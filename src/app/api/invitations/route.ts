import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";
import { resolveInvitationPricing } from "@/lib/invitation-pricing";
import { sendInvitationConfirmation } from "@/lib/invitation-notify";

// Re-exported for the callers that already imported it from this route.
export { getLandingPageMeta } from "@/lib/invitation-notify";

function sanitizeText(value?: string | null) {
  return (value ?? "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = sanitizeText(body.firstName);
    const email = sanitizeText(body.email).toLowerCase();
    const whatsappNumber = sanitizeText(body.whatsappNumber);
    const location = sanitizeText(body.location);

    if (!firstName || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const { InvitationRequest } = await getDB();

    const rawLandingPageId = sanitizeText(body.landingPageId);
    const rawLandingPageSlug = sanitizeText(body.landingPageSlug);

    // This endpoint enrols someone outright, so it must refuse to run for a
    // webinar that charges. Without this check anyone could skip the Razorpay
    // flow by POSTing here directly and get a paid seat for free.
    const pricing = await resolveInvitationPricing(rawLandingPageId, rawLandingPageSlug);
    if (pricing?.isPaid) {
      return NextResponse.json(
        { error: "This webinar requires payment. Please register through the payment form." },
        { status: 402 }
      );
    }

    const invitationData = {
      // landing_page_id is an ObjectId in the schema — only set it when it's a
      // valid id, otherwise Mongoose throws a CastError and the whole sign-up fails.
      landing_page_id: /^[a-f\d]{24}$/i.test(rawLandingPageId) ? rawLandingPageId : undefined,
      landing_page_slug: rawLandingPageSlug || undefined,
      first_name: firstName,
      email,
      whatsapp_number: whatsappNumber || undefined,
      location: location || undefined,
      payment_status: "not_required" as const,
    };

    await InvitationRequest.create(invitationData);

    await sendInvitationConfirmation({
      firstName,
      email,
      whatsappNumber,
      location,
      landingPageId: invitationData.landing_page_id,
      landingPageSlug: invitationData.landing_page_slug,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Invitation request error", err);
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const landingPageId = url.searchParams.get("landingPageId");

  // "Unwindowed" tab on the invitations page: registrants for this page who
  // don't fall inside any existing InvitationWindow's registration range —
  // paginated/sortable/date-filterable, since a page with no windows at all
  // means EVERY registrant it's ever had lands in this one bucket.
  if (url.searchParams.get("unwindowed") === "true") {
    return getUnwindowedInvitations(url, landingPageId);
  }

  const { InvitationRequest } = await getDB();
  const filter: any = {};
  if (landingPageId) {
    filter.landing_page_id = landingPageId;
  }

  const invitations = await InvitationRequest.find(filter)
    .select('landing_page_id landing_page_slug first_name email whatsapp_number location payment_status amount currency razorpay_payment_id paid_at created_at')
    .sort({ created_at: -1 })
    .lean();

  const data = invitations.map(inv => ({
    ...inv,
    id: inv._id.toString(),
    _id: undefined
  }));

  return NextResponse.json({ invitations: data });
}

const SORTABLE_FIELDS = new Set(["created_at", "first_name", "email"]);

async function getUnwindowedInvitations(url: URL, landingPageId: string | null) {
  if (!landingPageId || !/^[a-f\d]{24}$/i.test(landingPageId)) {
    return NextResponse.json({ error: "A valid landingPageId is required" }, { status: 400 });
  }

  const { InvitationRequest, InvitationWindow, LandingPage } = await getDB();

  const page = await LandingPage.findById(landingPageId).select("slug").lean();
  if (!page) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }
  const slug = (page as any).slug;

  const pageNum = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10) || 20));
  const sortByParam = url.searchParams.get("sortBy") || "created_at";
  const sortBy = SORTABLE_FIELDS.has(sortByParam) ? sortByParam : "created_at";
  const sortDir = url.searchParams.get("sortDir") === "asc" ? 1 : -1;
  const search = (url.searchParams.get("search") || "").trim();
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const windows = await InvitationWindow.find({ landing_page_slug: slug })
    .select("registration_start registration_end")
    .lean();

  const filter: any = { landing_page_slug: slug };
  // No windows at all → nothing to exclude, this IS every registrant the
  // page has ever had. With windows, exclude anyone already claimed by one
  // of them (their created_at falls inside its registration range).
  if (windows.length > 0) {
    filter.$nor = windows.map((w: any) => ({
      created_at: { $gte: w.registration_start, $lte: w.registration_end },
    }));
  }
  if (from || to) {
    filter.created_at = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };
  }
  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ first_name: regex }, { email: regex }, { whatsapp_number: regex }, { location: regex }];
  }

  const total = await InvitationRequest.countDocuments(filter);
  const invitations = await InvitationRequest.find(filter)
    .select('landing_page_id landing_page_slug first_name email whatsapp_number location payment_status amount currency razorpay_payment_id paid_at created_at')
    .sort({ [sortBy]: sortDir })
    .skip((pageNum - 1) * limit)
    .limit(limit)
    .lean();

  const data = invitations.map((inv: any) => ({
    ...inv,
    id: inv._id.toString(),
    _id: undefined,
  }));

  return NextResponse.json({
    invitations: data,
    total,
    page: pageNum,
    pages: Math.max(1, Math.ceil(total / limit)),
    windowCount: windows.length,
  });
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { InvitationRequest } = await getDB();
  const deleted = await InvitationRequest.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

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

  const { InvitationRequest } = await getDB();
  const url = new URL(req.url);
  const landingPageId = url.searchParams.get("landingPageId");

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

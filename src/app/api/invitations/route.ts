import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

function sanitizeText(value?: string | null) {
  return (value ?? "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = sanitizeText(body.firstName);
    const email = sanitizeText(body.email).toLowerCase();

    if (!firstName || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const { InvitationRequest } = await getDB();

    await InvitationRequest.create({
      landing_page_id: sanitizeText(body.landingPageId) || null,
      landing_page_slug: sanitizeText(body.landingPageSlug) || null,
      first_name: firstName,
      email,
      whatsapp_number: sanitizeText(body.whatsappNumber) || null,
      gender: sanitizeText(body.gender) || null,
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
    .select('landing_page_id landing_page_slug first_name email whatsapp_number gender created_at')
    .sort({ created_at: -1 })
    .lean();

  const data = invitations.map(inv => ({
    ...inv,
    id: inv._id.toString(),
    _id: undefined
  }));

  return NextResponse.json({ invitations: data });
}

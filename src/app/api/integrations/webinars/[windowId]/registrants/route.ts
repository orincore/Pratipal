import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

function isAuthorized(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const expected = process.env.INTEGRATIONS_API_KEY;
  return Boolean(expected) && apiKey === expected;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ windowId: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { windowId } = await context.params;
  const { InvitationWindow, InvitationRequest } = await getDB();

  const window = await InvitationWindow.findById(windowId).lean();
  if (!window) {
    return NextResponse.json({ error: "Window not found" }, { status: 404 });
  }

  const invitations = await InvitationRequest.find({
    landing_page_slug: (window as any).landing_page_slug,
    created_at: { $gte: (window as any).registration_start, $lte: (window as any).registration_end },
  })
    .select("first_name email whatsapp_number location created_at")
    .sort({ created_at: 1 })
    .lean();

  const registrants = invitations.map((inv: any) => ({
    first_name: inv.first_name,
    email: inv.email,
    whatsapp_number: inv.whatsapp_number,
    location: inv.location,
    created_at: inv.created_at,
  }));

  return NextResponse.json({ registrants });
}

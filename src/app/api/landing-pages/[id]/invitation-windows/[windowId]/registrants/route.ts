import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

function requireAdmin(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; windowId: string }> }
) {
  const user = requireAdmin(req);
  if (!user) {
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
    .sort({ created_at: -1 })
    .lean();

  const data = invitations.map((inv: any) => ({
    ...inv,
    id: inv._id.toString(),
    _id: undefined,
  }));

  return NextResponse.json({ window: { ...window, id: (window as any)._id.toString(), _id: undefined }, invitations: data });
}

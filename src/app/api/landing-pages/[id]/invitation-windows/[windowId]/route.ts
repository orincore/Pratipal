import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

function requireAdmin(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; windowId: string }> }
) {
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, windowId } = await context.params;
  const body = await req.json();
  const payload: Record<string, any> = {};

  if (typeof body.name === "string") payload.name = body.name.trim();
  if (body.registration_start) payload.registration_start = new Date(body.registration_start);
  if (body.registration_end) payload.registration_end = new Date(body.registration_end);
  if (body.webinar_starts_at) payload.webinar_starts_at = new Date(body.webinar_starts_at);
  if (body.webinar_timezone) payload.webinar_timezone = body.webinar_timezone;
  if (typeof body.join_link === "string") payload.join_link = body.join_link.trim();
  if (typeof body.join_platform === "string") payload.join_platform = body.join_platform;

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const { InvitationWindow } = await getDB();
  const window = await InvitationWindow.findOneAndUpdate(
    { _id: windowId, landing_page_id: id },
    payload,
    { new: true }
  );

  if (!window) {
    return NextResponse.json({ error: "Window not found" }, { status: 404 });
  }

  return NextResponse.json({ window: window.toJSON() });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; windowId: string }> }
) {
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, windowId } = await context.params;
  const { InvitationWindow } = await getDB();
  const result = await InvitationWindow.findOneAndDelete({ _id: windowId, landing_page_id: id });

  if (!result) {
    return NextResponse.json({ error: "Window not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

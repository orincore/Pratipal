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
  context: { params: Promise<{ id: string }> }
) {
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { InvitationWindow, InvitationRequest } = await getDB();

  const windows = await InvitationWindow.find({ landing_page_id: id })
    .sort({ registration_start: -1 })
    .lean();

  const withCounts = await Promise.all(
    windows.map(async (w: any) => {
      const registrant_count = await InvitationRequest.countDocuments({
        landing_page_slug: w.landing_page_slug,
        created_at: { $gte: w.registration_start, $lte: w.registration_end },
      });
      return { ...w, id: w._id.toString(), _id: undefined, registrant_count };
    })
  );

  return NextResponse.json({ windows: withCounts });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const name = (body.name ?? "").trim();
  const registrationStart = body.registration_start;
  const registrationEnd = body.registration_end;
  const webinarStartsAt = body.webinar_starts_at;

  if (!name || !registrationStart || !registrationEnd || !webinarStartsAt) {
    return NextResponse.json(
      { error: "name, registration_start, registration_end and webinar_starts_at are required" },
      { status: 400 }
    );
  }

  const { LandingPage, InvitationWindow } = await getDB();
  const page = await LandingPage.findById(id).lean();
  if (!page) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }

  const window = await InvitationWindow.create({
    landing_page_id: id,
    landing_page_slug: (page as any).slug,
    name,
    registration_start: new Date(registrationStart),
    registration_end: new Date(registrationEnd),
    webinar_starts_at: new Date(webinarStartsAt),
    webinar_timezone: body.webinar_timezone || "Asia/Kolkata",
    join_link: body.join_link ? String(body.join_link).trim() : undefined,
    join_platform: body.join_platform || undefined,
  });

  return NextResponse.json({ window: window.toJSON() }, { status: 201 });
}

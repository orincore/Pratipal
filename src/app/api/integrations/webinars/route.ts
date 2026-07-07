import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

// Server-to-server integration surface for the mail system to pull webinar
// occurrences. Auth is a shared API key (not the cookie-based admin session),
// since this is called by another backend service, not a browser.
//
// Each row is one InvitationWindow (one occurrence of a possibly-reused landing
// page), not one landing page — a page can have many past/future windows, and
// each needs its own independent registrant list + reminder schedule.
function isAuthorized(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const expected = process.env.INTEGRATIONS_API_KEY;
  return Boolean(expected) && apiKey === expected;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { InvitationWindow, LandingPage } = await getDB();

  const windows = await InvitationWindow.find({}).lean();
  const publishedPages = await LandingPage.find({ status: "published" }).select("slug title").lean();
  const titleBySlug = new Map(publishedPages.map((p: any) => [p.slug, p.title]));

  const webinars = windows
    .filter((w: any) => titleBySlug.has(w.landing_page_slug))
    .map((w: any) => ({
      id: w._id.toString(),
      slug: w.landing_page_slug,
      title: `${titleBySlug.get(w.landing_page_slug)} — ${w.name}`,
      webinar_starts_at: w.webinar_starts_at,
      webinar_timezone: w.webinar_timezone,
      registration_start: w.registration_start,
      registration_end: w.registration_end,
      join_link: w.join_link,
      join_platform: w.join_platform,
      status: "published",
    }));

  return NextResponse.json({ webinars });
}

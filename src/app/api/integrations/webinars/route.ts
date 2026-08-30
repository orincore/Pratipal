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

  const { InvitationWindow, LandingPage, InvitationRequest } = await getDB();

  const windows = await InvitationWindow.find({}).lean();
  const publishedPages = await LandingPage.find({ status: "published" })
    .select("slug title content created_at")
    .lean();
  const titleBySlug = new Map(publishedPages.map((p: any) => [p.slug, p.title]));

  const webinars = windows
    .filter((w: any) => titleBySlug.has(w.landing_page_slug))
    .map((w: any) => ({
      id: w._id.toString(),
      slug: w.landing_page_slug,
      title: titleBySlug.get(w.landing_page_slug) as string,
      // The window's own name (e.g. "July 2026 Batch") — every window for
      // the same landing page shares the page's title above, so without
      // this, a page with several occurrences shows as the exact same
      // label repeated once per window everywhere the mail system lists
      // webinars (there's nothing else in this payload that differs
      // besides dates, which several UI surfaces don't even render).
      window_name: w.name,
      webinar_starts_at: w.webinar_starts_at,
      webinar_timezone: w.webinar_timezone,
      registration_start: w.registration_start,
      registration_end: w.registration_end,
      join_link: w.join_link,
      join_platform: w.join_platform,
      status: "published",
    }));

  // InvitationRequest is always page-scoped (landing_page_slug), never
  // window-scoped — a window is just a way of slicing those registrants by
  // date range for a scheduled occurrence. A page with invitation.enabled
  // but no InvitationWindow ever created (an evergreen/always-open page, or
  // one where a window just hasn't been set up yet) still has real
  // registrants sitting in InvitationRequest — they were simply invisible to
  // the mail system, which only ever asked for window occurrences. Give each
  // such page ONE synthetic "whole page" entry, id-prefixed `page:` so the
  // registrants route below (and webinar-sync.ts on the mail side, which
  // just echoes this id back) can tell it apart from a real window id.
  const slugsWithWindow = new Set(windows.map((w: any) => w.landing_page_slug));
  const invitationPages = publishedPages.filter(
    (p: any) => p.content?.templateData?.invitation?.enabled && !slugsWithWindow.has(p.slug)
  );

  if (invitationPages.length > 0) {
    const slugs = invitationPages.map((p: any) => p.slug);
    const counts = await InvitationRequest.aggregate([
      { $match: { landing_page_slug: { $in: slugs } } },
      { $group: { _id: "$landing_page_slug", count: { $sum: 1 } } },
    ]);
    const countBySlug = new Map(counts.map((c: any) => [c._id as string, c.count as number]));

    for (const p of invitationPages) {
      if (!countBySlug.get(p.slug)) continue; // no registrants yet — nothing to sync
      webinars.push({
        id: `page:${p.slug}`,
        slug: p.slug,
        title: p.title,
        // No window exists for this one at all (that's the whole reason it's
        // synthetic) — nothing to disambiguate it from, since a page only
        // ever gets this fallback entry when it has zero real windows.
        window_name: undefined,
        // No real scheduled start time exists for a page with no window.
        // created_at is at least stable across syncs (real starts_at
        // changing is what triggers reminder-reschedule logic on the mail
        // side — an unstable value here would spuriously refire that on
        // every sync). Reminders aren't meaningful for these anyway; this
        // exists so the page's audience is selectable for campaigns.
        webinar_starts_at: p.created_at,
        webinar_timezone: undefined,
        registration_start: undefined,
        registration_end: undefined,
        join_link: undefined,
        join_platform: undefined,
        status: "published",
      });
    }
  }

  return NextResponse.json({ webinars });
}

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import getDB from "@/lib/db";

// Public redirect target used by the WhatsApp "Join Webinar" template button.
// WhatsApp Cloud API dynamic URL buttons only allow a suffix appended to a
// fixed base URL, so the button always points here and this route resolves
// the actual Zoom/Google Meet/Teams link (which live on different domains)
// server-side and 302s to it. Keeps the approved template's URL immutable
// even as the underlying meeting link changes per webinar.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ windowId: string }> }
) {
  const { windowId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(windowId)) {
    return notReadyResponse(req);
  }

  const { InvitationWindow } = await getDB();
  const window = await InvitationWindow.findById(windowId).lean();

  if (!window || !(window as any).join_link) {
    return notReadyResponse(req, (window as any)?.landing_page_slug);
  }

  return NextResponse.redirect((window as any).join_link, { status: 302 });
}

function notReadyResponse(req: NextRequest, landingPageSlug?: string) {
  const fallbackUrl = landingPageSlug ? new URL(`/${landingPageSlug}`, req.url) : null;
  const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Joining link not available</title></head>
  <body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; color: #334155;">
    <h1 style="font-size: 18px;">Joining link not available yet</h1>
    <p>We'll share the link here closer to the session. Please check your email or WhatsApp again nearer the start time.</p>
    ${fallbackUrl ? `<p><a href="${fallbackUrl.toString()}">Back to event page</a></p>` : ""}
  </body>
</html>`;
  return new NextResponse(html, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

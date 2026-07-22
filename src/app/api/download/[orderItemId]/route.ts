import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import getDB from "@/lib/db";

// Public redirect target used by the WhatsApp "Download E-Book" template
// button (ebook_delivered_customer). WhatsApp Cloud API dynamic URL buttons
// only allow a suffix appended to a fixed base URL, and the actual
// ebook_download_url can be a long presigned link with query params that's
// unsafe/fragile to embed directly in a template button — so the button
// always points here (base + OrderItem._id) and this route resolves the
// real download link server-side. Same pattern as
// src/app/webinar/join/[windowId]/route.ts.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderItemId: string }> }
) {
  const { orderItemId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(orderItemId)) {
    return notReadyResponse();
  }

  const { OrderItem } = await getDB();
  const item = await OrderItem.findById(orderItemId).lean();

  if (!item || !(item as any).is_ebook || !(item as any).ebook_download_url) {
    return notReadyResponse();
  }

  return NextResponse.redirect((item as any).ebook_download_url, { status: 302 });
}

function notReadyResponse() {
  const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Download link not available</title></head>
  <body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; color: #334155;">
    <h1 style="font-size: 18px;">Download link not available</h1>
    <p>This link may have expired or the item isn't a downloadable e-book. Check your order confirmation email or contact support.</p>
  </body>
</html>`;
  return new NextResponse(html, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

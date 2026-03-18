import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";
import { mapShiprocketStatus } from "@/lib/shiprocket";
import { sendMail, trackingUpdateHtml, orderCancelledHtml } from "@/lib/mailer";

/**
 * Shipping status webhook (Shiprocket)
 * Configure in Shiprocket dashboard → Settings → Webhooks
 * URL: https://pratipal.in/api/shipping/track
 * Token: passed via x-api-key header
 *
 * Shiprocket sends a POST with JSON body on every shipment status change.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify token sent by Shiprocket in x-api-key header
    const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
    if (secret) {
      const incoming = req.headers.get("x-api-key") || req.headers.get("authorization");
      if (incoming !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();

    // Shiprocket webhook payload shape
    // awb can be a number (e.g. 59629792084) — normalise to string
    const awbRaw = body?.awb ?? body?.awb_code ?? body?.shipment?.awb;
    const awb: string | undefined = awbRaw != null ? String(awbRaw) : undefined;

    // Parse order_id as a number — Shiprocket test payloads send dummy strings, skip those
    const rawOrderId = body?.order_id ?? body?.shipment?.order_id;
    const srOrderId: number | undefined =
      rawOrderId != null && !isNaN(Number(rawOrderId)) ? Number(rawOrderId) : undefined;

    // Shiprocket sends both current_status and shipment_status; prefer current_status
    const srStatus: string | undefined =
      body?.current_status || body?.shipment_status || body?.status || body?.shipment?.status;

    if (!srStatus) {
      return NextResponse.json({ error: "No status in payload" }, { status: 400 });
    }

    const ourStatus = mapShiprocketStatus(srStatus);

    const { Order } = await getDB();

    // Find order by shiprocket_order_id or tracking_number (AWB)
    let order: any = null;
    if (srOrderId) {
      order = await Order.findOne({ shiprocket_order_id: srOrderId }).lean();
    }
    if (!order && awb) {
      order = await Order.findOne({ tracking_number: awb }).lean();
    }

    if (!order) {
      // Not our order — acknowledge anyway so Shiprocket doesn't retry
      return NextResponse.json({ received: true });
    }

    // Skip if status hasn't changed
    if (order.tracking_status === ourStatus) {
      return NextResponse.json({ received: true, skipped: "same status" });
    }

    const updateData: Record<string, any> = {
      tracking_status: ourStatus,
      tracking_updated_at: new Date().toISOString(),
    };
    if (awb && !order.tracking_number) {
      updateData.tracking_number = awb;
    }

    // Build tracking URL from AWB
    if (awb && !order.tracking_url) {
      updateData.tracking_url = `https://shiprocket.co/tracking/${awb}`;
    }

    // Auto-mark COD as paid on delivery
    if (
      ourStatus === "delivered" &&
      order.payment_method?.toLowerCase() === "cod" &&
      order.payment_status !== "paid"
    ) {
      updateData.payment_status = "paid";
      updateData.status = "completed";
      updateData.completed_at = new Date();
    }

    if (ourStatus === "cancelled") {
      updateData.status = "cancelled";
    }

    // Build history entries — use scans array if provided, otherwise single entry
    const scans: Array<{ date: string; activity: string; location?: string }> =
      Array.isArray(body?.scans) ? body.scans : [];

    const historyEntries = scans.length > 0
      ? scans.map((s) => ({
          status: ourStatus,
          message: `${s.activity}${s.location ? ` — ${s.location}` : ""}`,
          timestamp: new Date(s.date).toISOString(),
        }))
      : [{ status: ourStatus, message: body?.remark || body?.shipment?.remark || null, timestamp: new Date().toISOString() }];

    const updated = await Order.findByIdAndUpdate(
      order._id,
      { $set: updateData, $push: { tracking_history: { $each: historyEntries } } },
      { new: true }
    ).lean();
    if (!updated) return NextResponse.json({ received: true });

    // ── Send email notification ──────────────────────────────────────────────
    if (ourStatus === "cancelled") {
      sendMail({
        to: updated.customer_email,
        subject: `Order Cancelled — ${updated.order_number}`,
        html: orderCancelledHtml({
          orderNumber: updated.order_number,
          customerName: updated.customer_name,
          reason: srStatus,
          total: updated.total,
          cancelledBy: "admin",
        }),
      }).catch(() => {});
    } else {
      sendMail({
        to: updated.customer_email,
        subject: `Order Update — ${updated.order_number}`,
        html: trackingUpdateHtml({
          orderNumber: updated.order_number,
          customerName: updated.customer_name,
          trackingStatus: ourStatus,
          trackingNumber: updated.tracking_number ?? awb ?? null,
          trackingUrl: updated.tracking_url ?? (awb ? `https://shiprocket.co/tracking/${awb}` : null),
          trackingMessage: body?.remark || body?.shipment?.remark || null,
          total: updated.total,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ received: true, status: ourStatus });
  } catch (err: any) {
    console.error("Shiprocket webhook error:", err);
    // Always return 200 so Shiprocket doesn't keep retrying on our bugs
    return NextResponse.json({ received: true, error: err.message });
  }
}

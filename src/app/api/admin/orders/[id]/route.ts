import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import type { TrackingStatus } from "@/lib/ecommerce-types";
import getDB from "@/lib/db";
import { sendMail, trackingUpdateHtml } from "@/lib/mailer";

const TRACKING_STATUSES: TrackingStatus[] = [
  "order_received", "processing", "packed", "shipped",
  "out_for_delivery", "delivered", "cancelled",
];

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const { Order, OrderItem } = await getDB();
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const items = await OrderItem.find({ order_id: order._id }).lean();
    return NextResponse.json({
      order: {
        ...order,
        id: order._id.toString(),
        _id: undefined,
        items: items.map((i) => ({ ...i, id: i._id.toString(), _id: undefined })),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};
    const now = new Date().toISOString();

    if (body.tracking_status !== undefined) {
      if (!TRACKING_STATUSES.includes(body.tracking_status)) {
        return NextResponse.json({ error: "Invalid tracking status" }, { status: 400 });
      }
      updateData.tracking_status = body.tracking_status;
      updateData.tracking_updated_at = now;

      // Auto-complete order on delivered or cancelled
      if (body.tracking_status === "delivered") {
        updateData.status = "completed";
        updateData.completed_at = new Date();
      } else if (body.tracking_status === "cancelled") {
        updateData.status = "cancelled";
      }
    }

    if (body.tracking_number !== undefined) {
      updateData.tracking_number = body.tracking_number || null;
    }
    if (body.tracking_url !== undefined) {
      updateData.tracking_url = body.tracking_url || null;
    }
    if (body.tracking_message !== undefined) {
      updateData.tracking_message = body.tracking_message || null;
      updateData.tracking_updated_at = now;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No tracking fields provided" }, { status: 400 });
    }

    const { Order, OrderItem } = await getDB();
    const { id } = await context.params;

    const existingOrder = await Order.findById(id)
      .select("payment_method payment_status tracking_history")
      .lean();

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Auto-mark COD as paid on delivery
    if (
      body.tracking_status === "delivered" &&
      existingOrder.payment_method?.toLowerCase() === "cod" &&
      existingOrder.payment_status !== "paid"
    ) {
      updateData.payment_status = "paid";
    }

    // Build history entry
    const historyEntry = body.tracking_status !== undefined
      ? { status: body.tracking_status, message: body.tracking_message || null, timestamp: now }
      : null;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: updateData,
        ...(historyEntry ? { $push: { tracking_history: historyEntry } } : {}),
      },
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("[orders PATCH] tracking_history length:", (updatedOrder as any).tracking_history?.length ?? 0);

    const items = await OrderItem.find({ order_id: updatedOrder._id }).lean();

    const orderData = {
      ...updatedOrder,
      id: updatedOrder._id.toString(),
      _id: undefined,
      items: items.map((item) => ({
        ...item,
        id: item._id.toString(),
        _id: undefined,
      })),
    };

    // Send tracking update email
    if (body.tracking_status !== undefined) {
      sendMail({
        to: updatedOrder.customer_email,
        subject: `Order Update — ${updatedOrder.order_number}`,
        html: trackingUpdateHtml({
          orderNumber: updatedOrder.order_number,
          customerName: updatedOrder.customer_name,
          trackingStatus: updatedOrder.tracking_status || body.tracking_status,
          trackingNumber: updatedOrder.tracking_number ?? null,
          trackingUrl: updatedOrder.tracking_url ?? null,
          trackingMessage: updatedOrder.tracking_message ?? body.tracking_message ?? null,
          total: updatedOrder.total,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ order: orderData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

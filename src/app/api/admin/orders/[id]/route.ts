import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import type { TrackingStatus } from "@/lib/ecommerce-types";
import getDB from "@/lib/db";

const TRACKING_STATUSES: TrackingStatus[] = [
  "order_received",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

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

    if (body.tracking_status !== undefined) {
      if (!TRACKING_STATUSES.includes(body.tracking_status)) {
        return NextResponse.json({ error: "Invalid tracking status" }, { status: 400 });
      }
      updateData.tracking_status = body.tracking_status;
      updateData.tracking_updated_at = new Date().toISOString();
    }

    if (body.tracking_number !== undefined) {
      updateData.tracking_number = body.tracking_number || null;
    }

    if (body.tracking_url !== undefined) {
      updateData.tracking_url = body.tracking_url || null;
    }

    if (body.tracking_message !== undefined) {
      updateData.tracking_message = body.tracking_message || null;
      updateData.tracking_updated_at = new Date().toISOString();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No tracking fields provided" }, { status: 400 });
    }

    const { Order, OrderItem } = await getDB();
    const { id } = await context.params;

    const existingOrder = await Order.findById(id)
      .select('payment_method payment_status')
      .lean();

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      body.tracking_status === "delivered" &&
      existingOrder.payment_method?.toLowerCase() === "cod" &&
      existingOrder.payment_status !== "paid"
    ) {
      updateData.payment_status = "paid";
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await OrderItem.find({ order_id: updatedOrder._id }).lean();

    const orderData = {
      ...updatedOrder,
      id: updatedOrder._id.toString(),
      _id: undefined,
      items: items.map(item => ({
        ...item,
        id: item._id.toString(),
        _id: undefined
      }))
    };

    return NextResponse.json({ order: orderData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { requireCustomerSession } from "@/lib/customer-session";
import getDB from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Context) {
  try {
    const { Order, OrderItem } = await getDB();
    const { id } = await context.params;
    
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await OrderItem.find({ order_id: order._id }).lean();

    const data = {
      ...order,
      id: order._id.toString(),
      _id: undefined,
      items: items.map(item => ({
        ...item,
        id: item._id.toString(),
        _id: undefined
      }))
    };

    return NextResponse.json({ order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function normalizeStatus(value: string | null | undefined) {
  return value ? value.toLowerCase() : null;
}

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const action: string | undefined = body.action;

    if (action !== "cancel") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    const { Order, OrderItem } = await getDB();
    const orderDoc = await Order.findById(id).lean();

    if (!orderDoc) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await OrderItem.find({ order_id: orderDoc._id }).lean();
    const order: any = { ...orderDoc, items };

    const adminUser = getUserFromRequest(req);
    const isAdmin = !!adminUser && adminUser.role === "admin";
    const orderStatus = normalizeStatus(order.status);
    const trackingStatus = normalizeStatus(order.tracking_status);

    if (!isAdmin) {
      const session = await requireCustomerSession();
      const matchesCustomer = order.customer_id
        ? order.customer_id === session.id
        : order.customer_email === session.email;
      if (!matchesCustomer) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const lockedTrackingStatuses = new Set(["shipped", "out_for_delivery", "delivered"]);
      const lockedOrderStatuses = new Set(["completed", "cancelled", "failed"]);
      if (
        (orderStatus && lockedOrderStatuses.has(orderStatus)) ||
        (trackingStatus && lockedTrackingStatuses.has(trackingStatus))
      ) {
        return NextResponse.json(
          { error: "Order can no longer be cancelled" },
          { status: 400 }
        );
      }
    }

    if (orderStatus === "cancelled") {
      return NextResponse.json({ error: "Order already cancelled" }, { status: 400 });
    }

    const cancellationMessage: string = body.reason
      ? String(body.reason)
      : isAdmin
        ? "Cancelled by admin"
        : "Cancelled by customer";

    const updated = await Order.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
        tracking_status: "cancelled",
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
    }

    const updatedItems = await OrderItem.find({ order_id: updated._id }).lean();

    const orderData = {
      ...updated,
      id: updated._id.toString(),
      _id: undefined,
      items: updatedItems.map(item => ({
        ...item,
        id: item._id.toString(),
        _id: undefined
      }))
    };

    return NextResponse.json({ order: orderData });
  } catch (err: any) {
    if (err?.message === "Not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

// Public, unauthenticated lookup keyed by order_number (unguessable —
// timestamp+random, same trust model as an order confirmation email/WhatsApp
// message being private to its recipient). Backs the "Track Order" WhatsApp
// button (order_confirmed_customer / order_status_update_customer). Returns
// only shipment-status fields — no address, payment, or contact details.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await context.params;

  const { Order, OrderItem } = await getDB();
  const order = await Order.findOne({ order_number: orderNumber })
    .select("order_number status tracking_status tracking_number tracking_url tracking_message tracking_history total created_at")
    .lean();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const items = await OrderItem.find({ order_id: (order as any)._id })
    .select("product_name quantity")
    .lean();

  return NextResponse.json({
    order: {
      order_number: order.order_number,
      status: order.status,
      tracking_status: order.tracking_status ?? null,
      tracking_number: order.tracking_number ?? null,
      tracking_url: order.tracking_url ?? null,
      tracking_message: order.tracking_message ?? null,
      tracking_history: order.tracking_history ?? [],
      total: order.total,
      created_at: order.created_at,
      item_count: items.length,
      items: items.map((i) => ({ product_name: i.product_name, quantity: i.quantity })),
    },
  });
}

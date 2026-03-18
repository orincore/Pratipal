import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";
import { createShiprocketOrder, cancelShiprocketOrder } from "@/lib/shiprocket";

type Context = { params: Promise<{ id: string }> };

/** POST — create a Shiprocket shipment for this order */
export async function POST(req: NextRequest, context: Context) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const { Order, OrderItem } = await getDB();
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.shiprocket_order_id) {
      return NextResponse.json({ error: "Shipment already created on Shiprocket" }, { status: 400 });
    }

    const items = await OrderItem.find({ order_id: order._id }).lean();
    const addr = order.shipping_address as Record<string, any>;

    const payload = {
      order_id: order.order_number,
      order_date: new Date(order.created_at).toISOString().split("T")[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      billing_customer_name: order.customer_name.split(" ")[0] || order.customer_name,
      billing_last_name: order.customer_name.split(" ").slice(1).join(" ") || "",
      billing_address: addr.address_line1 || "",
      billing_address_2: addr.address_line2 || "",
      billing_city: addr.city || "",
      billing_pincode: String(addr.pincode || addr.postal_code || ""),
      billing_state: addr.state || "",
      billing_country: addr.country || "India",
      billing_email: order.customer_email,
      billing_phone: addr.phone || "",
      shipping_is_billing: true,
      order_items: items.map((i: any) => ({
        name: i.product_name,
        sku: i.product_sku || i.product_name.replace(/\s+/g, "-").toLowerCase(),
        units: i.quantity,
        selling_price: i.price,
      })),
      payment_method: order.payment_method?.toLowerCase() === "cod" ? "COD" : "Prepaid",
      sub_total: order.subtotal,
      // dimensions — use body overrides or sensible defaults
      length: body.length ?? 10,
      breadth: body.breadth ?? 10,
      height: body.height ?? 10,
      weight: body.weight ?? 0.5,
    };

    const srResponse = await createShiprocketOrder(payload as any);

    // Shiprocket returns order_id and shipment_id
    const srOrderId = srResponse.order_id;
    const srShipmentId = srResponse.shipment_id;

    await Order.findByIdAndUpdate(id, {
      shiprocket_order_id: srOrderId,
      shiprocket_shipment_id: srShipmentId,
      tracking_status: "processing",
      tracking_updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, shiprocket_order_id: srOrderId, shipment_id: srShipmentId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** DELETE — cancel the Shiprocket shipment */
export async function DELETE(req: NextRequest, context: Context) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { Order } = await getDB();
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!order.shiprocket_order_id) {
      return NextResponse.json({ error: "No Shiprocket shipment found" }, { status: 400 });
    }

    await cancelShiprocketOrder([order.shiprocket_order_id]);
    await Order.findByIdAndUpdate(id, { shiprocket_order_id: null, shiprocket_shipment_id: null });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

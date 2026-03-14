import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";
import { calculateShipping } from "@/lib/shipping-calculator";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { Order, OrderItem } = await getDB();
    const { id } = await context.params;

    // Get the order and its items
    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await OrderItem.find({ order_id: order._id }).lean();
    if (items.length === 0) {
      return NextResponse.json({ error: "No order items found" }, { status: 404 });
    }

    // Recalculate totals based on order items
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);

    // Calculate shipping using proper shipping logic
    const cartItemsForShipping = items.map(item => ({
      product: {
        price: item.price || 0,
        weight: 0, // We don't have weight in order items, so use 0
      },
      quantity: item.quantity || 0,
    }));

    const shippingResult = await calculateShipping(cartItemsForShipping);
    const tax = subtotal * 0.18;
    const shipping = shippingResult.shipping_cost;
    const total = subtotal + tax + shipping;

    console.log('Recalculating order totals:', {
      orderId: id,
      oldTotals: {
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping_cost,
        total: order.total
      },
      newTotals: {
        subtotal,
        tax,
        shipping,
        total
      },
      shippingDetails: {
        method: shippingResult.shipping_method,
        free_shipping_threshold: shippingResult.free_shipping_threshold,
        is_free_shipping: shippingResult.is_free_shipping
      }
    });

    // Update the order with recalculated totals
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        subtotal,
        tax,
        shipping_cost: shipping,
        total,
      },
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // Return the updated order with items
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

    return NextResponse.json({ 
      message: "Order totals recalculated successfully",
      order: orderData,
      changes: {
        subtotal: { old: order.subtotal, new: subtotal },
        tax: { old: order.tax, new: tax },
        shipping: { old: order.shipping_cost, new: shipping },
        total: { old: order.total, new: total }
      }
    });
  } catch (err: any) {
    console.error("Error recalculating order totals:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
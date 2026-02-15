import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServiceSupabase } from "@/lib/auth";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, orderData } = await req.json();
    const razorpay = getRazorpayClient();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const supabase = getServiceSupabase();

    function generateOrderNumber(): string {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      return `ORD-${timestamp}-${random}`;
    }

    const orderNumber = generateOrderNumber();
    const subtotal = orderData.items.reduce((sum: number, item: any) => {
      return sum + (item.price || 0) * item.quantity;
    }, 0);
    const tax = subtotal * 0.18;
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        status: "pending",
        payment_status: "pending",
        payment_method: "razorpay",
        subtotal,
        tax,
        shipping_cost: shipping,
        discount: 0,
        total,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const orderItems = [];
    for (const item of orderData.items) {
      const { data: product } = await supabase
        .from("products")
        .select("name, sku, price, sale_price")
        .eq("id", item.product_id)
        .single();

      if (product) {
        const price = product.sale_price || product.price;
        orderItems.push({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          product_name: product.name,
          product_sku: product.sku,
          quantity: item.quantity,
          price,
          subtotal: price * item.quantity,
        });
      }
    }

    await supabase.from("order_items").insert(orderItems);

    return NextResponse.json({
      razorpay_order_id: razorpayOrder.id,
      order_id: order.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

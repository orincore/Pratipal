import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceSupabase } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    const supabase = getServiceSupabase();

    if (isValid) {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
        })
        .eq("id", order_id);

      if (error) {
        throw new Error(error.message);
      }

      const { data: order } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", order_id)
        .single();

      if (order && order.items) {
        for (const item of order.items) {
          if (item.product_id) {
            await supabase.rpc("decrement_product_stock", {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            });
          }
        }
      }

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", order?.customer_email)
        .single();

      if (customer) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("customer_id", customer.id);
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "failed",
        })
        .eq("id", order_id);

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { error: err.message || "Verification failed" },
      { status: 500 }
    );
  }
}

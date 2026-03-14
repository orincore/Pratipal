import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import getDB from "@/lib/db";

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

    const { Order, OrderItem, Product, Customer, CartItem } = await getDB();

    if (isValid) {
      await Order.findByIdAndUpdate(order_id, {
        payment_status: "paid",
        status: "processing",
      });

      const order = await Order.findById(order_id).lean();
      const orderItems = await OrderItem.find({ order_id }).lean();

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          if (item.product_id) {
            await Product.findByIdAndUpdate(item.product_id, {
              $inc: { stock_quantity: -item.quantity }
            });
          }
        }
      }

      // Clear both customer cart and session cart
      const customer = await Customer.findOne({ email: order?.customer_email }).lean();

      if (customer) {
        // Clear customer cart
        await CartItem.deleteMany({ customer_id: customer._id.toString() });
      }

      // Also clear session-based cart if exists
      const cookieStore = await cookies();
      const sessionId = cookieStore.get("cart_session")?.value;
      if (sessionId) {
        await CartItem.deleteMany({ session_id: sessionId });
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      await Order.findByIdAndUpdate(order_id, {
        payment_status: "failed",
        status: "failed",
      });

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

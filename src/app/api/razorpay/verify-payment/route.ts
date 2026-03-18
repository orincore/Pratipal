import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import getDB from "@/lib/db";
import { sendMail, orderConfirmationHtml } from "@/lib/mailer";

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
      const orderItems = await OrderItem.find({ order_id: order?._id }).lean();

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

      // Send order confirmation email
      if (order) {
        sendMail({
          to: order.customer_email,
          subject: `Order Confirmed — ${order.order_number}`,
          html: orderConfirmationHtml({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            items: orderItems.map((i: any) => ({
              product_name: i.product_name,
              quantity: i.quantity,
              price: i.price,
              subtotal: i.subtotal,
            })),
            subtotal: order.subtotal,
            tax: order.tax,
            shippingCost: order.shipping_cost,
            total: order.total,
            paymentMethod: order.payment_method || "online",
            shippingAddress: order.shipping_address || {},
          }),
        }).catch((mailErr: any) => {
          console.error("Order confirmation email failed:", mailErr?.message || mailErr);
        });
      } else {
        console.warn("Skipping confirmation email — order not found for id:", order_id);
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

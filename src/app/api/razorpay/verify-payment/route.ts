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
        // Send confirmation to customer
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

        // Send notification to admin
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          const itemsList = orderItems.map((i: any) => `• ${i.product_name} × ${i.quantity} — ₹${i.subtotal.toFixed(2)}`).join('\n');
          const addr = order.shipping_address || {};
          const addrLine = [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode || addr.postal_code, addr.country]
            .filter(Boolean).join(", ");
          
          sendMail({
            to: adminEmail,
            subject: `New Order: ${order.order_number} — ₹${order.total.toFixed(2)}`,
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
                <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
                  <div style="text-align:center;margin-bottom:24px;">
                    <div style="display:inline-block;background:linear-gradient(135deg,#1b244a,#059669);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#fff;margin-bottom:12px;">🛍️</div>
                    <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">New Order Received</h2>
                    <p style="color:#6b7280;font-size:14px;margin:0;">Order #${order.order_number}</p>
                  </div>
                  <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
                    <p style="font-size:14px;color:#166534;font-weight:600;margin:0 0 12px;">Customer Details:</p>
                    <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Name:</strong> ${order.customer_name}</p>
                    <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Email:</strong> <a href="mailto:${order.customer_email}" style="color:#059669;">${order.customer_email}</a></p>
                    <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Payment:</strong> Online Payment (Razorpay)</p>
                    <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
                  </div>
                  <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:16px;">
                    <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Order Items:</strong></p>
                    <p style="font-size:13px;color:#6b7280;margin:0;white-space:pre-wrap;">${itemsList}</p>
                  </div>
                  <div style="background:#fef3c7;border-radius:10px;padding:16px;margin-bottom:16px;">
                    <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Order Total:</strong></p>
                    <p style="font-size:13px;color:#6b7280;margin:4px 0;">Subtotal: ₹${order.subtotal.toFixed(2)}</p>
                    <p style="font-size:13px;color:#6b7280;margin:4px 0;">Tax (18%): ₹${order.tax.toFixed(2)}</p>
                    <p style="font-size:13px;color:#6b7280;margin:4px 0;">Shipping: ${order.shipping_cost === 0 ? 'Free' : '₹' + order.shipping_cost.toFixed(2)}</p>
                    <p style="font-size:16px;color:#111827;font-weight:700;margin:8px 0 0;border-top:1px solid #fde68a;padding-top:8px;">Total: ₹${order.total.toFixed(2)}</p>
                  </div>
                  <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:16px;">
                    <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Shipping Address:</strong></p>
                    <p style="font-size:13px;color:#6b7280;margin:0;">${addrLine || "—"}</p>
                  </div>
                  ${order.notes ? `<div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:16px;">
                    <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Order Notes:</strong></p>
                    <p style="font-size:13px;color:#6b7280;margin:0;white-space:pre-wrap;">${order.notes}</p>
                  </div>` : ''}
                  <p style="color:#6b7280;font-size:13px;margin:0;">Received at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST</p>
                </div>
              </div>
            `,
          }).catch(() => {});
        }
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

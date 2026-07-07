import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import getDB from "@/lib/db";
import { sendMail, orderConfirmationHtml } from "@/lib/mailer";
import { BRAND, renderEmailLayout, emailInfoCard } from "@/lib/email-template";

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
            html: renderEmailLayout({
              badgeIcon: "bag",
              heading: "New Order Received",
              subheading: `Order #${order.order_number}`,
              bodyHtml:
                emailInfoCard([
                  { icon: "user", label: "Name", value: order.customer_name },
                  { icon: "mail", label: "Email", value: `<a href="mailto:${order.customer_email}" style="color:${BRAND.navy};">${order.customer_email}</a>` },
                  { icon: "card", label: "Payment", value: "Online Payment (Razorpay)" },
                  { icon: "fileText", label: "Transaction ID", value: razorpay_payment_id },
                ]) +
                `<div style="background:${BRAND.infoCardBg};border-radius:12px;padding:16px;margin-bottom:22px;">
                  <p style="font-size:13px;color:${BRAND.textDark};margin:0 0 8px;font-weight:600;">Order Items</p>
                  <p style="font-size:13px;color:${BRAND.textMuted};margin:0;white-space:pre-wrap;line-height:1.7;">${itemsList}</p>
                </div>` +
                emailInfoCard([
                  { icon: "fileText", label: "Subtotal", value: `₹${order.subtotal.toFixed(2)}` },
                  { icon: "fileText", label: "Tax (18%)", value: `₹${order.tax.toFixed(2)}` },
                  { icon: "truck", label: "Shipping", value: order.shipping_cost === 0 ? "Free" : `₹${order.shipping_cost.toFixed(2)}` },
                  { icon: "card", label: "Total", value: `₹${order.total.toFixed(2)}` },
                ]) +
                `<div style="background:${BRAND.infoCardBg};border-radius:12px;padding:16px;margin-bottom:${order.notes ? "22px" : "0"};">
                  <p style="font-size:13px;color:${BRAND.textDark};margin:0 0 8px;font-weight:600;">Shipping Address</p>
                  <p style="font-size:13px;color:${BRAND.textMuted};margin:0;">${addrLine || "—"}</p>
                </div>` +
                (order.notes ? `<div style="background:${BRAND.infoCardBg};border-radius:12px;padding:16px;">
                  <p style="font-size:13px;color:${BRAND.textDark};margin:0 0 8px;font-weight:600;">Order Notes</p>
                  <p style="font-size:13px;color:${BRAND.textMuted};margin:0;white-space:pre-wrap;">${order.notes}</p>
                </div>` : ""),
              footerNote: `Received at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST — sent to the admin mailbox.`,
            }),
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

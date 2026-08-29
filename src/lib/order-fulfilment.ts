import { after } from "next/server";
import getDB from "@/lib/db";
import { sendMail, orderConfirmationHtml, ebookDeliveryHtml } from "@/lib/mailer";
import { BRAND, renderEmailLayout, emailInfoCard } from "@/lib/email-template";
import { sendWhatsappNotification, formatOrderItemsForWhatsapp } from "@/lib/whatsapp";
import { resolveOrderWhatsappNumber } from "@/lib/customer-phone";

/**
 * The single place a store order becomes paid and fulfilled.
 *
 * Two callers reach the same payment, and either may be first or may arrive
 * twice:
 *
 *   1. /api/razorpay/verify-payment — the browser's Razorpay handler.
 *   2. /api/razorpay/webhook       — Razorpay telling the server directly.
 *
 * Path 1 used to be the only one, which meant an order was only fulfilled if
 * the tab that started checkout survived the whole payment. On mobile it
 * frequently doesn't: choosing a UPI app hands the screen to GPay/PhonePe, the
 * backgrounded tab is discarded under memory pressure, and the `handler`
 * callback never runs. The money arrived, and the order sat `pending` with no
 * stock decrement, no e-book, and no email.
 *
 * Path 2 hears it from Razorpay regardless of what the browser did, so it
 * covers the customer who pays and never comes back at all.
 *
 * Everything below the claim runs exactly once because the claim is a single
 * conditional update: whichever caller flips `pending -> paid` does the work,
 * and the other is told it was already confirmed and does nothing.
 */
export type StoreOrderOutcome =
  | { status: "confirmed"; alreadyConfirmed: boolean; orderId: string }
  | { status: "not_found" }
  | { status: "order_mismatch" };

export async function fulfilStoreOrder(params: {
  /** Either id identifies the order; pass whichever you hold. */
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  /**
   * Guest cart to clear. Only the browser path has the cookie, so the webhook
   * leaves the session cart alone — the customer's own tab clears it locally.
   */
  sessionCartId?: string | null;
}): Promise<StoreOrderOutcome> {
  const { orderId, razorpayOrderId, razorpayPaymentId, sessionCartId } = params;
  const { Order, OrderItem, Product, Customer, CartItem } = await getDB();

  const existing = orderId
    ? await Order.findById(orderId).catch(() => null)
    : razorpayOrderId
      ? await Order.findOne({ razorpay_order_id: razorpayOrderId })
      : null;

  // Not one of ours — e.g. a webinar registration or a session booking, which
  // confirm through their own routes. The caller decides whether that's an error.
  if (!existing) return { status: "not_found" };

  // The order id must be the one this order created, so a valid signature from
  // some other (cheaper) order can't be replayed onto it.
  if (razorpayOrderId && existing.razorpay_order_id && existing.razorpay_order_id !== razorpayOrderId) {
    return { status: "order_mismatch" };
  }

  const orderReceivedAt = new Date().toISOString();

  // Atomic claim. The status guard lives in the filter, so the handler and a
  // webhook landing at the same instant cannot both pass — MongoDB applies one
  // and returns null to the other.
  const claimed = await Order.findOneAndUpdate(
    { _id: existing._id, payment_status: { $ne: "paid" } },
    {
      payment_status: "paid",
      status: "processing",
      razorpay_payment_id: razorpayPaymentId,
      // Backfilled when it was missing (orders placed before this field
      // existed), so this row can never be adopted by a second order id later.
      ...(razorpayOrderId ? { razorpay_order_id: razorpayOrderId } : {}),
      paid_at: new Date(),
      tracking_status: "order_received",
      tracking_updated_at: orderReceivedAt,
      $push: { tracking_history: { status: "order_received", timestamp: orderReceivedAt } },
    },
    { new: true }
  );

  if (!claimed) {
    return { status: "confirmed", alreadyConfirmed: true, orderId: existing._id.toString() };
  }

  const order: any = claimed.toObject();
  const orderItems: any[] = await OrderItem.find({ order_id: order._id }).lean();

  for (const item of orderItems) {
    if (item.product_id) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock_quantity: -item.quantity },
      }).catch(() => {});
    }
  }

  // Deliver any e-books now that payment is confirmed. Awaited (unlike the
  // order-confirmation email below, which is fire-and-forget) because the
  // delivery status recorded on each OrderItem needs to reflect whether the
  // send actually succeeded — a serverless function isn't guaranteed to keep
  // running after the response goes out, so this can't finish in the background.
  const ebookItems = orderItems.filter((i) => i.is_ebook && i.ebook_download_url);
  for (const item of ebookItems) {
    try {
      await sendMail({
        to: order.customer_email,
        subject: `Your E-Book is Ready — ${item.product_name}`,
        html: ebookDeliveryHtml({
          customerName: order.customer_name,
          productName: item.product_name,
          orderNumber: order.order_number,
          downloadUrl: item.ebook_download_url as string,
        }),
      });
      await OrderItem.findByIdAndUpdate(item._id, {
        ebook_delivery_status: "delivered",
        ebook_delivered_at: new Date(),
      });

      const ebookWhatsappNumber = await resolveOrderWhatsappNumber({
        shipping_address: order.shipping_address,
        customer_id: order.customer_id,
      });
      // after() keeps the serverless function alive until this finishes — an
      // un-awaited fire-and-forget call is frozen by Vercel the instant the
      // response is sent, so it never completes in production.
      after(() =>
        sendWhatsappNotification({
          event: "ebook_delivered_customer",
          to: ebookWhatsappNumber,
          data: {
            customerName: order.customer_name,
            productName: item.product_name,
            orderNumber: order.order_number,
            orderItemId: item._id.toString(),
          },
        }).catch(() => {})
      );

      if (process.env.ADMIN_WHATSAPP_NUMBER) {
        after(() =>
          sendWhatsappNotification({
            event: "ebook_sold_admin",
            to: process.env.ADMIN_WHATSAPP_NUMBER,
            data: {
              orderSummary: `${item.product_name} — Order ${order.order_number}`,
              buyerSummary: `${order.customer_name} (${order.customer_email})`,
              amount: item.subtotal,
            },
          }).catch(() => {})
        );
      }
    } catch (mailErr: any) {
      console.error(`Ebook delivery email failed for order item ${item._id}:`, mailErr?.message || mailErr);
      await OrderItem.findByIdAndUpdate(item._id, {
        ebook_delivery_status: "failed",
      }).catch(() => {});
    }
  }

  // Clear the customer's saved cart, and the guest session cart when the
  // caller had a cookie to identify it.
  const customer: any = await Customer.findOne({ email: order.customer_email }).lean().catch(() => null);
  if (customer) {
    await CartItem.deleteMany({ customer_id: customer._id.toString() }).catch(() => {});
  }
  if (sessionCartId) {
    await CartItem.deleteMany({ session_id: sessionCartId }).catch(() => {});
  }

  sendMail({
    to: order.customer_email,
    subject: `Order Confirmed — ${order.order_number}`,
    html: orderConfirmationHtml({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      items: orderItems.map((i) => ({
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

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const itemsList = orderItems
      .map((i) => `• ${i.product_name} × ${i.quantity} — ₹${i.subtotal.toFixed(2)}`)
      .join("\n");
    const addr = order.shipping_address || {};
    const addrLine = [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode || addr.postal_code, addr.country]
      .filter(Boolean)
      .join(", ");

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
            { icon: "fileText", label: "Transaction ID", value: razorpayPaymentId },
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
          (order.notes
            ? `<div style="background:${BRAND.infoCardBg};border-radius:12px;padding:16px;">
                <p style="font-size:13px;color:${BRAND.textDark};margin:0 0 8px;font-weight:600;">Order Notes</p>
                <p style="font-size:13px;color:${BRAND.textMuted};margin:0;white-space:pre-wrap;">${order.notes}</p>
              </div>`
            : ""),
        footerNote: `Received at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST — sent to the admin mailbox.`,
      }),
    }).catch(() => {});
  }

  // WhatsApp notifications (additive alongside the emails above).
  after(() =>
    resolveOrderWhatsappNumber({
      shipping_address: order.shipping_address,
      customer_id: order.customer_id,
    })
      .then((customerWhatsappNumber) => {
        const itemsSummary = formatOrderItemsForWhatsapp(orderItems);
        const sends = [
          sendWhatsappNotification({
            event: "order_confirmed_customer",
            to: customerWhatsappNumber,
            data: {
              customerName: order.customer_name,
              orderNumber: order.order_number,
              itemsSummary,
              total: order.total,
            },
          }),
        ];

        if (process.env.ADMIN_WHATSAPP_NUMBER) {
          sends.push(
            sendWhatsappNotification({
              event: "order_confirmed_admin",
              to: process.env.ADMIN_WHATSAPP_NUMBER,
              data: {
                orderNumber: order.order_number,
                customerName: order.customer_name,
                customerPhone: customerWhatsappNumber,
                itemsSummary,
                total: order.total,
              },
            })
          );
        }

        return Promise.all(sends);
      })
      .catch(() => {})
  );

  return { status: "confirmed", alreadyConfirmed: false, orderId: order._id.toString() };
}

/**
 * A payment attempt that Razorpay reports as failed.
 *
 * Guarded to `pending` so a late-arriving `payment.failed` for one abandoned
 * attempt can never downgrade an order the customer went on to pay for with a
 * second attempt on the same Razorpay order.
 */
export async function markStoreOrderFailed(params: {
  orderId?: string;
  razorpayOrderId?: string;
}): Promise<boolean> {
  const { Order } = await getDB();
  const filter: Record<string, any> = { payment_status: "pending" };
  if (params.orderId) filter._id = params.orderId;
  else if (params.razorpayOrderId) filter.razorpay_order_id = params.razorpayOrderId;
  else return false;

  const updated = await Order.findOneAndUpdate(
    filter,
    // `notes` is the customer's own order note — never overwritten here.
    { payment_status: "failed", status: "failed" },
    { new: true }
  ).catch(() => null);

  return !!updated;
}

/**
 * A refund Razorpay has processed against this order.
 *
 * Only a paid order can be refunded, so the guard doubles as an
 * out-of-order-delivery filter: a refund event that somehow arrives before the
 * capture event is a no-op, and the retry Razorpay sends next lands correctly
 * once the capture has been recorded.
 */
export async function markStoreOrderRefunded(params: {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}): Promise<boolean> {
  const { Order } = await getDB();
  const filter: Record<string, any> = { payment_status: "paid" };
  if (params.razorpayOrderId) filter.razorpay_order_id = params.razorpayOrderId;
  else if (params.razorpayPaymentId) filter.razorpay_payment_id = params.razorpayPaymentId;
  else return false;

  const updated = await Order.findOneAndUpdate(
    filter,
    { payment_status: "refunded", status: "refunded", refunded_at: new Date() },
    { new: true }
  ).catch(() => null);

  return !!updated;
}

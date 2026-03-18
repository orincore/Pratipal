import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    ...options,
  });
}

export function loginNotificationHtml({
  name,
  email,
  time,
  isAdmin,
}: {
  name: string;
  email: string;
  time: string;
  isAdmin?: boolean;
}) {
  const role = isAdmin ? "Admin" : "Customer";
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);border-radius:50%;width:48px;height:48px;line-height:48px;font-size:22px;color:#fff;">🔐</div>
        </div>
        <h2 style="margin:0 0 6px;font-size:20px;color:#111827;text-align:center;">New Login Detected</h2>
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;text-align:center;">Your Pratipal ${role} account was just signed in to.</p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;width:40%;">Account</td>
            <td style="padding:10px 0;color:#111827;font-weight:600;">${email}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;">Name</td>
            <td style="padding:10px 0;color:#111827;">${name}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;">Time</td>
            <td style="padding:10px 0;color:#111827;">${time}</td>
          </tr>
        </table>

        <p style="font-size:13px;color:#6b7280;margin:0;">
          If this was you, no action is needed. If you didn't sign in, please
          <a href="mailto:connect@pratipal.in" style="color:#059669;">contact us</a> immediately.
        </p>
      </div>
      <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Pratipal · connect@pratipal.in</p>
    </div>
  `;
}

export function welcomeEmailHtml({ name }: { name: string }) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:26px;color:#fff;">🌿</div>
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;color:#111827;text-align:center;">Welcome to Pratipal, ${name}!</h2>
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;text-align:center;line-height:1.6;">
          We're so glad you're here. Your account is ready — explore our healing products, book a session, or dive into our courses.
        </p>

        <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#065f46;">What you can do now:</p>
          <ul style="margin:0;padding-left:18px;color:#374151;font-size:13px;line-height:2;">
            <li>Browse our <a href="https://pratipal.in/shop" style="color:#059669;">healing products</a></li>
            <li>Book a <a href="https://pratipal.in/booking" style="color:#059669;">one-on-one session</a></li>
            <li>Explore our <a href="https://pratipal.in/courses" style="color:#059669;">courses & workshops</a></li>
          </ul>
        </div>

        <div style="text-align:center;">
          <a href="https://pratipal.in/shop" style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
            Start Exploring →
          </a>
        </div>

        <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:24px;margin-bottom:0;">
          Questions? Reply to this email or reach us at <a href="mailto:connect@pratipal.in" style="color:#059669;">connect@pratipal.in</a>
        </p>
      </div>
      <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Pratipal · Healing &amp; Wellness</p>
    </div>
  `;
}

// ─── Order email helpers ───────────────────────────────────────────────────

function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function orderItemsTable(items: Array<{ product_name: string; quantity: number; price: number; subtotal: number }>) {
  const rows = items.map(
    (i) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:10px 0;color:#111827;font-size:14px;">${i.product_name}</td>
      <td style="padding:10px 0;color:#6b7280;font-size:14px;text-align:center;">×${i.quantity}</td>
      <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;font-weight:600;">${formatINR(i.subtotal)}</td>
    </tr>`
  ).join("");
  return `
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <thead>
      <tr style="border-bottom:2px solid #e5e7eb;">
        <th style="padding:8px 0;text-align:left;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Item</th>
        <th style="padding:8px 0;text-align:center;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Qty</th>
        <th style="padding:8px 0;text-align:right;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function orderTotalsBlock(subtotal: number, tax: number, shipping: number, total: number) {
  return `
  <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
    <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:6px;"><span>Subtotal</span><span>${formatINR(subtotal)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:6px;"><span>Tax (18% GST)</span><span>${formatINR(tax)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:10px;"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:#059669;">Free</span>' : formatINR(shipping)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#111827;border-top:1px solid #e5e7eb;padding-top:10px;"><span>Total</span><span>${formatINR(total)}</span></div>
  </div>`;
}

function emailShell(icon: string, title: string, subtitle: string, body: string) {
  return `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
    <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);border-radius:50%;width:52px;height:52px;line-height:52px;font-size:24px;color:#fff;">${icon}</div>
      </div>
      <h2 style="margin:0 0 6px;font-size:20px;color:#111827;text-align:center;">${title}</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;text-align:center;">${subtitle}</p>
      ${body}
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Pratipal · connect@pratipal.in</p>
  </div>`;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: Array<{ product_name: string; quantity: number; price: number; subtotal: number }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  shippingAddress: Record<string, any>;
}

export function orderConfirmationHtml(data: OrderEmailData) {
  const addr = data.shippingAddress;
  const addrLine = [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode || addr.postal_code, addr.country]
    .filter(Boolean).join(", ");
  const payLabel = data.paymentMethod?.toLowerCase() === "cod" ? "Cash on Delivery" : "Online Payment";

  const body = `
    ${orderItemsTable(data.items)}
    ${orderTotalsBlock(data.subtotal, data.tax, data.shippingCost, data.total)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:#f0fdf4;border-radius:8px;padding:12px;">
        <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Payment</p>
        <p style="margin:0;font-size:13px;font-weight:600;color:#065f46;">${payLabel}</p>
      </div>
      <div style="background:#f0fdf4;border-radius:8px;padding:12px;">
        <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Ship to</p>
        <p style="margin:0;font-size:13px;font-weight:600;color:#065f46;">${addrLine || "—"}</p>
      </div>
    </div>
    <div style="text-align:center;">
      <a href="https://pratipal.in/order-history" style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#fff;text-decoration:none;padding:11px 28px;border-radius:8px;font-size:14px;font-weight:600;">Track Your Order →</a>
    </div>`;

  return emailShell(
    "🛍️",
    `Order Confirmed — ${data.orderNumber}`,
    `Hi ${data.customerName}, your order has been placed successfully.`,
    body
  );
}

const TRACKING_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  order_received:    { label: "Order Received",      icon: "📋", color: "#6366f1" },
  processing:        { label: "Processing",           icon: "⚙️", color: "#f59e0b" },
  packed:            { label: "Packed",               icon: "📦", color: "#8b5cf6" },
  shipped:           { label: "Shipped",              icon: "🚚", color: "#0ea5e9" },
  out_for_delivery:  { label: "Out for Delivery",     icon: "🏃", color: "#f97316" },
  delivered:         { label: "Delivered",            icon: "✅", color: "#059669" },
  cancelled:         { label: "Cancelled",            icon: "❌", color: "#ef4444" },
};

export interface TrackingUpdateEmailData {
  orderNumber: string;
  customerName: string;
  trackingStatus: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  trackingMessage?: string | null;
  total: number;
}

export function trackingUpdateHtml(data: TrackingUpdateEmailData) {
  const meta = TRACKING_LABELS[data.trackingStatus] ?? { label: data.trackingStatus, icon: "📦", color: "#6b7280" };

  const trackingBlock = data.trackingNumber ? `
    <div style="background:#f0fdf4;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Tracking Number</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#065f46;letter-spacing:.05em;">${data.trackingNumber}</p>
      ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="display:inline-block;margin-top:8px;font-size:13px;color:#059669;text-decoration:underline;">Track on courier website →</a>` : ""}
    </div>` : "";

  const messageBlock = data.trackingMessage ? `
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#92400e;">${data.trackingMessage}</p>
    </div>` : "";

  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 24px;">
        <span style="font-size:28px;">${meta.icon}</span>
        <div style="text-align:left;">
          <p style="margin:0 0 2px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Status</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:${meta.color};">${meta.label}</p>
        </div>
      </div>
    </div>
    ${trackingBlock}
    ${messageBlock}
    <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;justify-content:space-between;">
      <span style="font-size:13px;color:#6b7280;">Order</span>
      <span style="font-size:13px;font-weight:600;color:#111827;">${data.orderNumber}</span>
    </div>
    <div style="text-align:center;">
      <a href="https://pratipal.in/order-history" style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#fff;text-decoration:none;padding:11px 28px;border-radius:8px;font-size:14px;font-weight:600;">View Order Details →</a>
    </div>`;

  return emailShell(
    meta.icon,
    `Order Update — ${data.orderNumber}`,
    `Hi ${data.customerName}, here's the latest on your order.`,
    body
  );
}

export interface CancelOrderEmailData {
  orderNumber: string;
  customerName: string;
  reason?: string;
  total: number;
  cancelledBy: "customer" | "admin";
}

export function orderCancelledHtml(data: CancelOrderEmailData) {
  const reasonBlock = data.reason ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Reason</p>
      <p style="margin:0;font-size:13px;color:#991b1b;">${data.reason}</p>
    </div>` : "";

  const refundNote = `
    <div style="background:#f0fdf4;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#065f46;">
        💳 If you paid online, a refund of <strong>${formatINR(data.total)}</strong> will be processed to your original payment method within 5–7 business days.
      </p>
    </div>`;

  const body = `
    <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;justify-content:space-between;">
      <span style="font-size:13px;color:#6b7280;">Order</span>
      <span style="font-size:13px;font-weight:600;color:#111827;">${data.orderNumber}</span>
    </div>
    ${reasonBlock}
    ${refundNote}
    <p style="font-size:13px;color:#6b7280;margin:0 0 20px;">
      Questions? Reply to this email or reach us at <a href="mailto:connect@pratipal.in" style="color:#059669;">connect@pratipal.in</a>
    </p>
    <div style="text-align:center;">
      <a href="https://pratipal.in/shop" style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#fff;text-decoration:none;padding:11px 28px;border-radius:8px;font-size:14px;font-weight:600;">Continue Shopping →</a>
    </div>`;

  return emailShell(
    "❌",
    `Order Cancelled — ${data.orderNumber}`,
    `Hi ${data.customerName}, your order has been cancelled${data.cancelledBy === "admin" ? " by our team" : ""}.`,
    body
  );
}

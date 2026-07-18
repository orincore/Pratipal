import nodemailer from "nodemailer";
import { BRAND, renderEmailLayout, emailInfoCard, emailNote, emailStatusPill, type IconName } from "./email-template";
import { siteConfig } from "@/config/site.config";
import { SITE_URL } from "./seo";

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
  return renderEmailLayout({
    preheader: `New sign-in to your ${BRAND.name} ${role.toLowerCase()} account`,
    badgeIcon: "lock",
    heading: "New Login Detected",
    subheading: `Your ${BRAND.name} ${role} account was just signed in to.`,
    bodyHtml: emailInfoCard([
      { icon: "user", label: "Account", value: email },
      { icon: "user", label: "Name", value: name },
      { icon: "clock", label: "Time", value: time },
    ]) + emailNote(
      `If this was you, no action is needed. If you didn't sign in, please <a href="mailto:${siteConfig.contact.supportEmail}" style="color:${BRAND.navy};font-weight:600;">contact us</a> immediately.`,
      "warning",
      "alertTriangle"
    ),
  });
}

export function welcomeEmailHtml({ name }: { name: string }) {
  return renderEmailLayout({
    preheader: `Welcome to ${BRAND.name}, ${name}!`,
    badgeIcon: "leaf",
    heading: `Welcome to ${BRAND.name}, ${name}!`,
    subheading: "We're so glad you're here. Your account is ready — explore our healing products, book a session, or dive into our courses.",
    bodyHtml: `
      <div style="background:${BRAND.infoCardBg};border-radius:12px;padding:16px;margin-bottom:6px;">
        <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:${BRAND.textDark};">What you can do now:</p>
        <ul style="margin:0;padding-left:18px;color:${BRAND.textMuted};font-size:13px;line-height:2;">
          <li>Browse our <a href="${SITE_URL}/shop" style="color:${BRAND.navy};font-weight:600;">healing products</a></li>
          <li>Book a <a href="${SITE_URL}/booking" style="color:${BRAND.navy};font-weight:600;">one-on-one session</a></li>
          <li>Explore our <a href="${SITE_URL}/courses" style="color:${BRAND.navy};font-weight:600;">courses &amp; workshops</a></li>
        </ul>
      </div>`,
    cta: { label: "Start Exploring", url: `${SITE_URL}/shop` },
  });
}

// ─── Order email helpers ───────────────────────────────────────────────────

function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function orderItemsTable(items: Array<{ product_name: string; quantity: number; price: number; subtotal: number }>) {
  const rows = items.map(
    (i) => `
    <tr style="border-bottom:1px solid ${BRAND.rowBorder};">
      <td style="padding:10px 0;color:${BRAND.textDark};font-size:14px;">${i.product_name}</td>
      <td style="padding:10px 0;color:${BRAND.textMuted};font-size:14px;text-align:center;">×${i.quantity}</td>
      <td style="padding:10px 0;color:${BRAND.textDark};font-size:14px;text-align:right;font-weight:600;">${formatINR(i.subtotal)}</td>
    </tr>`
  ).join("");
  return `
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <thead>
      <tr style="border-bottom:2px solid ${BRAND.cardBorder};">
        <th style="padding:8px 0;text-align:left;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Item</th>
        <th style="padding:8px 0;text-align:center;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Qty</th>
        <th style="padding:8px 0;text-align:right;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function totalsRow(label: string, value: string, opts?: { bold?: boolean; topBorder?: boolean }) {
  const size = opts?.bold ? "16px" : "13px";
  const weight = opts?.bold ? "700" : "400";
  const color = opts?.bold ? BRAND.textDark : BRAND.textMuted;
  const border = opts?.topBorder ? `border-top:1px solid ${BRAND.cardBorder};` : "";
  return `
  <tr><td style="padding:${opts?.topBorder ? "10px 0 0" : "0 0 6px"};${border}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-size:${size};font-weight:${weight};color:${color};">${label}</td>
      <td align="right" style="font-size:${size};font-weight:${weight};color:${color};">${value}</td>
    </tr></table>
  </td></tr>`;
}

function orderTotalsBlock(subtotal: number, tax: number, shipping: number, total: number) {
  const shippingValue = shipping === 0 ? `<span style="color:${BRAND.success};font-weight:600;">Free</span>` : formatINR(shipping);
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.infoCardBg};border-radius:12px;margin-bottom:20px;"><tr><td style="padding:14px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${totalsRow("Subtotal", formatINR(subtotal))}
      ${totalsRow("Tax (18% GST)", formatINR(tax))}
      ${totalsRow("Shipping", shippingValue)}
      ${totalsRow("Total", formatINR(total), { bold: true, topBorder: true })}
    </table>
  </td></tr></table>`;
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

  const bodyHtml = `
    ${orderItemsTable(data.items)}
    ${orderTotalsBlock(data.subtotal, data.tax, data.shippingCost, data.total)}
    ${emailInfoCard([
      { icon: "card", label: "Payment", value: payLabel },
      { icon: "mapPin", label: "Ship to", value: addrLine || "—" },
    ])}`;

  return renderEmailLayout({
    preheader: `Your order ${data.orderNumber} has been placed successfully.`,
    badgeIcon: "bag",
    heading: `Order Confirmed — ${data.orderNumber}`,
    subheading: `Hi ${data.customerName}, your order has been placed successfully.`,
    bodyHtml,
    cta: { label: "Track Your Order", url: `${SITE_URL}/order-history` },
  });
}

export interface EbookDeliveryEmailData {
  customerName: string;
  productName: string;
  orderNumber: string;
  downloadUrl: string;
}

export function ebookDeliveryHtml(data: EbookDeliveryEmailData) {
  const bodyHtml = `
    ${emailInfoCard([
      { icon: "fileText", label: "E-Book", value: data.productName },
      { icon: "bag", label: "Order", value: data.orderNumber },
    ])}
    ${emailNote(
      "This link is yours to keep — save the file somewhere safe after downloading. If it ever stops working, just reply to this email and we'll resend it.",
      "neutral",
      "link"
    )}`;

  return renderEmailLayout({
    preheader: `Your e-book "${data.productName}" is ready to download.`,
    badgeIcon: "fileText",
    heading: "Your E-Book is Ready!",
    subheading: `Hi ${data.customerName}, thanks for your purchase — your download is ready below.`,
    bodyHtml,
    cta: { label: "Download Now", url: data.downloadUrl, icon: "fileText" },
    footerNote: `Trouble downloading? Reach us at <a href="mailto:${siteConfig.contact.supportEmail}" style="color:${BRAND.navy};">${siteConfig.contact.supportEmail}</a>`,
  });
}

const TRACKING_LABELS: Record<string, { label: string; icon: IconName; tone: "success" | "danger" | "warning" | "neutral" }> = {
  order_received:    { label: "Order Received",      icon: "fileText", tone: "neutral" },
  processing:        { label: "Processing",           icon: "refresh",  tone: "warning" },
  packed:            { label: "Packed",               icon: "package", tone: "neutral" },
  shipped:           { label: "Shipped",              icon: "truck",   tone: "neutral" },
  out_for_delivery:  { label: "Out for Delivery",     icon: "truck",   tone: "warning" },
  delivered:         { label: "Delivered",            icon: "check",  tone: "success" },
  cancelled:         { label: "Cancelled",            icon: "x",       tone: "danger" },
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
  const meta = TRACKING_LABELS[data.trackingStatus] ?? { label: data.trackingStatus, icon: "package" as IconName, tone: "neutral" as const };

  const trackingBlock = data.trackingNumber ? emailInfoCard([
    { icon: "tag", label: "Tracking Number", value: data.trackingNumber },
    ...(data.trackingUrl ? [{ icon: "link" as IconName, label: "Courier", value: `<a href="${data.trackingUrl}" style="color:${BRAND.navy};font-weight:600;">Track shipment</a>` }] : []),
  ]) : "";

  const messageBlock = data.trackingMessage ? emailNote(data.trackingMessage, "warning") : "";

  const bodyHtml = `
    <div style="text-align:center;margin-bottom:22px;">
      ${emailStatusPill(meta.label, meta.tone)}
    </div>
    ${trackingBlock}
    ${messageBlock}
    ${emailInfoCard([{ icon: "fileText", label: "Order", value: data.orderNumber }])}`;

  return renderEmailLayout({
    preheader: `Order ${data.orderNumber}: ${meta.label}`,
    badgeIcon: meta.icon,
    heading: `Order Update — ${data.orderNumber}`,
    subheading: `Hi ${data.customerName}, here's the latest on your order.`,
    bodyHtml,
    cta: { label: "View Order Details", url: `${SITE_URL}/order-history` },
  });
}

export interface CancelOrderEmailData {
  orderNumber: string;
  customerName: string;
  reason?: string;
  total: number;
  cancelledBy: "customer" | "admin";
}

export function orderCancelledHtml(data: CancelOrderEmailData) {
  const reasonBlock = data.reason ? emailNote(`<strong>Reason:</strong> ${data.reason}`, "danger") : "";
  const refundNote = emailNote(
    `If you paid online, a refund of <strong>${formatINR(data.total)}</strong> will be processed to your original payment method within 5–7 business days.`,
    "success",
    "card"
  );

  const bodyHtml = `
    ${emailInfoCard([{ icon: "fileText", label: "Order", value: data.orderNumber }])}
    ${reasonBlock}
    ${refundNote}
    <p style="font-size:13px;color:${BRAND.textMuted};margin:0 0 4px;text-align:center;">
      Questions? Reply to this email or reach us at <a href="mailto:${siteConfig.contact.supportEmail}" style="color:${BRAND.navy};font-weight:600;">${siteConfig.contact.supportEmail}</a>
    </p>`;

  return renderEmailLayout({
    preheader: `Order ${data.orderNumber} has been cancelled.`,
    badgeIcon: "x",
    heading: `Order Cancelled — ${data.orderNumber}`,
    subheading: `Hi ${data.customerName}, your order has been cancelled${data.cancelledBy === "admin" ? " by our team" : ""}.`,
    bodyHtml,
    cta: { label: "Continue Shopping", url: `${SITE_URL}/shop` },
  });
}

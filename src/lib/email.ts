import { BRAND, renderEmailLayout, emailInfoCard, emailNote } from "./email-template";
import { siteConfig } from "@/config/site.config";
import { sendMail } from "./mailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await sendMail({ to, subject, html });
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

export function generateBookingConfirmationEmail(data: {
  name: string;
  email: string;
  phone: string;
  sessionType: string;
  frequency?: string;
  healingType?: string;
  bookingId: string;
  amount: number;
  bookingDate: string;
}) {
  return renderEmailLayout({
    preheader: "Your healing session has been successfully booked.",
    badgeIcon: "check",
    heading: "Booking Confirmed!",
    subheading: "Your healing session has been successfully booked.",
    bodyHtml:
      emailInfoCard([
        { icon: "ticket", label: "Booking ID", value: data.bookingId },
        { icon: "user", label: "Name", value: data.name },
        { icon: "mail", label: "Email", value: data.email },
        { icon: "phone", label: "Phone", value: data.phone },
        { icon: "leaf", label: "Session Type", value: data.sessionType },
        ...(data.frequency ? [{ icon: "package" as const, label: "Frequency", value: data.frequency }] : []),
        ...(data.healingType ? [{ icon: "leaf" as const, label: "Healing Type", value: data.healingType }] : []),
        { icon: "calendar", label: "Booking Date", value: data.bookingDate },
        { icon: "card", label: "Total Amount", value: `₹${data.amount.toLocaleString()}` },
      ]) +
      `<div style="margin-bottom:4px;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:${BRAND.textDark};">What's Next?</p>
        <ul style="margin:0;padding-left:18px;color:${BRAND.textMuted};font-size:13px;line-height:1.9;">
          <li>Our team will contact you within 24 hours to schedule your session</li>
          <li>You will receive a WhatsApp message with session details</li>
          <li>Please keep your phone accessible for coordination</li>
          <li>Prepare any questions you'd like to discuss during the session</li>
        </ul>
      </div>`,
    footerNote: `Questions? Reach us at <a href="mailto:${siteConfig.contact.supportEmail}" style="color:${BRAND.navy};">${siteConfig.contact.supportEmail}</a>`,
  });
}

export function generateAdminNotificationEmail(data: {
  name: string;
  email: string;
  phone: string;
  sessionType: string;
  frequency?: string;
  healingType?: string;
  bookingId: string;
  amount: number;
  bookingDate: string;
}) {
  return renderEmailLayout({
    badgeIcon: "bell",
    heading: "New Session Booking Received",
    bodyHtml:
      emailInfoCard([
        { icon: "ticket", label: "Booking ID", value: data.bookingId },
        { icon: "user", label: "Name", value: data.name },
        { icon: "mail", label: "Email", value: data.email },
        { icon: "phone", label: "Phone", value: data.phone },
        { icon: "leaf", label: "Session Type", value: data.sessionType },
        ...(data.frequency ? [{ icon: "package" as const, label: "Frequency", value: data.frequency }] : []),
        ...(data.healingType ? [{ icon: "leaf" as const, label: "Healing Type", value: data.healingType }] : []),
        { icon: "card", label: "Amount Paid", value: `₹${data.amount.toLocaleString()}` },
        { icon: "calendar", label: "Booking Date", value: data.bookingDate },
      ]) +
      emailNote("<strong>Action Required:</strong> Please contact the customer within 24 hours to schedule the session.", "warning"),
    footerNote: "Internal notification — sent to the admin mailbox.",
  });
}

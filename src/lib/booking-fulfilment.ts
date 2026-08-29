import { after } from "next/server";
import getDB from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { BRAND, renderEmailLayout, emailInfoCard, emailNote, emailButton } from "@/lib/email-template";
import { siteConfig } from "@/config/site.config";
import { sendWhatsappNotification } from "@/lib/whatsapp";

/**
 * The single place a service/course booking becomes paid and confirmed.
 *
 * Reached by the browser's Razorpay handler (/api/bookings/verify-payment) and
 * by Razorpay itself (/api/razorpay/webhook), in either order and possibly
 * twice. Confirmation is idempotent: the claim below is one conditional
 * update, so exactly one caller flips `pending -> paid` and exactly one set of
 * confirmation emails and WhatsApp messages goes out.
 *
 * The webhook path is what covers a customer who pays in a UPI app and never
 * returns to the browser tab — previously that booking stayed `pending` with
 * no confirmation sent to them or to the admin.
 */
export type BookingOutcome =
  | { status: "confirmed"; alreadyConfirmed: boolean; bookingId: string; whatsappUrl: string; booking: any }
  | { status: "not_found" }
  | { status: "order_mismatch" };

export async function confirmSessionBooking(params: {
  /** Either id identifies the booking; pass whichever you hold. */
  bookingId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}): Promise<BookingOutcome> {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
  const { SessionBooking } = await getDB();

  const existing = bookingId
    ? await SessionBooking.findById(bookingId).catch(() => null)
    : razorpayOrderId
      ? await SessionBooking.findOne({ razorpay_order_id: razorpayOrderId })
      : null;

  // Not one of ours — e.g. a store order or a webinar registration.
  if (!existing) return { status: "not_found" };

  // The order id must be the one this booking created, so a valid signature
  // from some other (cheaper) order can't be replayed onto it.
  if (razorpayOrderId && existing.razorpay_order_id && existing.razorpay_order_id !== razorpayOrderId) {
    return { status: "order_mismatch" };
  }

  const bookingType = existing.order_type === "course" ? "Course" : "Service";
  const whatsappUrl = buildBookingWhatsappUrl(existing, razorpayPaymentId);

  // Atomic claim — see the note on fulfilStoreOrder.
  const claimed = await SessionBooking.findOneAndUpdate(
    { _id: existing._id, payment_status: { $ne: "paid" } },
    {
      payment_status: "paid",
      booking_status: existing.booking_status === "pending" ? "confirmed" : existing.booking_status,
      razorpay_payment_id: razorpayPaymentId,
      // Backfilled when it was missing, so this row can never be adopted by a
      // second order id later.
      ...(razorpayOrderId ? { razorpay_order_id: razorpayOrderId } : {}),
      ...(razorpaySignature ? { razorpay_signature: razorpaySignature } : {}),
      whatsapp_redirect_url: whatsappUrl,
      paid_at: new Date(),
    },
    { new: true }
  );

  if (!claimed) {
    // Already confirmed by the other caller. Hand back the stored WhatsApp
    // link rather than the freshly built one, so the browser shows the same
    // message the confirmation email already contains.
    return {
      status: "confirmed",
      alreadyConfirmed: true,
      bookingId: existing._id.toString(),
      whatsappUrl: existing.whatsapp_redirect_url || whatsappUrl,
      booking: existing,
    };
  }

  const booking = claimed;

  sendMail({
    to: booking.customer_email,
    subject: `${bookingType} Booking Confirmed — ${booking.booking_number}`,
    html: renderEmailLayout({
      preheader: "Your booking has been confirmed and payment received successfully.",
      badgeIcon: "check",
      heading: `${bookingType} Booking Confirmed!`,
      subheading: `Hi ${booking.customer_name}, your booking has been confirmed and payment received successfully.`,
      bodyHtml:
        emailInfoCard([
          { icon: "ticket", label: "Booking ID", value: booking.booking_number },
          { icon: "leaf", label: bookingType, value: booking.service_name },
          { icon: "package", label: "Plan", value: booking.frequency_label },
          { icon: "card", label: "Amount Paid", value: `₹${booking.amount.toFixed(2)}` },
          { icon: "fileText", label: "Transaction ID", value: razorpayPaymentId },
        ]) +
        emailNote(
          `<strong>Next Step:</strong> We'll contact you on WhatsApp at <strong>${booking.customer_phone}</strong> to schedule your session. You can also reach out to us directly.`,
          "warning",
          "phone"
        ) +
        `<div style="text-align:center;">${emailButton("Message Us on WhatsApp", whatsappUrl, "#25D366", "messageCircle")}</div>`,
    }),
  }).catch(() => {});

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    sendMail({
      to: adminEmail,
      subject: `New ${bookingType} Booking: ${booking.booking_number} — ₹${booking.amount.toFixed(2)}`,
      html: renderEmailLayout({
        badgeIcon: "calendar",
        heading: `New ${bookingType} Booking`,
        subheading: `Booking #${booking.booking_number}`,
        bodyHtml:
          emailInfoCard([
            { icon: "user", label: "Name", value: booking.customer_name },
            { icon: "mail", label: "Email", value: `<a href="mailto:${booking.customer_email}" style="color:${BRAND.navy};">${booking.customer_email}</a>` },
            { icon: "phone", label: "Phone", value: booking.customer_phone },
            { icon: "leaf", label: bookingType, value: booking.service_name },
            { icon: "tag", label: "Category", value: booking.service_category },
            { icon: "package", label: "Plan", value: booking.frequency_label },
            { icon: "card", label: "Amount", value: `₹${booking.amount.toFixed(2)}` },
            { icon: "fileText", label: "Transaction ID", value: razorpayPaymentId },
            { icon: "clock", label: "Received", value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST" },
          ]) +
          `<div style="text-align:center;">${emailButton("Contact Customer on WhatsApp", whatsappUrl, "#25D366", "messageCircle")}</div>`,
        footerNote: "Internal notification — sent to the admin mailbox.",
      }),
    }).catch(() => {});
  }

  // WhatsApp notifications (additive alongside the emails above).
  // after() keeps the serverless function alive until this finishes — an
  // un-awaited fire-and-forget call is frozen by Vercel the instant the
  // response is sent, so it never completes in production.
  const bookingWhatsappNumber = booking.customer_whatsapp || booking.customer_phone;
  const bookingSummary = `Booking #${booking.booking_number} — ${booking.service_name} (${booking.frequency_label} plan)`;
  after(() =>
    sendWhatsappNotification({
      event: "booking_confirmed_customer",
      to: bookingWhatsappNumber,
      data: {
        customerName: booking.customer_name,
        sessionTypeLabel: bookingType,
        bookingSummary,
        amount: booking.amount,
      },
    }).catch(() => {})
  );

  if (process.env.ADMIN_WHATSAPP_NUMBER) {
    after(() =>
      sendWhatsappNotification({
        event: "booking_confirmed_admin",
        to: process.env.ADMIN_WHATSAPP_NUMBER,
        data: {
          sessionTypeLabel: bookingType,
          bookingSummary,
          customerSummary: `${booking.customer_name} (${bookingWhatsappNumber})`,
          amount: booking.amount,
        },
      }).catch(() => {})
    );
  }

  return {
    status: "confirmed",
    alreadyConfirmed: false,
    bookingId: booking._id.toString(),
    whatsappUrl,
    booking,
  };
}

function buildBookingWhatsappUrl(booking: any, razorpayPaymentId: string): string {
  const whatsappNumber = siteConfig.contact.whatsapp;
  const message = `Hi, I just booked a session on ${BRAND.name}!

📋 *Booking Details*
• Booking ID: ${booking.booking_number}
• Service: ${booking.service_name}
• Plan: ${booking.frequency_label}
• Amount Paid: ₹${booking.amount}

👤 *My Details*
• Name: ${booking.customer_name}
• Email: ${booking.customer_email}
• Phone: ${booking.customer_phone}

💳 *Payment*
• Transaction ID: ${razorpayPaymentId}
• Status: Confirmed ✅

Please confirm my booking. Thank you!`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Guarded to `pending` so a late `payment.failed` for an abandoned attempt
 * can't downgrade a booking the customer went on to pay for.
 */
export async function markSessionBookingFailed(params: {
  bookingId?: string;
  razorpayOrderId?: string;
  reason?: string;
}): Promise<boolean> {
  const { SessionBooking } = await getDB();
  const filter: Record<string, any> = { payment_status: "pending" };
  if (params.bookingId) filter._id = params.bookingId;
  else if (params.razorpayOrderId) filter.razorpay_order_id = params.razorpayOrderId;
  else return false;

  const updated = await SessionBooking.findOneAndUpdate(
    filter,
    { payment_status: "failed", ...(params.reason ? { payment_failure_reason: params.reason } : {}) },
    { new: true }
  ).catch(() => null);

  return !!updated;
}

/** See markStoreOrderRefunded — same guard, same reasoning. */
export async function markSessionBookingRefunded(params: {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}): Promise<boolean> {
  const { SessionBooking } = await getDB();
  const filter: Record<string, any> = { payment_status: "paid" };
  if (params.razorpayOrderId) filter.razorpay_order_id = params.razorpayOrderId;
  else if (params.razorpayPaymentId) filter.razorpay_payment_id = params.razorpayPaymentId;
  else return false;

  const updated = await SessionBooking.findOneAndUpdate(
    filter,
    { payment_status: "refunded", booking_status: "cancelled", refunded_at: new Date() },
    { new: true }
  ).catch(() => null);

  return !!updated;
}

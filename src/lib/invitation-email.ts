import { BRAND, renderEmailLayout, emailInfoCard, emailButton } from "./email-template";

export interface InvitationPaymentDetails {
  /** Whole rupees, as charged. */
  amount: number;
  currency?: string;
  paymentId?: string;
}

export interface InvitationConfirmationInput {
  firstName: string;
  email: string;
  whatsappNumber?: string;
  location?: string;
  whatsappGroupLink?: string;
  /** Present only for paid webinars, and only once the payment is verified. */
  payment?: InvitationPaymentDetails;
}

function formatAmount(amount: number, currency = "INR") {
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

// Single source of truth for the registration-confirmation email — used both
// by the real send (lib/invitation-notify.ts) and the admin "send test email"
// preview, so the preview can never drift from what registrants actually get.
export function buildInvitationConfirmationEmail(input: InvitationConfirmationInput): {
  subject: string;
  html: string;
} {
  const { firstName, email, whatsappNumber, location, whatsappGroupLink, payment } = input;

  // A paid registration doubles as the receipt, so the amount and the payment
  // reference go in the details card alongside the contact rows.
  const isPaid = !!payment && payment.amount > 0;
  const amountText = isPaid ? formatAmount(payment!.amount, payment!.currency) : "";

  const detailsRows: Array<{ icon: "mail" | "phone" | "mapPin" | "card" | "fileText"; label: string; value: string }> = [
    { icon: "mail", label: "Email", value: email },
    ...(whatsappNumber ? [{ icon: "phone" as const, label: "WhatsApp", value: whatsappNumber }] : []),
    ...(location ? [{ icon: "mapPin" as const, label: "Location", value: location }] : []),
    ...(isPaid ? [{ icon: "card" as const, label: "Amount paid", value: amountText }] : []),
    ...(isPaid && payment!.paymentId
      ? [{ icon: "fileText" as const, label: "Payment ID", value: payment!.paymentId! }]
      : []),
  ];

  const paidBanner = isPaid
    ? `<p style="color:${BRAND.textDark};font-size:14px;margin:0 0 18px;text-align:center;line-height:1.6;">
         We've received your payment of <strong>${amountText}</strong>. Your seat is confirmed.
       </p>`
    : "";

  const bodyHtml = `
    ${paidBanner}
    ${emailInfoCard(detailsRows)}
    ${whatsappGroupLink ? `
    <div style="text-align:center;margin-bottom:22px;">
      ${emailButton("Join our WhatsApp Group", whatsappGroupLink, "#25D366", "messageCircle")}
    </div>` : ""}
    <p style="color:${BRAND.textMuted};font-size:14px;margin:0;text-align:center;line-height:1.6;">
      Check your email${whatsappGroupLink ? " and the WhatsApp group" : ""} for the event link and further instructions.
    </p>
    ${isPaid ? `
    <p style="color:${BRAND.textMuted};font-size:12px;margin:18px 0 0;text-align:center;line-height:1.6;">
      Keep this email as your receipt.
    </p>` : ""}`;

  return {
    subject: isPaid ? "Payment received, your seat is confirmed" : "Your seat has been reserved",
    html: renderEmailLayout({
      preheader: isPaid
        ? `We've received ${amountText}. Your seat is confirmed.`
        : "Your seat is confirmed — here's what happens next.",
      badgeIcon: "ticket",
      heading: isPaid ? "Payment Received, Seat Confirmed!" : "Your Seat is Reserved!",
      // The paid banner right below already states the amount, so the
      // subheading doesn't repeat it.
      subheading: isPaid
        ? `Hi ${firstName}, your seat is booked. Event details are on their way.`
        : `Hi ${firstName}, we've received your request and will send you the event details shortly.`,
      bodyHtml,
    }),
  };
}

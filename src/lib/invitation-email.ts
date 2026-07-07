import { BRAND, renderEmailLayout, emailInfoCard, emailButton } from "./email-template";

export interface InvitationConfirmationInput {
  firstName: string;
  email: string;
  whatsappNumber?: string;
  location?: string;
  whatsappGroupLink?: string;
}

// Single source of truth for the registration-confirmation email — used both
// by the real send (api/invitations/route.ts) and the admin "send test email"
// preview, so the preview can never drift from what registrants actually get.
export function buildInvitationConfirmationEmail(input: InvitationConfirmationInput): {
  subject: string;
  html: string;
} {
  const { firstName, email, whatsappNumber, location, whatsappGroupLink } = input;

  const detailsRows: Array<{ icon: "mail" | "phone" | "mapPin"; label: string; value: string }> = [
    { icon: "mail", label: "Email", value: email },
    ...(whatsappNumber ? [{ icon: "phone" as const, label: "WhatsApp", value: whatsappNumber }] : []),
    ...(location ? [{ icon: "mapPin" as const, label: "Location", value: location }] : []),
  ];

  const bodyHtml = `
    ${emailInfoCard(detailsRows)}
    ${whatsappGroupLink ? `
    <div style="text-align:center;margin-bottom:22px;">
      ${emailButton("Join our WhatsApp Group", whatsappGroupLink, "#25D366", "messageCircle")}
    </div>` : ""}
    <p style="color:${BRAND.textMuted};font-size:14px;margin:0;text-align:center;line-height:1.6;">
      Check your email${whatsappGroupLink ? " and the WhatsApp group" : ""} for the event link and further instructions.
    </p>`;

  return {
    subject: "Your seat has been reserved",
    html: renderEmailLayout({
      preheader: "Your seat is confirmed — here's what happens next.",
      badgeIcon: "ticket",
      heading: "Your Seat is Reserved!",
      subheading: `Hi ${firstName}, we've received your request and will send you the event details shortly.`,
      bodyHtml,
    }),
  };
}

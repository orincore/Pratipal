import { after } from "next/server";
import getDB from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { sendWhatsappNotification } from "@/lib/whatsapp";
import { buildInvitationConfirmationEmail } from "@/lib/invitation-email";

interface LandingPageMeta {
  title?: string;
  whatsappGroupLink?: string;
}

export async function getLandingPageMeta(
  landingPageId: string | undefined,
  landingPageSlug: string | undefined
): Promise<LandingPageMeta> {
  const { LandingPage } = await getDB();
  const query = landingPageId ? { _id: landingPageId } : landingPageSlug ? { slug: landingPageSlug } : null;
  if (!query) return {};

  const page = await LandingPage.findOne(query).select("title content").lean();
  const buttons = (page as any)?.content?.templateData?.invitation?.thankYouButtons as
    | { icon?: string; url?: string }[]
    | undefined;
  return {
    title: (page as any)?.title,
    whatsappGroupLink: buttons?.find((b) => b.icon === "whatsapp" && b.url)?.url,
  };
}

/**
 * Confirmation email + WhatsApp for a registrant who is now enrolled.
 *
 * Shared by the free flow (fires on submit) and the paid flow (fires only
 * after the Razorpay signature verifies), so a paying registrant gets exactly
 * the same confirmation as a free one.
 *
 * Entirely best-effort: the registration is already saved by the time this
 * runs, so an SMTP or WhatsApp failure must never surface as a failed sign-up.
 */
export async function sendInvitationConfirmation(params: {
  firstName: string;
  email: string;
  whatsappNumber?: string;
  location?: string;
  landingPageId?: string;
  landingPageSlug?: string;
  /** Paid webinars only, and only after the payment has been verified. */
  payment?: { amount: number; currency?: string; paymentId?: string };
}) {
  const { firstName, email, whatsappNumber, location, landingPageId, landingPageSlug, payment } = params;

  try {
    const meta = await getLandingPageMeta(landingPageId, landingPageSlug);

    const confirmationEmail = buildInvitationConfirmationEmail({
      firstName,
      email,
      whatsappNumber: whatsappNumber || "",
      location: location || "",
      whatsappGroupLink: meta.whatsappGroupLink,
      payment,
    });
    await sendMail({
      to: email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
    });

    // Wrapped in after() because on Vercel the serverless function is frozen
    // as soon as the response is sent — an un-awaited fetch left running in
    // the background never completes there.
    if (whatsappNumber) {
      after(() =>
        sendWhatsappNotification({
          event: "invitation_registration_confirmed",
          to: whatsappNumber,
          data: { firstName, topicTitle: meta.title },
        }).catch(() => {})
      );
    }
  } catch (mailErr) {
    console.error("Invitation confirmation send failed (registration still saved)", mailErr);
  }
}

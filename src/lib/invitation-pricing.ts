import getDB from "@/lib/db";

export interface InvitationPricing {
  isPaid: boolean;
  /** Whole rupees. 0 when the webinar is free. */
  amount: number;
  currency: string;
  pageTitle?: string;
  pageSlug?: string;
  pageId?: string;
}

/**
 * Resolves what a landing page's webinar actually costs, straight from the
 * saved page document.
 *
 * This is the single source of truth for price on the server. The browser
 * sends no amount at all — if it did, anyone could open devtools and register
 * for a 2,999 rupee webinar for 1 rupee. Both the order-creation and the
 * verification routes call this and use the value it returns.
 */
export async function resolveInvitationPricing(
  landingPageId?: string,
  landingPageSlug?: string
): Promise<InvitationPricing | null> {
  const { LandingPage } = await getDB();

  const validId = landingPageId && /^[a-f\d]{24}$/i.test(landingPageId) ? landingPageId : null;
  const query = validId ? { _id: validId } : landingPageSlug ? { slug: landingPageSlug } : null;
  if (!query) return null;

  const page = await LandingPage.findOne(query).select("title slug content").lean();
  if (!page) return null;

  const invitation = (page as any)?.content?.templateData?.invitation;
  const rawAmount = Number(invitation?.amount);
  // A page is only chargeable when it is explicitly marked paid AND carries a
  // positive amount. A "paid" page with a blank amount stays free rather than
  // creating a zero-value Razorpay order that would fail anyway.
  const isPaid = invitation?.pricingMode === "paid" && Number.isFinite(rawAmount) && rawAmount > 0;

  return {
    isPaid,
    amount: isPaid ? Math.round(rawAmount) : 0,
    currency: "INR",
    pageTitle: (page as any).title,
    pageSlug: (page as any).slug,
    pageId: (page as any)._id?.toString(),
  };
}

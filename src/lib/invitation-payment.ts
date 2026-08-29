import getDB from "@/lib/db";
import { sendInvitationConfirmation } from "@/lib/invitation-notify";

/**
 * The single place a paid registration becomes enrolled.
 *
 * Two callers can reach the same payment, and either may be first or may
 * arrive twice:
 *
 *   1. /api/invitations/verify-payment  — the browser's Razorpay handler.
 *   2. /api/invitations/payment-status  — a browser reconciling a checkout it
 *      left behind, either on returning to the page or on dismissing the
 *      sheet.
 *
 * Path 1 is the only one that used to exist, which meant a payment was only
 * ever recorded if the tab that started it survived the whole checkout. On
 * mobile it frequently doesn't (see payment-status route), so the money
 * arrived at Razorpay and the registrant stayed `pending` forever.
 *
 * Path 2 asks Razorpay what happened rather than trusting the browser, and
 * confirmation is idempotent: the claim below is a single conditional update,
 * so exactly one caller flips `pending -> paid` and exactly one confirmation
 * email/WhatsApp goes out no matter how many race.
 */
export type ConfirmOutcome =
  | { status: "confirmed"; alreadyConfirmed: boolean }
  | { status: "not_found" }
  | { status: "order_mismatch" };

export async function confirmInvitationPayment(params: {
  /** Either id identifies the registration; pass whichever you hold. */
  invitationId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId: string;
}): Promise<ConfirmOutcome> {
  const { invitationId, razorpayOrderId, razorpayPaymentId } = params;
  const { InvitationRequest } = await getDB();

  const registrant = invitationId
    ? await InvitationRequest.findById(invitationId)
    : razorpayOrderId
      ? await InvitationRequest.findOne({ razorpay_order_id: razorpayOrderId })
      : null;

  // Not one of ours — e.g. a store order or a session booking, which confirm
  // through their own routes. The caller decides whether that's an error.
  if (!registrant) return { status: "not_found" };

  // The order id must be the one this registration created, so a valid
  // signature from some other (e.g. cheaper) order can't be replayed onto it.
  //
  // A registration with no stored order id at all is the one exception: that
  // means create-payment's follow-up write lost the id, and refusing here
  // would strand a customer who really did pay. The caller is responsible for
  // having established the pairing some other way before reaching this point
  // (see resolveTarget in the webhook, which will only adopt an order id after
  // checking the amount paid covers what this registration is priced at).
  if (razorpayOrderId && registrant.razorpay_order_id && registrant.razorpay_order_id !== razorpayOrderId) {
    return { status: "order_mismatch" };
  }

  // Atomic claim. `findOneAndUpdate` with the status guard baked into the
  // filter means the handler and a reconcile landing at the same instant
  // cannot both pass — MongoDB applies one, and returns null to the other.
  const claimed = await InvitationRequest.findOneAndUpdate(
    { _id: registrant._id, payment_status: { $ne: "paid" } },
    {
      payment_status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      // Backfilled when it was missing, so this row can never be adopted by a
      // second order id later.
      ...(razorpayOrderId ? { razorpay_order_id: razorpayOrderId } : {}),
      paid_at: new Date(),
    },
    { new: true }
  );

  if (!claimed) return { status: "confirmed", alreadyConfirmed: true };

  await sendInvitationConfirmation({
    firstName: registrant.first_name,
    email: registrant.email,
    whatsappNumber: registrant.whatsapp_number,
    location: registrant.location,
    landingPageId: registrant.landing_page_id?.toString(),
    landingPageSlug: registrant.landing_page_slug,
    // Turns the confirmation into a receipt. The amount comes off the saved
    // registration (which was priced server-side), never off the request.
    payment: {
      amount: registrant.amount ?? 0,
      currency: registrant.currency || "INR",
      paymentId: razorpayPaymentId,
    },
  });

  return { status: "confirmed", alreadyConfirmed: false };
}

/**
 * Payment states that mean the customer's money has left their account.
 *
 * `authorized` is included deliberately: with auto-capture the window between
 * authorize and capture is short, but a registrant who returns inside it has
 * still paid and must not be told otherwise. Capture then follows on its own,
 * and any later re-confirmation is an already-confirmed no-op.
 */
export const SETTLED_PAYMENT_STATES = new Set(["captured", "authorized"]);

/**
 * A payment attempt Razorpay reports as failed.
 *
 * Guarded to `pending` so a late `payment.failed` for one abandoned attempt
 * can never downgrade a registration the person went on to pay for.
 */
export async function markInvitationFailed(params: {
  invitationId?: string;
  razorpayOrderId?: string;
  reason?: string;
}): Promise<boolean> {
  const { InvitationRequest } = await getDB();
  const filter: Record<string, any> = { payment_status: "pending" };
  if (params.invitationId) filter._id = params.invitationId;
  else if (params.razorpayOrderId) filter.razorpay_order_id = params.razorpayOrderId;
  else return false;

  const updated = await InvitationRequest.findOneAndUpdate(
    filter,
    { payment_status: "failed", ...(params.reason ? { payment_failure_reason: params.reason } : {}) },
    { new: true }
  ).catch(() => null);

  return !!updated;
}

/**
 * A refund Razorpay has processed. Guarded to `paid`, which also makes a
 * refund event that arrives before its capture event a harmless no-op.
 */
export async function markInvitationRefunded(params: {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}): Promise<boolean> {
  const { InvitationRequest } = await getDB();
  const filter: Record<string, any> = { payment_status: "paid" };
  if (params.razorpayOrderId) filter.razorpay_order_id = params.razorpayOrderId;
  else if (params.razorpayPaymentId) filter.razorpay_payment_id = params.razorpayPaymentId;
  else return false;

  const updated = await InvitationRequest.findOneAndUpdate(
    filter,
    { payment_status: "refunded", refunded_at: new Date() },
    { new: true }
  ).catch(() => null);

  return !!updated;
}

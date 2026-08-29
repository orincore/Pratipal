import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import getDB from "@/lib/db";
import {
  confirmInvitationPayment,
  markInvitationFailed,
  markInvitationRefunded,
} from "@/lib/invitation-payment";
import {
  fulfilStoreOrder,
  markStoreOrderFailed,
  markStoreOrderRefunded,
} from "@/lib/order-fulfilment";
import {
  confirmSessionBooking,
  markSessionBookingFailed,
  markSessionBookingRefunded,
} from "@/lib/booking-fulfilment";

/**
 * Razorpay's server-to-server report of what actually happened to a payment.
 *
 * Every checkout on this site — webinar registrations, store orders, and
 * service/course bookings — used to be recorded only by the browser calling
 * back into a verify-payment route from Razorpay's `handler`. That works right
 * up until the browser isn't there to do it, which on mobile is common:
 * choosing a UPI app hands the whole screen to GPay/PhonePe/Paytm, and a
 * backgrounded tab on a phone under memory pressure is routinely discarded. If
 * the customer pays in the UPI app and then closes it, or opens something else,
 * or just never taps "return to merchant", no `handler` ever fires. The money
 * reached Razorpay; the site never heard about it. Nothing was recorded, no
 * confirmation went out, and the record sat `pending` forever.
 *
 * This endpoint closes that hole for every payment method at once, because
 * Razorpay tells the *server* directly and does not care whether the customer's
 * browser survived. It is the authoritative capture channel; the browser paths
 * remain only because they are faster when they do work.
 *
 * Safety properties:
 *
 *   - Authenticated by HMAC-SHA256 over the exact raw body with
 *     RAZORPAY_WEBHOOK_SECRET, compared in constant time. An unsigned or
 *     wrongly signed request is rejected before anything is read from it.
 *   - Idempotent. Razorpay retries a webhook until it gets a 2xx, and delivers
 *     out of order, and both a webhook and a browser handler routinely report
 *     the same payment. Every write below is a conditional claim, so exactly
 *     one of them does the work and exactly one confirmation is sent.
 *   - Fails loudly, not silently. A transient error returns non-2xx so
 *     Razorpay retries (safe, per the point above); only genuinely
 *     unrecognised or already-handled events return 200.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** What kind of thing a Razorpay order belongs to. */
type Target =
  | { kind: "invitation"; id: string }
  | { kind: "order"; id: string }
  | { kind: "booking"; id: string }
  | { kind: "unknown" };

/**
 * A Razorpay order id is the one handle every event carries, so the three
 * collections that can own one are asked in parallel. That lookup is the
 * trusted route: the id was written server-side before checkout ever opened,
 * so a match is proof of which record this payment belongs to.
 *
 * `notes` is a guarded fallback for the one case the lookup can't cover — the
 * follow-up write that stores the order id failed, so a customer paid against
 * an order nothing here can recognise. Notes are set in the browser's checkout
 * options, which means a tampered client can put any id it likes in them; on
 * their own they are not proof of anything. So a record is only adopted from
 * notes when both hold:
 *
 *   1. it has no gateway order id at all (a record that has one must match it,
 *      or the pairing guard in the fulfilment libs rejects the event), and
 *   2. the amount actually paid — read off the Razorpay-signed payload, not
 *      off the notes — covers what that record is priced at.
 *
 * Without (2), someone could point a ₹1 payment's notes at a ₹4,900
 * registration and have it confirmed. With it, the only way to claim a record
 * is to have paid for it.
 */
async function resolveTarget(
  razorpayOrderId: string | null,
  notes: Record<string, any> | undefined,
  paidAmountPaise: number | null
): Promise<Target> {
  const { InvitationRequest, Order, SessionBooking } = await getDB();

  if (razorpayOrderId) {
    const [invitation, order, booking] = await Promise.all([
      InvitationRequest.findOne({ razorpay_order_id: razorpayOrderId }).select("_id").lean(),
      Order.findOne({ razorpay_order_id: razorpayOrderId }).select("_id").lean(),
      SessionBooking.findOne({ razorpay_order_id: razorpayOrderId }).select("_id").lean(),
    ]);
    if (invitation) return { kind: "invitation", id: String((invitation as any)._id) };
    if (order) return { kind: "order", id: String((order as any)._id) };
    if (booking) return { kind: "booking", id: String((booking as any)._id) };
  }

  const isObjectId = (v: unknown) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
  const candidates: Array<[Target["kind"], string]> = [];
  if (isObjectId(notes?.invitation_id)) candidates.push(["invitation", notes!.invitation_id]);
  if (isObjectId(notes?.order_id)) candidates.push(["order", notes!.order_id]);
  if (isObjectId(notes?.booking_id)) candidates.push(["booking", notes!.booking_id]);

  for (const [kind, id] of candidates) {
    const adopted = await adoptUnpairedRecord(kind, id, razorpayOrderId, paidAmountPaise);
    if (adopted) return { kind, id } as Target;
  }

  return { kind: "unknown" };
}

/**
 * Attach `razorpayOrderId` to a record that has none, but only if the payment
 * covers its price. Returns false — leaving the record untouched — otherwise.
 *
 * The write is conditional on the order id still being absent, so two events
 * racing to adopt the same record can't both win.
 */
async function adoptUnpairedRecord(
  kind: Target["kind"],
  id: string,
  razorpayOrderId: string | null,
  paidAmountPaise: number | null
): Promise<boolean> {
  if (kind === "unknown" || !razorpayOrderId || !paidAmountPaise) return false;

  const { InvitationRequest, Order, SessionBooking } = await getDB();
  // `any` because the three models have different document types and TypeScript
  // cannot call across the union; only the two field names below are touched.
  const model: any =
    kind === "invitation" ? InvitationRequest : kind === "order" ? Order : SessionBooking;
  // Store orders price into `total`; the other two into `amount`.
  const priceField = kind === "order" ? "total" : "amount";

  const record: any = await model.findById(id).select(`${priceField} razorpay_order_id`).lean().catch(() => null);
  if (!record) return false;

  // Already paired: the fulfilment libs enforce the pairing, so leave it be.
  if (record.razorpay_order_id) return false;

  const expectedPaise = Math.round(Number(record[priceField] || 0) * 100);
  if (!expectedPaise || paidAmountPaise < expectedPaise) {
    console.warn(
      `Razorpay webhook: refusing to adopt ${kind} ${id} from notes — paid ${paidAmountPaise} paise against an expected ${expectedPaise}`
    );
    return false;
  }

  const claimed = await model
    .findOneAndUpdate(
      { _id: id, $or: [{ razorpay_order_id: { $exists: false } }, { razorpay_order_id: null }] },
      { razorpay_order_id: razorpayOrderId },
      { new: true }
    )
    .catch(() => null);

  if (claimed) {
    console.warn(
      `Razorpay webhook: adopted ${kind} ${id} from notes for order ${razorpayOrderId} (amount verified)`
    );
  }
  return !!claimed;
}

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    // Refusing rather than skipping verification: an unauthenticated endpoint
    // that marks orders paid would be worse than no endpoint at all. Non-2xx
    // makes Razorpay retry, so events queue up rather than being lost while
    // the secret is missing.
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured — webhook rejected");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // The signature is over the exact bytes Razorpay sent. Re-serialising a
  // parsed object would change key order and whitespace and never match, so
  // the raw text has to be read first and parsed only afterwards.
  const rawBody = await req.text();
  const providedSignature = req.headers.get("x-razorpay-signature") || "";

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  const signatureValid =
    provided.length === expected.length && crypto.timingSafeEqual(provided, expected);

  if (!signatureValid) {
    console.warn("Razorpay webhook rejected: signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    // Correctly signed but unparseable. Retrying can't help, so accept it and
    // stop Razorpay from redelivering forever.
    console.error("Razorpay webhook: signed body was not valid JSON");
    return NextResponse.json({ received: true, handled: false, reason: "unparseable" });
  }

  const event: string = body?.event || "";
  const payment = body?.payload?.payment?.entity;
  const refund = body?.payload?.refund?.entity;
  const orderEntity = body?.payload?.order?.entity;

  const razorpayOrderId: string | null =
    payment?.order_id || orderEntity?.id || null;
  const razorpayPaymentId: string | null =
    payment?.id || refund?.payment_id || null;
  const notes: Record<string, any> | undefined = payment?.notes || orderEntity?.notes;
  // Straight off the signed payload, so it is Razorpay's word for what was
  // actually paid rather than anything the browser supplied.
  const paidAmountPaise: number | null =
    typeof payment?.amount === "number"
      ? payment.amount
      : typeof orderEntity?.amount_paid === "number"
        ? orderEntity.amount_paid
        : null;

  try {
    switch (event) {
      case "payment.captured":
      // `authorized` is handled too. With auto-capture the gap before capture
      // is short, but a customer who has been debited has paid and must not be
      // left pending inside it; the capture event that follows is then an
      // already-confirmed no-op.
      case "payment.authorized":
      case "order.paid": {
        if (!razorpayPaymentId) {
          console.error(`Razorpay webhook ${event}: no payment id in payload`);
          return NextResponse.json({ received: true, handled: false, reason: "no_payment_id" });
        }
        return await handleSettled(event, razorpayOrderId, razorpayPaymentId, notes, paidAmountPaise);
      }

      case "payment.failed": {
        const reason: string | undefined =
          payment?.error_description || payment?.error_reason || undefined;
        return await handleFailed(razorpayOrderId, notes, reason);
      }

      case "refund.created":
      case "refund.processed": {
        return await handleRefunded(razorpayOrderId, razorpayPaymentId, notes);
      }

      default:
        // Subscribed to something we don't act on. 200 so Razorpay stops.
        return NextResponse.json({ received: true, handled: false, reason: "event_ignored", event });
    }
  } catch (err: any) {
    // A DB or mailer failure. Non-2xx so Razorpay retries — safe because every
    // write is a conditional claim, so a retry after partial work re-runs
    // nothing that already succeeded.
    console.error(`Razorpay webhook ${event} failed:`, err?.message || err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleSettled(
  event: string,
  razorpayOrderId: string | null,
  razorpayPaymentId: string,
  notes: Record<string, any> | undefined,
  paidAmountPaise: number | null
) {
  const target = await resolveTarget(razorpayOrderId, notes, paidAmountPaise);

  if (target.kind === "unknown") {
    // A payment taken through some other channel (a payment link, the
    // dashboard, another site on the same Razorpay account). Nothing here owns
    // it, and retrying will not change that.
    console.warn(
      `Razorpay webhook ${event}: no local record for order ${razorpayOrderId ?? "(none)"}`
    );
    return NextResponse.json({ received: true, handled: false, reason: "no_matching_record" });
  }

  if (target.kind === "invitation") {
    const outcome = await confirmInvitationPayment({
      invitationId: target.id,
      razorpayOrderId: razorpayOrderId || undefined,
      razorpayPaymentId,
    });
    return respondToOutcome(event, "invitation", target.id, outcome.status, outcome);
  }

  if (target.kind === "order") {
    // No sessionCartId: the webhook has no cookies, so a guest's session cart
    // is left for their own tab to clear.
    const outcome = await fulfilStoreOrder({
      orderId: target.id,
      razorpayOrderId: razorpayOrderId || undefined,
      razorpayPaymentId,
    });
    return respondToOutcome(event, "order", target.id, outcome.status, outcome);
  }

  const outcome = await confirmSessionBooking({
    bookingId: target.id,
    razorpayOrderId: razorpayOrderId || undefined,
    razorpayPaymentId,
  });
  return respondToOutcome(event, "booking", target.id, outcome.status, outcome);
}

function respondToOutcome(
  event: string,
  kind: string,
  id: string,
  status: string,
  outcome: any
) {
  if (status === "confirmed") {
    console.log(
      `Razorpay webhook ${event}: ${kind} ${id} ${outcome.alreadyConfirmed ? "already confirmed" : "confirmed"}`
    );
    return NextResponse.json({
      received: true,
      handled: true,
      kind,
      alreadyConfirmed: !!outcome.alreadyConfirmed,
    });
  }

  // order_mismatch means a signed event named an order this record doesn't
  // own. That's a data problem, not a transient one — retrying won't fix it,
  // so acknowledge and log for a human.
  console.error(`Razorpay webhook ${event}: ${kind} ${id} -> ${status}`);
  return NextResponse.json({ received: true, handled: false, reason: status });
}

async function handleFailed(
  razorpayOrderId: string | null,
  notes: Record<string, any> | undefined,
  reason: string | undefined
) {
  // `null` amount: a failure or refund must never cause an unpaired record to
  // be adopted, so the notes fallback is deliberately disarmed for them.
  const target = await resolveTarget(razorpayOrderId, notes, null);
  if (target.kind === "unknown") {
    return NextResponse.json({ received: true, handled: false, reason: "no_matching_record" });
  }

  const marked =
    target.kind === "invitation"
      ? await markInvitationFailed({ invitationId: target.id, reason })
      : target.kind === "order"
        ? await markStoreOrderFailed({ orderId: target.id })
        : await markSessionBookingFailed({ bookingId: target.id, reason });

  // `marked === false` is the normal, correct outcome for a customer whose
  // first attempt failed and whose second succeeded: the record is already
  // `paid`, and the guard refused to downgrade it.
  console.log(
    `Razorpay webhook payment.failed: ${target.kind} ${target.id} ${marked ? "marked failed" : "left as-is (not pending)"}`
  );
  return NextResponse.json({ received: true, handled: true, kind: target.kind, marked });
}

async function handleRefunded(
  razorpayOrderId: string | null,
  razorpayPaymentId: string | null,
  notes: Record<string, any> | undefined
) {
  const target = await resolveTarget(razorpayOrderId, notes, null);
  if (target.kind === "unknown") {
    return NextResponse.json({ received: true, handled: false, reason: "no_matching_record" });
  }

  const args = {
    razorpayOrderId: razorpayOrderId || undefined,
    razorpayPaymentId: razorpayPaymentId || undefined,
  };
  const marked =
    target.kind === "invitation"
      ? await markInvitationRefunded(args)
      : target.kind === "order"
        ? await markStoreOrderRefunded(args)
        : await markSessionBookingRefunded(args);

  console.log(
    `Razorpay webhook refund: ${target.kind} ${target.id} ${marked ? "marked refunded" : "no paid record to refund"}`
  );
  return NextResponse.json({ received: true, handled: true, kind: target.kind, marked });
}

/**
 * Deployment check only — says whether the secret is present, never what it is.
 * Razorpay itself only ever POSTs here.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "razorpay-webhook",
    configured: !!process.env.RAZORPAY_WEBHOOK_SECRET,
    events: [
      "payment.captured",
      "payment.authorized",
      "payment.failed",
      "order.paid",
      "refund.created",
      "refund.processed",
    ],
  });
}

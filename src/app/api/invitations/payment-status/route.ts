import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import getDB from "@/lib/db";
import { confirmInvitationPayment, SETTLED_PAYMENT_STATES } from "@/lib/invitation-payment";

/**
 * "Did this registration actually get paid?" — asked by the browser, answered
 * by Razorpay rather than by the browser's own memory of what happened.
 *
 * This exists because of what mobile checkout really looks like. Picking a UPI
 * app in Razorpay's sheet fires an Android/iOS intent and hands the whole
 * screen to GPay/PhonePe/Paytm. The browser tab is backgrounded, and on a
 * phone under memory pressure it is routinely discarded — so when the user
 * comes back after paying, the landing page reloads from scratch. React state
 * is gone, Razorpay's `handler` callback never runs, and nothing ever calls
 * verify-payment. The customer is charged, is dumped back on the landing page
 * with no gateway and no confirmation, and the registration sits `pending`
 * forever. Same story for in-app browsers (Instagram/Facebook) that kill the
 * page on app switch.
 *
 * So on load the client asks here about any checkout it left unfinished, and
 * we go and look the order up at Razorpay. If a payment settled, the
 * registration is confirmed exactly as if the handler had fired.
 *
 * The one case this cannot cover is a customer who pays and never returns to
 * the page at all. Their payment is visible in the Razorpay dashboard but
 * nothing here hears about it, so those registrations stay `pending` until
 * someone reconciles them by hand.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const invitationId = String(body.invitationId || "").trim();

    if (!/^[a-f\d]{24}$/i.test(invitationId)) {
      return NextResponse.json({ error: "Invalid registration id" }, { status: 400 });
    }

    const { InvitationRequest } = await getDB();
    const registrant = await InvitationRequest.findById(invitationId);
    if (!registrant) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Already settled by the handler or an earlier check — nothing to look up.
    if (registrant.payment_status === "paid") {
      return NextResponse.json({ paid: true, status: "paid" });
    }

    if (!registrant.razorpay_order_id) {
      return NextResponse.json({ paid: false, status: registrant.payment_status });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error("Razorpay credentials are not configured");
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payments: any = await razorpay.orders.fetchPayments(registrant.razorpay_order_id);
    const settled = (payments?.items || []).find((p: any) => SETTLED_PAYMENT_STATES.has(p?.status));

    if (!settled) {
      // Genuinely unpaid: they abandoned the sheet, or the payment failed.
      // Surface the gateway's own reason when there is one so the form can say
      // something better than "try again".
      const failed = (payments?.items || []).find((p: any) => p?.status === "failed");
      return NextResponse.json({
        paid: false,
        status: registrant.payment_status,
        failureReason: failed?.error_description || null,
      });
    }

    const outcome = await confirmInvitationPayment({
      invitationId,
      razorpayOrderId: registrant.razorpay_order_id,
      razorpayPaymentId: settled.id,
    });

    if (outcome.status !== "confirmed") {
      console.error("Invitation confirmation failed", invitationId, outcome.status);
      return NextResponse.json({ error: "Could not confirm this payment" }, { status: 409 });
    }

    return NextResponse.json({ paid: true, status: "paid", reconciled: true });
  } catch (err: any) {
    console.error("Invitation payment status error", err);
    return NextResponse.json(
      { error: err?.message || "Unable to check this payment right now." },
      { status: 500 }
    );
  }
}

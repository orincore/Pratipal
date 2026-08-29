import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import getDB from "@/lib/db";
import { confirmInvitationPayment } from "@/lib/invitation-payment";

/**
 * Step 2 of the paid-webinar flow: the browser reporting back from Razorpay's
 * `handler` callback.
 *
 * The signature is recomputed here with the Razorpay secret. The browser's
 * claim that a payment succeeded is never trusted — a handler callback can be
 * forged, an HMAC over the server's own secret cannot.
 *
 * This is now the *fastest* confirmation path rather than the only one: the
 * payment-status route confirms the same payment through
 * confirmInvitationPayment, which enrols and emails exactly once no matter
 * which of them gets there first. See src/lib/invitation-payment.ts.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invitationId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invitationId) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not configured");
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const provided = Buffer.from(String(razorpay_signature));
    const expected = Buffer.from(expectedSignature);
    const isValid =
      provided.length === expected.length && crypto.timingSafeEqual(provided, expected);

    if (!isValid) {
      const { InvitationRequest } = await getDB();
      // Only a still-pending row may be marked failed. Without that guard a
      // forged call could downgrade a registration that had already been
      // confirmed.
      await InvitationRequest.findOneAndUpdate(
        { _id: invitationId, payment_status: "pending" },
        { payment_status: "failed" }
      ).catch(() => {});
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // The order id must be the one this registration created, so a valid
    // signature from some other (e.g. cheaper) order can't be replayed here —
    // confirmInvitationPayment enforces that pairing.
    const outcome = await confirmInvitationPayment({
      invitationId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    if (outcome.status === "not_found") {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    if (outcome.status === "order_mismatch") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      alreadyConfirmed: outcome.alreadyConfirmed,
    });
  } catch (err: any) {
    console.error("Invitation payment verification error", err);
    return NextResponse.json(
      { error: err?.message || "Verification failed" },
      { status: 500 }
    );
  }
}

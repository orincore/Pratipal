import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { fulfilStoreOrder, markStoreOrderFailed } from "@/lib/order-fulfilment";

/**
 * The browser reporting back from Razorpay's `handler` callback.
 *
 * The signature is recomputed here with the Razorpay secret — the browser's
 * claim that a payment succeeded is never trusted, since a handler callback can
 * be forged and an HMAC over the server's own secret cannot.
 *
 * This is now the *fastest* confirmation path rather than the only one:
 * /api/razorpay/webhook fulfils the same order through the same
 * fulfilStoreOrder, which decrements stock, delivers e-books and sends
 * confirmations exactly once no matter which of them gets there first. See
 * src/lib/order-fulfilment.ts.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
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
      // Only a still-pending order may be marked failed. Without that guard a
      // forged call could downgrade an order that was already paid for.
      await markStoreOrderFailed({ orderId: order_id });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCartId = cookieStore.get("cart_session")?.value || null;

    const outcome = await fulfilStoreOrder({
      orderId: order_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      sessionCartId,
    });

    if (outcome.status === "not_found") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (outcome.status === "order_mismatch") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      alreadyConfirmed: outcome.alreadyConfirmed,
    });
  } catch (err: any) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { error: err.message || "Verification failed" },
      { status: 500 }
    );
  }
}

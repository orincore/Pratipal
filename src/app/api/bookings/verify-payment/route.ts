import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { confirmSessionBooking } from "@/lib/booking-fulfilment";

/**
 * The browser reporting back from Razorpay's `handler` callback.
 *
 * The signature is recomputed with the Razorpay secret — a handler callback can
 * be forged, an HMAC over the server's own secret cannot.
 *
 * This is now the *fastest* confirmation path rather than the only one:
 * /api/razorpay/webhook confirms the same booking through the same
 * confirmSessionBooking, which sends the customer and admin notifications
 * exactly once no matter which of them gets there first. See
 * src/lib/booking-fulfilment.ts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not configured");
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const provided = Buffer.from(String(razorpay_signature));
    const expected = Buffer.from(generatedSignature);
    const isValid =
      provided.length === expected.length && crypto.timingSafeEqual(provided, expected);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const outcome = await confirmSessionBooking({
      bookingId: booking_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (outcome.status === "not_found") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (outcome.status === "order_mismatch") {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      booking: outcome.booking?.toJSON ? outcome.booking.toJSON() : outcome.booking,
      whatsapp_url: outcome.whatsappUrl,
      alreadyConfirmed: outcome.alreadyConfirmed,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}

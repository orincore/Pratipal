import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import getDB from "@/lib/db";

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

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const { SessionBooking } = await getDB();

    // Update booking with payment details
    const booking = await SessionBooking.findById(booking_id);
    
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Generate WhatsApp redirect URL
    const whatsappNumber = "917605072424"; // +91 7605072424
    const message = `Hi, I just booked a session on Pratipal!

📋 *Booking Details*
• Booking ID: ${booking.booking_number}
• Service: ${booking.service_name}
• Plan: ${booking.frequency_label}
• Amount Paid: ₹${booking.amount}

👤 *My Details*
• Name: ${booking.customer_name}
• Email: ${booking.customer_email}
• Phone: ${booking.customer_phone}

💳 *Payment*
• Transaction ID: ${razorpay_payment_id}
• Status: Confirmed ✅

Please confirm my booking. Thank you!`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Update booking
    booking.payment_status = "paid";
    booking.razorpay_payment_id = razorpay_payment_id;
    booking.razorpay_signature = razorpay_signature;
    booking.whatsapp_redirect_url = whatsappUrl;
    await booking.save();

    return NextResponse.json({
      success: true,
      booking: booking.toJSON(),
      whatsapp_url: whatsappUrl,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}

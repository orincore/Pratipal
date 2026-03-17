import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import getDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, amount } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize Razorpay inside the function
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay credentials not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const { SessionBooking } = await getDB();

    // Get booking details
    const booking = await SessionBooking.findById(bookingId).lean();

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: booking.booking_number,
      notes: {
        booking_id: bookingId,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        session_type: booking.session_type,
      },
    };

    const order = await razorpay.orders.create(options);

    // Update booking with Razorpay order ID
    await SessionBooking.findByIdAndUpdate(bookingId, {
      razorpay_order_id: order.id,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
      booking,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}

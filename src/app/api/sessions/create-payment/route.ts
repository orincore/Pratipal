import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServiceSupabase } from "@/lib/auth";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

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

    const supabase = getServiceSupabase();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("session_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
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
    const { error: updateError } = await supabase
      .from("session_bookings")
      .update({
        razorpay_order_id: order.id,
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
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

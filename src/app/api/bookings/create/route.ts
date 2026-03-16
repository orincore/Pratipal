import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { nanoid } from "nanoid";
import getDB from "@/lib/db";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_id,
      service_id,
      service_name,
      service_category,
      frequency_label,
      booking_type,
      customer_name,
      customer_email,
      customer_phone,
      amount,
    } = body;

    if (!customer_id || !service_id || !service_name || !amount || !customer_name || !customer_email || !customer_phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { SessionBooking } = await getDB();

    // Generate unique booking number
    const booking_number = `BK-${Date.now()}-${nanoid(6)}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: booking_number,
      notes: {
        customer_id,
        service_id,
        service_name,
        customer_name,
        customer_email,
      },
    });

    // Create booking in database
    const booking = await SessionBooking.create({
      booking_number,
      customer_id,
      service_id,
      service_name,
      service_category: service_category || "General",
      frequency_label: frequency_label || "One-time",
      booking_type: booking_type || "service",
      order_type: booking_type || "service",
      customer_name,
      customer_email,
      customer_phone,
      amount,
      payment_status: "pending",
      razorpay_order_id: razorpayOrder.id,
    });

    return NextResponse.json({
      booking: booking.toJSON(),
      razorpay_order_id: razorpayOrder.id,
      razorpay_key_id: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
    });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

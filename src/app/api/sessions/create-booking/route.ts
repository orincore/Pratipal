import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      sessionType,
      frequency,
      healingType,
      courseType,
      amount,
      notes,
    } = body;

    // Validation
    if (!customerName || !customerEmail || !customerPhone || !sessionType || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate booking number
    const bookingNumber = `SB-${Date.now()}-${nanoid(6).toUpperCase()}`;

    const { SessionBooking } = await getDB();

    // Create booking record
    const booking = await SessionBooking.create({
      booking_number: bookingNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      session_id: sessionType,
      session_date: new Date(),
      session_time: "TBD",
      amount: amount,
      payment_status: "pending",
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error in create-booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

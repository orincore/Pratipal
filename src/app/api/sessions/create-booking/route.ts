import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/auth";
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

    const supabase = getServiceSupabase();

    // Create booking record
    const { data: booking, error } = await supabase
      .from("session_bookings")
      .insert({
        booking_number: bookingNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        session_type: sessionType,
        frequency: frequency || null,
        healing_type: healingType || null,
        course_type: courseType || null,
        amount: amount,
        payment_status: "pending",
        status: "pending",
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

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

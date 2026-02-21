import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceSupabase } from "@/lib/auth";
import { sendEmail, generateBookingConfirmationEmail, generateAdminNotificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Update booking with payment details
    const { data: booking, error: updateError } = await supabase
      .from("session_bookings")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError || !booking) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    // Send confirmation email to customer
    try {
      const emailData = {
        name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone,
        sessionType: booking.session_type,
        frequency: booking.frequency,
        healingType: booking.healing_type,
        bookingId: booking.booking_number,
        amount: booking.amount,
        bookingDate: new Date(booking.created_at).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      await sendEmail({
        to: booking.customer_email,
        subject: "Session Booking Confirmed - Pratipal Healing",
        html: generateBookingConfirmationEmail(emailData),
      });

      // Send notification to admin
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `New Session Booking: ${booking.booking_number}`,
          html: generateAdminNotificationEmail(emailData),
        });
      }
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Payment verified and booking confirmed",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

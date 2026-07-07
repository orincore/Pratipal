import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import getDB from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { BRAND, renderEmailLayout, emailInfoCard, emailNote, emailButton } from "@/lib/email-template";

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

    // Send confirmation email to customer
    const bookingType = booking.order_type === "course" ? "Course" : "Service";
    sendMail({
      to: booking.customer_email,
      subject: `${bookingType} Booking Confirmed — ${booking.booking_number}`,
      html: renderEmailLayout({
        preheader: "Your booking has been confirmed and payment received successfully.",
        badgeIcon: "check",
        heading: `${bookingType} Booking Confirmed!`,
        subheading: `Hi ${booking.customer_name}, your booking has been confirmed and payment received successfully.`,
        bodyHtml:
          emailInfoCard([
            { icon: "ticket", label: "Booking ID", value: booking.booking_number },
            { icon: "leaf", label: bookingType, value: booking.service_name },
            { icon: "package", label: "Plan", value: booking.frequency_label },
            { icon: "card", label: "Amount Paid", value: `₹${booking.amount.toFixed(2)}` },
            { icon: "fileText", label: "Transaction ID", value: razorpay_payment_id },
          ]) +
          emailNote(
            `<strong>Next Step:</strong> We'll contact you on WhatsApp at <strong>${booking.customer_phone}</strong> to schedule your session. You can also reach out to us directly.`,
            "warning",
            "phone"
          ) +
          `<div style="text-align:center;">${emailButton("Message Us on WhatsApp", whatsappUrl, "#25D366", "messageCircle")}</div>`,
      }),
    }).catch(() => {});

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendMail({
        to: adminEmail,
        subject: `New ${bookingType} Booking: ${booking.booking_number} — ₹${booking.amount.toFixed(2)}`,
        html: renderEmailLayout({
          badgeIcon: "calendar",
          heading: `New ${bookingType} Booking`,
          subheading: `Booking #${booking.booking_number}`,
          bodyHtml:
            emailInfoCard([
              { icon: "user", label: "Name", value: booking.customer_name },
              { icon: "mail", label: "Email", value: `<a href="mailto:${booking.customer_email}" style="color:${BRAND.navy};">${booking.customer_email}</a>` },
              { icon: "phone", label: "Phone", value: booking.customer_phone },
              { icon: "leaf", label: bookingType, value: booking.service_name },
              { icon: "tag", label: "Category", value: booking.service_category },
              { icon: "package", label: "Plan", value: booking.frequency_label },
              { icon: "card", label: "Amount", value: `₹${booking.amount.toFixed(2)}` },
              { icon: "fileText", label: "Transaction ID", value: razorpay_payment_id },
              { icon: "clock", label: "Received", value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST" },
            ]) +
            `<div style="text-align:center;">${emailButton("Contact Customer on WhatsApp", whatsappUrl, "#25D366", "messageCircle")}</div>`,
          footerNote: "Internal notification — sent to the admin mailbox.",
        }),
      }).catch(() => {});
    }

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

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import getDB from "@/lib/db";
import { sendMail } from "@/lib/mailer";

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
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#fff;margin-bottom:12px;">✅</div>
              <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">${bookingType} Booking Confirmed!</h2>
              <p style="color:#6b7280;font-size:14px;margin:0;">Hi ${booking.customer_name},</p>
            </div>
            <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
              <p style="color:#166534;font-size:15px;font-weight:600;margin:0 0 8px;">✓ Payment Confirmed</p>
              <p style="color:#15803d;font-size:13px;margin:0;">Your booking has been confirmed and payment received successfully.</p>
            </div>
            <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:20px;">
              <p style="font-size:13px;color:#374151;margin:0 0 12px;"><strong>Booking Details:</strong></p>
              <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>Booking ID:</strong> ${booking.booking_number}</p>
              <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>${bookingType}:</strong> ${booking.service_name}</p>
              <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>Plan:</strong> ${booking.frequency_label}</p>
              <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>Amount Paid:</strong> ₹${booking.amount.toFixed(2)}</p>
              <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
            </div>
            <div style="background:#fef3c7;border-radius:10px;padding:16px;margin-bottom:20px;border:1px solid #fde68a;">
              <p style="color:#92400e;font-size:13px;margin:0;">📱 <strong>Next Step:</strong> We'll contact you on WhatsApp at <strong>${booking.customer_phone}</strong> to schedule your session. You can also reach out to us directly.</p>
            </div>
            <div style="text-align:center;margin-bottom:16px;">
              <a href="${whatsappUrl}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                💬 Message Us on WhatsApp
              </a>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin:0;">If you have any questions, feel free to reach out to us at <a href="mailto:connect@pratipal.in" style="color:#059669;">connect@pratipal.in</a></p>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Pratipal · connect@pratipal.in</p>
        </div>
      `,
    }).catch(() => {});

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendMail({
        to: adminEmail,
        subject: `New ${bookingType} Booking: ${booking.booking_number} — ₹${booking.amount.toFixed(2)}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
            <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#1b244a,#059669);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#fff;margin-bottom:12px;">📅</div>
                <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">New ${bookingType} Booking</h2>
                <p style="color:#6b7280;font-size:14px;margin:0;">Booking #${booking.booking_number}</p>
              </div>
              <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
                <p style="font-size:14px;color:#166534;font-weight:600;margin:0 0 12px;">Customer Details:</p>
                <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Name:</strong> ${booking.customer_name}</p>
                <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Email:</strong> <a href="mailto:${booking.customer_email}" style="color:#059669;">${booking.customer_email}</a></p>
                <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Phone:</strong> ${booking.customer_phone}</p>
              </div>
              <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:16px;">
                <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Booking Details:</strong></p>
                <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>${bookingType}:</strong> ${booking.service_name}</p>
                <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>Category:</strong> ${booking.service_category}</p>
                <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>Plan:</strong> ${booking.frequency_label}</p>
                <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>Amount:</strong> ₹${booking.amount.toFixed(2)}</p>
                <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
              </div>
              <div style="text-align:center;margin-bottom:16px;">
                <a href="${whatsappUrl}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                  💬 Contact Customer on WhatsApp
                </a>
              </div>
              <p style="color:#6b7280;font-size:13px;margin:0;">Received at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST</p>
            </div>
          </div>
        `,
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

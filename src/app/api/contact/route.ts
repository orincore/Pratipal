import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create contact submission
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    await contact.save();

    // Send confirmation email to user
    await sendMail({
      to: email,
      subject: "We received your message!",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#1b244a,#059669);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#fff;margin-bottom:12px;">✉️</div>
              <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Thank You for Reaching Out!</h2>
              <p style="color:#6b7280;font-size:14px;margin:0;">Hi ${name},</p>
            </div>
            <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
              <p style="color:#166534;font-size:15px;font-weight:600;margin:0 0 8px;">✓ Message Received</p>
              <p style="color:#15803d;font-size:13px;margin:0;">We've received your message and will get back to you within 24-48 hours.</p>
            </div>
            <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:20px;">
              <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Your Message:</strong></p>
              <p style="font-size:13px;color:#6b7280;margin:4px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="font-size:13px;color:#6b7280;margin:8px 0 0;white-space:pre-wrap;">${message}</p>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin:0;">If you have any urgent questions, feel free to reach out to us at <a href="mailto:connect@pratipal.in" style="color:#059669;">connect@pratipal.in</a></p>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Pratipal · connect@pratipal.in</p>
        </div>
      `,
    });

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendMail({
        to: adminEmail,
        subject: `New Contact Form: ${subject}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
            <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#1b244a,#059669);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#fff;margin-bottom:12px;">📬</div>
                <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">New Contact Form Submission</h2>
              </div>
              <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
                <p style="font-size:14px;color:#166534;font-weight:600;margin:0 0 12px;">Contact Details:</p>
                <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Name:</strong> ${name}</p>
                <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#059669;">${email}</a></p>
                ${phone ? `<p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
                <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Subject:</strong> ${subject}</p>
              </div>
              <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:16px;">
                <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Message:</strong></p>
                <p style="font-size:13px;color:#6b7280;margin:0;white-space:pre-wrap;">${message}</p>
              </div>
              <p style="color:#6b7280;font-size:13px;margin:0;">Received at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json(
      { 
        message: "Contact form submitted successfully",
        id: contact._id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    
    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Contact.countDocuments(filter);
    
    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
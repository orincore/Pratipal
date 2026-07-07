import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { sendMail } from "@/lib/mailer";
import { BRAND, renderEmailLayout, emailInfoCard } from "@/lib/email-template";

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
      html: renderEmailLayout({
        preheader: "We've received your message and will get back to you within 24-48 hours.",
        badgeIcon: "mail",
        heading: "Thank You for Reaching Out!",
        subheading: `Hi ${name}, we've received your message and will get back to you within 24-48 hours.`,
        bodyHtml: `
          <div style="background:${BRAND.infoCardBg};border-radius:12px;padding:16px;margin-bottom:6px;">
            <p style="font-size:13px;color:${BRAND.textDark};margin:0 0 8px;font-weight:600;">${subject}</p>
            <p style="font-size:13px;color:${BRAND.textMuted};margin:0;white-space:pre-wrap;line-height:1.6;">${message}</p>
          </div>`,
      }),
    });

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendMail({
        to: adminEmail,
        subject: `New Contact Form: ${subject}`,
        html: renderEmailLayout({
          badgeIcon: "bell",
          heading: "New Contact Form Submission",
          bodyHtml:
            emailInfoCard([
              { icon: "user", label: "Name", value: name },
              { icon: "mail", label: "Email", value: `<a href="mailto:${email}" style="color:${BRAND.navy};">${email}</a>` },
              ...(phone ? [{ icon: "phone" as const, label: "Phone", value: phone }] : []),
              { icon: "clock", label: "Received", value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST" },
            ]) +
            `<div style="background:${BRAND.infoCardBg};border-radius:12px;padding:16px;">
              <p style="font-size:13px;color:${BRAND.textDark};margin:0 0 8px;font-weight:600;">${subject}</p>
              <p style="font-size:13px;color:${BRAND.textMuted};margin:0;white-space:pre-wrap;line-height:1.6;">${message}</p>
            </div>`,
          footerNote: "Internal notification — sent to the admin mailbox.",
        }),
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
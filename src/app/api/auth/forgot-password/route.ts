import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendMail } from "@/lib/mailer";
import getDB from "@/lib/db";
import { renderEmailLayout, emailCodeBox, emailNote } from "@/lib/email-template";

// In-memory OTP store for password reset: email → { otp, expires }
const resetOtpStore = new Map<string, { otp: string; expires: number }>();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/forgot-password — send OTP
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const { Customer } = await getDB();
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() }).lean();

    // Always return success to avoid email enumeration
    if (!customer) {
      return NextResponse.json({ success: true });
    }

    const otp = generateOtp();
    resetOtpStore.set(email.toLowerCase(), { otp, expires: Date.now() + 10 * 60 * 1000 });

    const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "there";

    await sendMail({
      to: email,
      subject: "Reset your Pratipal password",
      html: renderEmailLayout({
        preheader: `Your password reset code is ${otp}`,
        badgeIcon: "lock",
        heading: "Reset your password",
        subheading: `Hi ${name}, use this code to reset your Pratipal password.`,
        bodyHtml:
          emailCodeBox(otp) +
          `<p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>`,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/auth/forgot-password — verify OTP
export async function PUT(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    }

    const record = resetOtpStore.get(email.toLowerCase());
    if (!record) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }
    if (Date.now() > record.expires) {
      resetOtpStore.delete(email.toLowerCase());
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }
    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: "Incorrect code. Try again." }, { status: 400 });
    }

    // Mark as verified but keep in store for the reset step
    resetOtpStore.set(email.toLowerCase(), { ...record, otp: "__verified__" });

    return NextResponse.json({ verified: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/auth/forgot-password — set new password
export async function PATCH(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Email and a password of at least 8 characters are required" }, { status: 400 });
    }

    const record = resetOtpStore.get(email.toLowerCase());
    if (!record || record.otp !== "__verified__") {
      return NextResponse.json({ error: "Please verify your email first." }, { status: 400 });
    }

    const { Customer } = await getDB();
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    customer.password_hash = await bcrypt.hash(password, 12);
    await customer.save();

    resetOtpStore.delete(email.toLowerCase());

    const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "there";
    const resetTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

    await sendMail({
      to: email,
      subject: "Your Pratipal password has been reset",
      html: renderEmailLayout({
        preheader: `Your password was changed on ${resetTime} IST`,
        badgeIcon: "check",
        heading: "Password successfully reset",
        subheading: `Hi ${name}, your Pratipal account password was successfully changed on ${resetTime} IST. If you made this change, no further action is needed.`,
        bodyHtml: emailNote(
          `If you did not reset your password, please contact us immediately at <a href="mailto:connect@pratipal.in" style="font-weight:600;">connect@pratipal.in</a>`,
          "danger"
        ),
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

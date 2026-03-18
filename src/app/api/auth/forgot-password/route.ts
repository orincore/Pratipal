import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendMail } from "@/lib/mailer";
import getDB from "@/lib/db";

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
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#1b244a,#059669);border-radius:50%;width:52px;height:52px;line-height:52px;font-size:24px;color:#fff;margin-bottom:16px;">🔐</div>
            <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Reset your password</h2>
            <p style="color:#6b7280;font-size:14px;margin:0 0 4px;">Hi ${name},</p>
            <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Use this code to reset your Pratipal password.</p>
            <div style="background:#f0fdf4;border:2px dashed #6ee7b7;border-radius:12px;padding:20px;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#059669;">${otp}</span>
            </div>
            <p style="font-size:12px;color:#9ca3af;margin:0;">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Pratipal · connect@pratipal.in</p>
        </div>
      `,
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
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#1b244a,#059669);border-radius:50%;width:52px;height:52px;line-height:52px;font-size:24px;color:#fff;margin-bottom:16px;">✅</div>
            <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Password successfully reset</h2>
            <p style="color:#6b7280;font-size:14px;margin:0 0 4px;">Hi ${name},</p>
            <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Your Pratipal account password was successfully changed on <strong>${resetTime} IST</strong>.</p>
            <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">If you made this change, no further action is needed.</p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:8px;">
              <p style="color:#dc2626;font-size:13px;margin:0;">If you did not reset your password, please contact us immediately at <a href="mailto:connect@pratipal.in" style="color:#dc2626;">connect@pratipal.in</a></p>
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Pratipal · connect@pratipal.in</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

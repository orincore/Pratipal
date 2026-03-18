import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

// In-memory OTP store: email → { otp, expires }
// For production use Redis or MongoDB, but this works for a single-instance server
const otpStore = new Map<string, { otp: string; expires: number }>();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const otp = generateOtp();
    otpStore.set(email.toLowerCase(), { otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 min

    await sendMail({
      to: email,
      subject: "Your Pratipal verification code",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);border-radius:50%;width:52px;height:52px;line-height:52px;font-size:24px;color:#fff;margin-bottom:16px;">✉️</div>
            <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Verify your email</h2>
            <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Enter this code to complete your Pratipal registration.</p>
            <div style="background:#f0fdf4;border:2px dashed #6ee7b7;border-radius:12px;padding:20px;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#059669;">${otp}</span>
            </div>
            <p style="font-size:12px;color:#9ca3af;margin:0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
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

export async function PUT(req: NextRequest) {
  // Verify OTP
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });

  const record = otpStore.get(email.toLowerCase());
  if (!record) return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
  if (Date.now() > record.expires) {
    otpStore.delete(email.toLowerCase());
    return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
  }
  if (record.otp !== otp.trim()) return NextResponse.json({ error: "Incorrect code. Try again." }, { status: 400 });

  otpStore.delete(email.toLowerCase()); // one-time use
  return NextResponse.json({ verified: true });
}

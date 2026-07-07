import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { BRAND, renderEmailLayout, emailCodeBox } from "@/lib/email-template";

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
      html: renderEmailLayout({
        preheader: `Your verification code is ${otp}`,
        badgeIcon: "mail",
        heading: "Verify your email",
        subheading: "Enter this code to complete your Pratipal registration.",
        bodyHtml:
          emailCodeBox(otp) +
          `<p style="font-size:12px;color:${BRAND.textMuted};margin:0;text-align:center;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>`,
      }),
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

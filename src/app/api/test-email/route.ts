import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function GET() {
  try {
    const info = await sendMail({
      to: "suradkaradarsh@gmail.com",
      subject: "Test Email from Pratipal",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1b244a;">Hello from Pratipal 👋</h2>
          <p style="color: #555;">This is a test email sent via Nodemailer using the Google Workspace account <strong>connect@pratipal.in</strong>.</p>
          <p style="color: #555;">If you received this, the email setup is working correctly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 12px;">Pratipal &mdash; connect@pratipal.in</p>
        </div>
      `,
      text: "Hello from Pratipal! This is a test email sent via Nodemailer.",
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

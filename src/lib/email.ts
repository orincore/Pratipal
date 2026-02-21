import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Pratipal Healing" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

export function generateBookingConfirmationEmail(data: {
  name: string;
  email: string;
  phone: string;
  sessionType: string;
  frequency?: string;
  healingType?: string;
  bookingId: string;
  amount: number;
  bookingDate: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background: linear-gradient(135deg, rgba(59,89,152,0.05) 0%, rgba(16,185,129,0.05) 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(59,89,152,0.05) 0%, rgba(16,185,129,0.05) 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #3B5998 0%, #1B7F79 50%, #10B981 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">प्रतिपल</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; letter-spacing: 2px;">PRATIPAL HEALING</p>
            </td>
          </tr>
          
          <!-- Success Message -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3B5998 0%, #10B981 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 40px;">✓</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #1B7F79; font-size: 28px; font-weight: 700;">Booking Confirmed!</h2>
              <p style="margin: 0; color: #666; font-size: 16px;">Your healing session has been successfully booked</p>
            </td>
          </tr>
          
          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(59,89,152,0.05) 0%, rgba(16,185,129,0.05) 100%); border-radius: 12px; padding: 25px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 20px; color: #333; font-size: 18px; font-weight: 600;">Booking Details</h3>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Booking ID:</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${data.bookingId}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Name:</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${data.name}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Email:</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${data.email}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Phone:</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${data.phone}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Session Type:</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${data.sessionType}</td>
                      </tr>
                      ${data.frequency ? `
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Frequency:</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${data.frequency}</td>
                      </tr>
                      ` : ''}
                      ${data.healingType ? `
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Healing Type:</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${data.healingType}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Booking Date:</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${data.bookingDate}</td>
                      </tr>
                      <tr style="border-top: 2px solid rgba(27,127,121,0.2);">
                        <td style="color: #1B7F79; font-size: 16px; font-weight: 700; padding: 15px 0 0;">Total Amount:</td>
                        <td style="color: #1B7F79; font-size: 18px; font-weight: 700; text-align: right; padding: 15px 0 0;">₹${data.amount.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #333; font-size: 18px; font-weight: 600;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                <li>Our team will contact you within 24 hours to schedule your session</li>
                <li>You will receive a WhatsApp message with session details</li>
                <li>Please keep your phone accessible for coordination</li>
                <li>Prepare any questions you'd like to discuss during the session</li>
              </ul>
            </td>
          </tr>
          
          <!-- Contact Section -->
          <tr>
            <td style="padding: 0 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3B5998 0%, #10B981 100%); border-radius: 12px; padding: 25px;">
                <tr>
                  <td style="text-align: center;">
                    <h3 style="margin: 0 0 15px; color: white; font-size: 18px; font-weight: 600;">Need Help?</h3>
                    <p style="margin: 0 0 15px; color: rgba(255,255,255,0.9); font-size: 14px;">Contact us for any questions or concerns</p>
                    <p style="margin: 0; color: white; font-size: 14px;">
                      📧 hello@pratipal.in<br>
                      📱 +91 98765 43210
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #666; font-size: 12px;">
                Thank you for choosing Pratipal Healing
              </p>
              <p style="margin: 0; color: #999; font-size: 11px;">
                © ${new Date().getFullYear()} Pratipal. All rights reserved.<br>
                Handcrafted with love & intention in India 🇮🇳
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateAdminNotificationEmail(data: {
  name: string;
  email: string;
  phone: string;
  sessionType: string;
  frequency?: string;
  healingType?: string;
  bookingId: string;
  amount: number;
  bookingDate: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Session Booking</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #1B7F79; margin-bottom: 20px;">🔔 New Session Booking Received</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.bookingId}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.email}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Session Type:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.sessionType}</td>
      </tr>
      ${data.frequency ? `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Frequency:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.frequency}</td>
      </tr>
      ` : ''}
      ${data.healingType ? `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Healing Type:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.healingType}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>₹${data.amount.toLocaleString()}</strong></td>
      </tr>
      <tr>
        <td style="padding: 10px;"><strong>Booking Date:</strong></td>
        <td style="padding: 10px;">${data.bookingDate}</td>
      </tr>
    </table>
    
    <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
      <p style="margin: 0; color: #0369a1;"><strong>Action Required:</strong> Please contact the customer within 24 hours to schedule the session.</p>
    </div>
  </div>
</body>
</html>
  `;
}

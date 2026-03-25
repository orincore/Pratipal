import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";
import { sendMail } from "@/lib/mailer";

function sanitizeText(value?: string | null) {
  return (value ?? "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = sanitizeText(body.firstName);
    const email = sanitizeText(body.email).toLowerCase();
    const whatsappNumber = sanitizeText(body.whatsappNumber);
    const location = sanitizeText(body.location);

    if (!firstName || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const { InvitationRequest } = await getDB();

    const invitationData = {
      landing_page_id: sanitizeText(body.landingPageId) || undefined,
      landing_page_slug: sanitizeText(body.landingPageSlug) || undefined,
      first_name: firstName,
      email,
      whatsapp_number: whatsappNumber || undefined,
      location: location || undefined,
    };

    await InvitationRequest.create(invitationData);
    // Send confirmation email to user
    await sendMail({
      to: email,
      subject: "Your seat has been reserved! 🎉",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#fff;margin-bottom:12px;">🎉</div>
              <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Your Seat is Reserved!</h2>
              <p style="color:#6b7280;font-size:14px;margin:0;">Hi ${firstName},</p>
            </div>
            <div style="background:linear-gradient(135deg,#faf5ff,#f3e8ff);border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e9d5ff;">
              <p style="color:#6b21a8;font-size:15px;font-weight:600;margin:0 0 8px;">✓ Registration Confirmed</p>
              <p style="color:#7c3aed;font-size:13px;margin:0;">We've received your request and will send you the event details shortly.</p>
            </div>
            <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:20px;">
              <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Your Details:</strong></p>
              <p style="font-size:13px;color:#6b7280;margin:4px 0;">📧 Email: ${email}</p>
              ${whatsappNumber ? `<p style="font-size:13px;color:#6b7280;margin:4px 0;">📱 WhatsApp: ${whatsappNumber}</p>` : ''}
              ${location ? `<p style="font-size:13px;color:#6b7280;margin:4px 0;">📍 Location: ${location}</p>` : ''}
            </div>
            <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">Check your email and WhatsApp for the event link and further instructions.</p>
            <p style="color:#9ca3af;font-size:12px;margin:0;">If you have any questions, feel free to reach out to us at <a href="mailto:connect@pratipal.in" style="color:#7c3aed;">connect@pratipal.in</a></p>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">Pratipal · connect@pratipal.in</p>
        </div>
      `,
    });

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendMail({
        to: adminEmail,
        subject: `New Invitation Request from ${firstName}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
            <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#1b244a,#059669);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#fff;margin-bottom:12px;">🔔</div>
                <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">New Invitation Request</h2>
                <p style="color:#6b7280;font-size:14px;margin:0;">Someone just reserved their seat!</p>
              </div>
              <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
                <p style="font-size:14px;color:#166534;font-weight:600;margin:0 0 12px;">Attendee Information:</p>
                <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Name:</strong> ${firstName}</p>
                <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#059669;">${email}</a></p>
                ${whatsappNumber ? `<p style="font-size:14px;color:#374151;margin:6px 0;"><strong>WhatsApp:</strong> ${whatsappNumber}</p>` : ''}
                ${location ? `<p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Location:</strong> ${location}</p>` : ''}
                ${body.landingPageSlug ? `<p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Landing Page:</strong> ${body.landingPageSlug}</p>` : ''}
              </div>
              <p style="color:#6b7280;font-size:13px;margin:0;">Received at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Invitation request error", err);
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { InvitationRequest } = await getDB();
  const url = new URL(req.url);
  const landingPageId = url.searchParams.get("landingPageId");

  const filter: any = {};
  if (landingPageId) {
    filter.landing_page_id = landingPageId;
  }

  const invitations = await InvitationRequest.find(filter)
    .select('landing_page_id landing_page_slug first_name email whatsapp_number location created_at')
    .sort({ created_at: -1 })
    .lean();

  const data = invitations.map(inv => ({
    ...inv,
    id: inv._id.toString(),
    _id: undefined
  }));

  return NextResponse.json({ invitations: data });
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { InvitationRequest } = await getDB();
  const deleted = await InvitationRequest.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

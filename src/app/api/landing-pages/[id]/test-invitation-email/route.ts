import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { buildInvitationConfirmationEmail } from "@/lib/invitation-email";

function sanitizeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

// Lets an admin preview exactly what a registrant's confirmation email looks
// like for this landing page — including its WhatsApp group button, if one is
// configured — without creating a real InvitationRequest.
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const to = (body.to || user.email || "").trim();
  if (!to) {
    return NextResponse.json({ error: "A recipient email is required" }, { status: 400 });
  }

  const { LandingPage } = await getDB();
  const page = await LandingPage.findById(id).select("content").lean();
  if (!page) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }

  // Prefer the value sent from the editor (may include unsaved changes);
  // fall back to what's actually persisted for this landing page.
  let whatsappGroupLink: string | undefined = sanitizeUrl(body.whatsappGroupLink);
  if (!whatsappGroupLink) {
    const buttons = (page as any)?.content?.templateData?.invitation?.thankYouButtons as
      | { icon?: string; url?: string }[]
      | undefined;
    whatsappGroupLink = buttons?.find((b) => b.icon === "whatsapp" && b.url)?.url;
  }

  const { subject, html } = buildInvitationConfirmationEmail({
    firstName: "Test User",
    email: to,
    whatsappNumber: "+91 98765 43210",
    location: "Mumbai",
    whatsappGroupLink,
  });

  try {
    const info = await sendMail({ to, subject: `[TEST] ${subject}`, html });
    return NextResponse.json({
      success: true,
      sentTo: to,
      whatsappGroupLinkIncluded: Boolean(whatsappGroupLink),
      messageId: (info as any)?.messageId,
    });
  } catch (err: any) {
    console.error("test-invitation-email send failed", err);
    return NextResponse.json({ error: err.message || "Failed to send test email" }, { status: 500 });
  }
}

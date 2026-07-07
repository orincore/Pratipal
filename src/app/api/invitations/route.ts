import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { buildInvitationConfirmationEmail } from "@/lib/invitation-email";
import { BRAND, renderEmailLayout, emailInfoCard } from "@/lib/email-template";

function sanitizeText(value?: string | null) {
  return (value ?? "").trim();
}

export async function getWhatsappGroupLink(
  landingPageId: string | undefined,
  landingPageSlug: string | undefined
): Promise<string | undefined> {
  const { LandingPage } = await getDB();
  const query = landingPageId ? { _id: landingPageId } : landingPageSlug ? { slug: landingPageSlug } : null;
  if (!query) return undefined;

  const page = await LandingPage.findOne(query).select("content").lean();
  const buttons = (page as any)?.content?.templateData?.invitation?.thankYouButtons as
    | { icon?: string; url?: string }[]
    | undefined;
  return buttons?.find((b) => b.icon === "whatsapp" && b.url)?.url;
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

    const rawLandingPageId = sanitizeText(body.landingPageId);
    const invitationData = {
      // landing_page_id is an ObjectId in the schema — only set it when it's a
      // valid id, otherwise Mongoose throws a CastError and the whole sign-up fails.
      landing_page_id: /^[a-f\d]{24}$/i.test(rawLandingPageId) ? rawLandingPageId : undefined,
      landing_page_slug: sanitizeText(body.landingPageSlug) || undefined,
      first_name: firstName,
      email,
      whatsapp_number: whatsappNumber || undefined,
      location: location || undefined,
    };

    await InvitationRequest.create(invitationData);

    // Emails are best-effort: a mail/SMTP failure must NOT make the sign-up
    // appear to fail, since the request has already been saved successfully.
    try {
    const whatsappGroupLink = await getWhatsappGroupLink(invitationData.landing_page_id, invitationData.landing_page_slug);

    // Send confirmation email to user
    const confirmationEmail = buildInvitationConfirmationEmail({
      firstName,
      email,
      whatsappNumber,
      location,
      whatsappGroupLink,
    });
    await sendMail({
      to: email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
    });

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendMail({
        to: adminEmail,
        subject: `New Invitation Request from ${firstName}`,
        html: renderEmailLayout({
          badgeIcon: "bell",
          heading: "New Invitation Request",
          subheading: "Someone just reserved their seat!",
          bodyHtml: emailInfoCard([
            { icon: "user", label: "Name", value: firstName },
            { icon: "mail", label: "Email", value: `<a href="mailto:${email}" style="color:${BRAND.navy};">${email}</a>` },
            ...(whatsappNumber ? [{ icon: "phone" as const, label: "WhatsApp", value: whatsappNumber }] : []),
            ...(location ? [{ icon: "mapPin" as const, label: "Location", value: location }] : []),
            ...(body.landingPageSlug ? [{ icon: "link" as const, label: "Landing Page", value: body.landingPageSlug }] : []),
            { icon: "clock", label: "Received", value: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST" },
          ]),
          footerNote: "Internal notification — sent to the admin mailbox.",
        }),
      });
    }
    } catch (mailErr) {
      // Log but don't fail the request — the sign-up was already saved.
      console.error("Invitation email send failed (sign-up still saved)", mailErr);
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

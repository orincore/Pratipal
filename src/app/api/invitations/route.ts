import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, getUserFromRequest } from "@/lib/auth";

function sanitizeText(value?: string | null) {
  return (value ?? "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = sanitizeText(body.firstName);
    const email = sanitizeText(body.email).toLowerCase();

    if (!firstName || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase.from("invitation_requests").insert({
      landing_page_id: sanitizeText(body.landingPageId) || null,
      landing_page_slug: sanitizeText(body.landingPageSlug) || null,
      first_name: firstName,
      email,
      whatsapp_number: sanitizeText(body.whatsappNumber) || null,
      gender: sanitizeText(body.gender) || null,
    });

    if (error) {
      console.error("Invitation request failed", error);
      return NextResponse.json(
        { error: "Unable to save request. Please try again." },
        { status: 500 }
      );
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

  const supabase = getServiceSupabase();
  const url = new URL(req.url);
  const landingPageId = url.searchParams.get("landingPageId");

  let query = supabase
    .from("invitation_requests")
    .select("id, landing_page_id, landing_page_slug, first_name, email, whatsapp_number, gender, created_at")
    .order("created_at", { ascending: false });

  if (landingPageId) {
    query = query.eq("landing_page_id", landingPageId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invitations: data ?? [] });
}

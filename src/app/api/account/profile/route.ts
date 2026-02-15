import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/auth";
import { requireCustomerSession } from "@/lib/customer-session";

export async function GET() {
  try {
    const session = await requireCustomerSession();
    const supabase = getServiceSupabase();

    const { data: customer, error } = await supabase
      .from("customers")
      .select("id, email, first_name, last_name, phone, avatar_url, is_verified, created_at")
      .eq("id", session.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireCustomerSession();
    const body = await req.json();
    const supabase = getServiceSupabase();

    const updates: Record<string, any> = {};
    if (body.first_name !== undefined) updates.first_name = body.first_name;
    if (body.last_name !== undefined) updates.last_name = body.last_name;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

    const { data, error } = await supabase
      .from("customers")
      .update(updates)
      .eq("id", session.id)
      .select("id, email, first_name, last_name, phone, avatar_url, is_verified, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

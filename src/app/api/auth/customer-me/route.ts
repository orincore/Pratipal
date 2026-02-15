import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("customer_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(sessionCookie.value);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const supabase = getServiceSupabase();

    const { data: customer, error } = await supabase
      .from("customers")
      .select("id, email, first_name, last_name, phone, avatar_url, is_verified, created_at")
      .eq("id", decoded.sub)
      .single();

    if (error || !customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

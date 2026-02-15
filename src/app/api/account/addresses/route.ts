import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/auth";
import { requireCustomerSession } from "@/lib/customer-session";

export async function GET() {
  try {
    const session = await requireCustomerSession();
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", session.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ addresses: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: err.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireCustomerSession();
    const body = await req.json();
    const supabase = getServiceSupabase();

    const address = {
      customer_id: session.id,
      address_type: body.address_type || "shipping",
      first_name: body.first_name,
      last_name: body.last_name,
      company: body.company,
      address_line1: body.address_line1,
      address_line2: body.address_line2,
      city: body.city,
      state: body.state,
      postal_code: body.postal_code,
      country: body.country || "India",
      phone: body.phone,
      is_default: body.is_default || false,
    };

    if (!address.first_name || !address.last_name || !address.address_line1 || !address.city || !address.state || !address.postal_code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (address.is_default) {
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", session.id)
        .eq("address_type", address.address_type);
    }

    const { data, error } = await supabase
      .from("customer_addresses")
      .insert(address)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ address: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: err.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

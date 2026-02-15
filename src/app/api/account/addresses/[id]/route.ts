import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/auth";
import { requireCustomerSession } from "@/lib/customer-session";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireCustomerSession();
    const body = await req.json();
    const supabase = getServiceSupabase();

    const updates: Record<string, any> = {};
    const allowed = [
      "first_name",
      "last_name",
      "company",
      "address_line1",
      "address_line2",
      "city",
      "state",
      "postal_code",
      "country",
      "phone",
      "address_type",
      "is_default",
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    if (updates.is_default) {
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", session.id)
        .eq("address_type", updates.address_type || body.address_type || "shipping");
    }

    const { id } = await context.params;
    const { data, error } = await supabase
      .from("customer_addresses")
      .update(updates)
      .eq("id", id)
      .eq("customer_id", session.id)
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

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireCustomerSession();
    const supabase = getServiceSupabase();
    const { id } = await context.params;

    const { error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id)
      .eq("customer_id", session.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: err.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

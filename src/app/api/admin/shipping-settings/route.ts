import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/auth";

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("shipping_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch shipping settings" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || { cost_per_kg: 50, free_shipping_threshold: 500 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const body = await req.json();

    const { cost_per_kg, free_shipping_threshold } = body;

    // Get existing settings
    const { data: existing } = await supabase
      .from("shipping_settings")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from("shipping_settings")
        .update({
          cost_per_kg,
          free_shipping_threshold,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      // Insert new
      result = await supabase
        .from("shipping_settings")
        .insert({
          cost_per_kg,
          free_shipping_threshold,
        })
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json(
        { error: "Failed to update shipping settings" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

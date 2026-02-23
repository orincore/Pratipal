import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET all hero sections
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("hero_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching hero sections:", error);
      return NextResponse.json(
        { error: "Failed to fetch hero sections" },
        { status: 500 }
      );
    }

    return NextResponse.json({ heroSections: data || [] });
  } catch (error) {
    console.error("Error in GET /api/admin/hero-sections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new hero section
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("hero_sections")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Error creating hero section:", error);
      return NextResponse.json(
        { error: "Failed to create hero section" },
        { status: 500 }
      );
    }

    return NextResponse.json({ heroSection: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/hero-sections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

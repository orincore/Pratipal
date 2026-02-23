import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public endpoint to fetch active hero sections
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("hero_sections")
      .select("*")
      .eq("is_active", true)
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
    console.error("Error in GET /api/hero-sections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

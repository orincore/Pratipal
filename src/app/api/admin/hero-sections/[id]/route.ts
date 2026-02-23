import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET single hero section
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from("hero_sections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching hero section:", error);
      return NextResponse.json(
        { error: "Hero section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ heroSection: data });
  } catch (error) {
    console.error("Error in GET /api/admin/hero-sections/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update hero section
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("hero_sections")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating hero section:", error);
      return NextResponse.json(
        { error: "Failed to update hero section" },
        { status: 500 }
      );
    }

    return NextResponse.json({ heroSection: data });
  } catch (error) {
    console.error("Error in PUT /api/admin/hero-sections/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE hero section
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await context.params;

    const { error } = await supabase
      .from("hero_sections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting hero section:", error);
      return NextResponse.json(
        { error: "Failed to delete hero section" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Hero section deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/hero-sections/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    //TO check is auth is working or noT
    
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product by slug:", error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: data });
  } catch (err: any) {
    console.error("Exception in GET /api/products/slug/[slug]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

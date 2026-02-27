import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product by ID:", error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: data });
  } catch (err: any) {
    console.error("Exception in GET /api/products/[id]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("products")
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description,
        short_description: body.short_description,
        price: body.price,
        sale_price: body.sale_price,
        cost_price: body.cost_price,
        sku: body.sku,
        stock_quantity: body.stock_quantity,
        stock_status: body.stock_status,
        manage_stock: body.manage_stock,
        category_id: body.category_id,
        images: body.images,
        featured_image: body.featured_image,
        is_featured: body.is_featured,
        is_active: body.is_active,
        homepage_section: body.homepage_section,
        weight: body.weight,
        dimensions: body.dimensions,
        tags: body.tags,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (err: any) {
    console.error("Exception in PUT /api/products/[id]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Exception in DELETE /api/products/[id]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

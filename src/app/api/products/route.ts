import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const url = new URL(req.url);
    
    const categoryId = url.searchParams.get("categoryId");
    const featured = url.searchParams.get("featured");
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    let query = supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data || [], total: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(req);
    console.log("User from request:", user);
    
    if (!user) {
      console.error("No user found in request");
      return NextResponse.json({ error: "Not authenticated. Please login first." }, { status: 401 });
    }
    
    if (user.role !== "admin") {
      console.error("User is not admin:", user.role);
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    console.log("Creating product with data:", JSON.stringify(body, null, 2));

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description,
        short_description: body.short_description,
        price: body.price,
        sale_price: body.sale_price,
        cost_price: body.cost_price,
        sku: body.sku,
        stock_quantity: body.stock_quantity || 0,
        stock_status: body.stock_status || "in_stock",
        manage_stock: body.manage_stock !== false,
        category_id: body.category_id,
        images: body.images || [],
        featured_image: body.featured_image,
        is_featured: body.is_featured || false,
        is_active: body.is_active !== false,
        homepage_section: body.homepage_section || null,
        weight: body.weight,
        dimensions: body.dimensions || {},
        tags: body.tags || [],
        meta_title: body.meta_title,
        meta_description: body.meta_description,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating product:", JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint 
      }, { status: 500 });
    }

    console.log("Product created successfully:", data);
    return NextResponse.json({ product: data });
  } catch (err: any) {
    console.error("Exception creating product:", err);
    return NextResponse.json({ 
      error: err.message, 
      type: err.constructor.name,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    }, { status: 500 });
  }
}

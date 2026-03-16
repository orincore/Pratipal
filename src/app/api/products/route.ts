import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { Product } = await getDB();
    const url = new URL(req.url);
    
    const categoryId = url.searchParams.get("categoryId");
    const featured = url.searchParams.get("featured");
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    console.log("Fetching products with params:", { categoryId, featured, search, limit, offset });

    const filter: any = { is_active: true };

    if (categoryId) {
      filter.category_id = categoryId;
    }

    if (featured === "true") {
      filter.is_featured = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category_id', 'id name slug')
        .sort({ created_at: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const productsWithId = products.map(p => {
      const product: any = { ...p, id: p._id.toString() };
      delete product._id;
      if (product.category_id) {
        product.category = {
          id: product.category_id._id?.toString() || product.category_id,
          name: product.category_id.name,
          slug: product.category_id.slug
        };
      }
      return product;
    });

    console.log(`Successfully fetched ${productsWithId.length} products`);
    return NextResponse.json({ products: productsWithId, total });
  } catch (err: any) {
    console.error("Exception in GET /api/products:", err);
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

    const { Product } = await getDB();

    const product = await Product.create({
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
      highlights: body.highlights || [],
      additional_info: body.additional_info || [],
      care_instructions: body.care_instructions,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
    });

    console.log("Product created successfully:", product.id);
    return NextResponse.json({ product: product.toJSON() });
  } catch (err: any) {
    console.error("Exception creating product:", err);
    return NextResponse.json({ 
      error: err.message, 
      type: err.constructor.name,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    console.log("API: Fetching product with slug:", slug);
    
    if (!slug) {
      console.error("API: No slug provided");
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const { Product } = await getDB();
    console.log("API: Database connection established");

    const product = await Product.findOne({ slug, is_active: true })
      .populate('category_id', 'id name slug')
      .lean();

    console.log("API: Database query completed, product found:", !!product);

    if (!product) {
      console.log("API: Product not found in database");
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data: any = { ...product, id: product._id.toString() };
    delete data._id;
    
    if (data.category_id) {
      data.category = {
        id: data.category_id._id?.toString() || data.category_id,
        name: data.category_id.name,
        slug: data.category_id.slug
      };
    }

    console.log("API: Returning product data:", data.name);
    return NextResponse.json({ product: data });
  } catch (err: any) {
    console.error("API: Exception in GET /api/products/slug/[slug]:", err);
    console.error("API: Error stack:", err.stack);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    }, { status: 500 });
  }
}

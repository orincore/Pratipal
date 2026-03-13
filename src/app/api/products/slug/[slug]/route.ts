import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

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

    const { Product } = await getDB();

    const product = await Product.findOne({ slug, is_active: true })
      .populate('category_id', 'id name slug')
      .lean();

    if (!product) {
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

    return NextResponse.json({ product: data });
  } catch (err: any) {
    console.error("Exception in GET /api/products/slug/[slug]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

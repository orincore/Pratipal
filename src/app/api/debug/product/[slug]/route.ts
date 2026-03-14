import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    
    console.log("DEBUG: Checking product with slug:", slug);
    
    const { Product } = await getDB();
    
    // Check if product exists (active or inactive)
    const product = await Product.findOne({ slug }).lean();
    const activeProduct = await Product.findOne({ slug, is_active: true }).lean();
    
    // Get all products for comparison
    const allProducts = await Product.find({}, 'slug name is_active').lean();
    
    return NextResponse.json({
      slug,
      productExists: !!product,
      productActive: !!activeProduct,
      productData: product ? {
        id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        is_active: product.is_active,
        category_id: product.category_id,
      } : null,
      allProductSlugs: allProducts.map(p => ({
        slug: p.slug,
        name: p.name,
        is_active: p.is_active,
      })),
      totalProducts: allProducts.length,
    });
  } catch (error: any) {
    console.error("DEBUG: Error checking product:", error);
    
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { Product } = await getDB();

    const product = await Product.findById(id)
      .where('is_active').equals(true)
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

    const { Product } = await getDB();

    const product = await Product.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true }
    ).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: { ...product, id: product._id.toString(), _id: undefined } });
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
    const { Product } = await getDB();

    const result = await Product.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Exception in DELETE /api/products/[id]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

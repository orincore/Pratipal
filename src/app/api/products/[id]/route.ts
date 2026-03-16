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
        id: data.category_id._id?.toString() || data.category_id.toString(),
        name: data.category_id.name,
        slug: data.category_id.slug
      };
      // Store the raw string ID separately for form use
      data.category_id_str = data.category_id._id?.toString() || data.category_id.toString();
      delete data.category_id;
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
        highlights: body.highlights,
        additional_info: body.additional_info,
        care_instructions: body.care_instructions,
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

export async function PATCH(
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

    // Use $set to only update provided fields
    const updateData: any = {};
    
    // Only update fields that are provided in the request body
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.short_description !== undefined) updateData.short_description = body.short_description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.sale_price !== undefined) updateData.sale_price = body.sale_price;
    if (body.cost_price !== undefined) updateData.cost_price = body.cost_price;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.stock_quantity !== undefined) updateData.stock_quantity = body.stock_quantity;
    if (body.stock_status !== undefined) updateData.stock_status = body.stock_status;
    if (body.manage_stock !== undefined) updateData.manage_stock = body.manage_stock;
    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.featured_image !== undefined) updateData.featured_image = body.featured_image;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.homepage_section !== undefined) updateData.homepage_section = body.homepage_section;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.highlights !== undefined) updateData.highlights = body.highlights;
    if (body.additional_info !== undefined) updateData.additional_info = body.additional_info;
    if (body.care_instructions !== undefined) updateData.care_instructions = body.care_instructions;
    if (body.meta_title !== undefined) updateData.meta_title = body.meta_title;
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Product updated successfully",
      product: { ...product, id: product._id.toString(), _id: undefined } 
    });
  } catch (err: any) {
    console.error("Exception in PATCH /api/products/[id]:", err);
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

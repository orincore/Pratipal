import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { Category } = await getDB();
    const url = new URL(req.url);
    
    const parentId = url.searchParams.get("parentId");
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    const filter: any = {};

    if (!includeInactive) {
      filter.is_active = true;
    }

    if (parentId) {
      filter.parent_id = parentId;
    } else if (parentId === null) {
      filter.parent_id = null;
    }

    const categories = await Category.find(filter)
      .sort({ display_order: 1 })
      .lean();

    const categoriesWithId = categories.map(cat => ({
      ...cat,
      id: cat._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ categories: categoriesWithId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { Category } = await getDB();

    const category = await Category.create({
      name: body.name,
      slug: body.slug,
      description: body.description,
      image_url: body.image_url,
      parent_id: body.parent_id,
      display_order: body.display_order || 0,
      is_active: body.is_active !== false,
    });

    return NextResponse.json({ category: category.toJSON() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

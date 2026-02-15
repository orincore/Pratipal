import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const url = new URL(req.url);
    
    const parentId = url.searchParams.get("parentId");
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    let query = supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    if (parentId) {
      query = query.eq("parent_id", parentId);
    } else if (parentId === null) {
      query = query.is("parent_id", null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data || [] });
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
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description,
        image_url: body.image_url,
        parent_id: body.parent_id,
        display_order: body.display_order || 0,
        is_active: body.is_active !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

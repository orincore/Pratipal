import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, getUserFromRequest } from "@/lib/auth";

function requireAdmin(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function GET(req: NextRequest) {
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pages: data ?? [] });
}

export async function POST(req: NextRequest) {
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = (body.title ?? "").trim();
  const slug = (body.slug ?? "").trim();

  if (!title || !slug) {
    return NextResponse.json(
      { error: "Title and slug are required" },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabase();

  // Auto-increment slug if it already exists (-1, -2, -3, etc.)
  const baseSlug = slug.replace(/-\d+$/, "");
  const { data: existingPages } = await supabase
    .from("landing_pages")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  const existingSlugs = new Set((existingPages ?? []).map((p: any) => p.slug));
  let finalSlug = slug;
  if (existingSlugs.has(finalSlug)) {
    let counter = 1;
    while (existingSlugs.has(`${baseSlug}-${counter}`)) {
      counter++;
    }
    finalSlug = `${baseSlug}-${counter}`;
  }

  const { data, error } = await supabase
    .from("landing_pages")
    .insert([
      {
        title,
        slug: finalSlug,
        content:
          body.content ??
          {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: title }],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Start editing your landing page here...",
                  },
                ],
              },
            ],
          },
        theme:
          body.theme ?? {
            primary: "#0F8A5F",
            secondary: "#0B4F6C",
            accent: "#18A999",
            background: "#FFFFFF",
          },
        seo_title: body.seo_title ?? title,
        seo_description: body.seo_description ?? "",
        status: body.status ?? "draft",
      },
    ])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ page: data }, { status: 201 });
}

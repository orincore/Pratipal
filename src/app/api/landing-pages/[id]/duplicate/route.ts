import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, getUserFromRequest } from "@/lib/auth";

function requireAdmin(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  // Fetch the original page
  const { data: original, error: fetchError } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return NextResponse.json(
      { error: fetchError?.message ?? "Page not found" },
      { status: 404 }
    );
  }

  // Generate a unique slug with -1, -2, -3 suffix
  const baseSlug = original.slug.replace(/-\d+$/, "");
  const { data: existingPages } = await supabase
    .from("landing_pages")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  const existingSlugs = new Set((existingPages ?? []).map((p: any) => p.slug));
  let newSlug = `${baseSlug}-1`;
  let counter = 1;
  while (existingSlugs.has(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  // Create the duplicate
  const { data: duplicated, error: insertError } = await supabase
    .from("landing_pages")
    .insert([
      {
        title: `${original.title} (Copy)`,
        slug: newSlug,
        content: original.content,
        theme: original.theme,
        seo_title: original.seo_title,
        seo_description: original.seo_description,
        status: "draft",
      },
    ])
    .select("*")
    .single();

  if (insertError || !duplicated) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to duplicate page" },
      { status: 500 }
    );
  }

  return NextResponse.json({ page: duplicated }, { status: 201 });
}

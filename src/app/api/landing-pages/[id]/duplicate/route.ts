import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

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

  const { LandingPage } = await getDB();

  // Fetch the original page
  const original = await LandingPage.findById(id).lean();

  if (!original) {
    return NextResponse.json(
      { error: "Page not found" },
      { status: 404 }
    );
  }

  // Generate a unique slug with -1, -2, -3 suffix
  const baseSlug = original.slug.replace(/-\d+$/, "");
  const existingPages = await LandingPage.find({
    slug: new RegExp(`^${baseSlug}`, 'i')
  }).select('slug').lean();

  const existingSlugs = new Set(existingPages.map((p: any) => p.slug));
  let newSlug = `${baseSlug}-1`;
  let counter = 1;
  while (existingSlugs.has(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  // Create the duplicate
  try {
    const duplicated = await LandingPage.create({
      title: `${original.title} (Copy)`,
      slug: newSlug,
      content: original.content,
      theme: original.theme,
      seo_title: original.seo_title,
      seo_description: original.seo_description,
      status: "draft",
    });

    return NextResponse.json({ page: duplicated.toJSON() }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to duplicate page" },
      { status: 500 }
    );
  }
}

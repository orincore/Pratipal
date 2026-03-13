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

export async function GET(req: NextRequest) {
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { LandingPage } = await getDB();
  const pages = await LandingPage.find({})
    .sort({ created_at: -1 })
    .lean();

  const pagesWithId = pages.map(p => ({
    ...p,
    id: p._id.toString(),
    _id: undefined,
  }));

  return NextResponse.json({ pages: pagesWithId });
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

  const { LandingPage } = await getDB();

  // Auto-increment slug if it already exists (-1, -2, -3, etc.)
  const baseSlug = slug.replace(/-\d+$/, "");
  const existingPages = await LandingPage.find({
    slug: { $regex: `^${baseSlug}`, $options: "i" }
  }).select('slug').lean();

  const existingSlugs = new Set(existingPages.map(p => p.slug));
  let finalSlug = slug;
  if (existingSlugs.has(finalSlug)) {
    let counter = 1;
    while (existingSlugs.has(`${baseSlug}-${counter}`)) {
      counter++;
    }
    finalSlug = `${baseSlug}-${counter}`;
  }

  const page = await LandingPage.create({
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
  });

  return NextResponse.json({ page: page.toJSON() }, { status: 201 });
}

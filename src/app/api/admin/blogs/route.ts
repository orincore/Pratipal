import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find({}).sort({ created_at: -1 }).lean();
    return NextResponse.json({ blogs: blogs.map((b: any) => ({ ...b, id: b._id.toString() })) });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    let slug = generateSlug(data.title);
    const existing = await Blog.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const blog = new Blog({
      ...data,
      slug,
      read_time: estimateReadTime(data.content || ""),
    });

    await blog.save();
    const obj = blog.toJSON();
    return NextResponse.json({ blog: obj }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}

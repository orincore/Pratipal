import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    const blog = await Blog.findOne({ slug, status: "published" }).lean() as any;
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ blog: { ...blog, id: blog._id.toString() } });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find({ status: "published" })
      .select("title slug excerpt featured_image category tags author read_time featured created_at")
      .sort({ created_at: -1 })
      .lean();
    return NextResponse.json({ blogs: blogs.map((b: any) => ({ ...b, id: b._id.toString() })) });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "published";
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: any = { status };
    if (featured !== null) {
      query.featured = featured === "true";
    }

    const courses = await Course.find(query)
      .sort({ display_order: 1, created_at: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
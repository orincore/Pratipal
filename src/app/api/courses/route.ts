import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { Course } = await getDB();
    
    const courses = await Course.find({ status: "published" })
      .sort({ display_order: 1, created_at: -1 })
      .lean();

    const transformedCourses = courses.map((course: any) => ({
      ...course,
      id: course._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ courses: transformedCourses });
  } catch (error: any) {
    console.error("Fetch courses error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

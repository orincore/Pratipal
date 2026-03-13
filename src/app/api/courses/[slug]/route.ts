import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { Course } = await getDB();
    const { slug } = await context.params;
    
    const course = await Course.findOne({ 
      slug,
      status: "published"
    }).lean();

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const transformedCourse = {
      ...course,
      id: course._id.toString(),
      _id: undefined,
    };

    return NextResponse.json({ course: transformedCourse });
  } catch (error: any) {
    console.error("Fetch course error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch course" },
      { status: 500 }
    );
  }
}

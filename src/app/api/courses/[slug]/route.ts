import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    const course = await Course.findOne({ 
      slug: slug, 
      status: "published" 
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Ensure the returned course has an id field
    const courseObj = course.toJSON();
    if (!courseObj.id && courseObj._id) {
      courseObj.id = courseObj._id.toString();
    }

    return NextResponse.json({ course: courseObj });
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
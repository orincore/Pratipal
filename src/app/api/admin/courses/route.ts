import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const courses = await Course.find({})
      .sort({ display_order: 1, created_at: -1 });

    // Ensure each course has an id field
    const coursesWithId = courses.map(course => {
      const courseObj = course.toJSON();
      // Ensure id field exists
      if (!courseObj.id && courseObj._id) {
        courseObj.id = courseObj._id.toString();
      }
      return courseObj;
    });

    return NextResponse.json({ courses: coursesWithId });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();
    
    // Generate slug from title
    const slug = generateSlug(data.title);
    
    // Check if slug already exists
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return NextResponse.json(
        { error: "A course with this title already exists" },
        { status: 400 }
      );
    }

    const course = new Course({
      ...data,
      slug,
    });

    await course.save();

    // Ensure the returned course has an id field
    const courseObj = course.toJSON();
    if (!courseObj.id && courseObj._id) {
      courseObj.id = courseObj._id.toString();
    }

    return NextResponse.json({ course: courseObj }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
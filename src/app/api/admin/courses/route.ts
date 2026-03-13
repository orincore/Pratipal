import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { Course } = await getDB();
    
    const courses = await Course.find({})
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

export async function POST(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { Course } = await getDB();

    // Generate slug from title
    const slug = slugify(body.title);

    // Check if slug already exists
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return NextResponse.json(
        { error: "A course with this title already exists" },
        { status: 400 }
      );
    }

    const course = await Course.create({
      ...body,
      slug,
    });

    return NextResponse.json({ course: course.toJSON() }, { status: 201 });
  } catch (error: any) {
    console.error("Create course error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}

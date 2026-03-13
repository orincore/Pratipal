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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { Course } = await getDB();
    const course = await Course.findById(id).lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
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

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { Course } = await getDB();

    // Generate new slug if title changed
    const slug = slugify(body.title);

    // Check if slug already exists (excluding current course)
    const existingCourse = await Course.findOne({ 
      slug, 
      _id: { $ne: id } 
    });
    
    if (existingCourse) {
      return NextResponse.json(
        { error: "A course with this title already exists" },
        { status: 400 }
      );
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { ...body, slug },
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course: course.toJSON() });
  } catch (error: any) {
    console.error("Update course error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const authUser = getUserFromRequest(req);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { Course } = await getDB();
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error: any) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}

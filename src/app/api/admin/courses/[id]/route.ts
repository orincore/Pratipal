import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import { Types } from "mongoose";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && id !== "undefined" && id !== "null";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const course = await Course.findById(id);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const data = await request.json();
    
    // Generate new slug if title changed
    const newSlug = generateSlug(data.title);
    
    // Check if new slug conflicts with another course
    const existingCourse = await Course.findOne({ 
      slug: newSlug, 
      _id: { $ne: new Types.ObjectId(id) } 
    });
    
    if (existingCourse) {
      return NextResponse.json(
        { error: "A course with this title already exists" },
        { status: 400 }
      );
    }

    const course = await Course.findByIdAndUpdate(
      new Types.ObjectId(id),
      { ...data, slug: newSlug },
      { new: true, runValidators: true }
    );

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
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const course = await Course.findByIdAndDelete(new Types.ObjectId(id));
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
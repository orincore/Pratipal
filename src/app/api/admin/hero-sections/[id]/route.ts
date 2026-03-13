import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

// GET single hero section
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { HeroSection } = await getDB();
    const { id } = await context.params;

    const heroSection = await HeroSection.findById(id).lean();

    if (!heroSection) {
      return NextResponse.json(
        { error: "Hero section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ heroSection: { ...heroSection, id: heroSection._id.toString(), _id: undefined } });
  } catch (error) {
    console.error("Error in GET /api/admin/hero-sections/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update hero section
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { HeroSection } = await getDB();
    const { id } = await context.params;
    const body = await request.json();

    const heroSection = await HeroSection.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).lean();

    if (!heroSection) {
      return NextResponse.json(
        { error: "Hero section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ heroSection: { ...heroSection, id: heroSection._id.toString(), _id: undefined } });
  } catch (error) {
    console.error("Error in PUT /api/admin/hero-sections/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE hero section
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { HeroSection } = await getDB();
    const { id } = await context.params;

    const result = await HeroSection.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: "Hero section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Hero section deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/hero-sections/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

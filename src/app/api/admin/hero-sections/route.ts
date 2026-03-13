import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// GET all hero sections
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { HeroSection } = await getDB();

    const heroSections = await HeroSection.find({})
      .sort({ display_order: 1 })
      .lean();

    const data = heroSections.map(section => ({
      ...section,
      id: section._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ heroSections: data });
  } catch (error) {
    console.error("Error in GET /api/admin/hero-sections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new hero section
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { HeroSection } = await getDB();
    const body = await request.json();

    const heroSection = await HeroSection.create(body);

    return NextResponse.json({ heroSection: heroSection.toJSON() }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/hero-sections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import getDB from "@/lib/db";

// Public endpoint to fetch active hero sections
export async function GET() {
  try {
    const { HeroSection } = await getDB();

    const heroSections = await HeroSection.find({ is_active: true })
      .sort({ display_order: 1 })
      .lean();

    const data = heroSections.map(section => ({
      ...section,
      id: section._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ heroSections: data });
  } catch (error) {
    console.error("Error in GET /api/hero-sections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

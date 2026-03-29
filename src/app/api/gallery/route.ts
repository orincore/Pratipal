import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import GalleryImage from "@/models/GalleryImage";

export async function GET() {
  try {
    await connectDB();
    const images = await GalleryImage.find({})
      .sort({ display_order: 1, created_at: -1 })
      .lean();
    return NextResponse.json({
      images: images.map((img: any) => ({ ...img, id: img._id.toString() })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

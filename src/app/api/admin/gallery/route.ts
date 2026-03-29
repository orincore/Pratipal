import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    if (!data.url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    const count = await GalleryImage.countDocuments();
    const image = new GalleryImage({ ...data, display_order: data.display_order ?? count });
    await image.save();
    return NextResponse.json({ image: image.toJSON() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import GalleryImage from "@/models/GalleryImage";
import R2Storage from "@/lib/r2-client";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    const image = await GalleryImage.findByIdAndUpdate(id, data, { new: true });
    if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ image: image.toJSON() });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const image = await GalleryImage.findById(id);
    if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete from R2 if key exists
    if (image.r2_key && R2Storage.isConfigured()) {
      try {
        await R2Storage.deleteFile(image.r2_key);
      } catch {
        // non-fatal — still delete the DB record
      }
    }

    await GalleryImage.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

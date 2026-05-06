import { NextRequest, NextResponse } from "next/server";
import R2Storage from "@/lib/r2-client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images and videos allowed)
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Only image and video files are allowed" }, { status: 400 });
    }

    // Validate file size (50MB limit for videos, 10MB for images)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = isVideo ? "50MB" : "10MB";
      return NextResponse.json({ error: `File size must be less than ${maxSizeMB}` }, { status: 400 });
    }

    // Check if R2 is configured
    if (!R2Storage.isConfigured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    // Upload to R2 only
    console.log("Uploading to R2 bucket...");
    const result = await R2Storage.uploadFile(file, folder);
    
    return NextResponse.json({
      url: result.url,
      fileName: result.fileName,
      key: result.key,
      storage: "r2"
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
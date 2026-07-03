import { NextRequest, NextResponse } from "next/server";
import R2Storage from "@/lib/r2-client";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize, folder } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName and fileType are required" }, { status: 400 });
    }

    const isImage = fileType.startsWith("image/");
    const isVideo = fileType.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Only image and video files are allowed" }, { status: 400 });
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (typeof fileSize === "number" && fileSize > maxSize) {
      const maxSizeMB = isVideo ? "50MB" : "10MB";
      return NextResponse.json({ error: `File size must be less than ${maxSizeMB}` }, { status: 400 });
    }

    if (!R2Storage.isConfigured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    const result = await R2Storage.getPresignedUploadUrl(fileName, fileType, folder || "uploads");

    return NextResponse.json({ ...result, storage: "r2", type: isVideo ? "video" : "image" });
  } catch (error: any) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create upload URL" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import R2Storage from "@/lib/r2-client";

// E-book PDFs can be sizeable (image-heavy books, scanned pages) — allow up
// to 100MB. Uploads go straight from the browser to R2 via a presigned PUT
// (see /api/upload/presign for the same pattern used for videos), never
// through this Vercel function's body, which has a hard ~4.5MB limit.
const MAX_EBOOK_SIZE = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName and fileType are required" }, { status: 400 });
    }

    if (fileType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed for e-books" }, { status: 400 });
    }

    if (typeof fileSize === "number" && fileSize > MAX_EBOOK_SIZE) {
      return NextResponse.json({ error: "File size must be less than 100MB" }, { status: 400 });
    }

    if (!R2Storage.isConfigured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    const result = await R2Storage.getPresignedUploadUrl(fileName, fileType, "ebooks");

    return NextResponse.json({ ...result, storage: "r2", type: "ebook" });
  } catch (error: any) {
    console.error("Ebook presign error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create upload URL" },
      { status: 500 }
    );
  }
}

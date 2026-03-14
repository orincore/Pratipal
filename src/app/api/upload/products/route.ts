import { NextRequest, NextResponse } from "next/server";
import R2Storage from "@/lib/r2-client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images and videos for products)
    const allowedTypes = ["image/", "video/"];
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    
    if (!isValidType) {
      return NextResponse.json({ error: "Only image and video files are allowed" }, { status: 400 });
    }

    // Validate file size (50MB limit for products to allow videos)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 50MB" }, { status: 400 });
    }

    const folder = "products";

    // Try R2 upload first if configured
    if (R2Storage.isConfigured()) {
      try {
        console.log("Uploading product media to R2 bucket...");
        const result = await R2Storage.uploadFile(file, folder);
        
        return NextResponse.json({
          url: result.url,
          fileName: result.fileName,
          key: result.key,
          storage: "r2",
          type: file.type.startsWith("image/") ? "image" : "video"
        });
      } catch (r2Error: any) {
        console.error("R2 upload failed, falling back to local storage:", r2Error.message);
        // Continue to local storage fallback
      }
    }

    // Fallback to local storage
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Create products directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", folder);
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file locally
    const filePath = join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Return the public URL
    const url = `/${folder}/${fileName}`;

    return NextResponse.json({ 
      url, 
      fileName,
      storage: "local",
      type: file.type.startsWith("image/") ? "image" : "video"
    });
  } catch (error: any) {
    console.error("Product upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL || "";

// Construct R2 endpoint from account ID
const R2_ENDPOINT = R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "";

const R2_CONFIG = {
  region: "auto", // R2 uses "auto" as region
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
};

// Create R2 client
const r2Client = new S3Client(R2_CONFIG);

export interface UploadResult {
  url: string;
  key: string;
  fileName: string;
}

export class R2Storage {
  /**
   * Upload a file to R2 bucket
   */
  static async uploadFile(
    file: File,
    folder: string = "uploads"
  ): Promise<UploadResult> {
    try {
      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }

      // Generate unique filename
      const fileExtension = file.name.split(".").pop() || "jpg";
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ContentLength: file.size,
        // Make the object publicly readable
        ACL: "public-read",
        // Add cache control headers
        CacheControl: "public, max-age=31536000", // 1 year
      });

      await r2Client.send(command);

      // Construct public URL
      const url = `${PUBLIC_URL_BASE}/${key}`;

      return {
        url,
        key,
        fileName,
      };
    } catch (error: any) {
      console.error("R2 upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload buffer to R2 bucket
   */
  static async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    folder: string = "uploads"
  ): Promise<UploadResult> {
    try {
      // Generate unique filename if not provided
      const fileExtension = fileName.split(".").pop() || "jpg";
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${uniqueFileName}`;

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length,
        ACL: "public-read",
        CacheControl: "public, max-age=31536000",
      });

      await r2Client.send(command);

      // Construct public URL
      const url = `${PUBLIC_URL_BASE}/${key}`;

      return {
        url,
        key,
        fileName: uniqueFileName,
      };
    } catch (error: any) {
      console.error("R2 buffer upload error:", error);
      throw new Error(`Failed to upload buffer: ${error.message}`);
    }
  }

  /**
   * Delete a file from R2 bucket
   */
  static async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await r2Client.send(command);
    } catch (error: any) {
      console.error("R2 delete error:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Extract key from URL
   */
  static extractKeyFromUrl(url: string): string | null {
    try {
      if (url.startsWith(PUBLIC_URL_BASE)) {
        return url.replace(`${PUBLIC_URL_BASE}/`, "");
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if R2 is configured
   */
  static isConfigured(): boolean {
    const hasRequiredVars = !!(
      R2_ACCOUNT_ID &&
      R2_ACCESS_KEY_ID &&
      R2_SECRET_ACCESS_KEY &&
      BUCKET_NAME &&
      PUBLIC_URL_BASE
    );
    
    if (hasRequiredVars) {
      console.log("R2 Configuration detected:");
      console.log("- Account ID:", R2_ACCOUNT_ID);
      console.log("- Endpoint:", R2_ENDPOINT);
      console.log("- Bucket:", BUCKET_NAME);
      console.log("- Public URL:", PUBLIC_URL_BASE);
    } else {
      console.log("R2 Configuration missing:");
      console.log("- R2_ACCOUNT_ID:", !!R2_ACCOUNT_ID);
      console.log("- R2_ACCESS_KEY_ID:", !!R2_ACCESS_KEY_ID);
      console.log("- R2_SECRET_ACCESS_KEY:", !!R2_SECRET_ACCESS_KEY);
      console.log("- R2_BUCKET_NAME:", !!BUCKET_NAME);
      console.log("- R2_PUBLIC_URL:", !!PUBLIC_URL_BASE);
    }
    
    return hasRequiredVars;
  }
}

export default R2Storage;
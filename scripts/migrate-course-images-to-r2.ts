/**
 * Migrate course featured_image to Cloudflare R2
 *
 * For each course with a featured_image that is NOT already on R2:
 *   1. Download / read the image
 *   2. Upload to R2 under the "courses/" folder
 *   3. Update the course document with the new R2 URL
 *
 * Run:
 *   npx ts-node -r tsconfig-paths/register scripts/migrate-course-images-to-r2.ts
 */

import path from "path";
import fs from "fs";
import https from "https";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

// ── R2 config ────────────────────────────────────────────────────────────────
const R2_ACCOUNT_ID      = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID   = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const BUCKET_NAME        = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL_BASE    = process.env.R2_PUBLIC_URL!;

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

// ── helpers ──────────────────────────────────────────────────────────────────

function extFromUrl(url: string): string {
  const clean = url.split("?")[0];
  const ext = path.extname(clean).replace(".", "").toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "avif", "gif", "svg"].includes(ext) ? ext : "jpg";
}

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    webp: "image/webp", avif: "image/avif", gif: "image/gif", svg: "image/svg+xml",
  };
  return map[ext] || "image/jpeg";
}

function downloadUrl(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow one redirect
        return downloadUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function getImageBuffer(imageUrl: string): Promise<{ buffer: Buffer; ext: string }> {
  // Local file (e.g. /courses/xxx.jpg or /uploads/xxx.jpg)
  if (imageUrl.startsWith("/")) {
    const localPath = path.join(process.cwd(), "public", imageUrl);
    if (!fs.existsSync(localPath)) throw new Error(`Local file not found: ${localPath}`);
    const buffer = fs.readFileSync(localPath);
    const ext = extFromUrl(imageUrl);
    return { buffer, ext };
  }
  // Remote URL
  const buffer = await downloadUrl(imageUrl);
  const ext = extFromUrl(imageUrl);
  return { buffer, ext };
}

async function uploadToR2(buffer: Buffer, ext: string): Promise<string> {
  const key = `courses/${uuidv4()}.${ext}`;
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeFromExt(ext),
    ContentLength: buffer.length,
    CacheControl: "public, max-age=31536000",
  }));
  return `${PUBLIC_URL_BASE}/${key}`;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  if (!R2_ACCOUNT_ID || !BUCKET_NAME || !PUBLIC_URL_BASE) throw new Error("R2 env vars missing");

  await mongoose.connect(uri);
  console.log("✓ Connected to MongoDB");

  const db = mongoose.connection.db!;
  const col = db.collection("courses");

  const courses = await col.find({ featured_image: { $exists: true, $nin: [null, ""] } }).toArray();
  console.log(`Found ${courses.length} courses with featured_image\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const course of courses) {
    const img: string = course.featured_image;
    const title: string = course.title || course._id.toString();

    // Already on R2 — skip
    if (img.startsWith(PUBLIC_URL_BASE)) {
      console.log(`  ⏭  [skip]    ${title} — already on R2`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  ⬆  [upload]  ${title} … `);
      const { buffer, ext } = await getImageBuffer(img);
      const newUrl = await uploadToR2(buffer, ext);
      await col.updateOne({ _id: course._id }, { $set: { featured_image: newUrl } });
      console.log(`done → ${newUrl}`);
      migrated++;
    } catch (err: any) {
      console.log(`FAILED — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n── Summary ──────────────────────────────`);
  console.log(`  Migrated : ${migrated}`);
  console.log(`  Skipped  : ${skipped}`);
  console.log(`  Failed   : ${failed}`);
  console.log(`─────────────────────────────────────────`);

  await mongoose.disconnect();
  console.log("✓ Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Set CORS policy on the Cloudflare R2 bucket so the browser can upload
 * files directly to R2 via presigned PUT URLs (see /api/upload/presign).
 *
 * Run once (and again if the allowed origins change):
 *   npx ts-node -r tsconfig-paths/register scripts/set-r2-cors.ts
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !BUCKET_NAME) {
  console.error("Missing R2 env vars (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME).");
  process.exit(1);
}

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const ALLOWED_ORIGINS = [
  "https://www.pratipal.in",
  "https://pratipal.in",
  "http://localhost:3000",
];

async function main() {
  await r2.send(
    new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ALLOWED_ORIGINS,
            AllowedMethods: ["PUT", "GET", "HEAD"],
            AllowedHeaders: ["Content-Type"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  );

  const current = await r2.send(new GetBucketCorsCommand({ Bucket: BUCKET_NAME }));
  console.log("CORS policy applied to bucket:", BUCKET_NAME);
  console.log(JSON.stringify(current.CORSRules, null, 2));
}

main().catch((err) => {
  console.error("Failed to set R2 CORS policy:", err);
  process.exit(1);
});

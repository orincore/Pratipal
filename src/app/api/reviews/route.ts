import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET() {
  await connectDB();
  const reviews = await Review.find({ verified: true })
    .sort({ featured: -1, date: -1 })
    .lean();
  return NextResponse.json({ reviews });
}

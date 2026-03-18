import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET() {
  await connectDB();
  const reviews = await Review.find().sort({ featured: -1, date: -1 }).lean();
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const review = await Review.create(body);
  return NextResponse.json({ review }, { status: 201 });
}

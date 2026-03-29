import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";

export async function GET() {
  try {
    await connectDB();
    const quotes = await Quote.find({}).sort({ date: -1 }).lean();
    return NextResponse.json({
      quotes: quotes.map((q: any) => ({ ...q, id: q._id.toString() })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    if (!data.text || !data.date) {
      return NextResponse.json({ error: "text and date are required" }, { status: 400 });
    }

    const quote = new Quote(data);
    await quote.save();
    return NextResponse.json({ quote: quote.toJSON() }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "A quote already exists for that date" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create quote" }, { status: 500 });
  }
}

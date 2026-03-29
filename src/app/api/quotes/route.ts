import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";

// Returns today's active quote (or the most recent active one as fallback)
export async function GET() {
  try {
    await connectDB();

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    let quote = await Quote.findOne({ date: today, status: "active" }).lean();

    if (!quote) {
      // Fallback: most recent active quote before today
      quote = await Quote.findOne({ status: "active", date: { $lte: today } })
        .sort({ date: -1 })
        .lean();
    }

    if (!quote) return NextResponse.json({ quote: null });

    return NextResponse.json({
      quote: { ...(quote as any), id: (quote as any)._id.toString() },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();

    const quote = await Quote.findByIdAndUpdate(id, data, { new: true });
    if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    return NextResponse.json({ quote: quote.toJSON() });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "A quote already exists for that date" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await Quote.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}

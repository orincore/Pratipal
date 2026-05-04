import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const { LandingPage } = await getDB();
  const page = await LandingPage.findOne({ slug, status: "published" }).lean();

  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ 
    page: { 
      ...page, 
      id: page._id.toString(), 
      _id: undefined 
    } 
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

function requireAdmin(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { LandingPage } = await getDB();
  const page = await LandingPage.findById(id).lean();

  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ page: { ...page, id: page._id.toString(), _id: undefined } });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const payload: Record<string, any> = {};

  const editableFields = [
    "title",
    "slug",
    "content",
    "theme",
    "seo_title",
    "seo_description",
    "status",
  ];

  for (const field of editableFields) {
    if (field in body) {
      payload[field] = body[field];
    }
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided" },
      { status: 400 }
    );
  }

  const { LandingPage } = await getDB();
  const page = await LandingPage.findByIdAndUpdate(
    id,
    payload,
    { new: true }
  ).lean();

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ page: { ...page, id: page._id.toString(), _id: undefined } });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { LandingPage } = await getDB();
  const result = await LandingPage.findByIdAndDelete(id);

  if (!result) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

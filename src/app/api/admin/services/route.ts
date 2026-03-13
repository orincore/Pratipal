import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { Service } = await getDB();
    const services = await Service.find({}).sort({ display_order: 1, created_at: -1 }).lean();

    const formatted = services.map((service: any) => ({
      ...service,
      id: service._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ services: formatted });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { Service } = await getDB();

    const payload = {
      ...body,
      slug: slugify(body.slug || body.title || Date.now().toString()),
    };

    const created = await Service.create(payload);
    return NextResponse.json({ service: created.toJSON() }, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

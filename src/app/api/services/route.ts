import { NextResponse } from "next/server";
import getDB from "@/lib/db";

export async function GET() {
  try {
    const { Service } = await getDB();

    const services = await Service.find({ is_active: true })
      .sort({ display_order: 1, created_at: -1 })
      .lean();

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

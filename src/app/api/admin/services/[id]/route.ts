import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(_req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { Service } = await getDB();
    const service = await Service.findById(id).lean();
    if (!service) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ service: { ...service, id: service._id.toString(), _id: undefined } });
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { Service } = await getDB();

    const updated = await Service.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ service: { ...updated, id: updated._id.toString(), _id: undefined } });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { Service } = await getDB();
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}

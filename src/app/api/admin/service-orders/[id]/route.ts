import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const { SessionBooking } = await getDB();
    const booking = await SessionBooking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: "Service order not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error("Admin service order fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch service order" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const body = await req.json();
    const { booking_status, admin_notes } = body;

    const { SessionBooking } = await getDB();

    const updateData: any = {};
    if (booking_status !== undefined) updateData.booking_status = booking_status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    updateData.updated_at = new Date();

    const booking = await SessionBooking.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ error: "Service order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Service order updated successfully",
      booking 
    });
  } catch (error: any) {
    console.error("Admin service order update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update service order" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const { SessionBooking } = await getDB();
    const booking = await SessionBooking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json({ error: "Service order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Service order deleted successfully" 
    });
  } catch (error: any) {
    console.error("Admin service order delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete service order" },
      { status: 500 }
    );
  }
}
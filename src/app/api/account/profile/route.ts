import { NextRequest, NextResponse } from "next/server";
import { requireCustomerSession } from "@/lib/customer-session";
import getDB from "@/lib/db";

export async function GET() {
  try {
    const session = await requireCustomerSession();
    const { Customer } = await getDB();

    const customer = await Customer.findById(session.id)
      .select('email first_name last_name phone avatar_url is_verified created_at')
      .lean();

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer: { ...customer, id: customer._id.toString(), _id: undefined } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireCustomerSession();
    const body = await req.json();
    const { Customer } = await getDB();

    const updates: Record<string, any> = {};
    if (body.first_name !== undefined) updates.first_name = body.first_name;
    if (body.last_name !== undefined) updates.last_name = body.last_name;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

    const customer = await Customer.findByIdAndUpdate(
      session.id,
      updates,
      { new: true }
    )
      .select('email first_name last_name phone avatar_url is_verified created_at')
      .lean();

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer: { ...customer, id: customer._id.toString(), _id: undefined } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

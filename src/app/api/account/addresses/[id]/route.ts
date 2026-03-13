import { NextRequest, NextResponse } from "next/server";
import { requireCustomerSession } from "@/lib/customer-session";
import getDB from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireCustomerSession();
    const body = await req.json();
    const { CustomerAddress } = await getDB();

    const updates: Record<string, any> = {};
    const allowed = [
      "first_name",
      "last_name",
      "company",
      "address_line1",
      "address_line2",
      "city",
      "state",
      "postal_code",
      "country",
      "phone",
      "address_type",
      "is_default",
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    if (updates.is_default) {
      await CustomerAddress.updateMany(
        { customer_id: session.id, address_type: updates.address_type || body.address_type || "shipping" },
        { is_default: false }
      );
    }

    const { id } = await context.params;
    const address = await CustomerAddress.findOneAndUpdate(
      { _id: id, customer_id: session.id },
      updates,
      { new: true }
    ).lean();

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ address: { ...address, id: address._id.toString(), _id: undefined } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: err.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireCustomerSession();
    const { CustomerAddress } = await getDB();
    const { id } = await context.params;

    const result = await CustomerAddress.findOneAndDelete({
      _id: id,
      customer_id: session.id
    });

    if (!result) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: err.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

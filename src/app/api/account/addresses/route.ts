import { NextRequest, NextResponse } from "next/server";
import { requireCustomerSession } from "@/lib/customer-session";
import getDB from "@/lib/db";

export async function GET() {
  try {
    const session = await requireCustomerSession();
    const { CustomerAddress } = await getDB();

    const addresses = await CustomerAddress.find({ customer_id: session.id })
      .sort({ created_at: 1 })
      .lean();

    const data = addresses.map(addr => ({
      ...addr,
      id: addr._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ addresses: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: err.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireCustomerSession();
    const body = await req.json();
    const { CustomerAddress } = await getDB();

    const address = {
      customer_id: session.id,
      address_type: body.address_type || "shipping",
      first_name: body.first_name,
      last_name: body.last_name,
      company: body.company,
      address_line1: body.address_line1,
      address_line2: body.address_line2,
      city: body.city,
      state: body.state,
      postal_code: body.postal_code,
      country: body.country || "India",
      phone: body.phone,
      is_default: body.is_default || false,
    };

    if (!address.first_name || !address.last_name || !address.address_line1 || !address.city || !address.state || !address.postal_code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (address.is_default) {
      await CustomerAddress.updateMany(
        { customer_id: session.id, address_type: address.address_type },
        { is_default: false }
      );
    }

    const newAddress = await CustomerAddress.create(address);

    return NextResponse.json({ address: newAddress.toJSON() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: err.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

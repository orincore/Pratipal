import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import getDB from "@/lib/db";

async function getCustomerIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("customer_session");
  
  if (sessionCookie?.value) {
    try {
      const decoded = jwt.verify(sessionCookie.value, process.env.JWT_SECRET || "") as any;
      return decoded.id;
    } catch {
      return null;
    }
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

    const { CartItem } = await getDB();
    const { id } = await context.params;
    
    const cartItem = await CartItem.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    ).lean();

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ cart_item: { ...cartItem, id: cartItem._id.toString(), _id: undefined } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { CartItem } = await getDB();
    const { id } = await context.params;
    
    const result = await CartItem.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

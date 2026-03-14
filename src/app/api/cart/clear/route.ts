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

async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("cart_session")?.value || null;
}

export async function POST(req: NextRequest) {
  try {
    const { CartItem } = await getDB();
    const customerId = await getCustomerIdFromCookie();
    const sessionId = await getSessionId();

    let deletedCount = 0;

    // Clear customer cart if logged in
    if (customerId) {
      const result = await CartItem.deleteMany({ customer_id: customerId });
      deletedCount += result.deletedCount || 0;
    }

    // Clear session cart if exists
    if (sessionId) {
      const result = await CartItem.deleteMany({ session_id: sessionId });
      deletedCount += result.deletedCount || 0;
    }

    console.log(`Cleared ${deletedCount} cart items`);

    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${deletedCount} cart items`,
      deletedCount 
    });
  } catch (err: any) {
    console.error('Error clearing cart:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
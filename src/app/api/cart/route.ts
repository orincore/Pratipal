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

async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cart_session")?.value;
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return sessionId;
}

export async function GET(req: NextRequest) {
  try {
    const { CartItem } = await getDB();
    const customerId = await getCustomerIdFromCookie();
    const sessionId = await getSessionId();

    let filter: any = customerId
      ? { customer_id: customerId }
      : { session_id: sessionId };

    let cartItems = await CartItem.find(filter)
      .populate('product_id', 'id name slug price sale_price featured_image stock_quantity stock_status')
      .populate('variant_id', 'id name price sale_price stock_quantity')
      .lean();

    // If logged-in user has no items by customer_id, migrate any session items
    if (customerId && cartItems.length === 0 && sessionId) {
      const sessionItems = await CartItem.find({ session_id: sessionId }).lean();
      if (sessionItems.length > 0) {
        await CartItem.updateMany(
          { session_id: sessionId },
          { $set: { customer_id: customerId, session_id: null } }
        );
        // Re-fetch after migration
        cartItems = await CartItem.find({ customer_id: customerId })
          .populate('product_id', 'id name slug price sale_price featured_image stock_quantity stock_status')
          .populate('variant_id', 'id name price sale_price stock_quantity')
          .lean();
      }
    }

    const data = cartItems.map(item => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
      product: item.product_id ? {
        id: (item.product_id as any)._id?.toString() || item.product_id,
        name: (item.product_id as any).name,
        slug: (item.product_id as any).slug,
        price: (item.product_id as any).price,
        sale_price: (item.product_id as any).sale_price,
        featured_image: (item.product_id as any).featured_image,
        stock_quantity: (item.product_id as any).stock_quantity,
        stock_status: (item.product_id as any).stock_status,
      } : null,
      variant: item.variant_id ? {
        id: (item.variant_id as any)._id?.toString() || item.variant_id,
        name: (item.variant_id as any).name,
        price: (item.variant_id as any).price,
        sale_price: (item.variant_id as any).sale_price,
        stock_quantity: (item.variant_id as any).stock_quantity,
      } : null,
    }));

    const response = NextResponse.json({ cart: data });

    // Always persist the session cookie so it survives across requests
    if (!customerId) {
      response.cookies.set("cart_session", sessionId, {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, variant_id, quantity = 1 } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { Product, CartItem } = await getDB();
    const customerId = await getCustomerIdFromCookie();
    const sessionId = await getSessionId();

    const product = await Product.findById(product_id)
      .select('price sale_price')
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const price = product.sale_price || product.price;

    // If logged-in user adds to cart, migrate any existing session items first
    if (customerId && sessionId) {
      const sessionItems = await CartItem.find({ session_id: sessionId }).lean();
      if (sessionItems.length > 0) {
        await CartItem.updateMany(
          { session_id: sessionId },
          { $set: { customer_id: customerId, session_id: null } }
        );
      }
    }

    const existingFilter: any = { product_id };
    if (variant_id) {
      existingFilter.variant_id = variant_id;
    } else {
      existingFilter.variant_id = null;
    }
    if (customerId) {
      existingFilter.customer_id = customerId;
    } else {
      existingFilter.session_id = sessionId;
    }

    const existing = await CartItem.findOne(existingFilter).lean();

    let result;
    if (existing) {
      const updated = await CartItem.findByIdAndUpdate(
        existing._id,
        { quantity: existing.quantity + quantity },
        { new: true }
      ).lean();
      result = { ...updated, id: updated!._id.toString(), _id: undefined };
    } else {
      const newItem = await CartItem.create({
        customer_id: customerId,
        session_id: customerId ? null : sessionId,
        product_id,
        variant_id,
        quantity,
        price,
      });
      result = newItem.toJSON();
    }

    const response = NextResponse.json({ cart_item: result });
    
    if (!customerId) {
      response.cookies.set("cart_session", sessionId, {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

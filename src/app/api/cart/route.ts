import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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
    const supabase = getServiceSupabase();
    const customerId = await getCustomerIdFromCookie();
    const sessionId = await getSessionId();

    let query = supabase
      .from("cart_items")
      .select(`
        *,
        product:products(id, name, slug, price, sale_price, featured_image, stock_quantity, stock_status),
        variant:product_variants(id, name, price, sale_price, stock_quantity)
      `);

    if (customerId) {
      query = query.eq("customer_id", customerId);
    } else {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({ cart: data || [] });
    
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

    const supabase = getServiceSupabase();
    const customerId = await getCustomerIdFromCookie();
    const sessionId = await getSessionId();

    const { data: product } = await supabase
      .from("products")
      .select("price, sale_price")
      .eq("id", product_id)
      .single();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const price = product.sale_price || product.price;

    let existingQuery = supabase
      .from("cart_items")
      .select("*")
      .eq("product_id", product_id);

    if (variant_id) {
      existingQuery = existingQuery.eq("variant_id", variant_id);
    } else {
      existingQuery = existingQuery.is("variant_id", null);
    }

    if (customerId) {
      existingQuery = existingQuery.eq("customer_id", customerId);
    } else {
      existingQuery = existingQuery.eq("session_id", sessionId);
    }

    const { data: existing } = await existingQuery.single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    } else {
      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          customer_id: customerId,
          session_id: customerId ? null : sessionId,
          product_id,
          variant_id,
          quantity,
          price,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
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

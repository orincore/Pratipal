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

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function GET(req: NextRequest) {
  try {
    const customerId = await getCustomerIdFromCookie();
    
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_email,
      customer_name,
      shipping_address,
      billing_address,
      payment_method = "cod",
      items,
      notes,
    } = body;

    if (!customer_email || !customer_name || !shipping_address || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const customerId = await getCustomerIdFromCookie();
    const supabase = getServiceSupabase();

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("id, name, sku, price, sale_price, stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.product_id} not found` },
          { status: 404 }
        );
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const price = product.sale_price || product.price;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        variant_id: item.variant_id || null,
        variant_name: item.variant_name || null,
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal,
      });
    }

    const tax = subtotal * 0.18;
    const shipping_cost = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping_cost;

    const orderNumber = generateOrderNumber();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        customer_email,
        customer_name,
        status: "pending",
        payment_status: payment_method === "cod" ? "pending" : "pending",
        payment_method,
        subtotal,
        tax,
        shipping_cost,
        discount: 0,
        total,
        shipping_address,
        billing_address: billing_address || shipping_address,
        notes,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    for (const item of items) {
      await supabase
        .from("products")
        .update({
          stock_quantity: supabase.rpc("decrement_stock", {
            product_id: item.product_id,
            quantity: item.quantity,
          }),
        })
        .eq("id", item.product_id);
    }

    if (customerId) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("customer_id", customerId);
    }

    return NextResponse.json({
      order: {
        ...order,
        items: orderItemsWithOrderId,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

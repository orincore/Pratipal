import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    // Get shipping settings
    const { data: settings } = await supabase
      .from("shipping_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    const costPerKg = settings?.cost_per_kg || 50;
    const freeShippingThreshold = settings?.free_shipping_threshold || 500;

    // Calculate total weight
    let totalWeight = 0;
    let subtotal = 0;

    for (const item of cartItems) {
      const product = item.product;
      const quantity = item.quantity || 1;
      const weight = product.weight || 0;
      const price = product.sale_price || product.price || 0;

      totalWeight += weight * quantity;
      subtotal += price * quantity;
    }

    // Calculate shipping cost
    let shippingCost = 0;
    if (subtotal < freeShippingThreshold) {
      shippingCost = Math.ceil(totalWeight * costPerKg);
    }

    return NextResponse.json({
      totalWeight,
      shippingCost,
      costPerKg,
      freeShippingThreshold,
      subtotal,
      isFreeShipping: subtotal >= freeShippingThreshold,
    });
  } catch (error) {
    console.error("Calculate shipping error:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping" },
      { status: 500 }
    );
  }
}

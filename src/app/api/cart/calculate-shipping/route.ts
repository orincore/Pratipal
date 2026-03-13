import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { ShippingSettings } = await getDB();
    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    // Get shipping settings
    const settings = await ShippingSettings.findOne()
      .sort({ updated_at: -1 })
      .lean();

    const flatRate = settings?.flat_rate || 50;
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
      shippingCost = flatRate;
    }

    return NextResponse.json({
      totalWeight,
      shippingCost,
      flatRate,
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

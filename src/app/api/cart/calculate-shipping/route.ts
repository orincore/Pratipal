import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";
import { IWeightTier } from "@/models/ShippingSettings";

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
    const weightBasedEnabled = settings?.weight_based_enabled || false;
    const weightTiers: IWeightTier[] = settings?.weight_tiers || [];

    // Calculate total weight and subtotal
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
    let shippingMethod = "flat_rate";

    // Check if free shipping applies
    if (subtotal >= freeShippingThreshold) {
      shippingCost = 0;
      shippingMethod = "free_shipping";
    } else if (weightBasedEnabled && weightTiers.length > 0 && totalWeight > 0) {
      // Use weight-based shipping
      const applicableTier = weightTiers.find((tier: IWeightTier) => 
        totalWeight >= tier.min_weight && totalWeight <= tier.max_weight
      );
      
      if (applicableTier) {
        shippingCost = applicableTier.rate;
        shippingMethod = "weight_based";
      } else {
        // If no tier matches, use flat rate as fallback
        shippingCost = flatRate;
        shippingMethod = "flat_rate_fallback";
      }
    } else {
      // Use flat rate
      shippingCost = flatRate;
    }

    return NextResponse.json({
      totalWeight,
      shippingCost,
      shippingMethod,
      flatRate,
      freeShippingThreshold,
      weightBasedEnabled,
      weightTiers,
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

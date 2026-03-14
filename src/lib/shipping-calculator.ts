import getDB from "@/lib/db";
import { IWeightTier } from "@/models/ShippingSettings";

export interface ShippingCalculationResult {
  shipping_cost: number;
  shipping_method: string;
  total_weight: number;
  free_shipping_threshold: number;
  is_free_shipping: boolean;
}

export interface CartItemForShipping {
  product: {
    weight?: number;
    price: number;
    sale_price?: number;
  };
  quantity: number;
}

export async function calculateShipping(
  cartItems: CartItemForShipping[]
): Promise<ShippingCalculationResult> {
  const { ShippingSettings } = await getDB();

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
    const quantity = item.quantity || 1;
    const weight = item.product.weight || 0;
    const price = item.product.sale_price || item.product.price || 0;

    totalWeight += weight * quantity;
    subtotal += price * quantity;
  }

  // Calculate shipping cost
  let shipping_cost = 0;
  let shipping_method = "flat_rate";

  // Check if free shipping applies
  if (subtotal >= freeShippingThreshold) {
    shipping_cost = 0;
    shipping_method = "free_shipping";
  } else if (weightBasedEnabled && weightTiers.length > 0 && totalWeight > 0) {
    // Use weight-based shipping
    const applicableTier = weightTiers.find((tier: IWeightTier) => 
      totalWeight >= tier.min_weight && totalWeight <= tier.max_weight
    );
    
    if (applicableTier) {
      shipping_cost = applicableTier.rate;
      shipping_method = "weight_based";
    } else {
      // If no tier matches, use flat rate as fallback
      shipping_cost = flatRate;
      shipping_method = "flat_rate_fallback";
    }
  } else {
    // Use flat rate
    shipping_cost = flatRate;
  }

  return {
    shipping_cost,
    shipping_method,
    total_weight: totalWeight,
    free_shipping_threshold: freeShippingThreshold,
    is_free_shipping: subtotal >= freeShippingThreshold,
  };
}

export async function calculateShippingFromProducts(
  items: Array<{ product_id: string; quantity: number }>
): Promise<ShippingCalculationResult> {
  const { Product } = await getDB();
  
  const cartItems: CartItemForShipping[] = [];
  
  for (const item of items) {
    const product = await Product.findById(item.product_id)
      .select("price sale_price weight")
      .lean();
      
    if (product) {
      cartItems.push({
        product: {
          price: product.price,
          sale_price: product.sale_price,
          weight: product.weight,
        },
        quantity: item.quantity,
      });
    }
  }
  
  return calculateShipping(cartItems);
}
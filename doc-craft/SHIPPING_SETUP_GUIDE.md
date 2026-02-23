# Shipping Cost Calculator Setup Guide

## Overview
The shipping cost calculator automatically calculates shipping charges based on product weight. The system multiplies the total cart weight by the cost per kilogram set by the admin.

## Database Setup

1. Run the shipping settings SQL migration:
```bash
# Execute the SQL file in your Supabase SQL editor
cat supabase-shipping-settings.sql
```

This creates:
- `shipping_settings` table to store shipping configuration
- Default settings (₹50/kg, free shipping threshold ₹500)
- Helper function `get_shipping_settings()`

## Admin Configuration

### Access Shipping Settings
1. Login to admin panel at `/admin/login`
2. Navigate to "Shipping Settings" in the sidebar
3. Configure:
   - **Cost per Kilogram**: Amount charged per kg (e.g., ₹50)
   - **Free Shipping Threshold**: Minimum order amount for free shipping (e.g., ₹500)

### Add Weight to Products
1. Go to "Products" → "Create Product" or edit existing product
2. Scroll to "Shipping" section
3. Enter product weight in kilograms (e.g., 0.5 for 500g)
4. Save the product

## How It Works

### Calculation Formula
```
Total Weight = Sum of (Product Weight × Quantity) for all cart items
Shipping Cost = Total Weight × Cost per KG
```

### Free Shipping Logic
- If cart subtotal ≥ Free Shipping Threshold → Shipping = ₹0
- If cart subtotal < Free Shipping Threshold → Calculate based on weight

### Example Calculation
**Shipping Settings:**
- Cost per KG: ₹50
- Free Shipping Threshold: ₹500

**Cart Items:**
- Product A: 0.5 kg × 2 qty = 1 kg, Price: ₹200
- Product B: 0.3 kg × 1 qty = 0.3 kg, Price: ₹150

**Calculation:**
- Total Weight: 1.3 kg
- Subtotal: ₹350
- Shipping: 1.3 kg × ₹50 = ₹65 (since ₹350 < ₹500)
- Total: ₹350 + ₹65 + Tax = Final Amount

## Features

### Cart Page
- Real-time shipping calculation
- Weight display (e.g., "Shipping (1.3 kg)")
- Free shipping progress indicator
- Shows how much more to add for free shipping

### Checkout Integration
- Shipping cost automatically included in order total
- Weight-based calculation happens server-side
- Prevents manipulation of shipping costs

### Admin Dashboard
- Easy configuration interface
- Example calculations
- Visual feedback for settings changes
- No code changes required to update rates

## API Endpoints

### Get Shipping Settings
```
GET /api/admin/shipping-settings
```

### Update Shipping Settings
```
PUT /api/admin/shipping-settings
Body: {
  cost_per_kg: 50,
  free_shipping_threshold: 500
}
```

### Calculate Shipping
```
POST /api/cart/calculate-shipping
Body: {
  cartItems: [...]
}
```

## Important Notes

1. **Product Weight**: Products without weight are treated as 0 kg
2. **Automatic Updates**: Shipping recalculates when cart items change
3. **Free Shipping**: Applies when subtotal exceeds threshold, regardless of weight
4. **Rounding**: Shipping cost is rounded up to nearest rupee
5. **Tax**: Applied after shipping calculation

## Testing

1. Add products with different weights to cart
2. Verify shipping calculation matches: Weight × Rate
3. Test free shipping threshold by adding items
4. Check that quantity changes update shipping cost
5. Verify checkout includes correct shipping amount

## Troubleshooting

**Shipping shows ₹0 for all orders:**
- Check if free shipping threshold is set too low
- Verify products have weight values

**Shipping not calculating:**
- Ensure shipping_settings table exists
- Check API endpoint `/api/cart/calculate-shipping` is working
- Verify products have weight field populated

**Wrong shipping amount:**
- Check cost_per_kg setting in admin
- Verify product weights are in kilograms (not grams)
- Ensure calculation: Total Weight × Cost per KG

## Future Enhancements

Potential additions:
- Multiple shipping zones with different rates
- Flat rate shipping option
- Shipping classes for different product types
- Real-time carrier rate integration
- Weight-based tiered pricing

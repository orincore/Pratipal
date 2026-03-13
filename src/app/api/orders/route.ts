import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import getDB from "@/lib/db";
import { IWeightTier } from "@/models/ShippingSettings";

const CUSTOMER_COOKIE_NAME = "customer_session";

interface CustomerContext {
  id: string | null;
  email: string | null;
}

async function getCustomerContextFromCookie(): Promise<CustomerContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) {
    return { id: null, email: null };
  }
  const payload = verifyToken(token);
  if (!payload) {
    return { id: null, email: null };
  }
  if (payload.role && payload.role !== "customer") {
    return { id: null, email: null };
  }
  return { id: payload.sub, email: payload.email }; 
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function GET(req: NextRequest) {
  try {
    const { id: customerId, email } = await getCustomerContextFromCookie();

    if (!customerId && !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { Order, OrderItem } = await getDB();

    const filter: any = {};
    if (customerId && email) {
      filter.$or = [
        { customer_id: customerId },
        { customer_email: email }
      ];
    } else if (customerId) {
      filter.customer_id = customerId;
    } else if (email) {
      filter.customer_email = email;
    }

    const orders = await Order.find(filter)
      .sort({ created_at: -1 })
      .lean();

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id }).lean();
        return {
          ...order,
          id: order._id.toString(),
          _id: undefined,
          items: items.map(item => ({
            ...item,
            id: item._id.toString(),
            _id: undefined
          }))
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
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

    const { id: customerIdFromSession } = await getCustomerContextFromCookie();
    const { Customer, Product, Order, OrderItem, CartItem, ShippingSettings } = await getDB();
    let resolvedCustomerId = customerIdFromSession;

    if (!resolvedCustomerId && customer_email) {
      const existingCustomer = await Customer.findOne({ 
        email: customer_email.toLowerCase().trim() 
      }).lean();
      resolvedCustomerId = existingCustomer?._id.toString() || null;
    }

    let subtotal = 0;
    let totalWeight = 0;
    const orderItems = [];

    // Calculate subtotal and total weight
    for (const item of items) {
      const product = await Product.findById(item.product_id)
        .select('name sku price sale_price stock_quantity weight')
        .lean();

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
      const weight = product.weight || 0;
      const itemSubtotal = price * item.quantity;
      const itemWeight = weight * item.quantity;
      
      subtotal += itemSubtotal;
      totalWeight += itemWeight;

      orderItems.push({
        product_id: product._id,
        product_name: product.name,
        product_sku: product.sku,
        variant_id: item.variant_id || null,
        variant_name: item.variant_name || null,
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal,
      });
    }

    // Calculate shipping cost using the same logic as the shipping API
    const settings = await ShippingSettings.findOne()
      .sort({ updated_at: -1 })
      .lean();

    const flatRate = settings?.flat_rate || 50;
    const freeShippingThreshold = settings?.free_shipping_threshold || 500;
    const weightBasedEnabled = settings?.weight_based_enabled || false;
    const weightTiers: IWeightTier[] = settings?.weight_tiers || [];

    let shipping_cost = 0;
    let shippingMethod = "flat_rate";

    // Check if free shipping applies
    if (subtotal >= freeShippingThreshold) {
      shipping_cost = 0;
      shippingMethod = "free_shipping";
    } else if (weightBasedEnabled && weightTiers.length > 0 && totalWeight > 0) {
      // Use weight-based shipping
      const applicableTier = weightTiers.find((tier: IWeightTier) => 
        totalWeight >= tier.min_weight && totalWeight <= tier.max_weight
      );
      
      if (applicableTier) {
        shipping_cost = applicableTier.rate;
        shippingMethod = "weight_based";
      } else {
        // If no tier matches, use flat rate as fallback
        shipping_cost = flatRate;
        shippingMethod = "flat_rate_fallback";
      }
    } else {
      // Use flat rate
      shipping_cost = flatRate;
    }

    const tax = subtotal * 0.18;
    const total = subtotal + tax + shipping_cost;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      order_number: orderNumber,
      customer_id: resolvedCustomerId,
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
    });

    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order._id,
    }));

    try {
      await OrderItem.insertMany(orderItemsWithOrderId);
    } catch (itemsError: any) {
      await Order.findByIdAndDelete(order._id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock_quantity: -item.quantity }
      });
    }

    // Clear customer cart
    if (resolvedCustomerId) {
      await CartItem.deleteMany({ customer_id: resolvedCustomerId });
    }

    return NextResponse.json({
      order: {
        ...order.toJSON(),
        items: orderItemsWithOrderId,
        shipping_method: shippingMethod,
        total_weight: totalWeight,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import getDB from "@/lib/db";
import { IWeightTier } from "@/models/ShippingSettings";
import { sendMail, orderConfirmationHtml } from "@/lib/mailer";

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
      payment_method = "razorpay",
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
      customer_id: resolvedCustomerId ?? undefined,
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

    // Send order confirmation email for COD orders
    if (payment_method === "cod") {
      // Send confirmation to customer
      sendMail({
        to: customer_email,
        subject: `Order Confirmed — ${orderNumber}`,
        html: orderConfirmationHtml({
          orderNumber,
          customerName: customer_name,
          items: orderItems.map((i) => ({
            product_name: i.product_name,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.subtotal,
          })),
          subtotal,
          tax,
          shippingCost: shipping_cost,
          total,
          paymentMethod: "cod",
          shippingAddress: shipping_address,
        }),
      }).catch(() => {});

      // Send notification to admin
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const itemsList = orderItems.map(i => `• ${i.product_name} × ${i.quantity} — ₹${i.subtotal.toFixed(2)}`).join('\n');
        const addr = shipping_address;
        const addrLine = [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode || addr.postal_code, addr.country]
          .filter(Boolean).join(", ");
        
        sendMail({
          to: adminEmail,
          subject: `New Order: ${orderNumber} — ₹${total.toFixed(2)}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
              <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
                <div style="text-align:center;margin-bottom:24px;">
                  <div style="display:inline-block;background:linear-gradient(135deg,#1b244a,#059669);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#fff;margin-bottom:12px;">🛍️</div>
                  <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">New Order Received</h2>
                  <p style="color:#6b7280;font-size:14px;margin:0;">Order #${orderNumber}</p>
                </div>
                <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
                  <p style="font-size:14px;color:#166534;font-weight:600;margin:0 0 12px;">Customer Details:</p>
                  <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Name:</strong> ${customer_name}</p>
                  <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Email:</strong> <a href="mailto:${customer_email}" style="color:#059669;">${customer_email}</a></p>
                  <p style="font-size:14px;color:#374151;margin:6px 0;"><strong>Payment:</strong> ${payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                </div>
                <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:16px;">
                  <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Order Items:</strong></p>
                  <p style="font-size:13px;color:#6b7280;margin:0;white-space:pre-wrap;">${itemsList}</p>
                </div>
                <div style="background:#fef3c7;border-radius:10px;padding:16px;margin-bottom:16px;">
                  <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Order Total:</strong></p>
                  <p style="font-size:13px;color:#6b7280;margin:4px 0;">Subtotal: ₹${subtotal.toFixed(2)}</p>
                  <p style="font-size:13px;color:#6b7280;margin:4px 0;">Tax (18%): ₹${tax.toFixed(2)}</p>
                  <p style="font-size:13px;color:#6b7280;margin:4px 0;">Shipping: ${shipping_cost === 0 ? 'Free' : '₹' + shipping_cost.toFixed(2)}</p>
                  <p style="font-size:16px;color:#111827;font-weight:700;margin:8px 0 0;border-top:1px solid #fde68a;padding-top:8px;">Total: ₹${total.toFixed(2)}</p>
                </div>
                <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:16px;">
                  <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Shipping Address:</strong></p>
                  <p style="font-size:13px;color:#6b7280;margin:0;">${addrLine || "—"}</p>
                </div>
                ${notes ? `<div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:16px;">
                  <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Order Notes:</strong></p>
                  <p style="font-size:13px;color:#6b7280;margin:0;white-space:pre-wrap;">${notes}</p>
                </div>` : ''}
                <p style="color:#6b7280;font-size:13px;margin:0;">Received at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST</p>
              </div>
            </div>
          `,
        }).catch(() => {});
      }
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

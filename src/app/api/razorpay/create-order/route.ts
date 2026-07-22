import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import getDB from "@/lib/db";
import { calculateShippingFromProducts } from "@/lib/shipping-calculator";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Missing Razorpay credentials:', { keyId: !!keyId, keySecret: !!keySecret });
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, orderData } = await req.json();
    
    console.log('Creating Razorpay order with amount:', amount, 'currency:', currency);
    
    const razorpay = getRazorpayClient();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log('Razorpay order created successfully:', razorpayOrder.id);

    const { Order, OrderItem, Product } = await getDB();

    function generateOrderNumber(): string {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      return `ORD-${timestamp}-${random}`;
    }

    const orderNumber = generateOrderNumber();
    
    // Calculate shipping using the shared shipping calculator
    const shippingResult = await calculateShippingFromProducts(orderData.items);
    
    // First, get all products and calculate accurate totals
    const orderItems = [];
    let calculatedSubtotal = 0;
    
    for (const item of orderData.items) {
      const product = await Product.findById(item.product_id)
        .select("name sku price sale_price is_ebook ebook_file_url ebook_link")
        .lean();

      if (product) {
        // Ebooks are a digital download — cap at one copy per order no
        // matter what quantity slipped through from the client/cart.
        const isEbook = !!product.is_ebook;
        const quantity = isEbook ? 1 : item.quantity;

        const price = product.sale_price || product.price;
        const itemSubtotal = price * quantity;
        calculatedSubtotal += itemSubtotal;

        // Snapshot the ebook download target at order time (not looked up
        // live later) so an admin later replacing/removing the product's
        // file never breaks a download link already emailed to a buyer.
        // An uploaded file wins over an external link if a product somehow
        // has both.
        const ebookDownloadUrl = isEbook ? (product.ebook_file_url || product.ebook_link || undefined) : undefined;

        orderItems.push({
          order_id: null, // Will be set after order creation
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          product_name: product.name,
          product_sku: product.sku,
          quantity,
          price,
          subtotal: itemSubtotal,
          is_ebook: isEbook,
          ebook_download_url: ebookDownloadUrl,
        });
      }
    }
    
    // Ebooks are delivered digitally — an order made up entirely of ebooks
    // is never charged GST or shipping.
    const isEbookOnlyOrder =
      orderItems.length > 0 && orderItems.every((item) => item.is_ebook);

    // Calculate totals using proper shipping calculation
    const tax = isEbookOnlyOrder ? 0 : calculatedSubtotal * 0.18;
    const shipping = isEbookOnlyOrder ? 0 : shippingResult.shipping_cost;
    const total = calculatedSubtotal + tax + shipping;
    
    console.log('Order totals:', { 
      subtotal: calculatedSubtotal, 
      tax, 
      shipping, 
      total,
      shipping_method: shippingResult.shipping_method,
      total_weight: shippingResult.total_weight,
      free_shipping_threshold: shippingResult.free_shipping_threshold
    });

    const order = await Order.create({
      order_number: orderNumber,
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      status: "pending",
      payment_status: "pending",
      payment_method: "razorpay",
      subtotal: calculatedSubtotal,
      tax,
      shipping_cost: shipping,
      discount: 0,
      total,
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address,
    });

    // Update order items with the actual order ID
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order._id.toString(),
    }));

    await OrderItem.insertMany(orderItemsWithOrderId);

    return NextResponse.json({
      razorpay_order_id: razorpayOrder.id,
      order_id: order._id.toString(),
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

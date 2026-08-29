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

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Opens a Razorpay order for a store checkout.
 *
 * The price is decided here, not by the caller. The request body used to carry
 * an `amount` that went straight into the Razorpay order, while the server
 * separately computed the real total for the Order record — so a tampered
 * client could put any figure it liked in the gateway and be charged that,
 * leaving an order marked paid for far less than it was worth. Only the
 * quantities and the product ids are taken from the request now; every rupee
 * is recomputed from the saved products, the saved shipping settings, and the
 * same tax rule the storefront shows.
 *
 * The order of operations matters too: the Order row is written first so the
 * Razorpay order can carry its id in `notes`, and the gateway order id is
 * stored back on the row before this responds. Both are what let
 * /api/razorpay/webhook match a payment to an order when the customer never
 * returns from their UPI app.
 */
export async function POST(req: NextRequest) {
  try {
    const { amount: clientAmount, orderData } = await req.json();

    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({ error: "No items to order" }, { status: 400 });
    }
    if (!orderData.customer_email || !orderData.customer_name) {
      return NextResponse.json({ error: "Customer details are required" }, { status: 400 });
    }

    const { Order, OrderItem, Product } = await getDB();

    // Shipping comes from the saved shipping settings and the products' own
    // weights — the same calculator /api/cart/calculate-shipping quotes from,
    // so what the customer was shown and what they're charged agree.
    const shippingResult = await calculateShippingFromProducts(orderData.items);

    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of orderData.items) {
      const product = await Product.findById(item.product_id)
        .select("name sku price sale_price is_ebook ebook_file_url ebook_link")
        .lean();

      // A product that no longer exists is skipped rather than priced at
      // whatever the client claimed for it.
      if (!product) continue;

      // Ebooks are a digital download — cap at one copy per order no
      // matter what quantity slipped through from the client/cart.
      const isEbook = !!product.is_ebook;
      const quantity = isEbook ? 1 : Math.max(1, Math.floor(Number(item.quantity) || 1));

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

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "None of these products are available any more." },
        { status: 400 }
      );
    }

    // Ebooks are delivered digitally — an order made up entirely of ebooks
    // is never charged GST or shipping.
    const isEbookOnlyOrder = orderItems.every((item) => item.is_ebook);

    const tax = isEbookOnlyOrder ? 0 : calculatedSubtotal * 0.18;
    const shipping = isEbookOnlyOrder ? 0 : shippingResult.shipping_cost;
    const total = calculatedSubtotal + tax + shipping;
    const amountInPaise = Math.round(total * 100);

    if (amountInPaise <= 0) {
      // Razorpay rejects a zero-value order, and a free basket has no business
      // going through the gateway at all.
      return NextResponse.json({ error: "This order has nothing to pay for." }, { status: 400 });
    }

    // Worth knowing about: it means the storefront and the server disagree on
    // the price, usually because a product's price changed while the customer
    // had checkout open. The server's figure is the one charged either way,
    // and the customer sees it in the Razorpay sheet before confirming.
    const clientPaise = Math.round(Number(clientAmount || 0) * 100);
    if (clientPaise && Math.abs(clientPaise - amountInPaise) > 100) {
      console.warn(
        `Checkout total mismatch: client quoted ${clientPaise} paise, server charging ${amountInPaise} paise`
      );
    }

    console.log('Order totals:', {
      subtotal: calculatedSubtotal,
      tax,
      shipping,
      total,
      shipping_method: shippingResult.shipping_method,
      total_weight: shippingResult.total_weight,
      free_shipping_threshold: shippingResult.free_shipping_threshold
    });

    const orderNumber = generateOrderNumber();

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
      // The whole pricing pipeline above is in rupees — GST, the shipping
      // tiers, the free-shipping threshold — so the charge is pinned to INR
      // rather than taking a currency off the request.
      currency: "INR",
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address,
    });

    // Update order items with the actual order ID
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order._id.toString(),
    }));

    await OrderItem.insertMany(orderItemsWithOrderId);

    let razorpayOrder;
    try {
      const razorpay = getRazorpayClient();
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        // Razorpay caps receipt at 40 chars; the order number is well inside it.
        receipt: orderNumber.slice(0, 40),
        notes: {
          order_id: order._id.toString(),
          order_number: orderNumber,
          customer_email: orderData.customer_email,
        },
      });
    } catch (orderErr: any) {
      // Don't strand a pending order that can never be paid for.
      await Order.findByIdAndUpdate(order._id, {
        payment_status: "failed",
        status: "failed",
      }).catch(() => {});
      throw orderErr;
    }

    // Stored before responding, so it is already in place by the time the
    // customer can possibly pay — see the note at the top about the webhook.
    await Order.findByIdAndUpdate(order._id, { razorpay_order_id: razorpayOrder.id });

    console.log('Razorpay order created successfully:', razorpayOrder.id);

    return NextResponse.json({
      razorpay_order_id: razorpayOrder.id,
      order_id: order._id.toString(),
      order_number: orderNumber,
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

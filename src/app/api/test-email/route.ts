import { NextRequest, NextResponse } from "next/server";
import { sendMail, orderConfirmationHtml, trackingUpdateHtml, orderCancelledHtml } from "@/lib/mailer";

const TEST_TO = "suradkaradarsh15@gmail.com";

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get("type") || "order_confirmation";

  try {
    let subject = "";
    let html = "";

    if (type === "order_confirmation") {
      subject = "Order Confirmed — TEST-ORD-001";
      html = orderConfirmationHtml({
        orderNumber: "TEST-ORD-001",
        customerName: "Adarsh Suradkar",
        items: [
          { product_name: "Rose Quartz Crystal", quantity: 2, price: 499, subtotal: 998 },
          { product_name: "Lavender Essential Oil", quantity: 1, price: 299, subtotal: 299 },
        ],
        subtotal: 1297,
        tax: 233.46,
        shippingCost: 50,
        total: 1580.46,
        paymentMethod: "online",
        shippingAddress: {
          address_line1: "123 Healing Street",
          address_line2: "Apt 4B",
          city: "Mumbai",
          state: "Maharashtra",
          postal_code: "400001",
          country: "India",
        },
      });
    } else if (type === "tracking") {
      subject = "Order Update — TEST-ORD-001";
      html = trackingUpdateHtml({
        orderNumber: "TEST-ORD-001",
        customerName: "Adarsh Suradkar",
        trackingStatus: "shipped",
        trackingNumber: "TESTAWB123456",
        trackingUrl: "https://shiprocket.co/tracking/TESTAWB123456",
        trackingMessage: "Your order has been picked up by the courier.",
        total: 1580.46,
      });
    } else if (type === "cancelled") {
      subject = "Order Cancelled — TEST-ORD-001";
      html = orderCancelledHtml({
        orderNumber: "TEST-ORD-001",
        customerName: "Adarsh Suradkar",
        reason: "Item out of stock",
        total: 1580.46,
        cancelledBy: "admin",
      });
    } else {
      return NextResponse.json({ error: "Unknown type. Use: order_confirmation | tracking | cancelled" }, { status: 400 });
    }

    const info = await sendMail({ to: TEST_TO, subject, html });
    return NextResponse.json({ success: true, type, messageId: info.messageId });
  } catch (err: any) {
    console.error("Test email error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

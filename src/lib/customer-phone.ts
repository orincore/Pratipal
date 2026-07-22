import getDB from "@/lib/db";

// Order has no dedicated phone field — only whatever's inside the free-form
// shipping_address (Schema.Types.Mixed). Falls back to the Customer record
// when the address didn't carry one (e.g. e-book-only orders with nothing to
// ship). Returns null if neither has one, so callers can skip the WhatsApp
// send rather than fail.
export async function resolveOrderWhatsappNumber(order: {
  shipping_address?: Record<string, any> | null;
  customer_id?: string | null;
}): Promise<string | null> {
  const fromAddress = order.shipping_address?.phone;
  if (fromAddress) return fromAddress;

  if (order.customer_id) {
    const { Customer } = await getDB();
    const customer = await Customer.findById(order.customer_id).select("phone").lean();
    if (customer?.phone) return customer.phone;
  }

  return null;
}

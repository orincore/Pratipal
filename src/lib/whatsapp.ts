// Fire-and-forget client for mail-pratipal-backend's transactional WhatsApp
// endpoint. Never throws — a WhatsApp/MSG91 outage must not affect checkout,
// booking, or registration, which all treat this the same way they already
// treat email sends (best-effort, logged on failure).
export type TransactionalWhatsappEvent =
  | "invitation_registration_confirmed"
  | "order_confirmed_customer"
  | "order_confirmed_admin"
  | "order_status_update_customer"
  | "ebook_delivered_customer"
  | "ebook_sold_admin"
  | "booking_confirmed_customer"
  | "booking_confirmed_admin";

interface SendWhatsappNotificationOptions {
  event: TransactionalWhatsappEvent;
  to: string | null | undefined;
  data: Record<string, unknown>;
}

// Meta's Cloud API rejects template parameter values containing newlines,
// tabs, or 4+ consecutive spaces, and the whole rendered body is capped at
// 1024 chars — so a cart's item list has to be flattened into one
// comma-separated string (not one {{n}} per item, since an approved
// template's variable count is fixed) and truncated defensively.
const ITEMS_SUMMARY_MAX_LEN = 300;

export function formatOrderItemsForWhatsapp(
  items: Array<{ product_name: string; quantity: number; subtotal: number }>
): string {
  const parts = items.map((i) => `${i.product_name} x${i.quantity} (₹${i.subtotal.toFixed(2)})`);

  let result = "";
  let shown = 0;
  for (const part of parts) {
    const candidate = result ? `${result}, ${part}` : part;
    if (candidate.length > ITEMS_SUMMARY_MAX_LEN) break;
    result = candidate;
    shown++;
  }

  const remaining = parts.length - shown;
  if (remaining > 0) {
    return `${result || parts[0].slice(0, ITEMS_SUMMARY_MAX_LEN)} +${remaining} more item${remaining === 1 ? "" : "s"}`;
  }
  return result || "—";
}

export async function sendWhatsappNotification({ event, to, data }: SendWhatsappNotificationOptions): Promise<void> {
  if (!to) {
    console.warn(`WhatsApp notification skipped (event=${event}): no phone number available`);
    return;
  }

  const backendUrl = process.env.MAIL_BACKEND_URL;
  const apiKey = process.env.MAIL_BACKEND_API_KEY;
  if (!backendUrl || !apiKey) {
    console.warn(`WhatsApp notification skipped (event=${event}): MAIL_BACKEND_URL/MAIL_BACKEND_API_KEY not configured`);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${backendUrl}/api/notifications/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({ event, to, data }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`WhatsApp notification failed (event=${event}): HTTP ${res.status} ${body}`);
      return;
    }
    const json = await res.json().catch(() => ({}));
    if (!json.success) {
      console.error(`WhatsApp notification failed (event=${event}):`, json.error);
    }
  } catch (err) {
    console.error(`WhatsApp notification request failed (event=${event}):`, err);
  } finally {
    clearTimeout(timeout);
  }
}

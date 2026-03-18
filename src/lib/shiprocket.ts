/**
 * Shiprocket API client
 * Docs: https://apidocs.shiprocket.in/
 */

const SR_BASE = "https://apiv2.shiprocket.in/v1/external";

let _token: string | null = null;
let _tokenExpiry = 0;

export async function getShiprocketToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const res = await fetch(`${SR_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shiprocket auth failed: ${err}`);
  }

  const data = await res.json();
  _token = data.token as string;
  // Token is valid for 24h; refresh after 23h
  _tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return _token;
}

async function srFetch(path: string, options: RequestInit = {}) {
  const token = await getShiprocketToken();
  const res = await fetch(`${SR_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Shiprocket error ${res.status}`);
  return data;
}

export interface ShiprocketOrderPayload {
  order_id: string;           // your internal order number
  order_date: string;         // ISO date string
  pickup_location: string;    // warehouse name in Shiprocket
  channel_id?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
    hsn?: number;
  }>;
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export async function createShiprocketOrder(payload: ShiprocketOrderPayload) {
  if (process.env.SHIPROCKET_MOCK === "true") {
    return {
      order_id: Math.floor(Math.random() * 900000 + 100000),
      shipment_id: Math.floor(Math.random() * 900000 + 100000),
      status: "NEW",
      status_code: 1,
      onboarding_completed_now: 0,
      awb_code: "",
      courier_company_id: "",
      courier_name: "",
    };
  }
  return srFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getShiprocketTracking(shipmentId: string) {
  if (process.env.SHIPROCKET_MOCK === "true") {
    return { tracking_data: { shipment_status: "SHIPPED", awb_code: "MOCK-AWB-" + shipmentId } };
  }
  return srFetch(`/courier/track/shipment/${shipmentId}`);
}

export async function cancelShiprocketOrder(ids: number[]) {
  if (process.env.SHIPROCKET_MOCK === "true") {
    return { message: "Cancelled successfully (mock)" };
  }
  return srFetch("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ── Map Shiprocket status strings → our TrackingStatus ──────────────────────
const SR_STATUS_MAP: Record<string, string> = {
  "new":                    "order_received",
  "pending":                "order_received",
  "confirmed":              "processing",
  "processing":             "processing",
  "packed":                 "packed",
  "ready to ship":          "packed",
  "pickup scheduled":       "packed",
  "pickup queued":          "packed",
  "manifest generated":     "packed",
  "shipped":                "shipped",
  "in transit":             "shipped",
  "shipment further connected": "shipped",
  "shipment arrived at hub":    "shipped",
  "shipment arrived":           "shipped",
  "shipment picked up":         "shipped",
  "out for delivery":           "out_for_delivery",
  "shipment out for delivery":  "out_for_delivery",
  "delivered":                  "delivered",
  "shipment delivered":         "delivered",
  "cancelled":                  "cancelled",
  "rto initiated":              "cancelled",
  "rto delivered":              "cancelled",
  "lost":                       "cancelled",
};

export function mapShiprocketStatus(srStatus: string): string {
  return SR_STATUS_MAP[srStatus.toLowerCase()] ?? "processing";
}

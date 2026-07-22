"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrackedOrder {
  order_number: string;
  status: string;
  tracking_status: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  tracking_message: string | null;
  tracking_history: Array<{ status: string; message?: string; timestamp: string }>;
  total: number;
  created_at: string;
  item_count: number;
  items: Array<{ product_name: string; quantity: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  order_received: "Order Received",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function statusIcon(status: string | null) {
  if (status === "delivered") return <CheckCircle className="h-10 w-10 text-green-600" />;
  if (status === "cancelled") return <XCircle className="h-10 w-10 text-red-600" />;
  if (status === "shipped" || status === "out_for_delivery") return <Truck className="h-10 w-10 text-blue-600" />;
  return <Package className="h-10 w-10 text-amber-600" />;
}

// Public, unauthenticated tracking page — this is the destination of the
// WhatsApp "Track Order" button (order_confirmed_customer /
// order_status_update_customer templates). Reads /api/orders/track/[orderNumber],
// which returns only shipment-status fields.
export default function TrackOrderPage() {
  const params = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.orderNumber) return;
    (async () => {
      try {
        const res = await fetch(`/api/orders/track/${params.orderNumber}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setOrder(data.order);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find an order matching this link. Double-check the link from your WhatsApp message or email.
          </p>
          <Link href="/" className="text-primary font-medium underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = order.tracking_status
    ? STATUS_LABELS[order.tracking_status] ?? order.tracking_status
    : "Order Received";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12 pt-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow mb-4">
            {statusIcon(order.tracking_status)}
          </div>
          <h1 className="text-3xl font-bold mb-1">{statusLabel}</h1>
          <p className="text-muted-foreground">Order #{order.order_number}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Placed on</span>
              <span className="font-medium">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{order.item_count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            {order.tracking_number && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tracking Number</span>
                <span className="font-medium">{order.tracking_number}</span>
              </div>
            )}
            {order.tracking_url && (
              <a href={order.tracking_url} target="_blank" rel="noreferrer" className="block text-center text-sm text-primary font-medium underline pt-1">
                View courier tracking
              </a>
            )}
            {order.tracking_message && (
              <p className="text-sm text-muted-foreground bg-amber-50 rounded-md p-3">{order.tracking_message}</p>
            )}
          </CardContent>
        </Card>

        {order.tracking_history?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[...order.tracking_history].reverse().map((entry, idx) => (
                  <li key={idx} className="flex gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{STATUS_LABELS[entry.status] ?? entry.status}</p>
                      {entry.message && <p className="text-sm text-muted-foreground">{entry.message}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

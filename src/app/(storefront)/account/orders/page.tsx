"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import type { Order, OrderItem, TrackingStatus } from "@/lib/ecommerce-types";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface OrdersResponse extends Order {
  items?: OrderItem[];
}

interface ServiceBooking {
  id: string;
  booking_number: string;
  service_name: string;
  service_category: string;
  frequency_label: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  payment_status: "pending" | "paid" | "failed";
  booking_status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  razorpay_payment_id?: string;
  whatsapp_redirect_url?: string;
  admin_notes?: string;
  created_at: string;
}

type StatusKey = Extract<
  Order["status"],
  "pending" | "processing" | "completed" | "cancelled" | "refunded" | "failed"
>;

const STATUS_META: Record<StatusKey, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", color: "bg-gray-200 text-gray-600" },
  refunded: { label: "Refunded", color: "bg-purple-100 text-purple-800" },
  failed: { label: "Failed", color: "bg-rose-100 text-rose-800" },
};

export default function AccountOrdersPage() {
  const { customer, loading } = useCustomerAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrdersResponse[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login?redirect=/account/orders");
    }
  }, [customer, loading, router]);

  useEffect(() => {
    if (!customer) return;
    async function loadOrders() {
      setFetching(true);
      try {
        // Fetch product orders
        const ordersRes = await fetch("/api/orders", { cache: "no-store" });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }

        // Fetch service bookings
        const bookingsRes = await fetch("/api/bookings/customer", { cache: "no-store" });
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        }
      } catch (err: any) {
        toast.error(err.message || "Unable to load orders");
      } finally {
        setFetching(false);
      }
    }
    loadOrders();
  }, [customer, router]);

  const metrics = useMemo(() => {
    const totalOrders = orders.length + bookings.length;
    const openOrders = orders.filter((order) =>
      ["pending", "processing"].includes(order.status)
    ).length;
    const openBookings = bookings.filter((booking) => booking.payment_status === "pending").length;
    const ordersValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const bookingsValue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    return {
      total: totalOrders,
      open: openOrders + openBookings,
      value: ordersValue + bookingsValue,
    };
  }, [orders, bookings]);

  const handleOrderUpdated = (updated: OrdersResponse) => {
    setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
  };

  if (loading || !customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">My Account</p>
            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track every ritual you’ve purchased with live status updates.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push("/account")}> 
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to account
            </Button>
            <Button onClick={() => router.push("/")}>Continue Shopping</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            title="Total Orders"
            icon={Package}
            value={metrics.total.toString()}
            description="All purchases placed under your profile"
          />
          <MetricCard
            title="Active"
            icon={Clock}
            value={metrics.open.toString()}
            description="Pending or processing orders"
          />
          <MetricCard
            title="Lifetime Spend"
            icon={CheckCircle2}
            value={formatPrice(metrics.value)}
            description="Total of all completed orders"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>Recent orders appear first.</CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your orders…
              </div>
            ) : orders.length === 0 && bookings.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg font-semibold">No orders yet</p>
                <p className="text-sm mt-2">Start shopping to see your purchases here.</p>
                <Button className="mt-6" onClick={() => router.push("/")}>Shop Rituals</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} onOrderUpdated={handleOrderUpdated} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  description,
  value,
  icon: Icon,
}: {
  title: string;
  description: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-white/70 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function OrderCard({
  order,
  onOrderUpdated,
}: {
  order: OrdersResponse;
  onOrderUpdated: (order: OrdersResponse) => void;
}) {
  const meta = STATUS_META[order.status as StatusKey] ?? STATUS_META.pending;
  const eventDate = new Date(order.created_at);
  const items = order.items || [];
  const shipping = order.shipping_address as any;
  const [cancelLoading, setCancelLoading] = useState(false);
  const trackingStatusMeta: Record<TrackingStatus, { label: string; color: string }> = {
    order_received: { label: "Order received", color: "bg-gray-100 text-gray-700" },
    processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
    packed: { label: "Packed", color: "bg-amber-100 text-amber-800" },
    shipped: { label: "Shipped", color: "bg-indigo-100 text-indigo-800" },
    out_for_delivery: { label: "Out for delivery", color: "bg-purple-100 text-purple-800" },
    delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-800" },
    cancelled: { label: "Cancelled", color: "bg-rose-100 text-rose-800" },
  };
  const trackingStatus = order.tracking_status ? trackingStatusMeta[order.tracking_status] : null;
  const trackingUpdatedAt = order.tracking_updated_at
    ? new Date(order.tracking_updated_at).toLocaleString()
    : null;
  const lockedTrackingStatuses = new Set<TrackingStatus>([
    "shipped",
    "out_for_delivery",
    "delivered",
  ]);
  const lockedOrderStatuses = new Set(["completed", "cancelled", "failed"]);
  const normalizedOrderStatus = order.status?.toLowerCase?.();
  const normalizedTrackingStatus = order.tracking_status?.toLowerCase?.() as TrackingStatus | undefined;
  const canCancel = !(
    (normalizedOrderStatus && lockedOrderStatuses.has(normalizedOrderStatus)) ||
    (normalizedTrackingStatus && lockedTrackingStatuses.has(normalizedTrackingStatus))
  );

  async function handleCancel() {
    if (!canCancel || cancelLoading) return;
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: "Cancelled by customer" }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to cancel order");
      }
      const data = await res.json();
      onOrderUpdated(data.order);
      toast.success("Order cancelled");
    } catch (err: any) {
      toast.error(err.message || "Unable to cancel order");
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
          <p className="text-lg font-semibold text-gray-900">
            Placed on {eventDate.toLocaleDateString(undefined, { dateStyle: "medium" })}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge className={`${meta.color} px-3 py-1 text-xs font-semibold`}>{meta.label}</Badge>
          <p className="text-sm font-semibold">{formatPrice(order.total || 0)}</p>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">Items</p>
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{item.product_name}</span>
                  <span>x{item.quantity}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.variant_name || item.product_sku || "Standard"}
                </p>
                <p className="text-sm font-semibold text-brand-primary mt-1">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Shipping</p>
          <div className="mt-3 rounded-lg border bg-gray-50 p-4 text-sm text-muted-foreground">
            {shipping ? (
              <>
                <p className="font-semibold text-gray-900">{shipping.first_name} {shipping.last_name}</p>
                <p>{shipping.address_line1}</p>
                {shipping.address_line2 && <p>{shipping.address_line2}</p>}
                <p>
                  {shipping.city}, {shipping.state} {shipping.postal_code}
                </p>
                <p>{shipping.country}</p>
                {shipping.phone && <p>Phone: {shipping.phone}</p>}
              </>
            ) : (
              <p>No shipping address on file.</p>
            )}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <LineItem label="Subtotal" value={formatPrice(order.subtotal || 0)} />
            <LineItem label="Tax" value={formatPrice(order.tax || 0)} />
            <LineItem label="Shipping" value={formatPrice(order.shipping_cost || 0)} />
            {order.discount ? (
              <LineItem label="Discount" value={`- ${formatPrice(order.discount)}`} />
            ) : null}
            <Separator />
            <LineItem label="Total Paid" value={formatPrice(order.total || 0)} emphasize />
          </div>
          {(trackingStatus || order.tracking_number || order.tracking_message) && (
            <div className="mt-6 rounded-lg border bg-white p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Tracking</p>
              <div className="space-y-3 text-sm">
                {trackingStatus && (
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${trackingStatus.color}`}>
                      {trackingStatus.label}
                    </span>
                    {trackingUpdatedAt && (
                      <span className="text-xs text-muted-foreground">Updated {trackingUpdatedAt}</span>
                    )}
                  </div>
                )}
                {order.tracking_number && (
                  <p>
                    <span className="text-muted-foreground">Tracking #:</span> {order.tracking_number}
                  </p>
                )}
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-primary text-sm underline"
                  >
                    View carrier page
                  </a>
                )}
                {order.tracking_message && (
                  <p className="text-muted-foreground">{order.tracking_message}</p>
                )}
                {!order.tracking_status && !order.tracking_number && (
                  <p className="text-muted-foreground text-sm">
                    We'll email you tracking updates once this order ships.
                  </p>
                )}
              </div>
            </div>
          )}
          {canCancel && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling
                  </>
                ) : (
                  "Cancel Order"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: ServiceBooking }) {
  const eventDate = new Date(booking.created_at);
  const statusMeta = {
    pending: { label: "Payment Pending", color: "bg-amber-100 text-amber-800" },
    paid: { label: "Paid", color: "bg-emerald-100 text-emerald-800" },
    failed: { label: "Payment Failed", color: "bg-rose-100 text-rose-800" },
  };
  const meta = statusMeta[booking.payment_status];

  // Check if frequency_label looks like a MongoDB ObjectId (24 hex characters)
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(booking.frequency_label);
  const displayFrequency = isObjectId ? "Custom Session" : booking.frequency_label;

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Booking #{booking.booking_number}</p>
          <p className="text-lg font-semibold text-gray-900">
            {booking.service_name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Booked on {eventDate.toLocaleDateString(undefined, { dateStyle: "medium" })}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge className={`${meta.color} px-3 py-1 text-xs font-semibold`}>{meta.label}</Badge>
          <p className="text-sm font-semibold">{formatPrice(booking.amount)}</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {booking.booking_status && booking.booking_status !== "pending" && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <Badge className={`${
                booking.booking_status === "confirmed" ? "bg-blue-100 text-blue-800" :
                booking.booking_status === "in_progress" ? "bg-purple-100 text-purple-800" :
                booking.booking_status === "completed" ? "bg-green-100 text-green-800" :
                booking.booking_status === "cancelled" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
              } px-3 py-1 text-xs font-semibold`}>
                {booking.booking_status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Service Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{booking.service_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency:</span>
                <span className="font-medium">{displayFrequency}</span>
              </div>
              {booking.razorpay_payment_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-xs">{booking.razorpay_payment_id}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Contact Information</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{booking.customer_name}</p>
              <p>{booking.customer_email}</p>
              <p>{booking.customer_phone}</p>
            </div>
          </div>
        </div>

        {booking.whatsapp_redirect_url && booking.payment_status === "paid" && (
          <div className="pt-4 border-t">
            <Button
              onClick={() => window.open(booking.whatsapp_redirect_url, "_blank")}
              className="w-full sm:w-auto"
              variant="outline"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Continue to WhatsApp
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function LineItem({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${emphasize ? "font-semibold text-gray-900" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className={`text-sm ${emphasize ? "font-semibold text-gray-900" : "text-gray-700"}`}>
        {value}
      </span>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Loader2, Package, Clock, CheckCircle2, ArrowLeft,
  ShoppingBag, BookOpen, Stethoscope, MessageCircle, ChevronDown, ChevronUp, Truck, MapPin,
} from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import type { Order, OrderItem, TrackingStatus } from "@/lib/ecommerce-types";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface OrdersResponse extends Order { items?: OrderItem[] }

interface ServiceBooking {
  id: string; booking_number: string; service_name: string;
  service_category: string; frequency_label: string;
  booking_type?: "service" | "course";
  order_type?: "service" | "course";  // canonical — prefer this
  customer_name: string;
  customer_email: string; customer_phone: string; amount: number;
  payment_status: "pending" | "paid" | "failed";
  booking_status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  razorpay_payment_id?: string; whatsapp_redirect_url?: string;
  admin_notes?: string; created_at: string;
}

type FilterTab = "all" | "goods" | "services" | "courses";
type StatusKey = Extract<Order["status"], "pending"|"processing"|"completed"|"cancelled"|"refunded"|"failed">;
type MergedItem = { kind: "order"; data: OrdersResponse; date: number } | { kind: "booking"; data: ServiceBooking; date: number };

const STATUS_META: Record<StatusKey, { label: string; color: string }> = {
  pending:    { label: "Pending",    color: "bg-amber-100 text-amber-800" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
  completed:  { label: "Completed",  color: "bg-emerald-100 text-emerald-800" },
  cancelled:  { label: "Cancelled",  color: "bg-gray-200 text-gray-600" },
  refunded:   { label: "Refunded",   color: "bg-purple-100 text-purple-800" },
  failed:     { label: "Failed",     color: "bg-rose-100 text-rose-800" },
};

export default function AccountOrdersPage() {
  const { customer, loading } = useCustomerAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrdersResponse[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    if (!loading && !customer) router.push("/login?redirect=/account/orders");
  }, [customer, loading, router]);

  useEffect(() => {
    if (!customer) return;
    (async () => {
      setFetching(true);
      try {
        const [oRes, bRes] = await Promise.all([
          fetch("/api/orders", { cache: "no-store" }),
          fetch("/api/bookings/customer", { cache: "no-store" }),
        ]);
        if (oRes.ok) setOrders((await oRes.json()).orders || []);
        if (bRes.ok) setBookings(
          ((await bRes.json()).bookings || []).map((b: ServiceBooking) => ({
            ...b,
            // Resolve order_type: prefer order_type, fall back to booking_type, default "service"
            order_type: (b.order_type ?? b.booking_type ?? "service") as "service" | "course",
          }))
        );
      } catch (err: any) {
        toast.error(err.message || "Unable to load orders");
      } finally {
        setFetching(false);
      }
    })();
  }, [customer]);

  const metrics = useMemo(() => ({
    total: orders.length + bookings.length,
    open: orders.filter((o) => ["pending","processing"].includes(o.status)).length
        + bookings.filter((b) => b.payment_status === "pending").length,
    value: orders.reduce((s, o) => s + (o.total || 0), 0)
         + bookings.reduce((s, b) => s + (b.amount || 0), 0),
  }), [orders, bookings]);

  const allItems = useMemo<MergedItem[]>(() => [
    ...orders.map((o) => ({ kind: "order" as const, data: o, date: new Date(o.created_at).getTime() })),
    ...bookings.map((b) => ({ kind: "booking" as const, data: b, date: new Date(b.created_at).getTime() })),
  ].sort((a, b) => b.date - a.date), [orders, bookings]);

  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case "goods":    return allItems.filter((i) => i.kind === "order");
      case "courses":  return allItems.filter((i) => i.kind === "booking" && i.data.order_type === "course");
      case "services": return allItems.filter((i) => i.kind === "booking" && i.data.order_type === "service");
      default:         return allItems;
    }
  }, [allItems, activeTab]);

  const handleOrderUpdated = (u: OrdersResponse) =>
    setOrders((prev) => prev.map((o) => (o.id === u.id ? u : o)));

  const tabs: { key: FilterTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "all",      label: "All",      icon: Package },
    { key: "goods",    label: "Products",  icon: ShoppingBag },
    { key: "services", label: "Services", icon: Stethoscope },
    { key: "courses",  label: "Courses",  icon: BookOpen },
  ];

  const tabCount = (key: FilterTab) => {
    switch (key) {
      case "goods":    return allItems.filter((i) => i.kind === "order").length;
      case "courses":  return allItems.filter((i) => i.kind === "booking" && i.data.order_type === "course").length;
      case "services": return allItems.filter((i) => i.kind === "booking" && i.data.order_type === "service").length;
      default:         return allItems.length;
    }
  };

  if (loading || !customer) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-20 pb-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 space-y-4 md:space-y-8">

        {/* ── MOBILE header ── */}
        <div className="flex items-center justify-between pt-2 md:hidden">
          <div>
            <button onClick={() => router.push("/account")} className="flex items-center gap-1 text-xs text-muted-foreground mb-1 hover:text-gray-700">
              <ArrowLeft className="h-3 w-3" /> My Account
            </button>
            <h1 className="text-xl font-bold text-gray-900">Order History</h1>
          </div>
          <Button size="sm" onClick={() => router.push("/shop")} className="text-xs h-8">Shop</Button>
        </div>

        {/* ── DESKTOP header ── */}
        <div className="hidden md:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <p className="text-sm text-muted-foreground">My Account</p>
            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            <p className="text-muted-foreground text-sm mt-1">Track every ritual you've purchased with live status updates.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push("/account")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to account</Button>
            <Button onClick={() => router.push("/")}>Continue Shopping</Button>
          </div>
        </div>

        {/* ── MOBILE metrics — 3-col compact row ── */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {[
            { label: "Orders", value: metrics.total,              icon: Package },
            { label: "Active",  value: metrics.open,              icon: Clock },
            { label: "Spent",   value: formatPrice(metrics.value), icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border px-3 py-2.5 flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-base font-bold text-gray-900 leading-tight">{value}</span>
            </div>
          ))}
        </div>

        {/* ── DESKTOP metrics — 3-col cards ── */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          {[
            { title: "Total Orders", value: metrics.total.toString(),    desc: "All purchases placed under your profile", icon: Package },
            { title: "Active",        value: metrics.open.toString(),     desc: "Pending or processing orders",            icon: Clock },
            { title: "Lifetime Spend",value: formatPrice(metrics.value),  desc: "Total of all completed orders",           icon: CheckCircle2 },
          ].map(({ title, value, desc, icon: Icon }) => (
            <Card key={title} className="bg-white/70 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Filter tabs (shared, slightly different sizing) ── */}
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-shrink-0 inline-flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all border ${
                activeTab === key
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
              }`}
            >
              <Icon className="h-3 w-3 md:h-3.5 md:w-3.5" />
              {label}
              <span className={`text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded-full ${activeTab === key ? "bg-white/20 text-white" : "bg-gray-100 text-slate-400 md:text-slate-500"}`}>
                {tabCount(key)}
              </span>
            </button>
          ))}
        </div>

        {/* ── List ── */}
        {fetching ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 md:py-16 text-muted-foreground bg-white rounded-xl border">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm md:text-lg">No orders yet</p>
            <p className="text-xs md:text-sm mt-1">{activeTab === "all" ? "Start shopping to see your purchases here." : `No ${activeTab === "goods" ? "product" : activeTab} orders found.`}</p>
            {activeTab === "all" && <Button className="mt-4 md:mt-6 h-8 md:h-10 text-xs md:text-sm" onClick={() => router.push("/")}>Shop Rituals</Button>}
          </div>
        ) : (
          /* Mobile: tight list. Desktop: wrapped in a Card */
          <>
            <div className="space-y-3 md:hidden">
              {filteredItems.map((item) =>
                item.kind === "order"
                  ? <OrderCard key={item.data.id} order={item.data} onOrderUpdated={handleOrderUpdated} />
                  : <BookingCard key={item.data.id} booking={item.data} />
              )}
            </div>
            <Card className="hidden md:block">
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>Latest orders appear first.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredItems.map((item) =>
                    item.kind === "order"
                      ? <OrderCardDesktop key={item.data.id} order={item.data} onOrderUpdated={handleOrderUpdated} />
                      : <BookingCardDesktop key={item.data.id} booking={item.data} />
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ── OrderCard ──────────────────────────────────────────────────────────────
function OrderCard({ order, onOrderUpdated }: { order: OrdersResponse; onOrderUpdated: (o: OrdersResponse) => void }) {
  const meta = STATUS_META[order.status as StatusKey] ?? STATUS_META.pending;
  const [expanded, setExpanded] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const items = order.items || [];
  const shipping = order.shipping_address as any;

  const trackingStatusMeta: Record<TrackingStatus, { label: string; color: string }> = {
    order_received:   { label: "Order received",   color: "bg-gray-100 text-gray-700" },
    processing:       { label: "Processing",        color: "bg-blue-100 text-blue-800" },
    packed:           { label: "Packed",            color: "bg-amber-100 text-amber-800" },
    shipped:          { label: "Shipped",           color: "bg-indigo-100 text-indigo-800" },
    out_for_delivery: { label: "Out for delivery",  color: "bg-purple-100 text-purple-800" },
    delivered:        { label: "Delivered",         color: "bg-emerald-100 text-emerald-800" },
    cancelled:        { label: "Cancelled",         color: "bg-rose-100 text-rose-800" },
  };
  const trackingStatus = order.tracking_status ? trackingStatusMeta[order.tracking_status] : null;

  const lockedTracking = new Set<TrackingStatus>(["shipped","out_for_delivery","delivered"]);
  const lockedOrder = new Set(["completed","cancelled","failed"]);
  const canCancel = !(
    (order.status && lockedOrder.has(order.status.toLowerCase())) ||
    (order.tracking_status && lockedTracking.has(order.tracking_status.toLowerCase() as TrackingStatus))
  );

  async function handleCancel() {
    if (!canCancel || cancelLoading) return;
    if (!window.confirm("Cancel this order?")) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: "Cancelled by customer" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      onOrderUpdated((await res.json()).order);
      toast.success("Order cancelled");
    } catch (err: any) {
      toast.error(err.message || "Unable to cancel");
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* Summary row — always visible */}
      <button className="w-full text-left px-4 py-3 flex items-center gap-3" onClick={() => setExpanded((v) => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">#{order.order_number}</span>
            <Badge className={`${meta.color} px-2 py-0.5 text-[10px] font-semibold`}>{meta.label}</Badge>
            {trackingStatus && <Badge className={`${trackingStatus.color} px-2 py-0.5 text-[10px] font-semibold`}>{trackingStatus.label}</Badge>}
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
            {items.length > 0 ? items.map((i) => i.product_name).join(", ") : "Order"}
          </p>
          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-emerald-700">{formatPrice(order.total || 0)}</p>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400 ml-auto mt-1" /> : <ChevronDown className="h-4 w-4 text-gray-400 ml-auto mt-1" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t px-4 py-3 space-y-3 text-sm">
          {/* Items */}
          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <p className="font-medium text-xs truncate">{item.product_name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.variant_name || item.product_sku || "Standard"} · qty {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold ml-2 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(order.subtotal || 0)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Tax (18%)</span><span>{formatPrice(order.tax || 0)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{formatPrice(order.shipping_cost || 0)}</span></div>
            {!!order.discount && <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <Separator />
            <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>{formatPrice(order.total || 0)}</span></div>
          </div>

          {/* Shipping address */}
          {shipping && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
              <p className="font-semibold text-gray-800 mb-0.5">{shipping.first_name} {shipping.last_name}</p>
              <p>{shipping.address_line1}{shipping.address_line2 ? `, ${shipping.address_line2}` : ""}</p>
              <p>{shipping.city}, {shipping.state} {shipping.postal_code}</p>
              {shipping.phone && <p>{shipping.phone}</p>}
            </div>
          )}

          {/* Tracking */}
          {(order.tracking_number || order.tracking_url) && (
            <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs space-y-1">
              {order.tracking_number && <p><span className="text-muted-foreground">Tracking #:</span> {order.tracking_number}</p>}
              {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">View carrier page</a>}
            </div>
          )}

          {canCancel && (
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancelLoading} className="w-full h-8 text-xs border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 disabled:opacity-50">
              {cancelLoading ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Cancelling…</> : "Cancel Order"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── BookingCard ────────────────────────────────────────────────────────────
function BookingCard({ booking }: { booking: ServiceBooking }) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = {
    pending: { label: "Payment Pending", color: "bg-amber-100 text-amber-800" },
    paid:    { label: "Paid",            color: "bg-emerald-100 text-emerald-800" },
    failed:  { label: "Payment Failed",  color: "bg-rose-100 text-rose-800" },
  };
  const meta = statusMeta[booking.payment_status];
  const displayFrequency = /^[0-9a-fA-F]{24}$/.test(booking.frequency_label) ? "Custom Session" : booking.frequency_label;

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* Summary row */}
      <button className="w-full text-left px-4 py-3 flex items-center gap-3" onClick={() => setExpanded((v) => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">#{booking.booking_number}</span>
            <Badge className={`${meta.color} px-2 py-0.5 text-[10px] font-semibold`}>{meta.label}</Badge>
            {booking.order_type === "course" && <Badge className="bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-semibold">Course</Badge>}
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{booking.service_name}</p>
          <p className="text-xs text-muted-foreground">{new Date(booking.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-emerald-700">{formatPrice(booking.amount)}</p>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400 ml-auto mt-1" /> : <ChevronDown className="h-4 w-4 text-gray-400 ml-auto mt-1" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t px-4 py-3 space-y-3 text-xs">
          {booking.booking_status && booking.booking_status !== "pending" && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={`${
                booking.booking_status === "confirmed"  ? "bg-blue-100 text-blue-800" :
                booking.booking_status === "in_progress"? "bg-purple-100 text-purple-800" :
                booking.booking_status === "completed"  ? "bg-green-100 text-green-800" :
                booking.booking_status === "cancelled"  ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
              } px-2 py-0.5 text-[10px] font-semibold`}>
                {booking.booking_status.replace("_", " ")}
              </Badge>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg px-3 py-2 space-y-1.5">
            <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{booking.service_category}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Frequency</span><span className="font-medium">{displayFrequency}</span></div>
            {booking.razorpay_payment_id && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground flex-shrink-0">Txn ID</span>
                <span className="font-mono text-[10px] truncate">{booking.razorpay_payment_id}</span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg px-3 py-2 space-y-0.5 text-muted-foreground">
            <p className="font-semibold text-gray-800">{booking.customer_name}</p>
            <p>{booking.customer_email}</p>
            <p>{booking.customer_phone}</p>
          </div>

          {booking.whatsapp_redirect_url && booking.payment_status === "paid" && (
            <Button onClick={() => window.open(booking.whatsapp_redirect_url, "_blank")} variant="outline" size="sm" className="w-full h-8 text-xs bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600">
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Continue to WhatsApp
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Desktop OrderCard ──────────────────────────────────────────────────────
function OrderCardDesktop({ order, onOrderUpdated }: { order: OrdersResponse; onOrderUpdated: (o: OrdersResponse) => void }) {
  const meta = STATUS_META[order.status as StatusKey] ?? STATUS_META.pending;
  const [cancelLoading, setCancelLoading] = useState(false);
  const items = order.items || [];
  const shipping = order.shipping_address as any;

  const trackingStatusMeta: Record<TrackingStatus, { label: string; color: string }> = {
    order_received:   { label: "Order received",   color: "bg-gray-100 text-gray-700" },
    processing:       { label: "Processing",        color: "bg-blue-100 text-blue-800" },
    packed:           { label: "Packed",            color: "bg-amber-100 text-amber-800" },
    shipped:          { label: "Shipped",           color: "bg-indigo-100 text-indigo-800" },
    out_for_delivery: { label: "Out for delivery",  color: "bg-purple-100 text-purple-800" },
    delivered:        { label: "Delivered",         color: "bg-emerald-100 text-emerald-800" },
    cancelled:        { label: "Cancelled",         color: "bg-rose-100 text-rose-800" },
  };
  const trackingStatus = order.tracking_status ? trackingStatusMeta[order.tracking_status] : null;
  const trackingUpdatedAt = order.tracking_updated_at ? new Date(order.tracking_updated_at).toLocaleString() : null;

  const lockedTracking = new Set<TrackingStatus>(["shipped","out_for_delivery","delivered"]);
  const lockedOrder = new Set(["completed","cancelled","failed"]);
  const canCancel = !(
    (order.status && lockedOrder.has(order.status.toLowerCase())) ||
    (order.tracking_status && lockedTracking.has(order.tracking_status.toLowerCase() as TrackingStatus))
  );

  async function handleCancel() {
    if (!canCancel || cancelLoading) return;
    if (!window.confirm("Cancel this order?")) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: "Cancelled by customer" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      onOrderUpdated((await res.json()).order);
      toast.success("Order cancelled");
    } catch (err: any) {
      toast.error(err.message || "Unable to cancel");
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
          <p className="text-lg font-semibold text-gray-900">Placed on {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
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
                  <span>{item.product_name}</span><span>x{item.quantity}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.variant_name || item.product_sku || "Standard"}</p>
                <p className="text-sm font-semibold text-brand-primary mt-1">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Truck className="h-4 w-4" /> Shipping</p>
          <div className="mt-3 rounded-lg border bg-gray-50 p-4 text-sm text-muted-foreground">
            {shipping ? (
              <>
                <p className="font-semibold text-gray-900">{shipping.first_name} {shipping.last_name}</p>
                <p>{shipping.address_line1}{shipping.address_line2 ? `, ${shipping.address_line2}` : ""}</p>
                <p>{shipping.city}, {shipping.state} {shipping.postal_code}</p>
                <p>{shipping.country}</p>
                {shipping.phone && <p>Phone: {shipping.phone}</p>}
              </>
            ) : <p>No shipping address on file.</p>}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            {[
              { label: "Subtotal", value: formatPrice(order.subtotal || 0) },
              { label: "Tax (18% GST)", value: formatPrice(order.tax || 0) },
              { label: "Shipping", value: formatPrice(order.shipping_cost || 0) },
              ...(order.discount ? [{ label: "Discount", value: `- ${formatPrice(order.discount)}` }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-base"><span>Total Paid</span><span>{formatPrice(order.total || 0)}</span></div>
          </div>

          {(trackingStatus || order.tracking_number || order.tracking_message) && (
            <div className="mt-6 rounded-lg border bg-white p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Tracking</p>
              <div className="space-y-2 text-sm">
                {trackingStatus && (
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${trackingStatus.color}`}>{trackingStatus.label}</span>
                    {trackingUpdatedAt && <span className="text-xs text-muted-foreground">Updated {trackingUpdatedAt}</span>}
                  </div>
                )}
                {order.tracking_number && <p><span className="text-muted-foreground">Tracking #:</span> {order.tracking_number}</p>}
                {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-brand-primary text-sm underline">View carrier page</a>}
                {order.tracking_message && <p className="text-muted-foreground">{order.tracking_message}</p>}
              </div>
            </div>
          )}

          {canCancel && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancelLoading} className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400">
                {cancelLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling</> : "Cancel Order"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Desktop BookingCard ────────────────────────────────────────────────────
function BookingCardDesktop({ booking }: { booking: ServiceBooking }) {
  const statusMeta = {
    pending: { label: "Payment Pending", color: "bg-amber-100 text-amber-800" },
    paid:    { label: "Paid",            color: "bg-emerald-100 text-emerald-800" },
    failed:  { label: "Payment Failed",  color: "bg-rose-100 text-rose-800" },
  };
  const meta = statusMeta[booking.payment_status];
  const displayFrequency = /^[0-9a-fA-F]{24}$/.test(booking.frequency_label) ? "Custom Session" : booking.frequency_label;

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{booking.order_type === "course" ? "Enrollment" : "Booking"} #{booking.booking_number}</p>
          <p className="text-lg font-semibold text-gray-900">{booking.service_name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {booking.order_type === "course" ? "Enrolled" : "Booked"} on {new Date(booking.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {booking.order_type === "course" && <Badge className="bg-blue-100 text-blue-800 px-3 py-1 text-xs font-semibold">Course</Badge>}
          <Badge className={`${meta.color} px-3 py-1 text-xs font-semibold`}>{meta.label}</Badge>
          <p className="text-sm font-semibold">{formatPrice(booking.amount)}</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {booking.booking_status && booking.booking_status !== "pending" && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Badge className={`${
              booking.booking_status === "confirmed"   ? "bg-blue-100 text-blue-800" :
              booking.booking_status === "in_progress" ? "bg-purple-100 text-purple-800" :
              booking.booking_status === "completed"   ? "bg-green-100 text-green-800" :
              booking.booking_status === "cancelled"   ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            } px-3 py-1 text-xs font-semibold`}>
              {booking.booking_status.replace("_", " ")}
            </Badge>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">{booking.order_type === "course" ? "Course Details" : "Service Details"}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Category:</span><span className="font-medium">{booking.service_category}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Frequency:</span><span className="font-medium">{displayFrequency}</span></div>
              {booking.razorpay_payment_id && (
                <div className="flex justify-between"><span className="text-muted-foreground">Transaction ID:</span><span className="font-mono text-xs">{booking.razorpay_payment_id}</span></div>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Contact Information</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{booking.customer_name}</p>
              <p>{booking.customer_email}</p>
              <p>{booking.customer_phone}</p>
            </div>
          </div>
        </div>
        {booking.whatsapp_redirect_url && booking.payment_status === "paid" && (
          <div className="pt-4 border-t">
            <Button onClick={() => window.open(booking.whatsapp_redirect_url, "_blank")} className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-green-500">
              <MessageCircle className="mr-2 h-4 w-4" /> Continue to WhatsApp
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

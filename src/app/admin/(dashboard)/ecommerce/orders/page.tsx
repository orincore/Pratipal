"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Eye, Loader2, Truck, Copy, Check, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Order, TrackingStatus } from "@/lib/ecommerce-types";
import { AdminLoader } from "@/components/admin/admin-loader";

// ── tiny copy hook ────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  }
  return { copied, copy };
}

function CopyBtn({ text, id, copied, copy }: { text: string; id: string; copied: string | null; copy: (t: string, k: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => copy(text, id)}
      className="ml-1.5 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
      title="Copy"
    >
      {copied === id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Tracking history timeline ─────────────────────────────────────────────
const TRACKING_META: Record<string, { label: string; color: string; dot: string }> = {
  order_received:   { label: "Order Received",    color: "text-gray-700",    dot: "bg-gray-400" },
  processing:       { label: "Processing",         color: "text-blue-700",    dot: "bg-blue-500" },
  packed:           { label: "Packed",             color: "text-amber-700",   dot: "bg-amber-500" },
  shipped:          { label: "Shipped",            color: "text-indigo-700",  dot: "bg-indigo-500" },
  out_for_delivery: { label: "Out for Delivery",   color: "text-purple-700",  dot: "bg-purple-500" },
  delivered:        { label: "Delivered",          color: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled:        { label: "Cancelled",          color: "text-rose-700",    dot: "bg-rose-500" },
};

const ORDER_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
  { label: "Failed", value: "failed" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

const TRACKING_STATUS_OPTIONS = [
  { label: "Order Received", value: "order_received" },
  { label: "Processing", value: "processing" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

function TrackingTimeline({ history }: { history: Array<{ status: string; message?: string | null; timestamp: string }> }) {
  if (!history || history.length === 0) return <p className="text-xs text-muted-foreground">No tracking history yet.</p>;
  return (
    <ol className="relative border-l border-gray-200 ml-2 space-y-3">
      {[...history].reverse().map((h, i) => {
        const meta = TRACKING_META[h.status] ?? { label: h.status, color: "text-gray-700", dot: "bg-gray-400" };
        const dt = new Date(h.timestamp);
        return (
          <li key={i} className="ml-4">
            <span className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white ${meta.dot}`} />
            <p className={`text-xs font-semibold ${meta.color}`}>{meta.label}</p>
            <p className="text-[11px] text-muted-foreground">
              {dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              {" · "}
              {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
            {h.message && <p className="text-[11px] text-gray-500 mt-0.5">{h.message}</p>}
          </li>
        );
      })}
    </ol>
  );
}

export default function EcommerceOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [trackingStatusFilter, setTrackingStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState({
    tracking_number: "", tracking_url: "", tracking_status: "" as TrackingStatus | "", tracking_message: "",
  });
  const [trackingSaving, setTrackingSaving] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [srLoading, setSrLoading] = useState(false);
  const [srDimensions, setSrDimensions] = useState({ length: 10, breadth: 10, height: 10, weight: 0.5 });
  const [loading, setLoading] = useState(true);
  const { copied, copy } = useCopy();

  useEffect(() => { loadOrders(); }, []);

  // Shiprocket doesn't assign an AWB at shipment-creation time — it lands
  // moments later via the webhook. Poll briefly while the dialog is open on
  // a shipment still waiting for one, so the tracking number appears on its
  // own instead of requiring a manual page reload. Capped at 5 minutes so an
  // order stuck without courier assignment doesn't poll forever.
  const shipmentId = (selectedOrder as any)?.shiprocket_shipment_id;
  const pollStartRef = useRef(0);
  useEffect(() => {
    if (!dialogOpen || !selectedOrder?.id || !shipmentId || selectedOrder.tracking_number) return;

    pollStartRef.current = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - pollStartRef.current > 5 * 60 * 1000) {
        clearInterval(interval);
        return;
      }
      fetch(`/api/admin/orders/${selectedOrder.id}`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          if (d.order) {
            setSelectedOrder(d.order);
            setOrders((prev) => prev.map((o) => (o.id === d.order.id ? d.order : o)));
          }
        })
        .catch(() => {});
    }, 8000);

    return () => clearInterval(interval);
  }, [dialogOpen, selectedOrder?.id, shipmentId, selectedOrder?.tracking_number]);

  // Orders shipped via Shiprocket get their AWB/tracking URL from Shiprocket
  // itself (webhook-driven) — keep the form fields mirroring that live value
  // instead of whatever was typed in on open, so admins never have to copy
  // it in by hand. Orders without a Shiprocket shipment keep manual entry
  // untouched (some are still fulfilled through other couriers).
  useEffect(() => {
    if (!shipmentId || !selectedOrder) return;
    setTrackingInputs((p) => ({
      ...p,
      tracking_number: selectedOrder.tracking_number || "",
      tracking_url: selectedOrder.tracking_url || "",
    }));
  }, [shipmentId, selectedOrder?.tracking_number, selectedOrder?.tracking_url]);

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;

    return orders.filter((o) => {
      if (q) {
        const phone = (o as any).customer_phone || o.shipping_address?.phone || "";
        const matchesSearch =
          o.order_number.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          phone.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (paymentStatusFilter !== "all" && o.payment_status !== paymentStatusFilter) return false;
      if (trackingStatusFilter !== "all" && (o.tracking_status || "order_received") !== trackingStatusFilter) return false;
      const createdAt = new Date(o.created_at);
      if (from && createdAt < from) return false;
      if (to && createdAt > to) return false;
      return true;
    });
  }, [orders, search, statusFilter, paymentStatusFilter, trackingStatusFilter, dateFrom, dateTo]);

  if (loading) return <AdminLoader />;

  const lockedCustomerStatuses = new Set(["completed", "cancelled", "failed"]);
  const lockedTrackingStatuses = new Set<TrackingStatus>(["shipped", "out_for_delivery", "delivered"]);
  const canCancelSelected = selectedOrder
    ? !lockedCustomerStatuses.has(selectedOrder.status) &&
      !(selectedOrder.tracking_status && lockedTrackingStatuses.has(selectedOrder.tracking_status))
    : false;
  // Ebooks are a digital download — nothing to ship, so Shiprocket doesn't apply.
  const isEbookOnlyOrder =
    !!selectedOrder?.items?.length && selectedOrder.items.every((i) => i.is_ebook);

  async function handleAdminCancel() {
    if (!selectedOrder || cancelLoading || !canCancelSelected) return;
    if (!window.confirm(`Cancel order #${selectedOrder.order_number}?`)) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: "Cancelled by admin" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to cancel order");
      const data = await res.json();
      setSelectedOrder(data.order);
      setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
      toast.success("Order cancelled");
    } catch (err: any) { toast.error(err.message || "Unable to cancel order"); }
    finally { setCancelLoading(false); }
  }

  async function handleCreateShiprocketShipment() {
    if (!selectedOrder || srLoading) return;
    setSrLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shiprocket`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(srDimensions),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create shipment");
      toast.success(`Shipment created on Shiprocket (ID: ${data.shipment_id})`);

      // Pull the freshly updated order so the open dialog reflects the new
      // shipment/tracking fields immediately — loadOrders() alone only
      // refreshes the list behind the dialog, not selectedOrder itself.
      const refreshed = await fetch(`/api/admin/orders/${selectedOrder.id}`, { credentials: "include" }).then((r) => r.json());
      if (refreshed.order) {
        setSelectedOrder(refreshed.order);
        setOrders((prev) => prev.map((o) => (o.id === refreshed.order.id ? refreshed.order : o)));
      } else {
        loadOrders();
      }
    } catch (err: any) { toast.error(err.message || "Shiprocket error"); }
    finally { setSrLoading(false); }
  }

  const filtersActive =
    !!search || statusFilter !== "all" || paymentStatusFilter !== "all" || trackingStatusFilter !== "all" || !!dateFrom || !!dateTo;

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setTrackingStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  function viewOrder(order: Order) {
    setSelectedOrder(order);
    setTrackingInputs({
      tracking_number: order.tracking_number || "",
      tracking_url: order.tracking_url || "",
      tracking_status: order.tracking_status || "",
      tracking_message: order.tracking_message || "",
    });
    setDialogOpen(true);
    // Fetch fresh order data (includes tracking_history) — must send cookies for admin auth
    fetch(`/api/admin/orders/${order.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.order) setSelectedOrder(d.order); })
      .catch(() => {});
  }

  const trackingOptions = TRACKING_STATUS_OPTIONS as { label: string; value: TrackingStatus }[];

  async function handleTrackingSave() {
    if (!selectedOrder) return;
    setTrackingSaving(true);
    try {
      const payload: Record<string, any> = {
          tracking_number: trackingInputs.tracking_number || null,
          tracking_url: trackingInputs.tracking_url || null,
          tracking_message: trackingInputs.tracking_message || null,
        };
        if (trackingInputs.tracking_status) {
          payload.tracking_status = trackingInputs.tracking_status;
        }
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to update tracking");
      const data = await res.json();
      setSelectedOrder(data.order);
      setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
      toast.success("Tracking updated");
    } catch (err: any) { toast.error(err.message || "Unable to update tracking"); }
    finally { setTrackingSaving(false); }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed": case "delivered": return "success";
      case "processing": case "packed": case "shipped": case "out_for_delivery": return "default";
      case "pending": case "order_received": return "warning";
      case "cancelled": case "failed": return "destructive";
      default: return "secondary";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage customer orders</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search by order #, name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[170px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Order Status</SelectItem>
                  {ORDER_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-full sm:w-[170px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  {PAYMENT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={trackingStatusFilter} onValueChange={setTrackingStatusFilter}>
                <SelectTrigger className="w-full sm:w-[190px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tracking Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracking Status</SelectItem>
                  {TRACKING_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground whitespace-nowrap">From</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground whitespace-nowrap">To</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
              </div>

              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" /> Clear filters
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {orders.length} order{orders.length === 1 ? "" : "s"}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Order #</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Customer</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Tracking Status</th>
                  <th className="pb-3 font-medium hidden lg:table-cell">Payment</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Date</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{order.order_number}</td>
                    <td className="py-3 hidden md:table-cell">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                      {((order as any).customer_phone || order.shipping_address?.phone) && (
                        <div className="text-xs text-muted-foreground">📞 {(order as any).customer_phone || order.shipping_address?.phone}</div>
                      )}
                    </td>
                    <td className="py-3 font-semibold">₹{order.total.toFixed(2)}</td>
                    <td className="py-3 hidden sm:table-cell">
                      <Badge variant={getStatusColor(order.tracking_status || order.status) as any}>
                        {order.tracking_status ? order.tracking_status.replace(/_/g, " ") : "—"}
                      </Badge>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <Badge variant={getStatusColor(order.payment_status) as any}>{order.payment_status}</Badge>
                    </td>
                    <td className="py-3 hidden md:table-cell text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <Button variant="ghost" size="icon" onClick={() => viewOrder(order)}><Eye className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] p-0 gap-0 flex flex-col"
          closeClassName="text-red-600 opacity-100 hover:text-red-700 hover:bg-red-50"
        >
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
          <div className="overflow-y-auto px-6 py-4">
            <div className="space-y-4">

              {/* Order number + date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Order Number</div>
                  <div className="font-semibold flex items-center">
                    {selectedOrder.order_number}
                    <CopyBtn text={selectedOrder.order_number} id="order_number" copied={copied} copy={copy} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div>{new Date(selectedOrder.created_at).toLocaleString()}</div>
                </div>
              </div>

              {/* Customer + status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Customer</div>
                  <div className="font-medium flex items-center">
                    {selectedOrder.customer_name}
                    <CopyBtn text={selectedOrder.customer_name} id="cust_name" copied={copied} copy={copy} />
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    {selectedOrder.customer_email}
                    <CopyBtn text={selectedOrder.customer_email} id="cust_email" copied={copied} copy={copy} />
                  </div>
                  {(() => {
                    const phone = (selectedOrder as any).customer_phone || selectedOrder.shipping_address?.phone;
                    return phone ? (
                      <div className="text-sm text-muted-foreground flex items-center">
                        📞 {phone}
                        <CopyBtn text={phone} id="cust_phone" copied={copied} copy={copy} />
                      </div>
                    ) : null;
                  })()}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant={getStatusColor(selectedOrder.status) as any}>{selectedOrder.status}</Badge>
                    <Badge variant={getStatusColor(selectedOrder.payment_status) as any}>{selectedOrder.payment_status}</Badge>
                    {selectedOrder.tracking_status && (
                      <Badge variant={getStatusColor(selectedOrder.tracking_status) as any}>
                        {selectedOrder.tracking_status.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  Shipping Address
                  <CopyBtn
                    text={[
                      selectedOrder.shipping_address.first_name + " " + selectedOrder.shipping_address.last_name,
                      selectedOrder.shipping_address.address_line1,
                      selectedOrder.shipping_address.address_line2,
                      selectedOrder.shipping_address.city + ", " + selectedOrder.shipping_address.state + " " + ((selectedOrder.shipping_address as any).postal_code || (selectedOrder.shipping_address as any).pincode),
                      selectedOrder.shipping_address.country,
                    ].filter(Boolean).join(", ")}
                    id="shipping_addr"
                    copied={copied}
                    copy={copy}
                  />
                </div>
                <div className="text-sm bg-muted p-3 rounded">
                  {selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}<br />
                  {selectedOrder.shipping_address.address_line1}<br />
                  {selectedOrder.shipping_address.address_line2 && <>{selectedOrder.shipping_address.address_line2}<br /></>}
                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {(selectedOrder.shipping_address as any).postal_code || (selectedOrder.shipping_address as any).pincode}<br />
                  {selectedOrder.shipping_address.country}
                </div>
              </div>

              {/* Order items */}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Order Items</div>
                <div className="border rounded">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between p-3 border-b last:border-0">
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        {item.variant_name && <div className="text-sm text-muted-foreground">{item.variant_name}</div>}
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                        {item.is_ebook && (
                          <div
                            className={`inline-flex items-center gap-1 mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              item.ebook_delivery_status === "delivered"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.ebook_delivery_status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            E-Book: {item.ebook_delivery_status === "delivered" ? "Delivered" : item.ebook_delivery_status === "failed" ? "Delivery Failed" : "Pending"}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.subtotal.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                {[
                  { label: "Subtotal", val: `₹${selectedOrder.subtotal.toFixed(2)}` },
                  { label: "Tax", val: `₹${selectedOrder.tax.toFixed(2)}` },
                  { label: "Shipping", val: `₹${selectedOrder.shipping_cost.toFixed(2)}` },
                  ...(selectedOrder.discount > 0 ? [{ label: "Discount", val: `-₹${selectedOrder.discount.toFixed(2)}` }] : []),
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span><span>{val}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span><span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Tracking history */}
              <div className="border-t pt-4">
                <div className="text-sm font-semibold mb-3">Tracking History</div>
                <TrackingTimeline history={(selectedOrder as any).tracking_history || []} />
              </div>

              {/* Update tracking */}
              <div className="border-t pt-4 space-y-3">
                <div className="text-sm font-semibold">Update Tracking</div>
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Tracking Number
                    {shipmentId && <Badge variant="secondary" className="text-[10px] font-normal">Auto-synced from Shiprocket</Badge>}
                  </label>
                  <Input
                    value={trackingInputs.tracking_number}
                    onChange={(e) => setTrackingInputs((p) => ({ ...p, tracking_number: e.target.value }))}
                    placeholder={shipmentId ? "Will fill in once Shiprocket assigns an AWB" : "E.g. AWB123456"}
                    disabled={!!shipmentId}
                    className={shipmentId ? "bg-muted" : undefined}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Tracking URL
                    {shipmentId && <Badge variant="secondary" className="text-[10px] font-normal">Auto-synced from Shiprocket</Badge>}
                  </label>
                  <Input
                    value={trackingInputs.tracking_url}
                    onChange={(e) => setTrackingInputs((p) => ({ ...p, tracking_url: e.target.value }))}
                    placeholder={shipmentId ? "Will fill in once Shiprocket assigns an AWB" : "https://courier.example.com/track/…"}
                    disabled={!!shipmentId}
                    className={shipmentId ? "bg-muted" : undefined}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">Tracking Status</label>
                  <select className="border rounded px-3 py-2 text-sm" value={trackingInputs.tracking_status || ""} onChange={(e) => setTrackingInputs((p) => ({ ...p, tracking_status: (e.target.value as TrackingStatus) || "" }))}>
                    <option value="">Select status</option>
                    {trackingOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">Customer Message</label>
                  <textarea className="border rounded px-3 py-2 text-sm" rows={2} value={trackingInputs.tracking_message} onChange={(e) => setTrackingInputs((p) => ({ ...p, tracking_message: e.target.value }))} placeholder="Short update customers will see" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleTrackingSave} disabled={trackingSaving}>
                    {trackingSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving</> : "Update Tracking"}
                  </Button>
                </div>
              </div>

              {/* Shiprocket */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold">Shiprocket</span>
                  {(selectedOrder as any).shiprocket_shipment_id && (
                    <Badge variant="secondary" className="text-xs">Shipment #{(selectedOrder as any).shiprocket_shipment_id}</Badge>
                  )}
                </div>
                {isEbookOnlyOrder ? (
                  <p className="text-xs text-muted-foreground">This order is e-books only — nothing to ship, so no Shiprocket shipment is needed.</p>
                ) : !(selectedOrder as any).shiprocket_order_id ? (
                  <>
                    <p className="text-xs text-muted-foreground">Create a shipment on Shiprocket to get AWB, auto-tracking, and courier assignment.</p>
                    <div className="grid grid-cols-4 gap-2">
                      {(["length", "breadth", "height"] as const).map((dim) => (
                        <div key={dim}>
                          <label className="text-xs text-muted-foreground capitalize">{dim} (cm)</label>
                          <Input type="number" min={1} value={srDimensions[dim]} onChange={(e) => setSrDimensions((p) => ({ ...p, [dim]: Number(e.target.value) }))} className="h-8 text-sm" />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-muted-foreground">Weight (kg)</label>
                        <Input type="number" min={0.1} step={0.1} value={srDimensions.weight} onChange={(e) => setSrDimensions((p) => ({ ...p, weight: Number(e.target.value) }))} className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleCreateShiprocketShipment} disabled={srLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
                        {srLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : <><Truck className="mr-2 h-4 w-4" />Ship via Shiprocket</>}
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-emerald-600 font-medium">✓ Shipment created. Tracking updates will arrive automatically via webhook.</p>
                )}
              </div>

            </div>
          </div>
          )}
          {selectedOrder && (
            <div className="shrink-0 border-t px-6 py-4 flex items-center gap-3">
              {canCancelSelected && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  onClick={handleAdminCancel}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling</> : "Cancel Order"}
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline" className="ml-auto">Close</Button>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

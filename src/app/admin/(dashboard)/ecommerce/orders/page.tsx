"use client";

import React, { useEffect, useState } from "react";
import { Search, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Order, TrackingStatus } from "@/lib/ecommerce-types";

export default function EcommerceOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState({
    tracking_number: "",
    tracking_url: "",
    tracking_status: "" as TrackingStatus | "",
    tracking_message: "",
  });
  const [trackingSaving, setTrackingSaving] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      toast.error("Failed to load orders");
    }
  }

  const lockedCustomerStatuses = new Set(["completed", "cancelled", "failed"]);
  const lockedTrackingStatuses = new Set<TrackingStatus>(["shipped", "out_for_delivery", "delivered"]);

  const canCancelSelected = selectedOrder
    ? !lockedCustomerStatuses.has(selectedOrder.status) &&
      !(selectedOrder.tracking_status && lockedTrackingStatuses.has(selectedOrder.tracking_status))
    : false;

  async function handleAdminCancel() {
    if (!selectedOrder || cancelLoading || !canCancelSelected) return;
    const confirmed = window.confirm(`Cancel order #${selectedOrder.order_number}?`);
    if (!confirmed) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: "Cancelled by admin" }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to cancel order");
      }
      const data = await res.json();
      setSelectedOrder(data.order);
      setOrders((prev) => prev.map((order) => (order.id === data.order.id ? data.order : order)));
      toast.success("Order cancelled");
    } catch (err: any) {
      toast.error(err.message || "Unable to cancel order");
    } finally {
      setCancelLoading(false);
    }
  }

  const filtered = orders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  function viewOrder(order: Order) {
    setSelectedOrder(order);
    setTrackingInputs({
      tracking_number: order.tracking_number || "",
      tracking_url: order.tracking_url || "",
      tracking_status: order.tracking_status || "",
      tracking_message: order.tracking_message || "",
    });
    setDialogOpen(true);
  }

  const trackingOptions: { label: string; value: TrackingStatus }[] = [
    { label: "Order Received", value: "order_received" },
    { label: "Processing", value: "processing" },
    { label: "Packed", value: "packed" },
    { label: "Shipped", value: "shipped" },
    { label: "Out for Delivery", value: "out_for_delivery" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  async function handleTrackingSave() {
    if (!selectedOrder) return;
    setTrackingSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_number: trackingInputs.tracking_number || null,
          tracking_url: trackingInputs.tracking_url || null,
          tracking_message: trackingInputs.tracking_message || null,
          tracking_status: trackingInputs.tracking_status || null,
        }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update tracking");
      }
      const data = await res.json();
      setSelectedOrder(data.order);
      setOrders((prev) => prev.map((order) => (order.id === data.order.id ? data.order : order)));
      toast.success("Tracking updated");
    } catch (err: any) {
      toast.error(err.message || "Unable to update tracking");
    } finally {
      setTrackingSaving(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "default";
      case "pending":
        return "warning";
      case "cancelled":
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer orders
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
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
                  <th className="pb-3 font-medium hidden sm:table-cell">Status</th>
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
                      <div>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.customer_email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-semibold">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="py-3 hidden sm:table-cell">
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <Badge variant={getStatusColor(order.payment_status) as any}>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className="py-3 hidden md:table-cell text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Order Number</div>
                  <div className="font-semibold">{selectedOrder.order_number}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div>{new Date(selectedOrder.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Customer</div>
                  <div className="font-medium">{selectedOrder.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{selectedOrder.customer_email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={getStatusColor(selectedOrder.status) as any}>
                      {selectedOrder.status}
                    </Badge>
                    <Badge variant={getStatusColor(selectedOrder.payment_status) as any}>
                      {selectedOrder.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</div>
                <div className="text-sm bg-muted p-3 rounded">
                  {selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}<br />
                  {selectedOrder.shipping_address.address_line1}<br />
                  {selectedOrder.shipping_address.address_line2 && <>{selectedOrder.shipping_address.address_line2}<br /></>}
                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}<br />
                  {selectedOrder.shipping_address.country}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Order Items</div>
                <div className="border rounded">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between p-3 border-b last:border-0">
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        {item.variant_name && (
                          <div className="text-sm text-muted-foreground">{item.variant_name}</div>
                        )}
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.subtotal.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{selectedOrder.shipping_cost.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">-₹{selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">Tracking Number</label>
                  <Input
                    value={trackingInputs.tracking_number}
                    onChange={(e) =>
                      setTrackingInputs((prev) => ({ ...prev, tracking_number: e.target.value }))
                    }
                    placeholder="E.g. AWB123456"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">Tracking URL</label>
                  <Input
                    value={trackingInputs.tracking_url}
                    onChange={(e) =>
                      setTrackingInputs((prev) => ({ ...prev, tracking_url: e.target.value }))
                    }
                    placeholder="https://courier.example.com/track/…"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">Tracking Status</label>
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={trackingInputs.tracking_status || ""}
                    onChange={(e) =>
                      setTrackingInputs((prev) => ({
                        ...prev,
                        tracking_status: (e.target.value as TrackingStatus) || "",
                      }))
                    }
                  >
                    <option value="">Select status</option>
                    {trackingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">Customer Message</label>
                  <textarea
                    className="border rounded px-3 py-2 text-sm"
                    rows={3}
                    value={trackingInputs.tracking_message}
                    onChange={(e) =>
                      setTrackingInputs((prev) => ({ ...prev, tracking_message: e.target.value }))
                    }
                    placeholder="Short update customers will see"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleTrackingSave} disabled={trackingSaving}>
                    {trackingSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Update Tracking"
                    )}
                  </Button>
                </div>
              </div>
              {canCancelSelected && (
                <div className="flex justify-end pt-2">
                  <Button
                    variant="destructive"
                    onClick={handleAdminCancel}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

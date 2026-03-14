"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function FixOrderTotalsPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleFixOrder() {
    if (!orderId.trim()) {
      toast.error("Please enter an order ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to recalculate order totals');
      }

      const data = await response.json();
      setResult(data);
      toast.success("Order totals recalculated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to fix order totals");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fix Order Totals</h1>
        <p className="text-muted-foreground">
          Recalculate order totals based on actual product prices and order items
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recalculate Order Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium mb-2">
              Order ID
            </label>
            <Input
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter order ID (e.g., 69b53877d176959feffe4446)"
            />
          </div>
          
          <Button 
            onClick={handleFixOrder} 
            disabled={loading || !orderId.trim()}
            className="w-full"
          >
            {loading ? "Recalculating..." : "Fix Order Totals"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-600 font-medium">{result.message}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Before</h4>
                  <div className="space-y-1 text-sm">
                    <div>Subtotal: ₹{result.changes.subtotal.old.toFixed(2)}</div>
                    <div>Tax: ₹{result.changes.tax.old.toFixed(2)}</div>
                    <div>Shipping: ₹{result.changes.shipping.old.toFixed(2)}</div>
                    <div className="font-semibold">Total: ₹{result.changes.total.old.toFixed(2)}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">After</h4>
                  <div className="space-y-1 text-sm">
                    <div>Subtotal: ₹{result.changes.subtotal.new.toFixed(2)}</div>
                    <div>Tax: ₹{result.changes.tax.new.toFixed(2)}</div>
                    <div>Shipping: ₹{result.changes.shipping.new.toFixed(2)}</div>
                    <div className="font-semibold">Total: ₹{result.changes.total.new.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {result.order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} (Qty: {item.quantity})</span>
                      <span>₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Package, Truck, IndianRupee } from "lucide-react";

interface ShippingSettings {
  cost_per_kg: number;
  free_shipping_threshold: number;
}

export default function ShippingSettingsPage() {
  const [settings, setSettings] = useState<ShippingSettings>({
    cost_per_kg: 50,
    free_shipping_threshold: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/admin/shipping-settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      toast.error("Failed to load shipping settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Shipping settings updated successfully");
    } catch (error) {
      toast.error("Failed to save shipping settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shipping Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure shipping costs based on product weight
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Weight-Based Shipping
            </CardTitle>
            <CardDescription>
              Set the cost per kilogram for shipping calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cost_per_kg">Cost per Kilogram (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cost_per_kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.cost_per_kg}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cost_per_kg: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping cost will be calculated as: Total Weight × Cost per KG
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Example Calculation</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Product A: 0.5 kg × 2 qty = 1 kg</p>
                <p>Product B: 0.3 kg × 1 qty = 0.3 kg</p>
                <p className="font-medium text-foreground pt-2 border-t">
                  Total: 1.3 kg × ₹{settings.cost_per_kg} = ₹
                  {(1.3 * settings.cost_per_kg).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Free Shipping Threshold
            </CardTitle>
            <CardDescription>
              Offer free shipping for orders above this amount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="free_shipping_threshold">
                Minimum Order Amount (₹)
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="free_shipping_threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.free_shipping_threshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      free_shipping_threshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Orders with subtotal above this amount get free shipping
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-green-900 mb-2">
                Free Shipping Benefits
              </h4>
              <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                <li>Encourages larger orders</li>
                <li>Improves customer satisfaction</li>
                <li>Reduces cart abandonment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
            <p className="text-sm text-muted-foreground">
              Make sure to add weight (in kg) to all products in the product management section
            </p>
          </div>
          <div className="flex gap-3">
            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
            <p className="text-sm text-muted-foreground">
              Shipping cost is calculated automatically based on total cart weight
            </p>
          </div>
          <div className="flex gap-3">
            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
            <p className="text-sm text-muted-foreground">
              If subtotal exceeds the free shipping threshold, shipping cost becomes ₹0
            </p>
          </div>
          <div className="flex gap-3">
            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
            <p className="text-sm text-muted-foreground">
              Products without weight will be treated as 0 kg
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={loadSettings} disabled={saving}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

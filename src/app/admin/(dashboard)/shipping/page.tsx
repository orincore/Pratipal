"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Package, Truck, IndianRupee, Plus, Trash2 } from "lucide-react";

interface WeightTier {
  min_weight: number;
  max_weight: number;
  rate: number;
}

interface ShippingSettings {
  free_shipping_threshold: number;
  flat_rate: number;
  weight_based_enabled: boolean;
  weight_tiers: WeightTier[];
  enabled: boolean;
}

export default function ShippingSettingsPage() {
  const [settings, setSettings] = useState<ShippingSettings>({
    free_shipping_threshold: 500,
    flat_rate: 50,
    weight_based_enabled: false,
    weight_tiers: [
      { min_weight: 0, max_weight: 1, rate: 50 },
      { min_weight: 1, max_weight: 5, rate: 100 },
      { min_weight: 5, max_weight: 10, rate: 150 },
    ],
    enabled: true,
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
        setSettings({
          free_shipping_threshold: data.free_shipping_threshold || 500,
          flat_rate: data.flat_rate || 50,
          weight_based_enabled: data.weight_based_enabled || false,
          weight_tiers: data.weight_tiers || [
            { min_weight: 0, max_weight: 1, rate: 50 },
            { min_weight: 1, max_weight: 5, rate: 100 },
            { min_weight: 5, max_weight: 10, rate: 150 },
          ],
          enabled: data.enabled !== false,
        });
      }
    } catch (error) {
      toast.error("Failed to load shipping settings");
    } finally {
      setLoading(false);
    }
  }

  const addWeightTier = () => {
    const lastTier = settings.weight_tiers[settings.weight_tiers.length - 1];
    const newTier = {
      min_weight: lastTier ? lastTier.max_weight : 0,
      max_weight: lastTier ? lastTier.max_weight + 5 : 5,
      rate: 50,
    };
    setSettings({
      ...settings,
      weight_tiers: [...settings.weight_tiers, newTier],
    });
  };

  const removeWeightTier = (index: number) => {
    const newTiers = settings.weight_tiers.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      weight_tiers: newTiers,
    });
  };

  const updateWeightTier = (index: number, field: keyof WeightTier, value: number) => {
    const newTiers = [...settings.weight_tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setSettings({
      ...settings,
      weight_tiers: newTiers,
    });
  };

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
          Configure shipping costs and weight-based pricing
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Basic Shipping Settings
            </CardTitle>
            <CardDescription>
              Configure flat rate and free shipping threshold
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="flat_rate">Flat Rate (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="flat_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.flat_rate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        flat_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used when weight-based shipping is disabled
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="free_shipping_threshold">
                  Free Shipping Threshold (₹)
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
                  Orders above this amount get free shipping
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight-Based Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Weight-Based Shipping
            </CardTitle>
            <CardDescription>
              Configure shipping rates based on total order weight
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="weight_based_enabled"
                checked={settings.weight_based_enabled}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    weight_based_enabled: checked,
                  })
                }
              />
              <Label htmlFor="weight_based_enabled">
                Enable Weight-Based Shipping
              </Label>
            </div>

            {settings.weight_based_enabled && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Weight Tiers</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addWeightTier}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tier
                  </Button>
                </div>

                <div className="space-y-3">
                  {settings.weight_tiers.map((tier, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-3 items-end p-3 border rounded-lg"
                    >
                      <div className="space-y-2">
                        <Label className="text-xs">Min Weight (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={tier.min_weight}
                          onChange={(e) =>
                            updateWeightTier(
                              index,
                              "min_weight",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Max Weight (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={tier.max_weight}
                          onChange={(e) =>
                            updateWeightTier(
                              index,
                              "max_weight",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Rate (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tier.rate}
                          onChange={(e) =>
                            updateWeightTier(
                              index,
                              "rate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeWeightTier(index)}
                        disabled={settings.weight_tiers.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Example Calculation</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Order with total weight: 2.5 kg</p>
                    <p>
                      Applicable tier: {settings.weight_tiers.find(tier => 
                        2.5 >= tier.min_weight && 2.5 <= tier.max_weight
                      )?.min_weight || 0}kg - {settings.weight_tiers.find(tier => 
                        2.5 >= tier.min_weight && 2.5 <= tier.max_weight
                      )?.max_weight || 0}kg
                    </p>
                    <p className="font-medium text-foreground pt-2 border-t">
                      Shipping Cost: ₹{settings.weight_tiers.find(tier => 
                        2.5 >= tier.min_weight && 2.5 <= tier.max_weight
                      )?.rate || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

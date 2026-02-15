"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProducts } from "@/services/api";
import type { HomepageSection, Product } from "@/types";
import { Loader2, RefreshCcw, Save, Trash2 } from "lucide-react";

const SECTION_KEYS = ["featured", "best_sellers", "new_arrivals", "on_sale"] as const;
type SectionKey = typeof SECTION_KEYS[number];
const SLOTS_PER_SECTION = 4;
type SectionAssignments = Record<SectionKey, (string | null)[]>;

const SECTION_COPY: Record<SectionKey, { title: string; description: string }> = {
  featured: {
    title: "Hero & Featured",
    description: "Products highlighted in the hero layout on the homepage.",
  },
  best_sellers: {
    title: "Best Sellers",
    description: "Customer favourites surfaced in the carousel collection.",
  },
  new_arrivals: {
    title: "New Arrivals",
    description: "Fresh additions to spotlight in marketing rows.",
  },
  on_sale: {
    title: "On Sale",
    description: "Discounted picks you want to promote upfront.",
  },
};

const createEmptyAssignments = (): SectionAssignments =>
  SECTION_KEYS.reduce((acc, key) => {
    acc[key] = Array(SLOTS_PER_SECTION).fill(null);
    return acc;
  }, {} as SectionAssignments);

const buildAssignmentsFromProducts = (products: Product[]): SectionAssignments => {
  const assignments = createEmptyAssignments();
  products.forEach((product) => {
    const section = product.homepageSection;
    if (!section || !SECTION_KEYS.includes(section as SectionKey)) return;
    const slots = assignments[section as SectionKey];
    const firstOpen = slots.findIndex((slot) => slot === null);
    if (firstOpen !== -1) {
      slots[firstOpen] = product.id;
    }
  });
  return assignments;
};

const computeDesiredMapping = (assignments: SectionAssignments): Map<string, SectionKey | "none"> => {
  const map = new Map<string, SectionKey | "none">();
  SECTION_KEYS.forEach((section) => {
    assignments[section].forEach((productId) => {
      if (productId) {
        map.set(productId, section);
      }
    });
  });
  return map;
};

export default function HomepageAssignmentsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [assignments, setAssignments] = useState<SectionAssignments>(() => createEmptyAssignments());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getProducts();
      setProducts(list);
      setAssignments(buildAssignmentsFromProducts(list));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const desiredMapping = useMemo(() => computeDesiredMapping(assignments), [assignments]);

  const changedProducts = useMemo(() => {
    return products.filter((product) => {
      const desiredSection = desiredMapping.get(product.id) ?? "none";
      const currentSection = product.homepageSection ?? "none";
      return desiredSection !== currentSection;
    });
  }, [desiredMapping, products]);

  const assignedIds = useMemo(() => {
    const ids = new Set<string>();
    SECTION_KEYS.forEach((section) => {
      assignments[section].forEach((id) => {
        if (id) ids.add(id);
      });
    });
    return ids;
  }, [assignments]);

  const handleSlotChange = (section: SectionKey, index: number, value: string) => {
    const normalized = value === "none" ? null : value;
    setAssignments((prev) => {
      const next = SECTION_KEYS.reduce((acc, key) => {
        acc[key] = [...prev[key]];
        return acc;
      }, {} as SectionAssignments);

      if (normalized) {
        SECTION_KEYS.forEach((key) => {
          if (key === section) return;
          next[key] = next[key].map((id) => (id === normalized ? null : id));
        });
      }

      next[section][index] = normalized;
      return next;
    });
  };

  const handleClearSection = (section: SectionKey) => {
    setAssignments((prev) => ({
      ...prev,
      [section]: Array(SLOTS_PER_SECTION).fill(null),
    }));
  };

  const handleSave = async () => {
    if (changedProducts.length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        changedProducts.map(async (product) => {
          const desiredSection = desiredMapping.get(product.id) ?? "none";
          const res = await fetch(`/api/products/${product.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              homepage_section: desiredSection === "none" ? null : desiredSection,
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed to update ${product.name}`);
          }
        })
      );
      toast.success("Homepage spotlight updated");
      await loadProducts();
    } catch (err: any) {
      toast.error(err?.message ?? "Unable to save homepage assignments");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Products</h1>
          <p className="text-sm text-muted-foreground">
            Curate which products appear in each homepage module. Changes go live immediately after saving.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadProducts} disabled={loading || saving}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving || changedProducts.length === 0}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Saving" : `Save (${changedProducts.length})`}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      ) : (
        <div className="space-y-5">
          {SECTION_KEYS.map((section) => (
            <Card key={section}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{SECTION_COPY[section].title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{SECTION_COPY[section].description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleClearSection(section)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {assignments[section].map((productId, slotIndex) => {
                    const product = products.find((p) => p.id === productId);
                    const value = productId ?? "none";
                    return (
                      <div key={`${section}-${slotIndex}`} className="rounded-xl border p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-muted">
                            {product ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                Empty
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {product ? product.name : `Slot ${slotIndex + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product ? `₹${product.price.toLocaleString("en-IN")}` : "Choose a product"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Select
                            value={value}
                            onValueChange={(newValue) => handleSlotChange(section, slotIndex, newValue)}
                            disabled={saving}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Empty</SelectItem>
                              {products.map((p) => {
                                const alreadyChosen = assignedIds.has(p.id) && p.id !== productId;
                                return (
                                  <SelectItem key={p.id} value={p.id} disabled={alreadyChosen}>
                                    {p.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

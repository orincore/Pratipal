"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotal, clearCart, setItems } =
    useCartStore();
  const [fetching, setFetching] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function syncCart() {
      setFetching(true);
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.cart)) {
          const mapped = data.cart.map((entry: any) => ({
            id: entry.id,
            product: {
              id: entry.product?.id || entry.product_id,
              name: entry.product?.name || "Product",
              slug: entry.product?.slug || entry.product_id,
              category: "candles",
              price: entry.product?.sale_price || entry.product?.price || entry.price,
              shortDescription:
                entry.product?.short_description || entry.product?.description || "",
              image:
                entry.product?.featured_image || entry.product?.images?.[0] ||
                "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=600&q=80",
              status: "active",
              landingPages: [],
            },
            quantity: entry.quantity || 1,
          }));
          setItems(mapped);
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    }
    syncCart();
    return () => {
      cancelled = true;
    };
  }, [open, setItems]);

  if (!open) return null;

  const getIdentifier = (itemId?: string, productId?: string) => itemId || productId || "";

  const patchQuantity = async (id: string, quantity: number) => {
    const res = await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to update cart");
    }
  };

  const deleteItem = async (id: string) => {
    const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to remove item");
    }
  };

  const handleQuantityChange = async (item: any, delta: number) => {
    const identifier = getIdentifier(item.id, item.product.id);
    if (!identifier) return;
    const nextQty = item.quantity + delta;
    setUpdatingId(identifier);
    try {
      if (nextQty <= 0) {
        await deleteItem(identifier);
        removeItem(identifier);
      } else {
        await patchQuantity(identifier, nextQty);
        updateQuantity(identifier, nextQty);
      }
    } catch (err: any) {
      toast.error(err.message || "Unable to update cart");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item: any) => {
    const identifier = getIdentifier(item.id, item.product.id);
    if (!identifier) return;
    setUpdatingId(identifier);
    try {
      await deleteItem(identifier);
      removeItem(identifier);
    } catch (err: any) {
      toast.error(err.message || "Unable to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              {fetching
                ? "Loading your cart..."
                : "Your cart is empty. Start shopping to add items."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-brand-primary font-semibold mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={updatingId === getIdentifier(item.id, item.product.id)}
                        onClick={() => handleQuantityChange(item, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={updatingId === getIdentifier(item.id, item.product.id)}
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive"
                        disabled={updatingId === getIdentifier(item.id, item.product.id)}
                        onClick={() => handleRemove(item)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-3">
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-lg">
                  {formatPrice(getTotal())}
                </span>
              </div>
              <Button variant="cta" className="w-full" size="lg">
                Proceed to Checkout
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

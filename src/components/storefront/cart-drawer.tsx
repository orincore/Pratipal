"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotal, clearCart, setItems } = useCartStore();
  const [fetching, setFetching] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const router = useRouter();

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
          if (data.cart.length === 0) {
            setItems([]);
          } else {
            const mapped = data.cart.map((entry: any) => ({
              id: entry.id,
              product: {
                id: entry.product?.id || entry.product_id,
                name: entry.product?.name || "Product",
                slug: entry.product?.slug || entry.product_id,
                category: "candles",
                price: entry.product?.sale_price || entry.product?.price || entry.price,
                shortDescription: entry.product?.short_description || entry.product?.description || "",
                image: entry.product?.featured_image || entry.product?.images?.[0] || "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=600&q=80",
                status: "active",
                landingPages: [],
              },
              quantity: entry.quantity || 1,
            }));
            const currentItems = useCartStore.getState().items;
            const mergedItems = [...mapped];
            currentItems.forEach((localItem: any) => {
              const existsInServer = mapped.some((s: any) => s.product.id === localItem.product.id);
              if (!existsInServer) mergedItems.push(localItem);
            });
            setItems(mergedItems);
          }
        }
      } catch {
        // keep local cart on error
      } finally {
        if (!cancelled) setFetching(false);
      }
    }
    syncCart();
    return () => { cancelled = true; };
  }, [open, setItems]);

  const getIdentifier = (itemId?: string, productId?: string) => itemId || productId || "";

  const patchQuantity = async (id: string, quantity: number) => {
    const res = await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to update cart");
  };

  const deleteItem = async (id: string) => {
    const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to remove item");
  };

  const handleQuantityChange = async (item: any, delta: number) => {
    const id = getIdentifier(item.id, item.product.id);
    if (!id) return;
    const nextQty = item.quantity + delta;
    setUpdatingId(id);
    try {
      if (nextQty <= 0) { await deleteItem(id); removeItem(id); }
      else { await patchQuantity(id, nextQty); updateQuantity(id, nextQty); }
    } catch (err: any) {
      toast.error(err.message || "Unable to update cart");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item: any) => {
    const id = getIdentifier(item.id, item.product.id);
    if (!id) return;
    // Start exit animation, then actually remove after it completes
    setRemovingId(id);
    setTimeout(async () => {
      setUpdatingId(id);
      try {
        await deleteItem(id);
        removeItem(id);
      } catch (err: any) {
        toast.error(err.message || "Unable to remove item");
      } finally {
        setUpdatingId(null);
        setRemovingId(null);
      }
    }, 650); // matches shake(250) + exit(400)
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full z-50 w-full max-w-sm flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full bg-white/80 backdrop-blur-2xl border-l border-white/40 shadow-[−8px_0_40px_rgba(0,0,0,0.15)]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">Your Cart</h2>
              {items.length > 0 && (
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-black/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                {fetching ? "Loading your cart…" : "Your cart is empty"}
              </p>
              {!fetching && (
                <p className="text-xs text-slate-400">Add something beautiful to get started.</p>
              )}
              <button
                onClick={() => { onClose(); router.push("/shop"); }}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
              >
                Browse products <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {items.map((item) => {
                  const id = getIdentifier(item.id, item.product.id);
                  const isUpdating = updatingId === id;
                  const isRemoving = removingId === id;
                  return (
                    <div
                      key={id}
                      className={`flex gap-3 p-3 rounded-2xl bg-white/60 border border-black/5 transition-colors ${isUpdating && !isRemoving ? "opacity-50" : ""} ${isRemoving ? "cart-item-removing" : ""}`}
                    >
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate leading-snug">{item.product.name}</p>
                        <p className="text-sm font-semibold text-emerald-600 mt-0.5">{formatPrice(item.product.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-1 py-0.5">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuantityChange(item, -1)}
                              className="h-6 w-6 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-gray-900 transition disabled:opacity-40"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-semibold w-5 text-center text-gray-900">{item.quantity}</span>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuantityChange(item, 1)}
                              className="h-6 w-6 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-gray-900 transition disabled:opacity-40"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            disabled={isUpdating || isRemoving}
                            onClick={() => handleRemove(item)}
                            className="ml-auto h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all disabled:opacity-40"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-black/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(getTotal())}</span>
                </div>
                <button
                  onClick={() => { onClose(); router.push("/checkout"); }}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-emerald-200 hover:shadow-lg"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={clearCart}
                  className="w-full h-9 rounded-2xl text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  Clear cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

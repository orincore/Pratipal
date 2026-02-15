"use client";

import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import type { Product as StoreProduct, ProductCategory } from "@/types";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=600&q=80";

interface AddToCartButtonProps extends ButtonProps {
  productId: string;
  variantId?: string;
  quantity?: number;
  product?: {
    id: string;
    name: string;
    price: number;
    image?: string;
    slug?: string;
    shortDescription?: string;
    category?: ProductCategory;
  };
}

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  children,
  disabled,
  product,
  ...buttonProps
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  async function handleAdd() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
          quantity,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to add to cart");
      }

      const serverItem = await res.json();
      const serverCartId = serverItem?.cart_item?.id;

      if (product) {
        const storeProduct: StoreProduct = {
          id: product.id,
          name: product.name,
          slug: product.slug || product.id,
          category: product.category || "candles",
          price: product.price,
          shortDescription: product.shortDescription || "",
          image: product.image || FALLBACK_IMAGE,
          status: "active",
          landingPages: [],
        } as StoreProduct;
        for (let i = 0; i < quantity; i++) {
          addItem(storeProduct, serverCartId);
        }
      }

      toast.success("Added to cart");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      <span className="ml-2">{children ?? "Add to Cart"}</span>
    </Button>
  );
}

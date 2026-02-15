"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus, Facebook, Instagram, Twitter } from "lucide-react";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import type { ProductVariant } from "@/lib/ecommerce-types";
import type { ProductCategory } from "@/types";

interface ProductPurchasePanelProps {
  productId: string;
  basePrice: number;
  compareAtPrice?: number;
  stockStatus?: string;
  variants?: ProductVariant[];
  productMeta: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    shortDescription?: string;
    category: ProductCategory;
  };
  shareUrl?: string;
}

const shareTargets = [
  {
    label: "Facebook",
    icon: Facebook,
    href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "Twitter",
    icon: Twitter,
    href: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    label: "Instagram",
    icon: Instagram,
    href: () => "https://instagram.com/", // placeholder
  },
];

export function ProductPurchasePanel({
  productId,
  basePrice,
  compareAtPrice,
  stockStatus,
  variants,
  productMeta,
  shareUrl,
}: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    variants?.[0]?.id
  );

  const selectedVariant = variants?.find((variant) => variant.id === selectedVariantId);
  const variantPrice = selectedVariant?.sale_price ?? selectedVariant?.price;
  const displayPrice = variantPrice ?? basePrice;
  const resolvedShareUrl = shareUrl || "";
  const checkoutParams = new URLSearchParams({ product: productId });
  if (selectedVariantId) checkoutParams.set("variant", selectedVariantId);
  if (quantity > 1) checkoutParams.set("quantity", quantity.toString());
  const checkoutUrl = `/checkout?${checkoutParams.toString()}`;

  function increment() {
    setQuantity((prev) => Math.min(prev + 1, 99));
  }

  function decrement() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-gray-200 bg-[#fff9f6] p-6 shadow-sm">
      <div>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-semibold text-[#c2554f]">₹{displayPrice.toFixed(2)}</p>
          {compareAtPrice && compareAtPrice > displayPrice && (
            <span className="text-sm text-gray-400 line-through">₹{compareAtPrice.toFixed(2)}</span>
          )}
        </div>
        <p
          className={`text-sm font-medium ${
            stockStatus === "in_stock" ? "text-green-600" : "text-amber-600"
          } mt-1`}
        >
          {stockStatus?.replace("_", " ") || "In stock"}
        </p>
      </div>

      {variants && variants.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Choose an option</p>
          <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
            <SelectTrigger className="h-12 rounded-full bg-white">
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.name}
                  {variant.sale_price && variant.sale_price < (variant.price ?? basePrice)
                    ? ` — ₹${variant.sale_price.toFixed(2)}`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-gray-200 bg-white">
          <button
            type="button"
            onClick={decrement}
            className="h-12 w-12 flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
          <button
            type="button"
            onClick={increment}
            className="h-12 w-12 flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500">Quantity</p>
      </div>

      <div className="grid gap-3">
        <AddToCartButton
          productId={productId}
          variantId={selectedVariantId}
          quantity={quantity}
          product={{
            id: productMeta.id,
            name: productMeta.name,
            price: displayPrice,
            image: productMeta.image,
            slug: productMeta.slug,
            shortDescription: productMeta.shortDescription,
            category: productMeta.category,
          }}
          className="h-12 rounded-full bg-black text-white text-base font-semibold shadow-md hover:bg-black/90"
        >
          Add to Cart
        </AddToCartButton>
        <Button
          asChild
          variant="outline"
          className="h-12 rounded-full border-gray-900 text-gray-900 font-semibold"
        >
          <a href={checkoutUrl}>Buy Now</a>
        </Button>
      </div>

      <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
        <p className="font-semibold text-gray-700 mb-2">Share</p>
        <div className="flex flex-wrap gap-3">
          {shareTargets.map((target) => (
            <a
              key={target.label}
              href={target.href(resolvedShareUrl)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-gray-400"
            >
              <target.icon className="h-4 w-4" /> {target.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

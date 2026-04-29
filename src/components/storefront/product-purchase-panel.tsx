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
import { Minus, Plus, Zap } from "lucide-react";
import { ShareButtons } from "@/components/storefront/share-buttons";
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
  const checkoutParams = new URLSearchParams({ buyNow: productId });
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
    <div className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
      <div>
        <div className="flex items-baseline gap-2 sm:gap-3">
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600">₹{displayPrice.toFixed(2)}</p>
          {compareAtPrice && compareAtPrice > displayPrice && (
            <>
              <span className="text-xs sm:text-sm text-gray-400 line-through">₹{compareAtPrice.toFixed(2)}</span>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                {Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100)}% off
              </span>
            </>
          )}
        </div>
        <p
          className={`text-sm font-medium mt-1 ${
            stockStatus === "in_stock" ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          {stockStatus === "in_stock" ? "In stock" : stockStatus === "out_of_stock" ? "Out of stock" : "On backorder"}
        </p>
      </div>

      {variants && variants.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Choose an option</p>
          <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
            <SelectTrigger className="h-10 sm:h-12 rounded-full bg-white">
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

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center rounded-full border border-gray-200 bg-white">
          <button
            type="button"
            onClick={decrement}
            className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 sm:w-12 text-center font-semibold text-gray-900">{quantity}</span>
          <button
            type="button"
            onClick={increment}
            className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500">Quantity</p>
      </div>

      <div className="grid gap-2 sm:gap-3">
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
          className="h-10 sm:h-12 rounded-full bg-[#1b244a] text-white text-sm sm:text-base font-semibold shadow-md hover:bg-[#232d5f]"
        >
          Add to Cart
        </AddToCartButton>
        <Button
          asChild
          variant="outline"
          className="h-10 sm:h-12 rounded-full border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-600 hover:text-white"
        >
          <a href={checkoutUrl}>Buy Now</a>
        </Button>
      </div>

      <div className="border-t border-gray-200 pt-3 sm:pt-4 text-sm text-gray-500">
        <p className="font-semibold text-gray-700 mb-2">Share</p>
        <ShareButtons url={resolvedShareUrl} />
      </div>
    </div>
  );
}

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
import { Minus, Plus, Facebook, Twitter, Zap } from "lucide-react";

// WhatsApp SVG icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L.057 23.571a.75.75 0 0 0 .92.92l5.723-1.471A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.5-5.24-1.375l-.374-.217-3.876.996.996-3.876-.217-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

const shareTargets = [
  {
    label: "WhatsApp",
    color: "#25D366",
    href: (url: string) => `https://wa.me/?text=${encodeURIComponent(url)}`,
    icon: WhatsAppIcon,
  },
  {
    label: "Facebook",
    color: "#1877F2",
    href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: Facebook,
  },
  {
    label: "Twitter",
    color: undefined,
    href: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    icon: Twitter,
  },
];
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
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {shareTargets.map((target) => (
            <a
              key={target.label}
              href={target.href(resolvedShareUrl)}
              target="_blank"
              rel="noreferrer"
              style={target.color ? { borderColor: target.color, color: target.color } : undefined}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                target.color
                  ? "hover:text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
              onMouseEnter={target.color ? (e) => { (e.currentTarget as HTMLElement).style.backgroundColor = target.color!; } : undefined}
              onMouseLeave={target.color ? (e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; } : undefined}
            >
              <target.icon className="h-4 w-4" /> {target.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

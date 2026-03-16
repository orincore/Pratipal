"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Zap } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useCartAnimation } from "@/lib/cart-animation-context";
import { formatPrice } from "@/lib/utils";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+";

export interface ProductCardItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  shortDescription?: string;
  category?: string;
}

export function ProductCard({
  product,
  index = 0,
}: {
  product: ProductCardItem;
  index?: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const { triggerFly } = useCartAnimation();
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    if (addBtnRef.current) triggerFly(addBtnRef.current, product.image);
    try {
      addItem(product as any);
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
    } catch {
      // cart already updated locally
    } finally {
      setAdding(false);
    }
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div
      className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-emerald-200 transition-all duration-300 cursor-pointer"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => router.push(`/product/${product.slug}`)}
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 flex-shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover object-center transition-all duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL={BLUR}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {product.category && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-white bg-black/40 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[9px] sm:text-[10px] font-bold text-white bg-red-500 px-1.5 sm:px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4 gap-1.5 sm:gap-2">
        <h3 className="text-xs sm:text-base font-semibold text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {product.shortDescription || "\u00A0"}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto pt-1.5 sm:pt-2 border-t border-gray-100">
          <span className="text-sm sm:text-lg font-bold text-emerald-700">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
          <button
            ref={addBtnRef}
            onClick={handleAddToCart}
            disabled={adding}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <ShoppingBag className="h-3 w-3 flex-shrink-0" />
            <span className="hidden xs:inline">{adding ? "Adding…" : "Add to Cart"}</span>
            <span className="xs:hidden">{adding ? "…" : "Cart"}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/checkout?buyNow=${product.id}`); }}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-semibold text-white bg-gradient-brand hover:shadow-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200"
          >
            <Zap className="h-3 w-3 flex-shrink-0" />
            <span className="sm:hidden">Buy</span>
            <span className="hidden sm:inline">Buy Now</span>
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:text-emerald-700 mt-0.5">
          View Details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Zap } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useCartAnimation } from "@/lib/cart-animation-context";
import { formatPrice } from "@/lib/utils";
import { DEFAULT_SHOP_SETTINGS, type ShopSettings } from "@/hooks/use-shop-settings";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+";

export interface ProductCardItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  shortDescription?: string;
  category?: string;
}

export function ProductCard({
  product,
  index = 0,
  settings = DEFAULT_SHOP_SETTINGS,
}: {
  product: ProductCardItem;
  index?: number;
  settings?: ShopSettings;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const { triggerFly } = useCartAnimation();
  const addBtnRef = useRef<HTMLButtonElement>(null);

  // Gallery images beyond the featured one, deduped — cycled through on
  // hover so shoppers can preview a product without opening it.
  const galleryImages = (product.images?.length ? product.images : [product.image]).filter(
    (src, i, arr) => src && arr.indexOf(src) === i
  );
  const [hoverIndex, setHoverIndex] = useState(0);
  const hoverIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHoverCycle = () => {
    if (galleryImages.length < 2 || hoverIntervalRef.current) return;
    hoverIntervalRef.current = setInterval(() => {
      setHoverIndex((i) => (i + 1) % galleryImages.length);
    }, 1800);
  };
  const stopHoverCycle = () => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }
    setHoverIndex(0);
  };
  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
    };
  }, []);

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

  const shadowStyles: Record<string, string> = {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  };

  const shadowClass = shadowStyles[settings.cardShadow] !== "none" ? `shadow-${settings.cardShadow}` : "shadow-none";

  const cardStyle: React.CSSProperties = {
    backgroundColor: settings.cardBgColor,
    borderRadius: `${settings.cardBorderRadius}px`,
    borderColor: settings.cardBorderColor,
    padding: `${settings.cardPadding}px`,
    animationDelay: `${index * 0.05}s`,
    ["--card-hover-border" as any]: settings.cardHoverBorderColor,
    ["--card-hover-shadow" as any]: shadowStyles[settings.cardHoverShadow] || "none",
  };

  const btnStyle: React.CSSProperties = {
    borderRadius: `${settings.buttonBorderRadius}px`,
    padding: `${settings.buttonPaddingY}px ${settings.buttonPaddingX}px`,
    backgroundColor: settings.buttonVariant === "solid" ? settings.buttonBgColor : "transparent",
    // buttonTextColor is meant to contrast against a *solid* buttonBgColor
    // fill (e.g. white on green). In the "outline" variant the background
    // is transparent — showing the card's own background through — so that
    // same white-on-white default (buttonVariant defaults to "outline",
    // buttonTextColor defaults to white) made the text invisible. Outline
    // buttons use the accent/border color for their text instead, the
    // standard convention for that style.
    color: settings.buttonVariant === "solid" ? settings.buttonTextColor : settings.buttonBorderColor,
    borderColor: settings.buttonBorderColor,
    ["--btn-hover-bg" as any]: settings.buttonHoverBg,
    ["--btn-hover-text" as any]: settings.buttonHoverTextColor,
  };

  const objectFitClass =
    settings.imageObjectFit === "cover"
      ? "object-cover"
      : settings.imageObjectFit === "contain"
      ? "object-contain"
      : "object-fill";

  return (
    <div
      className={`group flex flex-col h-full ve-product-card border transition-all duration-300 cursor-pointer ${shadowClass}`}
      style={cardStyle}
      onClick={() => router.push(`/product/${product.slug}`)}
      onMouseEnter={startHoverCycle}
      onMouseLeave={stopHoverCycle}
    >
      {/* Image */}
      <div
        className={`relative w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 flex-shrink-0 rounded-lg ${
          settings.imageAspectRatio === "3/4"
            ? "aspect-[3/4]"
            : settings.imageAspectRatio === "1/1"
            ? "aspect-square"
            : settings.imageAspectRatio === "16/9"
            ? "aspect-video"
            : settings.imageAspectRatio === "4/3"
            ? "aspect-[4/3]"
            : "aspect-auto"
        }`}
      >
        {galleryImages.length > 1 ? (
          // Stacked + crossfaded so cycling swaps opacity only — no
          // reload/flash, since every image is already mounted.
          galleryImages.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={`${product.name}${i > 0 ? ` — image ${i + 1}` : ""}`}
              fill
              className={`object-center transition-opacity duration-500 ${objectFitClass} ${
                settings.imageHoverScale ? "group-hover:scale-105" : ""
              } ${i === hoverIndex ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              placeholder={i === 0 ? "blur" : undefined}
              blurDataURL={i === 0 ? BLUR : undefined}
              priority={i === 0}
            />
          ))
        ) : (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-center transition-all duration-700 ${objectFitClass} ${
              settings.imageHoverScale ? "group-hover:scale-105" : ""
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            placeholder="blur"
            blurDataURL={BLUR}
          />
        )}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
            {galleryImages.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === hoverIndex ? "w-3 bg-white" : "w-1 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {settings.showCategory && product.category && (
          <span
            className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm"
            style={{ color: settings.categoryColor }}
          >
            {product.category}
          </span>
        )}
        {settings.showDiscountBadge && hasDiscount && (
          <span
            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full"
            style={{ backgroundColor: settings.discountBadgeBg, color: settings.discountBadgeColor }}
          >
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 mt-3 gap-1.5 sm:gap-2">
        <h3
          className="font-semibold leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2"
          style={{
            color: settings.productTitleColor,
            fontSize: `${settings.productTitleSize}px`,
            fontWeight: settings.productTitleWeight,
          }}
        >
          {product.name}
        </h3>
        {settings.showDescription && (
          <p
            className="text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]"
            style={{
              color: settings.descriptionColor,
              fontSize: `${settings.descriptionSize}px`,
            }}
          >
            {product.shortDescription || "\u00A0"}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto pt-1.5 sm:pt-2 border-t border-gray-100">
          <span
            className="font-bold text-emerald-700"
            style={{
              color: settings.priceColor,
              fontSize: `${settings.priceSize}px`,
            }}
          >
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>

        {/* Actions */}
        {settings.showActions && (
          <div className="flex gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
            <button
              ref={addBtnRef}
              onClick={handleAddToCart}
              disabled={adding}
              className={`flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-semibold ve-product-card-btn border transition-all duration-200 disabled:opacity-50 ${
                settings.buttonHoverScale ? "hover:scale-[1.03]" : ""
              }`}
              style={btnStyle}
            >
              <ShoppingBag className="h-3 w-3 flex-shrink-0" />
              <span className="hidden xs:inline">{adding ? "Adding…" : settings.buttonText}</span>
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
        )}

        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:text-emerald-700 mt-0.5">
          View Details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

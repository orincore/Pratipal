"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, Search, X, SlidersHorizontal, Zap, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useCartAnimation } from "@/lib/cart-animation-context";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/storefront/product-card";
import { useShopSettings } from "@/hooks/use-shop-settings";

// ── Types ────────────────────────────────────────────────────────────────────
interface ShopProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  original_price?: number;
  featured_image?: string;
  images?: string[];
  category?: { id: string; name: string; slug: string } | null;
  tags?: string[];
}

// Normalise to the shape ProductCard expects
interface NormProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  shortDescription?: string;
  category?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=600&q=80";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+";

function normalise(p: ShopProduct): NormProduct {
  const price = p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
  const originalPrice =
    p.sale_price && p.sale_price < p.price
      ? p.price
      : p.original_price && p.original_price > p.price
      ? p.original_price
      : undefined;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    image: p.featured_image || p.images?.[0] || FALLBACK_IMAGE,
    price,
    originalPrice,
    shortDescription: p.short_description || p.description,
    category: p.category?.name,
  };
}



// ── Page ─────────────────────────────────────────────────────────────────────
export default function ShopPage() {
  const { settings } = useShopSettings();
  const [raw, setRaw] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    let alive = true;
    fetch("/api/products?limit=200", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive) {
          // Shuffle once on load
          const arr: ShopProduct[] = d.products || [];
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          setRaw(arr);
        }
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const products = useMemo(() => raw.map(normalise), [raw]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    raw.forEach((p) => { if (p.category?.slug) map.set(p.category.slug, p.category.name); });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [raw]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchCat = activeCategory === "all" || raw.find((r) => r.id === p.id)?.category?.slug === activeCategory;
      const hay = `${p.name} ${p.shortDescription ?? ""}`.toLowerCase();
      return matchCat && hay.includes(search.toLowerCase());
    });
    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, raw, activeCategory, search, sortBy]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, activeCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero strip ── */}
      <div
        className="pt-16 sm:pt-20"
        style={{ background: "linear-gradient(120deg, #0f172a 0%, #1b244a 40%, #0d3d2e 75%, #134e3a 100%)" }}
      >
        <div className="container max-w-6xl px-4 sm:px-6 py-3 sm:py-8 flex items-center justify-between gap-6">
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.3em] font-semibold mb-0.5 sm:mb-1"
              style={{ color: "#6ee7b7" }}
            >
              Our Collection
            </p>
            <h1
              className="text-xl sm:text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Shop Pratipal
            </h1>
            <p className="text-xs text-white/50 mt-0.5 hidden sm:block">
              Handcrafted wellness essentials — aromatherapy, crystals &amp; ritual tools.
            </p>
          </div>
          {/* Decorative stat pills */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {[
              { value: "100+", label: "Products" },
              { value: "Pure", label: "Ingredients" },
              { value: "Ayurvedic", label: "Formulas" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="text-center px-4 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="text-sm font-bold text-white">{value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky toolbar ── */}
      <div className="sticky top-[60px] z-30 bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm">
        <div className="container max-w-6xl px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-stretch sm:items-center">

          {/* Row 1 on mobile: Search + Sort side by side */}
          <div className="flex gap-2 sm:contents">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full h-8 sm:h-9 pl-8 pr-8 text-xs sm:text-sm bg-gray-50 border border-black/8 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 placeholder:text-slate-400 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort — mobile only, inline with search */}
            <div className="flex items-center gap-1 flex-shrink-0 sm:hidden">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-8 pl-2 pr-5 text-[11px] font-medium bg-gray-100 border-0 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none cursor-pointer"
              >
                <option value="default">Default</option>
                <option value="price_asc">Low → High</option>
                <option value="price_desc">High → Low</option>
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
            {[{ slug: "all", name: "All" }, ...categories].map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex-shrink-0 h-6 sm:h-7 px-2.5 sm:px-3 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all duration-150 ${
                  activeCategory === cat.slug
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort — desktop only */}
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-7 pl-2 pr-6 text-[11px] font-medium bg-gray-100 border-0 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 appearance-none cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* ── Results ── */}
      <div className="container max-w-6xl px-3 sm:px-6 py-4 sm:py-8">

        {/* Count */}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-slate-400 mb-5">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} {filtered.length === 1 ? "product" : "products"}
            {activeCategory !== "all" && ` in ${categories.find((c) => c.slug === activeCategory)?.name}`}
            {search && ` matching "${search}"`}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-base font-semibold text-slate-600">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              className="mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div
              className="grid ve-shop-grid gap-2.5 sm:gap-5"
              style={{
                "--cols-desktop": settings.gridColumnsDesktop,
                "--cols-tablet": settings.gridColumnsTablet,
                "--cols-mobile": settings.gridColumnsMobile,
              } as React.CSSProperties}
            >
              {paginated.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} settings={settings} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                {/* Page info */}
                <p className="text-xs text-slate-400">
                  Page {page} of {totalPages}
                </p>

                {/* Controls */}
                <div className="flex items-center gap-1.5">
                  {/* Prev */}
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-black/10 text-slate-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                  >
                    ‹
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-slate-400 text-xs">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p as number)}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-semibold transition ${
                            page === p
                              ? "bg-emerald-700 text-white shadow-sm"
                              : "border border-black/10 text-slate-600 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                  {/* Next */}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-black/10 text-slate-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

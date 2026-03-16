"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, Search, X, SlidersHorizontal, Zap, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useCartAnimation } from "@/lib/cart-animation-context";
import { formatPrice } from "@/lib/utils";

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

// ── Product Card (identical to homepage) ─────────────────────────────────────
function ProductCard({ product, index }: { product: NormProduct; index: number }) {
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
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => router.push(`/product/${product.slug}`)}
    >
      {/* Image */}
      <div className="relative h-[180px] overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 flex-shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL={BLUR}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {product.category && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-semibold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="text-sm sm:text-base font-semibold text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {product.shortDescription || "\u00A0"}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-2 border-t border-gray-100">
          <span className="text-base sm:text-lg font-bold text-emerald-700">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button
            ref={addBtnRef}
            onClick={handleAddToCart}
            disabled={adding}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <ShoppingBag className="h-3 w-3 flex-shrink-0" />
            {adding ? "Adding…" : "Add to Cart"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/checkout?buyNow=${product.id}`); }}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-white bg-gradient-brand hover:shadow-md px-3 py-2 rounded-lg transition-all duration-200"
          >
            <Zap className="h-3 w-3 flex-shrink-0" />
            Buy Now
          </button>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:text-emerald-700 mt-0.5">
          View Details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [raw, setRaw] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  useEffect(() => {
    let alive = true;
    fetch("/api/products?limit=200", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (alive) setRaw(d.products || []); })
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
        className="pt-20"
        style={{ background: "linear-gradient(120deg, #0f172a 0%, #1b244a 40%, #0d3d2e 75%, #134e3a 100%)" }}
      >
        <div className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between gap-6">
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.3em] font-semibold mb-1"
              style={{ color: "#6ee7b7" }}
            >
              Our Collection
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold text-white leading-tight"
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
        <div className="container max-w-6xl px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">

          {/* Search */}
          <div className="relative flex-1 max-w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full h-9 pl-8 pr-8 text-sm bg-gray-50 border border-black/8 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 placeholder:text-slate-400 transition"
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

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
            {[{ slug: "all", name: "All" }, ...categories].map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-semibold transition-all duration-150 ${
                  activeCategory === cat.slug
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
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
      <div className="container max-w-6xl px-4 sm:px-6 py-8">

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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {paginated.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
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

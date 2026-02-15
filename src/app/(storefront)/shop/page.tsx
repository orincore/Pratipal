"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

interface ShopProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  featured_image?: string;
  images?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags?: string[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=600&q=80";

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const res = await fetch("/api/products?limit=200", { cache: "no-store" });
        const data = await res.json();
        if (isMounted) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    products.forEach((product) => {
      if (product.category?.slug && product.category?.name) {
        unique.set(product.category.slug, product.category.name);
      }
    });
    return Array.from(unique.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === "all" || product.category?.slug === categoryFilter;
      const haystack = `${product.name} ${product.description ?? ""} ${
        product.short_description ?? ""
      }`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, search]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Our Collection</p>
          <h1 className="text-4xl font-extrabold text-gray-900">Shop Pratipal</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover handcrafted wellness essentials infused with intention. Filter and explore the full range of aromatherapy candles, oils, and ritual tools.
          </p>
        </header>

        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Input
            placeholder="Search products by name, intent, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:max-w-md bg-white"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                categoryFilter === "all"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategoryFilter(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  categoryFilter === cat.slug
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-60" />
            <p className="text-lg font-semibold">No products found.</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const image =
                product.featured_image || product.images?.[0] || FALLBACK_IMAGE;
              const isOnSale = Boolean(
                product.sale_price && product.sale_price < product.price
              );
              const displayPrice = isOnSale
                ? product.sale_price ?? product.price
                : product.price;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition p-4 flex flex-col"
                >
                  <div className="relative rounded-2xl overflow-hidden mb-4 bg-gray-100">
                    <div className="relative h-56 w-full">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    {isOnSale && (
                      <span className="absolute top-4 left-4 bg-white/90 text-gray-900 text-xs font-semibold rounded-full px-3 py-1">
                        On Sale
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                        {product.category?.name || "Wellness"}
                      </p>
                      <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                      </h2>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.short_description ||
                          product.description ||
                          "Intentional aromatherapy blend."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-gray-900 font-bold">
                          ₹{displayPrice.toFixed(2)}
                        </p>
                        {isOnSale && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹{product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="rounded-full flex-1"
                          asChild
                        >
                          <Link href={`/product/${product.slug || product.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <AddToCartButton
                          productId={product.id}
                          className="rounded-full flex-1 justify-center"
                          product={{
                            id: product.id,
                            name: product.name,
                            price: displayPrice,
                            image,
                            slug: product.slug || product.id,
                            shortDescription:
                              product.short_description || product.description || "",
                            category: (product.category?.slug as any) || undefined,
                          }}
                        >
                          Add to Cart
                        </AddToCartButton>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, Search, User, Loader2, BookOpen, ShoppingBag, Stethoscope } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { CartDrawer } from "./cart-drawer";
import LogoMark from "@/app/assets/logo.png";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import { useRouter, usePathname } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { useCartAnimation } from "@/lib/cart-animation-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/shop", label: "Products" },
  { href: "/booking", label: "Services" },
  { href: "/blogs", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact Us" },
];

function parseRgb(color: string): [number, number, number] | null {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? [+m[1], +m[2], +m[3]] : null;
}

function luminance(r: number, g: number, b: number) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getEffectiveBg(el: Element | null): string {
  while (el && el !== document.body) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
    el = el.parentElement;
  }
  return getComputedStyle(document.body).backgroundColor || "rgb(255,255,255)";
}

function sampleIsDark(headerBottom: number): boolean {
  const sampleY = headerBottom + 10;
  const xs = [window.innerWidth * 0.15, window.innerWidth * 0.5, window.innerWidth * 0.85];
  let darkVotes = 0;
  for (const x of xs) {
    const el = document.elementFromPoint(x, sampleY);
    if (!el) continue;
    const bg = getEffectiveBg(el);
    const rgb = parseRgb(bg);
    if (rgb && luminance(...rgb) < 0.35) darkVotes++;
  }
  return darkVotes >= 2;
}

type SearchResult = {
  id: string;
  kind: "product" | "course" | "service";
  name: string;
  subtitle?: string;
  image?: string;
  price?: number;
  href: string;
};

export function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { customer, loading } = useCustomerAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { cartIconRef, popCount } = useCartAnimation();

  const [popKey, setPopKey] = useState(0);
  useEffect(() => {
    if (popCount > 0) setPopKey((k) => k + 1);
  }, [popCount]);

  const [isDark, setIsDark] = useState(true);

  const updateTheme = useCallback(() => {
    const h = headerRef.current;
    if (!h) return;
    const rect = h.getBoundingClientRect();
    setIsDark(sampleIsDark(rect.bottom));
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(updateTheme, 80);
    window.addEventListener("scroll", updateTheme, { passive: true });
    window.addEventListener("resize", updateTheme, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", updateTheme);
      window.removeEventListener("resize", updateTheme);
    };
  }, [updateTheme]);

  useEffect(() => {
    const t = setTimeout(updateTheme, 120);
    return () => clearTimeout(t);
  }, [pathname, updateTheme]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  async function runSearch(q: string) {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const term = q.trim().toLowerCase();
      const [pRes, cRes, sRes] = await Promise.all([
        fetch(`/api/products?search=${encodeURIComponent(q.trim())}&limit=5`),
        fetch(`/api/courses?limit=50`),
        fetch(`/api/services`),
      ]);
      const results: SearchResult[] = [];

      if (pRes.ok) {
        const { products = [] } = await pRes.json();
        products.slice(0, 4).forEach((p: any) => results.push({
          id: p.id, kind: "product", name: p.name,
          subtitle: p.short_description, image: p.featured_image,
          price: p.sale_price || p.price, href: `/product/${p.slug}`,
        }));
      }
      if (cRes.ok) {
        const { courses = [] } = await cRes.json();
        courses
          .filter((c: any) =>
            c.title?.toLowerCase().includes(term) ||
            c.description?.toLowerCase().includes(term)
          )
          .slice(0, 3)
          .forEach((c: any) => results.push({
            id: c.id, kind: "course", name: c.title,
            subtitle: c.short_description || c.category,
            image: c.thumbnail || c.image, price: c.price,
            href: `/courses/${c.slug || c.id}`,
          }));
      }
      if (sRes.ok) {
        const { services = [] } = await sRes.json();
        services
          .filter((s: any) =>
            s.name?.toLowerCase().includes(term) ||
            s.description?.toLowerCase().includes(term) ||
            s.category?.toLowerCase().includes(term)
          )
          .slice(0, 3)
          .forEach((s: any) => results.push({
            id: s.id, kind: "service", name: s.name,
            subtitle: s.category || s.description,
            image: s.image, price: s.price,
            href: `/booking`,
          }));
      }
      setSearchResults(results);
    } catch {
      setSearchError("Search failed");
    } finally {
      setSearchLoading(false);
    }
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  }

  const hasDarkHero = pathname === "/" || pathname === "/courses" || pathname === "/booking" || pathname === "/contact" || pathname === "/shop" || pathname === "/blogs";
  const forceLight = pathname === "/login" || pathname === "/register" || pathname?.startsWith("/login") || pathname?.startsWith("/register");
  const useWhite = forceLight ? false : (hasDarkHero ? !scrolled : (!scrolled && isDark));
  const iconCls = useWhite ? "text-white hover:bg-white/20" : "text-slate-700 hover:bg-black/5";
  const navCls = useWhite ? "text-white hover:text-white hover:bg-white/20" : "text-slate-700 hover:text-emerald-700 hover:bg-black/5";
  const borderCls = useWhite ? "border-white/20" : "border-black/10";

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pt-3 pointer-events-none"
      >
        <div
          className={`pointer-events-auto w-full max-w-6xl rounded-2xl border transition-all duration-500 backdrop-blur-xl ${
            scrolled || forceLight
              ? "bg-white/95 border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
              : "bg-white/10 border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          }`}
        >
          <div className="flex h-14 items-center justify-between px-4 sm:px-5">
            <div className="flex items-center gap-2">
              <button
                className={`lg:hidden h-8 w-8 flex items-center justify-center rounded-xl transition ${iconCls}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <Link href="/" className="flex items-center">
                <div className="relative h-10 w-10">
                  <Image src={LogoMark} alt="Pratipal" fill sizes="40px" className="object-contain" priority />
                </div>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 ${navCls}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button
                className={`h-8 w-8 flex items-center justify-center rounded-xl transition ${iconCls}`}
                onClick={() => setSearchOpen((p) => !p)}
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              <button
                ref={cartIconRef}
                key={`cart-${popKey}`}
                className={`relative h-8 w-8 flex items-center justify-center rounded-xl transition ${iconCls} ${popKey > 0 ? "cart-icon-pop" : ""}`}
                onClick={() => setCartOpen(true)}
                aria-label="Cart"
              >
                <ShoppingCart className="h-4 w-4" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center shadow">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {mounted && !loading && (
                customer ? (
                  <div className="flex items-center gap-1">
                    <button
                      className={`h-8 w-8 flex items-center justify-center rounded-xl transition md:hidden ${iconCls}`}
                      onClick={() => router.push("/account")}
                      title="Account"
                    >
                      <User className="h-4 w-4" />
                    </button>
                    <button
                      className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                      onClick={() => router.push("/account")}
                    >
                      <User className="h-3.5 w-3.5" />
                      {customer.first_name ? `Hi, ${customer.first_name}` : "Account"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      className={`h-8 px-3 rounded-xl text-xs font-semibold transition ${iconCls}`}
                      onClick={() => router.push("/login")}
                    >
                      Sign In
                    </button>
                    <button
                      className="h-8 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm"
                      onClick={() => router.push("/register")}
                    >
                      Join
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Search panel */}
          <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 sm:px-5 pb-3 pt-1 border-t border-white/30">
              <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2">
                <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); runSearch(e.target.value); }}
                  onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                  placeholder="Search products, courses, services…"
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                />
                {searchQuery && (
                  <button onClick={closeSearch} className="text-slate-400 hover:text-slate-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {(searchLoading || searchResults.length > 0 || searchError || (searchQuery && !searchLoading)) && (
                <div className="mt-2 max-h-80 overflow-y-auto rounded-xl bg-white/90 backdrop-blur-sm border border-white/40 shadow-lg divide-y divide-black/5">
                  {searchLoading && (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                    </div>
                  )}
                  {searchError && (
                    <div className="px-4 py-3 text-sm text-red-500">{searchError}</div>
                  )}
                  {!searchLoading && searchResults.length === 0 && !searchError && searchQuery && (
                    <div className="px-4 py-3 text-sm text-slate-500">No results found for "{searchQuery}"</div>
                  )}
                  {!searchLoading && searchResults.map((r) => {
                    const KindIcon = r.kind === "course" ? BookOpen : r.kind === "service" ? Stethoscope : ShoppingBag;
                    const kindLabel = r.kind === "course" ? "Course" : r.kind === "service" ? "Service" : "Product";
                    const kindColor = r.kind === "course"
                      ? "bg-blue-100 text-blue-700"
                      : r.kind === "service"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-emerald-100 text-emerald-700";
                    return (
                      <button
                        key={`${r.kind}-${r.id}`}
                        className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-emerald-50/60 transition text-left"
                        onClick={() => { closeSearch(); router.push(r.href); }}
                      >
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {r.image
                            ? <Image src={r.image} alt={r.name} fill sizes="40px" className="object-cover" />
                            : <div className="h-full w-full flex items-center justify-center"><KindIcon className="h-4 w-4 text-slate-400" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">{r.name}</p>
                          {r.subtitle && <p className="text-xs text-slate-500 line-clamp-1">{r.subtitle}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${kindColor}`}>{kindLabel}</span>
                          {r.price != null && <span className="text-xs font-semibold text-emerald-700">{formatPrice(r.price)}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className={`px-4 pb-4 pt-1 border-t space-y-1 ${borderCls}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-xl transition ${navCls}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

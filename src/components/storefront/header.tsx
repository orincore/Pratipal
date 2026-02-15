"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, Search, User, Heart, LogOut } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { CartDrawer } from "./cart-drawer";
import LogoMark from "@/app/assets/logo.png";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import { useRouter } from "next/navigation";

export function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const router = useRouter();
  const { customer, logout, loading } = useCustomerAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="bg-brand-dark text-brand-support/80 text-[11px] tracking-wider text-center py-1.5 font-sans hidden sm:block">
        FREE SHIPPING ON ORDERS ABOVE ₹999 &nbsp;|&nbsp; HANDCRAFTED WITH LOVE & INTENTION
      </div>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-brand-secondary/95 backdrop-blur-md shadow-lg"
            : "bg-gradient-purple"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-white/80 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link href="/" className="flex items-center">
              <div className="relative h-16 w-16">
                <Image
                  src={LogoMark}
                  alt="Pratipal logo"
                  fill
                  sizes="64px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-sans tracking-wide">
            <Link
              href="/shop"
              className="text-white/80 hover:text-brand-accent transition-colors duration-200 uppercase"
            >
              Shop
            </Link>
            <Link
              href="/candles"
              className="text-white/80 hover:text-brand-accent transition-colors duration-200 uppercase"
            >
              Healing Candles
            </Link>
            <Link
              href="/essential-oil"
              className="text-white/80 hover:text-brand-accent transition-colors duration-200 uppercase"
            >
              Essential Oils
            </Link>
            <Link
              href="/mood-refresher"
              className="text-white/80 hover:text-brand-accent transition-colors duration-200 uppercase"
            >
              Intention Salts
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-brand-accent hover:bg-white/10 transition-all">
              <Search className="h-4 w-4" />
            </button>
            <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-brand-accent hover:bg-white/10 transition-all">
              <Heart className="h-4 w-4" />
            </button>
            {mounted && !loading && customer ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  className="h-9 px-3 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wide flex items-center gap-2 hover:bg-white/20 transition"
                  onClick={() => router.push("/account")}
                >
                  <User className="h-3.5 w-3.5" />
                  {customer.first_name ? `Hi, ${customer.first_name}` : "My Account"}
                </button>
                <button
                  className="h-9 w-9 flex items-center justify-center rounded-full text-white/70 hover:text-red-300 hover:bg-white/10 transition"
                  onClick={async () => {
                    if (loggingOut) return;
                    setLoggingOut(true);
                    await logout();
                    setLoggingOut(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  className="h-9 px-3 rounded-full bg-white text-brand-secondary text-xs font-semibold uppercase tracking-wide hover:bg-brand-accent hover:text-white transition"
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </button>
                <button
                  className="h-9 px-3 rounded-full border border-white/40 text-white text-xs font-semibold uppercase tracking-wide hover:bg-white hover:text-brand-secondary transition"
                  onClick={() => router.push("/register")}
                >
                  Join Now
                </button>
              </div>
            )}
            <button
              className="relative h-9 w-9 flex items-center justify-center rounded-full text-white/70 hover:text-brand-accent hover:bg-white/10 transition-all"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-cta text-[9px] font-bold text-white flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-brand-dark/95 backdrop-blur-md border-t border-white/10 px-6 py-5 space-y-4">
            <Link
              href="/shop"
              className="block text-sm text-white/80 hover:text-brand-accent uppercase tracking-wider font-sans"
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/candles"
              className="block text-sm text-white/80 hover:text-brand-accent uppercase tracking-wider font-sans"
              onClick={() => setMenuOpen(false)}
            >
              Healing Candles
            </Link>
            <Link
              href="/essential-oil"
              className="block text-sm text-white/80 hover:text-brand-accent uppercase tracking-wider font-sans"
              onClick={() => setMenuOpen(false)}
            >
              Essential Oils
            </Link>
            <Link
              href="/mood-refresher"
              className="block text-sm text-white/80 hover:text-brand-accent uppercase tracking-wider font-sans"
              onClick={() => setMenuOpen(false)}
            >
              Intention Salts
            </Link>
            <div className="pt-4 border-t border-white/10 space-y-3">
              {mounted && !loading && customer ? (
                <>
                  <p className="text-xs text-white/70">Signed in as {customer.email}</p>
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-white/10 text-white py-2 text-sm font-semibold"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/account");
                    }}
                  >
                    <User className="h-4 w-4" /> Account
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-full border border-white/30 text-white py-2 text-sm"
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full rounded-full bg-white text-brand-secondary py-2 text-sm font-semibold"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/login");
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    className="w-full rounded-full border border-white/30 text-white py-2 text-sm"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/register");
                    }}
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

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

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/candles", label: "Healing Candles" },
    { href: "/mood-refresher", label: "Mood Refresher" },
  ];

  return (
    <>
      <div className="bg-brand-dark text-brand-support/80 text-[11px] tracking-wider text-center py-1.5 font-sans hidden sm:block">
        FREE SHIPPING ON ORDERS ABOVE ₹999 &nbsp;|&nbsp; HANDCRAFTED WITH LOVE & INTENTION
      </div>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-600 hover:text-gray-900"
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-brand-secondary transition-colors duration-200 uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-brand-secondary hover:bg-gray-50 transition-all">
              <Search className="h-4 w-4" />
            </button>
            <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-brand-secondary hover:bg-gray-50 transition-all">
              <Heart className="h-4 w-4" />
            </button>
            {mounted && !loading && customer ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  className="h-9 px-3 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold uppercase tracking-wide flex items-center gap-2 hover:bg-gray-200 transition"
                  onClick={() => router.push("/account")}
                >
                  <User className="h-3.5 w-3.5" />
                  {customer.first_name ? `Hi, ${customer.first_name}` : "My Account"}
                </button>
                <button
                  className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-100 transition"
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
                  className="h-9 px-3 rounded-full bg-brand-secondary text-white text-xs font-semibold uppercase tracking-wide hover:bg-brand-accent transition"
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </button>
                <button
                  className="h-9 px-3 rounded-full border border-gray-300 text-gray-700 text-xs font-semibold uppercase tracking-wide hover:bg-gray-100 transition"
                  onClick={() => router.push("/register")}
                >
                  Join Now
                </button>
              </div>
            )}
            <button
              className="relative h-9 w-9 flex items-center justify-center rounded-full text-gray-600 hover:text-brand-secondary hover:bg-gray-50 transition-all"
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
          <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-5 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-gray-700 hover:text-brand-secondary uppercase tracking-wider font-sans"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {mounted && !loading && customer ? (
                <>
                  <p className="text-xs text-gray-500">Signed in as {customer.email}</p>
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-gray-100 text-gray-900 py-2 text-sm font-semibold"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/account");
                    }}
                  >
                    <User className="h-4 w-4" /> Account
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 text-gray-700 py-2 text-sm"
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
                    className="w-full rounded-full bg-brand-secondary text-white py-2 text-sm font-semibold"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/login");
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    className="w-full rounded-full border border-gray-300 text-gray-700 py-2 text-sm"
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

"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, MessageCircle, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const KNOWN_ROUTES = new Set([
  "/", "/about", "/shop", "/candles", "/courses", "/blogs", "/booking",
  "/contact", "/cart", "/checkout", "/login", "/register", "/account",
  "/order-history", "/order-confirmation", "/order-failed", "/booking-success",
  "/forgot-password", "/mood-refresher",
]);

function isLandingPageSlug(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  // Single-segment path not in known routes = landing page
  return segments.length === 1 && !KNOWN_ROUTES.has(pathname);
}

export function FloatingActionButton() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLandingPageSlug(pathname)) return null;

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-2 animate-slide-up">
          <Link
            href="/contact"
            className="flex items-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Contact</span>
          </Link>
          
          <Link
            href="/booking"
            className="flex items-center gap-2 bg-white text-teal-700 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-100"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Book Session</span>
          </Link>
        </div>
      )}

      {/* Main FAB */}
      <div className="flex flex-col gap-2">
        <button
          onClick={scrollToTop}
          className="h-10 w-10 bg-white hover:bg-emerald-50 text-emerald-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100"
        >
          <ArrowUp className="h-4 w-4 mx-auto" />
        </button>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-10 w-10 bg-gradient-brand hover:shadow-xl text-white rounded-lg shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-center">
            {isExpanded ? (
              <div className="transform rotate-45 transition-transform duration-300">
                <ArrowUp className="h-4 w-4" />
              </div>
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
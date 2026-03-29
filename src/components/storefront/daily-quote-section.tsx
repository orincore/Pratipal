"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface Quote {
  id: string;
  text: string;
  author?: string;
  date: string;
}

export function DailyQuoteSection() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((d) => {
        if (d.quote) {
          setQuote(d.quote);
          setTimeout(() => setVisible(true), 80);
        }
      })
      .catch(() => {});
  }, []);

  if (!quote) return null;

  return (
    <section
      className="relative overflow-hidden py-6 sm:py-8"
      style={{ background: "linear-gradient(135deg, #065f46 0%, #0f766e 50%, #047857 100%)" }}
    >
      {/* Ambient blobs */}
      <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="container max-w-4xl px-4 sm:px-6 relative">
        <div
          className={`transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {/* Label — centered above */}
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] uppercase tracking-[0.2em] text-white/90 font-medium">
              <Sparkles className="h-3 w-3 text-emerald-300" />
              Quote of the Day
            </span>
          </div>

          {/* Quote text */}
          <div className="relative text-center px-4 sm:px-12">
            <span
              aria-hidden="true"
              className="absolute -top-1 left-0 sm:left-6 text-6xl leading-none text-white/15 font-serif select-none"
            >
              &ldquo;
            </span>

            <p className="relative text-lg sm:text-xl font-serif text-white leading-relaxed italic">
              {quote.text}
            </p>

            {quote.author && (
              <p className="mt-2 text-sm text-emerald-200/80 font-medium tracking-wide text-right">
                — {quote.author}
              </p>
            )}

            <span
              aria-hidden="true"
              className="absolute -bottom-3 right-0 sm:right-6 text-6xl leading-none text-white/15 font-serif select-none"
            >
              &rdquo;
            </span>
          </div>

          {/* Button — centered below */}
          <div className="flex justify-center mt-5">
            <Link
              href="/quotes"
              className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              View All Quotes
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

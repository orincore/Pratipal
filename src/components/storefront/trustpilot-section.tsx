"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const h = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" className={h} fill={s <= rating ? "#00b67a" : "#dde1e7"}>
          <path d="M12 2l3.09 9.26H24l-7.27 5.27 2.77 8.52L12 19.77l-7.5 5.28 2.77-8.52L0 11.26h8.91z" />
        </svg>
      ))}
    </div>
  );
}

interface TPReview {
  id: string;
  title: string;
  text: string;
  rating: number;
  date: string;
  consumer: { name: string; countryCode: string; imageUrl: string | null; hasImage: boolean };
  verified: boolean;
}
interface TPData {
  businessName: string;
  trustScore: number;
  totalReviews: number;
  reviews: TPReview[];
}

export function TrustpilotSection() {
  const [data, setData] = useState<TPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trustpilot")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const reviews = data?.reviews ?? [];
  const score = data?.trustScore ?? null;
  const total = data?.totalReviews ?? null;
  const scoreLabel = !score ? "" : score >= 4.5 ? "Excellent" : score >= 3.5 ? "Great" : "Good";

  return (
    <section className="py-10 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 max-w-6xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg mb-3">
              <Heart className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium text-sm">Reviews</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              What Our Clients Say
            </h2>
          </div>

          <a
            href="https://www.trustpilot.com/review/pratipal.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md hover:border-[#00b67a]/40 transition"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 leading-none">{score !== null ? score.toFixed(1) : "—"}</div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">{scoreLabel || "Trustpilot"}</div>
            </div>
            <div>
              <StarRow rating={Math.round(score ?? 0)} size="md" />
              <div className="flex items-center gap-1.5 mt-1.5">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="#00b67a">
                  <path d="M12 2l3.09 9.26H24l-7.27 5.27 2.77 8.52L12 19.77l-7.5 5.28 2.77-8.52L0 11.26h8.91z" />
                </svg>
                <span className="text-sm font-bold text-gray-800">Trustpilot</span>
                <span className="text-xs text-gray-400">· {total !== null ? `${total} reviews` : "reviews"}</span>
              </div>
            </div>
          </a>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex gap-4 max-w-6xl mx-auto overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-[300px] h-44 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 max-w-6xl lg:mx-auto lg:px-0">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="snap-start flex-shrink-0 w-[280px] sm:w-[310px] bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#00b67a]/30 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <StarRow rating={r.rating} />
                  <div className="flex items-center gap-1 opacity-60">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#00b67a">
                      <path d="M12 2l3.09 9.26H24l-7.27 5.27 2.77 8.52L12 19.77l-7.5 5.28 2.77-8.52L0 11.26h8.91z" />
                    </svg>
                    <span className="text-[10px] font-semibold text-gray-500">Trustpilot</span>
                  </div>
                </div>
                {r.title && (
                  <p className="text-sm font-semibold text-slate-800 mb-1 line-clamp-1">{r.title}</p>
                )}
                <blockquote className="text-sm text-slate-600 leading-relaxed flex-1 mb-4 line-clamp-4">
                  {r.text}
                </blockquote>
                <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
                  {r.consumer.hasImage && r.consumer.imageUrl ? (
                    <img
                      src={r.consumer.imageUrl}
                      alt={r.consumer.name}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0 bg-gray-100"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {r.consumer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 leading-tight truncate">{r.consumer.name}</div>
                    <div className="text-xs text-slate-400">
                      {r.consumer.countryCode && `${r.consumer.countryCode} · `}
                      {r.date ? new Date(r.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                    </div>
                  </div>
                  {r.verified && (
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-[#00b67a] font-semibold flex-shrink-0">
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                        <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.54 6.54l-4 4a.75.75 0 01-1.08 0l-2-2a.75.75 0 011.08-1.08L7 9l3.46-3.46a.75.75 0 011.08 1.08z" />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* See all */}
        <div className="text-center mt-6">
          <a
            href="https://www.trustpilot.com/review/pratipal.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#00b67a] text-[#00b67a] text-sm font-semibold hover:bg-[#00b67a] hover:text-white transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2l3.09 9.26H24l-7.27 5.27 2.77 8.52L12 19.77l-7.5 5.28 2.77-8.52L0 11.26h8.91z" />
            </svg>
            See all {total !== null ? `${total} ` : ""}reviews on Trustpilot
          </a>
        </div>
      </div>
    </section>
  );
}

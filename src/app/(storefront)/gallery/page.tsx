"use client";

import { useEffect, useState, useCallback } from "react";
import { Images, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

const accents = [
  { bg: "from-emerald-600 to-teal-700", pill: "bg-emerald-100 text-emerald-700" },
  { bg: "from-teal-600 to-cyan-700",    pill: "bg-teal-100 text-teal-700" },
  { bg: "from-slate-700 to-slate-800",  pill: "bg-slate-100 text-slate-600" },
  { bg: "from-stone-700 to-stone-800",  pill: "bg-stone-100 text-stone-600" },
];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setImages(d.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const prev = useCallback(() =>
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const next = useCallback(() =>
    setLightbox((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  const featured = images[0] ?? null;
  const rest = images.slice(1);

  return (
    <>
      <div className="min-h-screen bg-stone-50">

        {/* Hero banner — identical to quotes page */}
        <div style={{ background: "linear-gradient(120deg, #0f172a 0%, #1b244a 40%, #0d3d2e 75%, #134e3a 100%)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-semibold mb-1" style={{ color: "#6ee7b7" }}>
                Gallery
              </p>
              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Gallery
              </h1>
              <p className="text-xs text-white/50 mt-1 hidden sm:block">
                Moments from our healing journey.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0 pb-1">
              {[
                { value: `${images.length}`, label: "Photos" },
                { value: "Always", label: "Growing" },
                { value: "Free", label: "To View" },
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

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

          {loading && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="break-inside-avoid rounded-2xl bg-stone-200 animate-pulse aspect-video" />
              ))}
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="text-center py-24 text-stone-400">
              <Images className="h-10 w-10 mx-auto mb-3 opacity-30" />
              No images yet. Check back soon.
            </div>
          )}

          {/* Featured — first image as hero card */}
          {!loading && featured && (
            <div className="mb-10">
              <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-600 font-semibold mb-3 flex items-center gap-1.5">
                <Images className="h-3 w-3" /> Featured
              </p>
              <div
                className="relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer group"
                style={{ background: "linear-gradient(135deg, #065f46 0%, #0f766e 50%, #047857 100%)" }}
                onClick={() => setLightbox(0)}
              >
                {/* Decorative blobs */}
                <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />

                <img
                  src={featured.url}
                  alt={featured.caption || "Featured gallery image"}
                  className="w-full aspect-video object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 sm:p-10">
                  {featured.caption && (
                    <p className="text-white text-lg sm:text-xl font-serif font-semibold leading-snug">
                      {featured.caption}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <ZoomIn className="h-4 w-4 text-emerald-300" />
                    <span className="text-emerald-200 text-xs font-medium">View full</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rest — masonry grid matching quotes card style */}
          {!loading && rest.length > 0 && (
            <>
              {featured && (
                <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold mb-4">
                  All Photos
                </p>
              )}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
                {rest.map((img, i) => {
                  const accent = accents[i % accents.length];
                  return (
                    <div
                      key={img.id}
                      className={`break-inside-avoid rounded-2xl bg-gradient-to-br ${accent.bg} shadow-md hover:shadow-xl transition-shadow duration-300 relative overflow-hidden cursor-pointer group`}
                      onClick={() => setLightbox(i + 1)}
                    >
                      <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/5 blur-xl pointer-events-none" />

                      <img
                        src={img.url}
                        alt={img.caption || "Gallery image"}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Caption bar */}
                      {img.caption && (
                        <div className="px-4 py-3">
                          <p className="text-sm text-white/90 font-medium leading-snug">{img.caption}</p>
                        </div>
                      )}

                      {/* Zoom hint overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <ZoomIn className="h-3.5 w-3.5 text-white" />
                          <span className="text-white text-xs font-medium">View full</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div
            className="relative max-w-5xl max-h-[88vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightbox].url}
              alt={images[lightbox].caption || "Gallery image"}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
            {images[lightbox].caption && (
              <p className="mt-4 text-white/80 text-sm sm:text-base text-center font-medium">
                {images[lightbox].caption}
              </p>
            )}
            <p className="mt-1.5 text-white/30 text-xs tracking-widest">
              {lightbox + 1} / {images.length}
            </p>
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}

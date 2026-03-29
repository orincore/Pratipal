"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Images, ZoomIn, ArrowRight } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

export function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setImages((d.images || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  const prev = useCallback(() => {
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const next = useCallback(() => {
    setLightbox((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

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

  if (images.length === 0) return null;

  return (
    <>
      <section className="py-6 sm:py-8 bg-gradient-to-br from-slate-50 to-emerald-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-3">
              <Images className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Gallery</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 bg-clip-text text-transparent">
              Featured Images
            </h2>
            <p className="text-sm text-stone-500 mt-1">Moments from our healing journey.</p>
          </div>

          {/* Grid — 16:9 ratio, medium size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 aspect-video"
                  onClick={() => setLightbox(idx)}
                >
                  <img
                    src={img.url}
                    alt={img.caption || "Gallery image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-4 sm:p-5">
                    {img.caption && (
                      <p className="text-white text-sm sm:text-base font-semibold leading-snug drop-shadow-md translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {img.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      <ZoomIn className="h-4 w-4 text-emerald-300" />
                      <span className="text-emerald-200 text-xs font-medium">View full</span>
                    </div>
                  </div>
                </div>
            ))}
          </div>

          {/* View all button */}
          <div className="flex justify-center mt-8">
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              View Full Gallery
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-800 transition"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-800 transition"
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
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-xl"
            />
            {images[lightbox].caption && (
              <p className="mt-4 text-gray-800 text-sm sm:text-base text-center font-medium">
                {images[lightbox].caption}
              </p>
            )}
            <p className="mt-1.5 text-gray-400 text-xs tracking-widest">
              {lightbox + 1} / {images.length}
            </p>
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-800 transition"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}

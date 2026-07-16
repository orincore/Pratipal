"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductMediaGalleryProps {
  images: string[];
  name: string;
  className?: string;
}

export function ProductMediaGallery({ images, name, className }: ProductMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const safeImages = images.length ? images : [
    "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
  ];

  const goPrev = () => setActiveIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % safeImages.length);

  // Escape to close, arrow keys to navigate, and lock page scroll while open.
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, safeImages.length]);

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Main image: full width on mobile, 480px on desktop.
          Fixed 1:1 (square) box so it never dominates the page — the image
          itself uses object-contain (not cover) so non-square source images
          are letterboxed within the box instead of having their edges
          cropped off. Clicking it opens a fullscreen lightbox. */}
      <div className="w-full sm:w-[480px] sm:mx-auto overflow-hidden rounded-2xl sm:rounded-[28px] bg-white shadow-sm border border-gray-100">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative w-full mx-auto block cursor-zoom-in group"
          style={{ aspectRatio: "1/1", maxHeight: "70vh" }}
          aria-label="View full-size image"
        >
          <Image
            key={safeImages[activeIndex]}
            src={safeImages[activeIndex]}
            alt={`${name} image ${activeIndex + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-contain object-center"
            priority
          />
          <span className="absolute bottom-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-4 w-4" />
          </span>
        </button>
      </div>

      {/* Always shown, even for a single image, so the layout stays
          consistent across every product regardless of image count. */}
      <div className="w-full sm:w-[480px] sm:mx-auto grid grid-cols-4 gap-1.5 sm:gap-2">
        {safeImages.map((img, index) => (
          <button
            key={img}
            type="button"
            onClick={() => setActiveIndex(index)}
            disabled={safeImages.length === 1}
            className={cn(
              "relative h-14 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border bg-white transition",
              activeIndex === index
                ? "border-gray-900 shadow-sm"
                : "border-gray-200 hover:border-gray-400"
            )}
          >
            <Image
              src={img}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] m-4 sm:m-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={safeImages[activeIndex]}
              src={safeImages[activeIndex]}
              alt={`${name} image ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {safeImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
              {activeIndex + 1} / {safeImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

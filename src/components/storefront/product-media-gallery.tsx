"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductMediaGalleryProps {
  images: string[];
  name: string;
  className?: string;
}

export function ProductMediaGallery({ images, name, className }: ProductMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images.length ? images : [
    "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
  ];

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Main image: full width on mobile, 480px on desktop */}
      <div className="w-full sm:w-[480px] sm:mx-auto overflow-hidden rounded-2xl sm:rounded-[28px] bg-white shadow-sm border border-gray-100">
        <div className="relative w-full" style={{ aspectRatio: "2/3", maxHeight: "80vh" }}>
          <Image
            key={safeImages[activeIndex]}
            src={safeImages[activeIndex]}
            alt={`${name} image ${activeIndex + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      {safeImages.length > 1 && (
        <div className="w-full sm:w-[480px] sm:mx-auto grid grid-cols-4 gap-1.5 sm:gap-2">
          {safeImages.map((img, index) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveIndex(index)}
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
      )}
    </div>
  );
}

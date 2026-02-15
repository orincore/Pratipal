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
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm border border-gray-100">
        <div className="relative w-full h-[440px] md:h-[520px]">
          <Image
            key={safeImages[activeIndex]}
            src={safeImages[activeIndex]}
            alt={`${name} image ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {safeImages.map((img, index) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-20 sm:h-24 rounded-2xl overflow-hidden border bg-white transition",
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

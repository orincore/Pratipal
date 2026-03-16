"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  base_price: number;
  frequency_options: { label: string; value: string; price: number }[];
  category: string;
}

export function BookingSection() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setServices(d.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startingPrice = (s: ServiceItem) =>
    s.frequency_options[0]?.price ?? s.base_price;

  return (
    <section id="services" className="py-10 sm:py-14 bg-[#f5f4ef]">
      <div className="container max-w-6xl px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <span className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-1 text-xs uppercase tracking-[0.25em] text-gray-500">
            Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 leading-tight">
            Healing &amp; Learning Programs
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            Curated offerings that combine clinical precision with intuitive care.
          </p>
        </div>

        {/* Service grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No services available right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-10">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative h-40 sm:h-44 w-full flex-shrink-0">
                  <Image
                    src={service.image_url || "/placeholder.jpg"}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs text-white/90 uppercase tracking-wider font-medium">
                    {service.category}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-gray-900 mb-1 leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
                    {service.description}
                  </p>
                  <p className="mt-3 text-xs text-gray-400">
                    Starts at{" "}
                    <span className="font-semibold text-emerald-700 text-sm">
                      ₹{startingPrice(service).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            <Calendar className="h-4 w-4" />
            Book Consultation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

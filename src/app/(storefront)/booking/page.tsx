import { Metadata } from "next";
import { BookingPageClient } from "@/components/booking/booking-page-client";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Services & Booking | Pratipal Healing",
  description: "Book your personalized healing session — One to One, Need Based, Group Healing, or Learning Curve.",
};

async function getActiveServices() {
  try {
    await connectDB();
    const services = await Service.find({ is_active: true })
      .sort({ display_order: 1 })
      .lean() as any[];
    return services;
  } catch {
    return [];
  }
}

export default async function BookingPage() {
  const services = await getActiveServices();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": services.map((s: any) => ({
      "@type": "Service",
      name: s.seo_title || s.title,
      description: s.seo_description || s.description,
      ...(s.seo_keywords ? { keywords: s.seo_keywords } : {}),
      image: s.image_url || undefined,
      offers: s.frequency_options?.length
        ? s.frequency_options.map((f: any) => ({
            "@type": "Offer",
            name: f.label,
            price: f.price,
            priceCurrency: "INR",
          }))
        : [{
            "@type": "Offer",
            price: s.base_price,
            priceCurrency: "INR",
          }],
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pratipal.in"}/booking`,
    })),
  };

  return (
    <>
      <Script
        id="services-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BookingPageClient />
    </>
  );
}

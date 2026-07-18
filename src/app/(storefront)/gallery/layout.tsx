import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Gallery | ${siteConfig.name}`,
  description:
    `Browse the ${siteConfig.name} gallery — moments, products, and healing experiences captured from our wellness journey.`,
  alternates: { canonical: "/gallery" },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

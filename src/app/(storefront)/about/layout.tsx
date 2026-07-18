import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name}`,
  description:
    `Learn about ${siteConfig.name} — our story, our mission, and the intention behind our crystal-infused healing candles, essential oil roll-ons, and wellness offerings.`,
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Shop | ${siteConfig.name}`,
  description:
    "Shop crystal-infused healing candles, therapeutic essential oil roll-ons, and energy intention salts — crafted with love and intention.",
  alternates: { canonical: "/shop" },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

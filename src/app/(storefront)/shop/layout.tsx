import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Pratipal",
  description:
    "Shop crystal-infused healing candles, therapeutic essential oil roll-ons, and energy intention salts — crafted with love and intention.",
  alternates: { canonical: "/shop" },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

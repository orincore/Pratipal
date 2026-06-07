import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Pratipal",
  description:
    "Learn about Pratipal — our story, our mission, and the intention behind our crystal-infused healing candles, essential oil roll-ons, and wellness offerings.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

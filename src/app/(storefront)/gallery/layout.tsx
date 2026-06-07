import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | Pratipal",
  description:
    "Browse the Pratipal gallery — moments, products, and healing experiences captured from our wellness journey.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

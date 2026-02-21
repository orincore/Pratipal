import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import LogoMark from "@/app/assets/logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
  title: "Pratipal | Healing & Wellness Store",
  description:
    "Discover crystal-infused healing candles, therapeutic essential oil roll-ons, and energy intention salts crafted with love and intention.",
  icons: {
    icon: LogoMark.src,
    shortcut: LogoMark.src,
    apple: LogoMark.src,
  },
  openGraph: {
    title: "Pratipal | Healing & Wellness Store",
    description:
      "Discover crystal-infused healing candles, therapeutic essential oil roll-ons, and energy intention salts crafted with love and intention.",
    images: [LogoMark.src],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

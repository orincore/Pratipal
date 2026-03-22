import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";
import LogoMark from "@/app/assets/logo.png";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

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
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-head"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-W88FQD7L');`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${inter.className} bg-stone-50 text-stone-800`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W88FQD7L"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <FloatingActionButton />
        <Toaster position="bottom-right" richColors />
        {/* Trustpilot bootstrap — loaded once, works across all pages */}
        <Script
          id="trustpilot-bootstrap"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

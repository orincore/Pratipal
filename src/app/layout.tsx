import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { SITE_URL } from "@/lib/seo";
import { GOOGLE_FONTS_HREF } from "@/lib/fonts";
import { siteConfig } from "@/config/site.config";

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
  metadataBase: new URL(SITE_URL),
  title: siteConfig.seo.defaultTitle,
  description: siteConfig.seo.defaultDescription,
  icons: {
    icon: siteConfig.logo.header,
    shortcut: siteConfig.logo.header,
    apple: siteConfig.logo.header,
  },
  openGraph: {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    images: [siteConfig.logo.header],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Selectable web fonts (editors + public pages) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
        {/* Google Tag Manager */}
        {siteConfig.analytics.gtmId && (
          <Script
            id="gtm-head"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${siteConfig.analytics.gtmId}');`,
            }}
          />
        )}
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${inter.className} bg-stone-50 text-stone-800`}>
        {/* Google Tag Manager (noscript) */}
        {siteConfig.analytics.gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${siteConfig.analytics.gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
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

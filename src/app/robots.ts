import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/account",
          "/cart",
          "/checkout",
          "/login",
          "/register",
          "/forgot-password",
          "/order-confirmation",
          "/order-failed",
          "/order-history",
          "/booking-success",
          "/thank-you",
          "/p/", // internal landing-page previews (noindex)
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

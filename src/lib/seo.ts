import type { Metadata } from "next";

/**
 * Single source of truth for the site's canonical origin.
 *
 * Override in production via NEXT_PUBLIC_SITE_URL. The default is the canonical
 * host (www) so that canonical tags, the sitemap and robots.txt all agree —
 * mismatched hosts (www vs non-www) cause duplicate-content issues in search.
 */
export const SITE_URL = normalizeOrigin(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.pratipal.in"
);

function normalizeOrigin(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Build an absolute URL from a site-relative path (e.g. "/shop"). */
export function absoluteUrl(path = "/"): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${suffix === "/" ? "" : suffix}` || SITE_URL;
}

/**
 * Helper to attach a self-referencing canonical to a page's metadata.
 * Pass a site-relative path; Next.js resolves it against `metadataBase`.
 */
export function canonical(path = "/"): Metadata {
  return {
    alternates: {
      canonical: path.startsWith("/") ? path : `/${path}`,
    },
  };
}

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import getDB from "@/lib/db";

// Regenerate the sitemap at most once an hour so newly published
// products / courses / blogs show up without rebuilding the site.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/**
 * Static, always-available storefront routes.
 * Private/transactional routes (cart, checkout, account, auth, order-*) and
 * noindex landing pages are intentionally excluded — see robots.ts.
 */
const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: Entry["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/courses", changeFrequency: "weekly", priority: 0.9 },
  { path: "/booking", changeFrequency: "weekly", priority: 0.8 },
  { path: "/candles", changeFrequency: "weekly", priority: 0.8 },
  { path: "/mood-refresher", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/gallery", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blogs", changeFrequency: "daily", priority: 0.7 },
  { path: "/quotes", changeFrequency: "daily", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/shipping-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
];

function toDate(value: unknown): Date {
  const d = value ? new Date(value as string) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: Entry[] = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let dynamicEntries: Entry[] = [];

  try {
    const { Product, Course, Blog } = await getDB();

    const [products, courses, blogs] = await Promise.all([
      Product.find({ is_active: true })
        .select("slug updated_at")
        .lean(),
      Course.find({ status: "published" })
        .select("slug updated_at")
        .lean(),
      Blog.find({ status: "published" })
        .select("slug updated_at")
        .lean(),
    ]);

    const productEntries: Entry[] = products
      .filter((p: any) => p.slug)
      .map((p: any) => ({
        url: absoluteUrl(`/product/${p.slug}`),
        lastModified: toDate(p.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const courseEntries: Entry[] = courses
      .filter((c: any) => c.slug)
      .map((c: any) => ({
        url: absoluteUrl(`/courses/${c.slug}`),
        lastModified: toDate(c.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const blogEntries: Entry[] = blogs
      .filter((b: any) => b.slug)
      .map((b: any) => ({
        url: absoluteUrl(`/blogs/${b.slug}`),
        lastModified: toDate(b.updated_at),
        changeFrequency: "monthly",
        priority: 0.6,
      }));

    dynamicEntries = [...productEntries, ...courseEntries, ...blogEntries];
  } catch (error) {
    // Never let a DB hiccup take down the whole sitemap — serve static routes.
    console.error("sitemap: failed to load dynamic routes", error);
  }

  return [...staticEntries, ...dynamicEntries];
}

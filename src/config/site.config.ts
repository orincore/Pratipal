/**
 * Thin pass-through so app code can keep importing "@/config/site.config".
 * The real config lives at the project root (../../brand-config/site.config.ts)
 * because tailwind.config.ts needs to read it too, and Turbopack's Tailwind
 * config loader can only resolve sibling files at the project root.
 *
 * To swap brands, edit ../../brand-config/site.config.ts, not this file.
 */
export { siteConfig } from "../../brand-config/site.config";
export type { SiteConfig, SiteBrandKey, BrandColors, ContactInfo, SocialLinks, FounderProfile } from "../../brand-config/site-config.types";

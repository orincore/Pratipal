/**
 * Shared types for the per-deployment brand config. See site.config.ts for
 * how these are wired up.
 */

export type SiteBrandKey = "pratipal" | "adhyatmiksutraa";

export interface BrandColors {
  primary: string;
  secondary: string;
  peacock: string;
  earth: string;
  sand: string;
  accent: string;
  support: string;
  cta: string;
  cream: string;
  warm: string;
  dark: string;
}

export interface ContactInfo {
  /** Used as the "from"/reply-to on transactional emails and most public mentions. */
  supportEmail: string;
  /** Secondary inbox shown alongside supportEmail on some pages, if the business uses one. */
  secondaryEmail?: string;
  /** Primary public phone number, formatted for display, e.g. "+91 76050 72424". */
  phone: string;
  /** WhatsApp number, digits only with country code, e.g. "917605072424" (used in wa.me links). */
  whatsapp: string;
  /** Secondary phone number shown on some pages, if the business uses one. */
  secondaryPhone?: string;
  address: {
    line1?: string;
    city: string;
    region?: string;
    country: string;
  };
  businessHours: Array<{ day: string; hours: string }>;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export interface FounderProfile {
  name: string;
  title: string;
  bioParagraphs: string[];
  credentials: string[];
  quote?: string;
  achievements: string[];
  stats: Array<{ value: string; label: string; sub?: string }>;
  /** Tag-cloud of practices/modalities/services offered. */
  modalities: string[];
}

export interface SiteConfig {
  key: SiteBrandKey;
  name: string;
  legalName?: string;
  tagline: string;
  /** Canonical origin, no trailing slash. Overridable per-deployment via NEXT_PUBLIC_SITE_URL. */
  domain: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
  };
  logo: {
    /** Header/admin/login/favicon/OG image. Can be a local /assets path or a remote URL. */
    header: string;
    /** Taller wordmark used in the storefront footer. */
    footer: string;
    /** Certification badge shown next to footer contact info. Omit to hide. */
    isoBadge?: string;
  };
  colors: BrandColors;
  contact: ContactInfo;
  social: SocialLinks;
  analytics: {
    /** Google Tag Manager container ID. Omit to skip GTM entirely for this deployment. */
    gtmId?: string;
    /** Trustpilot domain, e.g. "pratipal.in". Omit to hide Trustpilot links/widgets. */
    trustpilotDomain?: string;
  };
  /** Display name shown in the Razorpay checkout modal. */
  razorpayDisplayName: string;
  email: {
    /** "From" display name on transactional emails, e.g. "Pratipal Healing". */
    fromName: string;
  };
  /** Short line shown under the footer copyright, e.g. "Integrating Healing with Routine". */
  copyrightTagline?: string;
  founder: FounderProfile;
}

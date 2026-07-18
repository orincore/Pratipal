import type { SiteConfig } from "./site-config.types";

/**
 * Adhyatmiksutraa's brand config, extracted from the live site
 * (adhyatmiksutraa.com) on 2026-07-19. To test this deployment locally:
 *   1. Back up site.config.ts (e.g. copy it to site.config.ts.bak).
 *   2. Replace its contents with: export { adhyatmiksutraa as siteConfig } from "./site.config.adhyatmiksutraa";
 *   3. Restart the dev server (tailwind.config.ts reads this at build time too).
 * To go back to Pratipal, restore the backed-up site.config.ts.
 *
 * Fields flagged below with "confirm with client" were not published on the
 * source site and need a real value before this goes live.
 */
export const adhyatmiksutraa: SiteConfig = {
  key: "adhyatmiksutraa",
  name: "Adhyatmik Sutraa",
  tagline: "Connect With Your Inner Self",
  domain: "https://adhyatmiksutraa.com",
  seo: {
    defaultTitle: "Adhyatmik Sutraa | Tarot, Numerology & Angel Healing",
    defaultDescription:
      "Adhyatmik Sutraa helps you connect with your inner self. Our tarot reader, numerologist, and angel healer Sonali Bhattacharya provides easy-to-follow guidance and insightful courses.",
  },
  logo: {
    // Sourced directly from the live WordPress site — swap for a local
    // /assets path once you have the original logo file.
    header: "https://adhyatmiksutraa.com/wp-content/uploads/2025/09/logo.png",
    footer: "https://adhyatmiksutraa.com/wp-content/uploads/2025/09/logo.png",
    // No ISO/certification badge on the source site — leave unset to hide it.
  },
  colors: {
    // Extracted from the live site's Elementor global color palette (post-8.css).
    primary: "#7B3F7A",
    secondary: "#35093C",
    peacock: "#7B3F7A",
    earth: "#D5D4C0",
    sand: "#EEC6BC",
    accent: "#FD4380",
    support: "#7675B9",
    cta: "#FD4380",
    cream: "#EEC6BC",
    warm: "#D89E2E",
    dark: "#240429",
  },
  contact: {
    // Footer (site-wide) pair — treated as the authoritative one.
    supportEmail: "adhyatmiksutraaonline@gmail.com",
    phone: "+91 86089 20776",
    whatsapp: "918608920776",
    // "Contact Our Coach" block on the homepage/contact page uses a second pair — confirm with client which is preferred.
    secondaryEmail: "adhyatmiksutraa@gmail.com",
    secondaryPhone: "+91 78712 89207",
    address: { city: "", region: "", country: "India" }, // confirm with client — not published on the source site
    businessHours: [], // confirm with client — not published on the source site
  },
  social: {
    instagram: "https://www.instagram.com/adhyatmiksutraa/",
    facebook: "https://www.facebook.com/adhyatmiksutra",
    youtube: "https://www.youtube.com/@adhyatmiksutraabysonali",
  },
  analytics: {
    // No GTM/Trustpilot found on the source site — leave unset until the client provides IDs.
  },
  razorpayDisplayName: "Adhyatmik Sutraa",
  email: {
    fromName: "Adhyatmik Sutraa",
  },
  founder: {
    name: "Sonali Bhattacharya",
    title: "Tarot Reader, Numerologist & Angel Healer",
    bioParagraphs: [
      "Adhyatmik Sutraa is helping its clients on a transformational journey of mind, body, and soul. Most people are looking for guidance to go ahead in their life, but they are stuck in the loop. A few want closure, and others are looking for direction. When you connect with Adhyatmik Sutraa, you will receive spiritual, emotional, and energy healing by our renowned life coach and healer Sonali Bhattacharya.",
      "She helps clients overcome their emotional and spiritual blockages, and supports them in stepping into aligned and purpose-driven living. Most clients reach her for confidence building, deep healing, transformed lives, vibrational alignment, relationship healing, and much more.",
      "Sonali started her journey as a reiki healer, and then continued on to become a numerologist, tarot reader, and healer. Being a trainer, she has been in the occult field for the last 10 years and helped people with holistic healing.",
    ],
    credentials: ["Reiki Healer", "Numerologist", "Tarot Reader", "Angel Healer", "Life Coach"],
    achievements: [
      "Guided over 10,000 people and counting",
      "10+ years of experience in the occult and spiritual healing field",
      "Offers 50+ courses in occult and spiritual healing",
      "Confidential, trustworthy, and customized sessions with no hidden charges",
    ],
    stats: [
      { value: "10,000+", label: "People Guided" },
      { value: "10+", label: "Years Experience" },
      { value: "12+", label: "Courses Offered" },
    ],
    modalities: [
      "Angel Healing", "Tarot Card Reading", "Black Magic Removal", "Crystal Healing",
      "Master Merlin", "Salt Magic", "Lama Fera", "Laal Kitab", "Hanuman Reiki",
      "Sacred Rituals, Verses & Texts", "Maa Kamakhya Devi Sadhna", "Maa Baglamukhi and Maa Kali",
    ],
  },
};

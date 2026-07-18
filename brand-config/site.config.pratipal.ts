import type { SiteConfig } from "./site-config.types";

/**
 * Pratipal's brand config — this is the current production data.
 * Treat this file as the backup/canonical copy: site.config.ts re-exports
 * this by default. Do not delete or overwrite this file when testing
 * another brand — swap site.config.ts's export instead.
 */
export const pratipal: SiteConfig = {
  key: "pratipal",
  name: "Pratipal",
  tagline: "Healing & Wellness Store",
  domain: "https://www.pratipal.in",
  seo: {
    defaultTitle: "Pratipal | Healing & Wellness Store",
    defaultDescription:
      "Discover crystal-infused healing candles, therapeutic essential oil roll-ons, and energy intention salts crafted with love and intention.",
  },
  logo: {
    header: "/assets/logo.png",
    footer: "/assets/footer_logo.png",
    isoBadge: "/assets/iso.png",
  },
  colors: {
    primary: "#232d5f",
    secondary: "#1b244a",
    peacock: "#232d5f",
    earth: "#edeae3",
    sand: "#d4c6ad",
    accent: "#f2c094",
    support: "#2f6f8a",
    cta: "#d97745",
    cream: "#f5efe4",
    warm: "#e0d4c1",
    dark: "#081629",
  },
  contact: {
    supportEmail: "connect@pratipal.in",
    phone: "+91 76050 72424",
    whatsapp: "917605072424",
    address: { city: "Mumbai", region: "MH", country: "India" },
    businessHours: [
      { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
      { day: "Saturday", hours: "10:00 AM – 4:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
  },
  social: {
    instagram: "https://www.instagram.com/pratipalofficial.in",
    facebook: "https://facebook.com/pratipalofficial",
    youtube: "https://youtube.com/@pratipalbyaparnaa",
  },
  analytics: {
    gtmId: "GTM-W88FQD7L",
    trustpilotDomain: "pratipal.in",
  },
  razorpayDisplayName: "Pratipal",
  email: {
    fromName: "Pratipal Healing",
  },
  copyrightTagline: "Integrating Healing with Routine 🇮🇳",
  founder: {
    name: "Dr. Aparnaa Singh",
    title: "Integrative Healing & Consciousness Coach",
    bioParagraphs: [
      "Dr. Aparnaa Singh is an Integrative Healing & Consciousness Coach and certified Naturopathy Practitioner with over 9 years of experience in holistic and energy-based healing. Her work seamlessly blends science, spirituality, and natural therapies to help individuals restore harmony across body, mind, and soul.",
      "With a doctorate in Naturopathy & Yoga, qualified practitioner & trainer of Acupressure (Ayurvedic & Chinese), Reiki Grand Master, Fertility Coach & a healer of 15 various healing techniques — she is on a mission to reform & revolutionise the costly, non-affordable wellness industry.",
      "As the founder of Reiki Magic and Pratipal, Dr. Aparnaa creates safe, nurturing spaces where clients can realign their energy, deepen self-awareness, and manifest a more empowered life.",
    ],
    credentials: ["Reiki Grand Master", "Naturopathy Dr.", "Fertility Coach"],
    quote:
      "Our vision is to nurture a community of healers and seekers — providing structured training, collective treatments, retreat camps, and personalized guidance for day-to-day challenges.",
    achievements: [
      "Successful assistance to women in overcoming health & infertility challenges",
      "Empowering 500+ healers in launching their spiritual businesses",
      "Mentored 1000+ families towards a medicine-free life",
      "Doctorate in Naturopathy & Yoga with 15+ certified healing modalities",
      "Certified Acupressure (Ayurvedic & Chinese), Reiki Grand Master, Fertility Coach",
    ],
    stats: [
      { value: "1000+", label: "Families Guided", sub: "Towards medicine-free living" },
      { value: "500+", label: "Healers Empowered", sub: "Launched their spiritual business" },
      { value: "15+", label: "Healing Modalities", sub: "Certified & practiced" },
      { value: "9+", label: "Years Experience", sub: "In holistic energy healing" },
    ],
    modalities: [
      "Reiki Grand Master", "Naturopathy", "Acupressure (Ayurvedic)", "Acupressure (Chinese)",
      "EFT Tapping", "Tarot Reading", "Fertility Coaching", "Past Life Regression",
      "Chakra Balancing", "Sound Healing", "Yoga", "Crystal Therapy",
      "NLP Techniques", "Breathwork", "Meditation Guidance",
    ],
  },
};

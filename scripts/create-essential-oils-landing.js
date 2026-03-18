require("dotenv/config");
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

const LandingPageSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    content: mongoose.Schema.Types.Mixed,
    theme: mongoose.Schema.Types.Mixed,
    seo_title: String,
    seo_description: String,
    status: { type: String, default: "draft" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const LandingPage =
  mongoose.models.LandingPage ||
  mongoose.model("LandingPage", LandingPageSchema);

const templateData = {
  sectionOrder: ["hero", "marquee", "why", "program", "about", "testimonials", "stats", "invitation", "footer"],
  mediaSettings: {},
  colors: {
    primary: "#C17F5A",
    secondary: "#8B5E3C",
    accent: "#D4A574",
    heroBg: "#FDF6EE",
    darkBg: "#3D2B1F",
    bodyBg: "#FEFAF5",
  },
  hero: {
    badge: "Stop Guessing With Essential Oils",
    headline: "Learn Therapeutic, Energetic & Ritual Use of Essential Oils for",
    highlightedWord: "Healing",
    subheadline: "Healing, Energy Work & Conscious Creation — safely and with intention.",
    bulletPoints: [
      "Felt confused about which oil to use",
      "Wondered if you're using too much or too little",
      "Tried blends that smell nice but don't really work",
      "Followed Pinterest or Instagram recipes without results",
      "Felt unsure about safety, dilution, or application",
    ],
    ctaButtonText: "Join the Masterclass Now",
    ctaButtonLink: "#register",
    heroImage: "",
    heroMedia: [],
    carouselAutoplay: false,
    carouselInterval: 6000,
    floatingStats: [
      { label: "Experience", value: "8+ Years" },
      { label: "Focus", value: "Healing" },
    ],
    visible: true,
  },
  marquee: {
    items: [
      "Therapeutic Use",
      "Energetic Blending",
      "Ritual Oils",
      "Safe Dilution",
      "Conscious Creation",
      "Healing with Intention",
    ],
    enabled: true,
  },
  why: {
    title: "Most People Are Using Essential Oils Wrong",
    subtitle: "It's not because essential oils don't work. It's because no one taught you how to use them correctly.",
    points: [
      {
        title: "Smelling good is NOT healing",
        description: "Blends alone are not enough. Where and how you apply essential oils changes everything. That's exactly what this masterclass teaches.",
        image: "",
      },
      {
        title: "You're not alone",
        description: "If you've tried blends that smell nice but don't really work, or followed Pinterest recipes without results — this is for you.",
        image: "",
      },
      {
        title: "Here's the Truth",
        description: "Blends alone are NOT enough. Where and how you apply essential oils changes everything. Stop guessing and start healing with intention.",
        image: "",
      },
    ],
    visible: true,
  },
  about: {
    name: "Dr. Aparnaa Singh",
    title: "Meet Your Trainer",
    description: "Dr. Aparnaa Singh is a Naturopathy & Holistic Healing Practitioner, Founder of Pratipal, and an intention-based candle and ritual salt maker with 8+ years of hands-on experience working with essential oils in healing and product formulation.\n\nShe bridges therapeutic knowledge, energetic intelligence, and spiritual integrity to teach essential oils in a grounded, practical, and safe way — helping healers, makers, and conscious creators move beyond guesswork into confident, responsible practice.\n\nDr. Aparnaa's approach is practitioner-led, safety-first, and focused on integrating healing into everyday life.",
    image: "",
    credentials: [
      "Naturopathy & Holistic Healing Practitioner",
      "Founder of Pratipal",
      "8+ Years with Essential Oils",
      "Intention-based Candle & Ritual Salt Maker",
    ],
    visible: true,
  },
  logos: { title: "Featured In", logos: [], enabled: false },
  gallery: { title: "Gallery", subtitle: "", images: [], visible: false },
  stats: {
    title: "Who This Masterclass Is For",
    subtitle: "This masterclass is for individuals who feel called to work with essential oils with depth, safety, and intention — not just for scent, but for real healing, energy work, and conscious creation.",
    stats: [
      { value: "✔", label: "Healers & Coaches" },
      { value: "✔", label: "Spiritual Practitioners" },
      { value: "✔", label: "Candle & Soap Makers" },
      { value: "✔", label: "Conscious Creators" },
    ],
    ctaButtonText: "Reserve Your Seat",
    ctaButtonLink: "#register",
    backgroundImage: "",
    visible: true,
  },
  testimonials: {
    title: "What Our Students Say",
    subtitle: "Real experiences from healers, makers, and conscious creators",
    items: [
      {
        name: "Priya M.",
        quote: "I finally understand how to use essential oils safely and with intention. This masterclass changed everything for me.",
        image: "",
        role: "Holistic Practitioner",
      },
      {
        name: "Sneha R.",
        quote: "Dr. Aparnaa's approach is so grounded and practical. I now create my own blends with confidence.",
        image: "",
        role: "Candle Maker",
      },
      {
        name: "Ananya K.",
        quote: "The section on acupressure-inspired application points was a game changer. I feel results I never felt before.",
        image: "",
        role: "Self-Healing Journey",
      },
    ],
    visible: true,
  },
  program: {
    title: "What You'll Learn in This Masterclass",
    subtitle: "Stop guessing with essential oils and learn how to use them correctly, safely, and intentionally for healing, energy work, rituals, and conscious product creation.",
    points: [
      { title: "Therapeutic Use", description: "Use essential oils for stress, sleep, pain, digestion & emotional balance", icon: "🌿" },
      { title: "Safe Blending", description: "Create safe, effective blends using correct dilution & synergy", icon: "⚗️" },
      { title: "Energetic & Emotional Blends", description: "Design blends for grounding, confidence & heart healing", icon: "💚" },
      { title: "Spiritual & Ritual Use", description: "Learn spiritual & ritual uses of essential oils with integrity", icon: "🕯️" },
      { title: "Acupressure Application", description: "Apply oils on acupressure-inspired points for deeper results", icon: "✋" },
      { title: "Conscious Product Creation", description: "Create intention-based oils, candles, salts & signature blends", icon: "🌸" },
    ],
    ctaButtonText: "Join the Masterclass Now",
    ctaButtonLink: "#register",
    visible: true,
  },
  bonus: { title: "Exclusive Bonuses", items: [], enabled: false },
  invitation: {
    enabled: true,
    badgeEmoji: "🌿",
    badgeText: "Limited Seats",
    title: "Ready to Begin Your Essential Oil Journey?",
    subtitle: "Stop guessing and start using essential oils with clarity, confidence, and intention.",
    dateLabel: "Format",
    dateValue: "Live Masterclass",
    timeLabel: "Access",
    timeValue: "Lifetime Recording",
    venueLabel: "Platform",
    venueValue: "Online (Private Link)",
    availabilityText: "Limited spots available. Reserve yours now.",
    buttonText: "Reserve Your Seat",
    formTitle: "Join the Essential Oil Masterclass",
    formHighlights: ["Safe & Practical", "Beginner Friendly", "Lifetime Access"],
    formButtonText: "Reserve My Seat",
    successTitle: "You're registered!",
    successDescription: "We'll send your access link via email and WhatsApp shortly.",
    supportText: "Join healers, makers & conscious creators learning with intention.",
  },
  footer: {
    cta: {
      title: "Stop Guessing. Start Healing.",
      subtitle: "Join the Essential Oil Masterclass and learn how to work with oils for healing, energy work, rituals, and conscious creation — safely and responsibly.",
      ctaButtonText: "Join the Masterclass Now",
      ctaButtonLink: "#register",
    },
    copyright: `© ${new Date().getFullYear()} Pratipal. All Rights Reserved.`,
    links: [
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Contact", url: "/contact" },
    ],
    enabled: true,
  },
  floatingButton: { enabled: true, section: "invitation" },
};

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const existing = await LandingPage.findOne({ slug: "essential-oils" });

  const payload = {
    title: "Essential Oil Masterclass",
    slug: "essential-oils",
    content: { templateData },
    theme: { primary: "#C17F5A", secondary: "#8B5E3C", accent: "#D4A574", background: "#FEFAF5" },
    seo_title: "Essential Oil Masterclass — Therapeutic, Energetic & Ritual Use | Pratipal",
    seo_description: "Learn to use essential oils correctly for healing, energy work, rituals, and conscious creation. Join Dr. Aparnaa Singh's masterclass.",
    status: "published",
  };

  if (existing) {
    await LandingPage.findByIdAndUpdate(existing._id, payload);
    console.log("✅ Updated: /essential-oils");
  } else {
    await LandingPage.create(payload);
    console.log("✅ Created: /essential-oils");
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

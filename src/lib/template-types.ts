// ---------------------------------------------------------------------------
// Fixed Landing Page Template – Data Types
// All landing pages share the same UI/UX layout. Only content is dynamic.
// ---------------------------------------------------------------------------

export interface TemplateColors {
  primary: string;       // Main brand color (buttons, highlights, accents)
  secondary: string;     // Secondary color (gradients, hover states)
  accent: string;        // Accent color (badges, small highlights)
  heroBg: string;        // Hero section background
  darkBg: string;        // Dark sections background
  bodyBg: string;        // Page body background
}

export interface HeroSection {
  badge: string;                 // e.g. "You're struggling because"
  headline: string;              // Main headline
  highlightedWord: string;       // Word with underline decoration (e.g. "Frequency")
  subheadline: string;           // Subtext below headline
  bulletPoints: string[];        // List of bullet points
  ctaButtonText: string;         // CTA button label
  ctaButtonLink: string;         // CTA button URL
  heroImage: string;             // Main hero image URL
  floatingStats: { label: string; value: string }[]; // Floating stat badges
  visible: boolean;
}

export interface MarqueeSection {
  items: string[];               // Scrolling text items
  enabled: boolean;
}

export interface WhySection {
  title: string;                 // e.g. "Why Effort Isn't Working Anymore"
  subtitle: string;
  points: { title: string; description: string; image: string }[];
  visible: boolean;
}

export interface AboutSection {
  name: string;                  // e.g. "Riha Aggarwal"
  title: string;                 // e.g. "About the Coach"
  description: string;
  image: string;
  credentials: string[];
  visible: boolean;
}

export interface LogoSection {
  title: string;                 // e.g. "Featured In"
  logos: { image: string; alt: string }[];
  enabled: boolean;
}

export interface GallerySection {
  title: string;                 // e.g. "And Lots of Energy Came to Us"
  subtitle: string;
  images: { url: string; caption: string }[];
  visible: boolean;
}

export interface StatsSection {
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  ctaButtonText: string;
  ctaButtonLink: string;
  backgroundImage: string;
  visible: boolean;
}

export interface TestimonialItem {
  name: string;
  quote: string;
  image: string;
  role: string;
}

export interface TestimonialsSection {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
  visible: boolean;
}

export interface ProgramPoint {
  title: string;
  description: string;
  icon: string;                  // emoji or icon name
}

export interface ProgramSection {
  title: string;
  subtitle: string;
  points: ProgramPoint[];
  ctaButtonText: string;
  ctaButtonLink: string;
  visible: boolean;
}

export interface BonusItem {
  title: string;
  description: string;
  image: string;
}

export interface BonusSection {
  title: string;
  items: BonusItem[];
  enabled: boolean;
}

export interface InvitationSection {
  enabled: boolean;
  badgeEmoji: string;
  badgeText: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  dateValue: string;
  timeLabel: string;
  timeValue: string;
  venueLabel: string;
  venueValue: string;
  availabilityText: string;
  buttonText: string;
  formTitle: string;
  formHighlights: string[];
  formButtonText: string;
  successTitle: string;
  successDescription: string;
  supportText: string;
}

export interface FooterCTA {
  title: string;
  subtitle: string;
  ctaButtonText: string;
  ctaButtonLink: string;
}

export interface FooterSection {
  cta: FooterCTA;
  copyright: string;
  links: { label: string; url: string }[];
  enabled: boolean;
}

export type FloatingButtonSource = "hero" | "program" | "invitation" | "footer";

export interface FloatingButtonSettings {
  enabled: boolean;
  section: FloatingButtonSource;
}

// ---------------------------------------------------------------------------
// Complete template data
// ---------------------------------------------------------------------------
export interface MediaFieldOptions {
  autoplay: boolean;
  mute: boolean;
}

export const DEFAULT_MEDIA_SETTINGS: MediaFieldOptions = {
  autoplay: false,
  mute: true,
};

export interface LandingTemplateData {
  colors: TemplateColors;
  hero: HeroSection;
  marquee: MarqueeSection;
  why: WhySection;
  about: AboutSection;
  logos: LogoSection;
  gallery: GallerySection;
  stats: StatsSection;
  testimonials: TestimonialsSection;
  program: ProgramSection;
  bonus: BonusSection;
  invitation: InvitationSection;
  footer: FooterSection;
  floatingButton: FloatingButtonSettings;
  sectionOrder?: string[];
  mediaSettings?: Record<string, MediaFieldOptions>;
}

// ---------------------------------------------------------------------------
// Default template data (placeholder content)
// ---------------------------------------------------------------------------
export const DEFAULT_TEMPLATE_DATA: LandingTemplateData = {
  sectionOrder: ['hero', 'marquee', 'why', 'about', 'logos', 'gallery', 'stats', 'testimonials', 'program', 'invitation', 'bonus', 'footer'],
  mediaSettings: {},
  colors: {
    primary: "#F5A623",
    secondary: "#7B2D8E",
    accent: "#E8552D",
    heroBg: "#FFF8E7",
    darkBg: "#1A1A2E",
    bodyBg: "#FFFFFF",
  },
  hero: {
    badge: "You're struggling because",
    headline: "You're Not Matching the",
    highlightedWord: "Frequency",
    subheadline: "Discover the hidden pattern that's keeping you stuck and learn how to break free.",
    bulletPoints: [
      "You work hard but results don't match your effort",
      "You feel stuck in the same patterns",
      "You know there's more to life but can't access it",
    ],
    ctaButtonText: "Join the Masterclass",
    ctaButtonLink: "#register",
    heroImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop",
    floatingStats: [
      { label: "Students", value: "10K+" },
      { label: "Countries", value: "50+" },
    ],
    visible: true,
  },
  marquee: {
    items: [
      "Transform Your Life",
      "Unlock Your Potential",
      "Find Your Frequency",
      "Live Abundantly",
      "Break Free Now",
    ],
    enabled: true,
  },
  why: {
    title: "Why Effort Isn't Working Anymore",
    subtitle: "The old paradigm of hustle and grind is broken. Here's what actually works.",
    points: [
      {
        title: "Think of your life",
        description: "as a radio station. If you're tuned to the wrong frequency, no amount of effort will get you the right signal.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
      },
      {
        title: "Energy alignment",
        description: "is the missing piece. When your internal frequency matches your desires, manifestation becomes effortless.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      },
      {
        title: "Science-backed methods",
        description: "combining neuroscience and ancient wisdom to rewire your subconscious patterns.",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop",
      },
    ],
    visible: true,
  },
  about: {
    name: "Your Coach Name",
    title: "Meet Your Guide",
    description: "A transformational coach with over 10 years of experience helping thousands of people unlock their true potential. Featured in major publications and trusted by leaders worldwide.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop",
    credentials: [
      "Certified Life Coach",
      "10,000+ Students Transformed",
      "Featured in Forbes & TEDx",
    ],
    visible: true,
  },
  logos: {
    title: "Featured In",
    logos: [
      { image: "", alt: "Brand 1" },
      { image: "", alt: "Brand 2" },
      { image: "", alt: "Brand 3" },
      { image: "", alt: "Brand 4" },
    ],
    enabled: true,
  },
  gallery: {
    title: "And Lots of Energy Came to Us",
    subtitle: "Moments from our transformational events and workshops",
    images: [
      { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop", caption: "Workshop 2024" },
      { url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop", caption: "Live Event" },
      { url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=300&fit=crop", caption: "Community" },
      { url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop", caption: "Retreat" },
      { url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop", caption: "Seminar" },
      { url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop", caption: "Masterclass" },
    ],
    visible: true,
  },
  stats: {
    title: "Join Thousands Who've Transformed",
    subtitle: "Our community is growing every day",
    stats: [
      { value: "10,000+", label: "Students" },
      { value: "50+", label: "Countries" },
      { value: "95%", label: "Success Rate" },
      { value: "4.9/5", label: "Rating" },
    ],
    ctaButtonText: "Start Your Transformation",
    ctaButtonLink: "#register",
    backgroundImage: "",
    visible: true,
  },
  testimonials: {
    title: "Women Report Changes",
    subtitle: "Real stories from real transformations",
    items: [
      {
        name: "Sarah Johnson",
        quote: "This program completely changed my perspective on life. I went from feeling stuck to feeling unstoppable.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
        role: "Entrepreneur",
      },
      {
        name: "Priya Sharma",
        quote: "The frequency alignment technique is unlike anything I've experienced. Results were almost immediate.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
        role: "Business Coach",
      },
      {
        name: "Emily Chen",
        quote: "I was skeptical at first, but the science-backed approach won me over. My life has transformed in 90 days.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        role: "Marketing Director",
      },
    ],
    visible: true,
  },
  program: {
    title: "What You'll Learn",
    subtitle: "A comprehensive program designed for lasting transformation",
    points: [
      { title: "Frequency Mapping", description: "Identify your current energetic frequency and understand what's blocking you", icon: "🎯" },
      { title: "Pattern Breaking", description: "Learn proven techniques to break free from limiting subconscious patterns", icon: "💡" },
      { title: "Alignment Protocol", description: "Step-by-step process to align your energy with your deepest desires", icon: "⚡" },
      { title: "Manifestation Mastery", description: "Advanced techniques to manifest your goals with ease and flow", icon: "🌟" },
      { title: "Community Support", description: "Join a tribe of like-minded individuals on the same journey", icon: "🤝" },
      { title: "Lifetime Access", description: "Get lifetime access to all materials, updates, and future bonuses", icon: "♾️" },
    ],
    ctaButtonText: "Enroll Now",
    ctaButtonLink: "#register",
    visible: true,
  },
  bonus: {
    title: "Exclusive Bonuses",
    items: [
      { title: "Guided Meditation Pack", description: "10 custom meditations for frequency alignment", image: "" },
      { title: "Private Community Access", description: "Lifetime access to our private support group", image: "" },
    ],
    enabled: true,
  },
  invitation: {
    enabled: true,
    badgeEmoji: "🔥",
    badgeText: "Filling Fast",
    title: "Request Your Invitation",
    subtitle: "Secure your spot for the next live experience",
    dateLabel: "Date",
    dateValue: "15 Feb 2026",
    timeLabel: "Time",
    timeValue: "03:00 PM",
    venueLabel: "Venue",
    venueValue: "Live on Zoom (Private Link)",
    availabilityText: "Live • Limited spots available.",
    buttonText: "Request Your Invitation",
    formTitle: "Request Your Invitation",
    formHighlights: ["Free", "Live", "Limited Seats"],
    formButtonText: "Request My Invitation",
    successTitle: "You're on the list!",
    successDescription: "We'll send your private invitation link via email and WhatsApp shortly.",
    supportText: "Join 200,000+ women shifting their state.",
  },
  footer: {
    cta: {
      title: "Ready to Transform Your Life?",
      subtitle: "Join thousands who've already made the shift. Your new frequency awaits.",
      ctaButtonText: "Join the Masterclass Now",
      ctaButtonLink: "#register",
    },
    copyright: "© 2025 All Rights Reserved",
    links: [
      { label: "Privacy Policy", url: "#" },
      { label: "Terms of Service", url: "#" },
      { label: "Contact", url: "#" },
    ],
    enabled: true,
  },
  floatingButton: {
    enabled: false,
    section: "invitation",
  },
};

export function normalizeTemplateData(data?: Partial<LandingTemplateData>): LandingTemplateData {
  if (!data) return DEFAULT_TEMPLATE_DATA;
  return {
    colors: { ...DEFAULT_TEMPLATE_DATA.colors, ...data.colors },
    hero: { ...DEFAULT_TEMPLATE_DATA.hero, ...data.hero },
    marquee: { ...DEFAULT_TEMPLATE_DATA.marquee, ...data.marquee },
    why: { ...DEFAULT_TEMPLATE_DATA.why, ...data.why },
    about: { ...DEFAULT_TEMPLATE_DATA.about, ...data.about },
    logos: { ...DEFAULT_TEMPLATE_DATA.logos, ...data.logos },
    gallery: { ...DEFAULT_TEMPLATE_DATA.gallery, ...data.gallery },
    stats: { ...DEFAULT_TEMPLATE_DATA.stats, ...data.stats },
    testimonials: { ...DEFAULT_TEMPLATE_DATA.testimonials, ...data.testimonials },
    program: { ...DEFAULT_TEMPLATE_DATA.program, ...data.program },
    bonus: { ...DEFAULT_TEMPLATE_DATA.bonus, ...data.bonus },
    invitation: { ...DEFAULT_TEMPLATE_DATA.invitation, ...data.invitation },
    footer: { ...DEFAULT_TEMPLATE_DATA.footer, ...data.footer },
    floatingButton: { ...DEFAULT_TEMPLATE_DATA.floatingButton, ...data.floatingButton },
    sectionOrder: data.sectionOrder || DEFAULT_TEMPLATE_DATA.sectionOrder,
    mediaSettings: data.mediaSettings || DEFAULT_TEMPLATE_DATA.mediaSettings,
  };
}

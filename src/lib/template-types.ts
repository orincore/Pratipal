// ---------------------------------------------------------------------------
// Fixed Landing Page Template – Data Types
// All landing pages share the same UI/UX layout. Only content is dynamic.
// ---------------------------------------------------------------------------

import type { LandingContent } from "@/lib/tiptap/content";

export interface TemplateColors {
  primary: string;       // Main brand color (buttons, highlights, accents)
  secondary: string;     // Secondary color (gradients, hover states)
  accent: string;        // Accent color (badges, small highlights)
  heroBg: string;        // Hero section background
  darkBg: string;        // Dark sections background
  bodyBg: string;        // Page body background
}

export interface HeroMediaItem {
  url: string;
  label?: string;
}

export interface HeroSection {
  badge: string;                 // e.g. "You're struggling because"
  headline: string;              // Main headline
  highlightedWord: string;       // Word with underline decoration (e.g. "Frequency")
  subheadline: string;           // Subtext below headline
  bulletPoints: string[];        // List of bullet points
  ctaButtonText: string;         // CTA button label
  ctaButtonLink: string;         // CTA button URL
  ctaButtonAction: "invitation" | "url"; // CTA button action type
  heroImage: string;             // Main hero image URL (fallback when carousel empty)
  heroMedia: HeroMediaItem[];    // Carousel slides (images/videos)
  carouselAutoplay: boolean;     // Auto-advance slides
  carouselInterval: number;      // Duration between slides (ms)
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
  points: { title: string; description: string; image: string; imageFit?: "contain" | "cover" | "natural" }[];
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
  ctaButtonAction: "invitation" | "url"; // CTA button action type
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

export interface VideoTestimonialItem {
  url: string;       // uploaded video URL or YouTube link
  name: string;
  role: string;
}

export interface VideoTestimonialsSection {
  title: string;
  subtitle: string;
  items: VideoTestimonialItem[];
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
  ctaButtonAction: "invitation" | "url"; // CTA button action type
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

export interface ContentBlockSection {
  enabled: boolean;
  layout: "media-left" | "media-right";
  mediaType: "image" | "video" | "youtube";
  mediaUrl: string;
  textFormat: "plain" | "bullets";
  heading?: string;
  content: string; // Plain text or bullet points (one per line)
  /**
   * Image-only. Default "contain" fits the artwork inside a fixed 16:9 well
   * (may letterbox); "cover" fills the frame instead (crops as needed);
   * "natural" drops the fixed well entirely and shows the image at its own
   * aspect ratio, scaled to the column width — no crop, no letterbox. Best
   * for a single self-contained poster/banner with copy baked into the
   * artwork, where either fixed-box mode looks wrong.
   */
  imageFit?: "contain" | "cover" | "natural";
}

// A free-floating rich-content zone that can sit anywhere in `sectionOrder`
// (key `richContent:<id>`), independent of the one legacy singleton
// `richContent` slot. Each has its own TipTap doc and its own Style-tab
// settings, so blocks don't have to share width/padding/background.
export interface RichBlockEntry {
  id: string;
  content: LandingContent;
  hidden?: boolean;
}

export interface ThankYouButton {
  label: string;
  url: string;
  icon: "whatsapp" | "facebook" | "instagram" | "x" | "none";
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
  buttonLink: string;
  buttonAction: "invitation" | "url"; // CTA button action type
  buttonTextColor?: string;  // text color for invitation buttons
  formTitle: string;
  formHighlights: string[];
  formButtonText: string;
  successTitle: string;
  successDescription: string;
  supportText: string;
  thankYouButtons?: ThankYouButton[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSection {
  title: string;
  subtitle: string;
  items: FaqItem[];
  enabled: boolean;
}

export interface FooterCTA {
  title: string;
  subtitle: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  ctaButtonAction: "invitation" | "url"; // CTA button action type
  showCtaButton?: boolean;
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

// Per-section style overrides (Elementor-style spacing controls). Values are
// pixels of extra outer spacing wrapped around the section.
export interface SectionStyleOptions {
  paddingTop?: number;
  paddingBottom?: number;
}

// Every reorderable section key, in default order. Shared by the sidebar
// editor, the canvas overlay, and the storefront renderer so they can never
// drift apart.
export const CANONICAL_SECTIONS = [
  "announcementBar",
  "hero",
  "marquee",
  "eventDetails",
  "why",
  "problems",
  "about",
  "guidesRail",
  "logos",
  "gallery",
  "stats",
  "curriculum",
  "formats",
  "testimonials",
  "videoTestimonials",
  "program",
  "pricing",
  "comparison",
  "guarantee",
  "contentBlocks",
  "appBanner",
  "richContent",
  "invitation",
  "bonus",
  "faq",
  "liveProof",
  "footer",
] as const;

export const SECTION_LABELS: Record<string, string> = {
  announcementBar: "Announcement Bar",
  hero: "Hero",
  marquee: "Marquee / Ticker",
  eventDetails: "Event Details",
  why: "Why Section",
  problems: "Problems / Pain Points",
  about: "About",
  guidesRail: "People Rail",
  logos: "Logo Bar",
  gallery: "Gallery",
  stats: "Stats / CTA",
  curriculum: "Curriculum",
  formats: "Format Carousel",
  testimonials: "Testimonials",
  videoTestimonials: "Video Testimonials",
  program: "Program",
  pricing: "Pricing Tiers",
  comparison: "Comparison Table",
  guarantee: "Guarantee",
  contentBlocks: "Content Blocks",
  appBanner: "App Banner",
  richContent: "Rich Content",
  invitation: "Request Invitation",
  bonus: "Bonus",
  faq: "FAQ",
  liveProof: "Live Social Proof",
  footer: "Footer",
};

// Dynamic, free-floating rich-content blocks use keys of the form
// `richContent:<id>` — never registered in CANONICAL_SECTIONS (which is a
// fixed compile-time list), so every place that keys off the canonical set
// needs to recognize this pattern explicitly via these two helpers.
export function isRichBlockKey(key: string): boolean {
  return key.startsWith("richContent:");
}

export function richBlockId(key: string): string {
  return key.slice("richContent:".length);
}

// Resolves a saved (possibly partial/stale) sectionOrder against the
// canonical list: keeps saved order, appends any new sections at the end.
// Dynamic richContent:<id> keys are preserved as-is but never auto-injected
// (they only ever enter sectionOrder via an explicit insert).
export function resolveSectionOrder(order?: string[]): string[] {
  const isKnown = (k: string) => (CANONICAL_SECTIONS as readonly string[]).includes(k) || isRichBlockKey(k);
  const base = order && order.length ? order.filter(isKnown) : [...CANONICAL_SECTIONS];
  const missing = (CANONICAL_SECTIONS as readonly string[]).filter((k) => !base.includes(k));
  return [...base, ...missing];
}

// Each section stores its visibility under a differently named flag
// (visible / enabled / derived). These two helpers give the editor a single
// uniform way to read and write it.
export function getSectionVisibility(t: LandingTemplateData, key: string): boolean {
  if (isRichBlockKey(key)) {
    const block = (t.richBlocks || []).find((b) => b.id === richBlockId(key));
    return block ? !block.hidden : true;
  }
  switch (key) {
    case "announcementBar": return t.announcementBar?.visible ?? false;
    case "hero": return t.hero.visible;
    case "marquee": return t.marquee.enabled;
    case "eventDetails": return t.eventDetails?.visible ?? false;
    case "why": return t.why.visible;
    case "problems": return t.problems?.visible ?? false;
    case "about": return t.about.visible;
    case "guidesRail": return t.guidesRail?.visible ?? false;
    case "logos": return t.logos.enabled;
    case "gallery": return t.gallery.visible;
    case "stats": return t.stats.visible;
    case "curriculum": return t.curriculum?.visible ?? false;
    case "formats": return t.formats?.visible ?? false;
    case "testimonials": return t.testimonials.visible;
    case "videoTestimonials": return t.videoTestimonials.visible;
    case "program": return t.program.visible;
    case "pricing": return t.pricing?.visible ?? false;
    case "comparison": return t.comparison?.visible ?? false;
    case "guarantee": return t.guarantee?.visible ?? false;
    case "contentBlocks": return (t.contentBlocks || []).some((b) => b.enabled);
    case "appBanner": return t.appBanner?.visible ?? false;
    case "richContent": return true;
    case "invitation": return t.invitation.enabled;
    case "bonus": return t.bonus.enabled;
    case "faq": return t.faq?.enabled ?? true;
    case "liveProof": return t.liveProof?.visible ?? false;
    case "footer": return t.footer.enabled;
    default: return true;
  }
}

export function applySectionVisibility(t: LandingTemplateData, key: string, visible: boolean): LandingTemplateData {
  if (isRichBlockKey(key)) {
    const id = richBlockId(key);
    return {
      ...t,
      richBlocks: (t.richBlocks || []).map((b) => (b.id === id ? { ...b, hidden: !visible } : b)),
    };
  }
  switch (key) {
    case "announcementBar": return { ...t, announcementBar: { ...(t.announcementBar || DEFAULT_TEMPLATE_DATA.announcementBar!), visible } };
    case "hero": return { ...t, hero: { ...t.hero, visible } };
    case "marquee": return { ...t, marquee: { ...t.marquee, enabled: visible } };
    case "eventDetails": return { ...t, eventDetails: { ...(t.eventDetails || DEFAULT_TEMPLATE_DATA.eventDetails!), visible } };
    case "why": return { ...t, why: { ...t.why, visible } };
    case "problems": return { ...t, problems: { ...(t.problems || DEFAULT_TEMPLATE_DATA.problems!), visible } };
    case "about": return { ...t, about: { ...t.about, visible } };
    case "guidesRail": return { ...t, guidesRail: { ...(t.guidesRail || DEFAULT_TEMPLATE_DATA.guidesRail!), visible } };
    case "logos": return { ...t, logos: { ...t.logos, enabled: visible } };
    case "gallery": return { ...t, gallery: { ...t.gallery, visible } };
    case "stats": return { ...t, stats: { ...t.stats, visible } };
    case "curriculum": return { ...t, curriculum: { ...(t.curriculum || DEFAULT_TEMPLATE_DATA.curriculum!), visible } };
    case "formats": return { ...t, formats: { ...(t.formats || DEFAULT_TEMPLATE_DATA.formats!), visible } };
    case "testimonials": return { ...t, testimonials: { ...t.testimonials, visible } };
    case "videoTestimonials": return { ...t, videoTestimonials: { ...t.videoTestimonials, visible } };
    case "program": return { ...t, program: { ...t.program, visible } };
    case "pricing": return { ...t, pricing: { ...(t.pricing || DEFAULT_TEMPLATE_DATA.pricing!), visible } };
    case "comparison": return { ...t, comparison: { ...(t.comparison || DEFAULT_TEMPLATE_DATA.comparison!), visible } };
    case "guarantee": return { ...t, guarantee: { ...(t.guarantee || DEFAULT_TEMPLATE_DATA.guarantee!), visible } };
    case "contentBlocks": return { ...t, contentBlocks: (t.contentBlocks || []).map((b) => ({ ...b, enabled: visible })) };
    case "appBanner": return { ...t, appBanner: { ...(t.appBanner || DEFAULT_TEMPLATE_DATA.appBanner!), visible } };
    case "richContent": return t;
    case "invitation": return { ...t, invitation: { ...t.invitation, enabled: visible } };
    case "bonus": return { ...t, bonus: { ...t.bonus, enabled: visible } };
    case "faq": return { ...t, faq: { ...(t.faq || DEFAULT_TEMPLATE_DATA.faq!), enabled: visible } };
    case "liveProof": return { ...t, liveProof: { ...(t.liveProof || DEFAULT_TEMPLATE_DATA.liveProof!), visible } };
    case "footer": return { ...t, footer: { ...t.footer, enabled: visible } };
    default: return t;
  }
}

// Centralizes the "Rich Content" fallback label for dynamic blocks (which
// can't have a static SECTION_LABELS entry since their key includes a uuid).
// Numbers them when more than one dynamic block exists on the page, based on
// its position in sectionOrder, so multiple blocks stay distinguishable.
export function getSectionLabel(key: string, order?: string[]): string {
  if (isRichBlockKey(key)) {
    if (order) {
      const richKeys = order.filter(isRichBlockKey);
      if (richKeys.length > 1) {
        const n = richKeys.indexOf(key) + 1;
        if (n > 0) return `Rich Content #${n}`;
      }
    }
    return "Rich Content";
  }
  return SECTION_LABELS[key] || key;
}

export const DEFAULT_MEDIA_SETTINGS: MediaFieldOptions = {
  autoplay: true,
  mute: true,
};

// --- Sections ported from the Adhyatmik Sutraa deployment of this same
// template — same data shape as there, rendered with Pratipal's own simpler
// styling (see landing-template.tsx) rather than porting its design system.

export interface GuidesRailItem {
  name: string;
  role: string;
  image: string;
  link?: string;
}

// Horizontal-scroll rail of people/practitioner cards.
export interface GuidesRailSection {
  title: string;
  subtitle: string;
  items: GuidesRailItem[];
  visible: boolean;
}

export interface FormatsSlide {
  image: string;
  label?: string;
}

// Single large rotating image carousel with dot pagination.
export interface FormatsSection {
  title: string;
  subtitle: string;
  slides: FormatsSlide[];
  visible: boolean;
}

// Single full-width clickable banner image (e.g. app download / secondary CTA).
export interface AppBannerSection {
  image: string;
  link: string;
  alt?: string;
  visible: boolean;
}

export interface CurriculumModule {
  label: string;                    // "Day 1" / "Module 01"
  title: string;
  description?: string;
  bullets: string[];
  image?: string;
}

// Day-wise or module-wise breakdown of what gets taught.
export interface CurriculumSection {
  title: string;
  subtitle: string;
  modules: CurriculumModule[];
  displayMode?: "accordion" | "cards";
  ctaButtonText?: string;
  ctaButtonLink?: string;
  ctaButtonAction?: "invitation" | "url";
  visible: boolean;
}

export interface PricingTier {
  name: string;
  price: string;
  originalPrice?: string;
  period?: string;
  badge?: string;
  description?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  ctaAction: "invitation" | "url";
  highlighted?: boolean;
}

export interface PricingSection {
  title: string;
  subtitle: string;
  tiers: PricingTier[];
  footnote?: string;
  visible: boolean;
}

// Feature matrix. `values[i]` aligns with `columns[i]`; "yes"/"no" render as
// a tick/cross, anything else renders as literal text.
export interface ComparisonSection {
  title: string;
  subtitle: string;
  columns: string[];
  rows: { feature: string; values: string[] }[];
  highlightColumn?: number;
  visible: boolean;
}

// Risk-reversal triad ("Pay once", "No upsells", "Full refund").
export interface GuaranteeSection {
  title: string;
  subtitle: string;
  items: { icon?: string; title: string; description: string }[];
  visible: boolean;
}

// Rotating corner toast of recent-signup notifications.
export interface LiveProofSection {
  items: { text: string; meta?: string; image?: string }[];
  intervalMs?: number;
  visible: boolean;
}

// Thin urgency strip pinned above the hero ("Only 7 slots left", price-rising
// warnings). Optionally counts down to a fixed instant.
export interface AnnouncementBarSection {
  text: string;
  ctaText?: string;
  ctaLink?: string;
  ctaAction?: "invitation" | "url";
  countdownTo?: string;    // ISO datetime — when set, a live countdown renders
  countdownLabel?: string;
  sticky?: boolean;        // stick to viewport top while scrolling
  visible: boolean;
}

export interface EventDetailItem {
  icon?: string;
  label: string;
  value: string;
}

// The "what/when/where/how much" card every webinar page leads with: format
// pills, a meta grid, price with a struck-through anchor, and a seats-left bar.
export interface EventDetailsSection {
  title: string;
  subtitle: string;
  pills: string[];                  // e.g. "Beginner Friendly", "Recording Available"
  items: EventDetailItem[];         // Date / Time / Duration / Language / Venue
  priceLabel?: string;
  price?: string;
  originalPrice?: string;           // struck through next to `price`
  savingsNote?: string;
  seatsNote?: string;               // e.g. "Only 23 of 100 seats left"
  seatsFilledPercent?: number;      // 0–100; renders a fill bar when > 0
  ctaButtonText: string;
  ctaButtonLink: string;
  ctaButtonAction: "invitation" | "url";
  visible: boolean;
}

// Pain-point taxonomy: an icon grid of problems the reader recognises, plus an
// optional consequence list ("a bad relationship can…").
export interface ProblemsSection {
  title: string;
  subtitle: string;
  items: { icon?: string; title: string; description?: string }[];
  impactTitle?: string;
  impacts?: string[];
  visible: boolean;
}

export interface LandingTemplateData {
  colors: TemplateColors;
  announcementBar?: AnnouncementBarSection;
  hero: HeroSection;
  marquee: MarqueeSection;
  eventDetails?: EventDetailsSection;
  why: WhySection;
  problems?: ProblemsSection;
  about: AboutSection;
  guidesRail?: GuidesRailSection;
  logos: LogoSection;
  gallery: GallerySection;
  stats: StatsSection;
  curriculum?: CurriculumSection;
  formats?: FormatsSection;
  testimonials: TestimonialsSection;
  videoTestimonials: VideoTestimonialsSection;
  program: ProgramSection;
  pricing?: PricingSection;
  comparison?: ComparisonSection;
  guarantee?: GuaranteeSection;
  bonus: BonusSection;
  contentBlocks?: ContentBlockSection[];
  appBanner?: AppBannerSection;
  faq?: FaqSection;
  liveProof?: LiveProofSection;
  invitation: InvitationSection;
  footer: FooterSection;
  floatingButton: FloatingButtonSettings;
  sectionOrder?: string[];
  // Free-floating rich-content zones, referenced from sectionOrder via
  // `richContent:<id>`. Separate from the one legacy singleton `richContent`
  // slot (whose content lives in the page-level `content` field, unchanged).
  richBlocks?: RichBlockEntry[];
  mediaSettings?: Record<string, MediaFieldOptions>;
  sectionBg?: Record<string, string>; // per-section background color overrides
  sectionStyles?: Record<string, SectionStyleOptions>; // per-section spacing overrides
  fontFamily?: string; // global font-family stack for the whole template
}

// ---------------------------------------------------------------------------
// Default template data (placeholder content)
// ---------------------------------------------------------------------------
export const DEFAULT_TEMPLATE_DATA: LandingTemplateData = {
  sectionOrder: ['announcementBar', 'hero', 'marquee', 'eventDetails', 'why', 'problems', 'about', 'guidesRail', 'logos', 'gallery', 'stats', 'curriculum', 'formats', 'testimonials', 'videoTestimonials', 'program', 'pricing', 'comparison', 'guarantee', 'contentBlocks', 'appBanner', 'invitation', 'bonus', 'faq', 'liveProof', 'footer'],
  mediaSettings: {},
  colors: {
    primary: "#F5A623",
    secondary: "#7B2D8E",
    accent: "#E8552D",
    heroBg: "#FFF8E7",
    darkBg: "#1A1A2E",
    bodyBg: "#FFFFFF",
  },
  announcementBar: {
    text: "Only a few seats left at this price",
    ctaText: "Reserve now",
    ctaLink: "#register",
    ctaAction: "invitation",
    countdownTo: "",
    countdownLabel: "Offer ends in",
    sticky: true,
    visible: false,
  },
  eventDetails: {
    title: "Everything You Need to Know",
    subtitle: "One live session. Nothing else to buy.",
    pills: ["Beginner Friendly", "Live on Zoom", "Recording Available"],
    items: [
      { icon: "CalendarDays", label: "Date", value: "Sunday, 15 Feb" },
      { icon: "Clock3", label: "Time", value: "11:30 AM IST" },
      { icon: "Hourglass", label: "Duration", value: "90 minutes" },
      { icon: "Languages", label: "Language", value: "Hindi + English" },
    ],
    priceLabel: "Your seat today",
    price: "",
    originalPrice: "",
    savingsNote: "",
    seatsNote: "",
    seatsFilledPercent: 0,
    ctaButtonText: "Reserve My Seat",
    ctaButtonLink: "#register",
    ctaButtonAction: "invitation",
    visible: false,
  },
  problems: {
    title: "Does This Sound Familiar?",
    subtitle: "If you nodded at even two of these, this session was built for you.",
    items: [],
    impactTitle: "",
    impacts: [],
    visible: false,
  },
  guidesRail: {
    title: "Learn From Our Trusted Guides",
    subtitle: "Experienced, vetted practitioners across every practice",
    items: [],
    visible: false,
  },
  curriculum: {
    title: "What We'll Cover",
    subtitle: "A clear path, broken into steps you can actually follow.",
    modules: [],
    displayMode: "accordion",
    ctaButtonText: "",
    ctaButtonLink: "#register",
    ctaButtonAction: "invitation",
    visible: false,
  },
  formats: {
    title: "Your Healing, Your Way",
    subtitle: "Learn, connect and heal in the format that works best for you.",
    slides: [],
    visible: false,
  },
  pricing: {
    title: "Choose Your Path",
    subtitle: "Pick the level of support that fits where you are right now.",
    tiers: [],
    footnote: "",
    visible: false,
  },
  comparison: {
    title: "Compare Your Options",
    subtitle: "",
    columns: [],
    rows: [],
    highlightColumn: 0,
    visible: false,
  },
  guarantee: {
    title: "Our Promise to You",
    subtitle: "",
    items: [],
    visible: false,
  },
  appBanner: {
    image: "",
    link: "#",
    alt: "",
    visible: false,
  },
  liveProof: {
    items: [],
    intervalMs: 5000,
    visible: false,
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
    ctaButtonAction: "invitation",
    heroImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop",
    heroMedia: [],
    carouselAutoplay: true,
    carouselInterval: 6000,
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
    ctaButtonAction: "invitation",
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
  videoTestimonials: {
    title: "Hear It From Them",
    subtitle: "Real video testimonials from our community",
    items: [],
    visible: false,
  },
  program: {
    title: "What You'll Learn",
    subtitle: "A comprehensive program designed for lasting transformation",
    points: [
      { title: "Frequency Mapping", description: "Identify your current energetic frequency and understand what's blocking you", icon: "Target" },
      { title: "Pattern Breaking", description: "Learn proven techniques to break free from limiting subconscious patterns", icon: "Lightbulb" },
      { title: "Alignment Protocol", description: "Step-by-step process to align your energy with your deepest desires", icon: "Zap" },
      { title: "Manifestation Mastery", description: "Advanced techniques to manifest your goals with ease and flow", icon: "Sparkles" },
      { title: "Community Support", description: "Join a tribe of like-minded individuals on the same journey", icon: "Users" },
      { title: "Lifetime Access", description: "Get lifetime access to all materials, updates, and future bonuses", icon: "Gem" },
    ],
    ctaButtonText: "Enroll Now",
    ctaButtonLink: "#register",
    ctaButtonAction: "invitation",
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
  contentBlocks: [],
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know before joining",
    items: [
      { question: "Who is this masterclass for?", answer: "This is for anyone who feels stuck and wants to create real, lasting change in their life." },
      { question: "Is this session free?", answer: "Yes, this live session is completely free. Just register to secure your spot." },
      { question: "How will I receive the Zoom link?", answer: "You'll receive the private Zoom link via WhatsApp and email after registering." },
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
    buttonLink: "#register",
    buttonAction: "invitation",
    formTitle: "Request Your Invitation",
    formHighlights: ["Free", "Live", "Limited Seats"],
    formButtonText: "Request My Invitation",
    successTitle: "You're on the list!",
    successDescription: "We'll send your private invitation link via email and WhatsApp shortly.",
    supportText: "Join 200,000+ women shifting their state.",
    thankYouButtons: [],
  },
  footer: {
    cta: {
      title: "Ready to Transform Your Life?",
      subtitle: "Join thousands who've already made the shift. Your new frequency awaits.",
      ctaButtonText: "Join the Masterclass Now",
      ctaButtonLink: "#register",
      ctaButtonAction: "invitation",
      showCtaButton: true,
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
    announcementBar: { ...DEFAULT_TEMPLATE_DATA.announcementBar!, ...data.announcementBar },
    hero: { ...DEFAULT_TEMPLATE_DATA.hero, ...data.hero },
    marquee: { ...DEFAULT_TEMPLATE_DATA.marquee, ...data.marquee },
    eventDetails: { ...DEFAULT_TEMPLATE_DATA.eventDetails!, ...data.eventDetails },
    why: { ...DEFAULT_TEMPLATE_DATA.why, ...data.why },
    problems: { ...DEFAULT_TEMPLATE_DATA.problems!, ...data.problems },
    about: { ...DEFAULT_TEMPLATE_DATA.about, ...data.about },
    guidesRail: { ...DEFAULT_TEMPLATE_DATA.guidesRail!, ...data.guidesRail },
    logos: { ...DEFAULT_TEMPLATE_DATA.logos, ...data.logos },
    gallery: { ...DEFAULT_TEMPLATE_DATA.gallery, ...data.gallery },
    stats: { ...DEFAULT_TEMPLATE_DATA.stats, ...data.stats },
    curriculum: { ...DEFAULT_TEMPLATE_DATA.curriculum!, ...data.curriculum },
    formats: { ...DEFAULT_TEMPLATE_DATA.formats!, ...data.formats },
    testimonials: { ...DEFAULT_TEMPLATE_DATA.testimonials, ...data.testimonials },
    videoTestimonials: { ...DEFAULT_TEMPLATE_DATA.videoTestimonials, ...data.videoTestimonials },
    program: { ...DEFAULT_TEMPLATE_DATA.program, ...data.program },
    pricing: { ...DEFAULT_TEMPLATE_DATA.pricing!, ...data.pricing },
    comparison: { ...DEFAULT_TEMPLATE_DATA.comparison!, ...data.comparison },
    guarantee: { ...DEFAULT_TEMPLATE_DATA.guarantee!, ...data.guarantee },
    bonus: { ...DEFAULT_TEMPLATE_DATA.bonus, ...data.bonus },
    contentBlocks: data.contentBlocks || [],
    appBanner: { ...DEFAULT_TEMPLATE_DATA.appBanner!, ...data.appBanner },
    faq: { ...DEFAULT_TEMPLATE_DATA.faq!, ...data.faq },
    liveProof: { ...DEFAULT_TEMPLATE_DATA.liveProof!, ...data.liveProof },
    invitation: { ...DEFAULT_TEMPLATE_DATA.invitation, ...data.invitation },
    footer: { ...DEFAULT_TEMPLATE_DATA.footer, ...data.footer },
    floatingButton: { ...DEFAULT_TEMPLATE_DATA.floatingButton, ...data.floatingButton },
    sectionOrder: data.sectionOrder || DEFAULT_TEMPLATE_DATA.sectionOrder,
    richBlocks: data.richBlocks || [],
    mediaSettings: data.mediaSettings || DEFAULT_TEMPLATE_DATA.mediaSettings,
    sectionBg: data.sectionBg || {},
    sectionStyles: data.sectionStyles || {},
    fontFamily: data.fontFamily || "",
  };
}

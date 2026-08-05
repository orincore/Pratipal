"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { EditorContent } from "@tiptap/react";
import type { LandingTemplateData, RichBlockEntry, TestimonialItem, WhySection } from "@/lib/template-types";
import {
  DEFAULT_MEDIA_SETTINGS,
  normalizeTemplateData,
  resolveSectionOrder,
  getSectionVisibility,
  SECTION_LABELS,
  getSectionLabel,
  isRichBlockKey,
  richBlockId,
} from "@/lib/template-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Clock3, MapPin, CheckCircle2, ChevronLeft, ChevronRight, Zap, Radio, FlaskConical, BookOpen, Star, Heart, Leaf, Sun, Moon, Sparkles, Target, Trophy, Users, Brain, Lightbulb, Shield, Flame, Gem, Music, Globe, Camera, Smile, Coffee, Rocket, Award, MessageSquare, Lock, GripVertical, ArrowUp, ArrowDown, Eye, EyeOff, Settings2, Plus, Copy, Trash2, Instagram, Facebook, Youtube, Linkedin, Twitter, MessageCircle, Hourglass, Languages, ShieldCheck, RefreshCcw, BadgeCheck, Wallet, TrendingUp, AlertTriangle, Video, Gift, PlayCircle, CircleDollarSign, Frown, CloudRain, Ban, Infinity as InfinityIcon, Headphones, Ticket, Check, X, Loader2 } from "lucide-react";
import { DynamicPageRenderer } from "@/components/storefront/dynamic-page-renderer";
import { siteConfig } from "@/config/site.config";

// Icon resolver for why-section cards
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Radio, FlaskConical, BookOpen, Star, Heart, Leaf, Sun, Moon, Sparkles,
  Target, Trophy, Users, Brain, Lightbulb, Shield, Flame, Gem, Music, Globe,
  Camera, Smile, Coffee, Rocket, Award, CheckCircle2, CalendarDays, Clock3,
  // Added for the conversion sections (event details, problems, guarantee)
  Hourglass, Languages, ShieldCheck, RefreshCcw, BadgeCheck, Wallet, TrendingUp,
  AlertTriangle, Video, Gift, PlayCircle, CircleDollarSign, Frown, CloudRain,
  Ban, Infinity: InfinityIcon, Headphones, Ticket, MapPin,
};
function ProgramIcon({ name, className, style }: { name?: string; className?: string; style?: React.CSSProperties }) {
  const Icon = name ? (ICON_MAP[name] ?? Sparkles) : Sparkles;
  return <Icon className={className} style={style} />;
}

// Footer social row — lucide has no dedicated WhatsApp glyph, MessageCircle stands in.
const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  x: Twitter,
  whatsapp: MessageCircle,
};

// ---------------------------------------------------------------------------
// Helper: hex to rgba
// ---------------------------------------------------------------------------
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Relative luminance — decides whether text on a given surface should be
// light or dark. Lets every page's own palette drive the design without
// hardcoding which sections are "dark" (a green-palette page and a
// plum-palette page both resolve correctly).
function isDarkColor(hex: string): boolean {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) < 0.42;
}

// The "stage" backdrop: a saturated base with aura blooms layered over it, so
// dark sections read as lit atmosphere rather than a flat block of color.
//
// The layers are intentionally static, not drifting. An infinite
// background-position/-size animation across 3 oversized gradient layers
// forces the browser to keep repainting a large region for as long as the
// page stays open — stacked with the aura blur and grain blend-mode next to
// it, that's exactly the sustained CPU/GPU load that shows up as page
// slowness and a hot device on mid/low-end phones. `animated` is kept as a
// param for call-site compatibility but no longer adds motion.
function stageBackground(base: string, glow: string, flare: string, animated = true): React.CSSProperties {
  void animated;
  return {
    backgroundColor: base,
    backgroundImage: [
      `radial-gradient(62% 52% at 12% 8%, ${hexToRgba(glow, 0.55)} 0%, transparent 62%)`,
      `radial-gradient(52% 46% at 88% 16%, ${hexToRgba(flare, 0.34)} 0%, transparent 66%)`,
      `radial-gradient(74% 60% at 50% 112%, ${hexToRgba(glow, 0.36)} 0%, transparent 62%)`,
    ].join(", "),
    backgroundRepeat: "no-repeat",
    backgroundSize: "150% 150%, 140% 140%, 160% 160%",
    backgroundPosition: "0% 0%, 100% 0%, 50% 100%",
  };
}

// Signature marker: a hairline rule broken by a small diamond node. Stands in
// for the usual "01 / 02 / 03" eyebrow — this content isn't a sequence, so a
// ritual mark suits it better than numbering.
function RitualRule({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-hidden="true">
      <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: color }} />
      <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </span>
  );
}

function SectionHeading({
  title,
  subtitle,
  onDark,
  accent,
  align = "center",
  className = "",
}: {
  title?: string;
  subtitle?: string;
  onDark?: boolean;
  accent: string;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center mx-auto" : ""} max-w-3xl ${className}`}>
      <div className={`lt-reveal mb-5 ${centered ? "flex justify-center" : ""}`}>
        <RitualRule color={accent} />
      </div>
      {hasContent(title) && (
        <h2
          className="lt-reveal font-display font-bold leading-[1.08] tracking-[-0.02em] text-[clamp(1.6rem,4vw,3.25rem)]"
          style={{ ["--lt-i" as string]: 1, color: onDark ? "#fff" : "#111827" }}
        >
          {title}
        </h2>
      )}
      {hasContent(subtitle) && (
        <p
          className="lt-reveal font-body mt-4 text-base sm:text-lg leading-relaxed"
          style={{ ["--lt-i" as string]: 2, color: onDark ? "#ffffff" : "#4B5563" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Arrow used on every CTA — kept as one component so the hover motion is
// identical everywhere.
function CtaArrow({ className = "" }: { className?: string }) {
  return (
    <svg className={`ml-2 h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover/cta:translate-x-1 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

// Shared CTA chrome: gradient fill derived from the page tokens, plus a sheen
// sweep on hover. `as` keeps <a> vs <button> semantics intact.
function ctaClass(size: "lg" | "md" = "lg") {
  return [
    "lt-cta lt-focus group/cta relative inline-flex max-w-full items-center justify-center rounded-full text-center font-semibold leading-tight text-white",
    "shadow-lg",
    // Phone-first padding and type. At the old px-8/text-base a label like
    // "Register Now For Live Webinar!" overflowed a card's inner width on a
    // 390px screen and wrapped to two lines with the arrow stranded beside it.
    size === "lg"
      ? "px-5 py-3.5 text-[15px] sm:px-10 sm:py-4 sm:text-lg"
      : "px-4 py-3 text-sm sm:px-6 sm:text-base",
  ].join(" ");
}

function ctaStyle(glow: string, flare: string): React.CSSProperties {
  // Accent-dominant so the button stays vivid; the deeper brand color only
  // falls off past the far corner, which keeps it from muddying the fill.
  return {
    backgroundImage: `linear-gradient(135deg, ${flare} 0%, ${flare} 52%, ${glow} 125%)`,
    boxShadow: `0 12px 32px -10px ${hexToRgba(flare, 0.75)}`,
  };
}

const VIDEO_REGEX = /\.(mp4|webm|ogg)$/i;
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
  /youtube\.com\/embed\/([^&\n?#]+)/,
  /youtube\.com\/shorts\/([^&\n?#]+)/,
];
const mediaKey = (...parts: (string | number)[]) => parts.join(".");

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

type FloatingButtonRenderProps =
  | { label: string; href: string; action?: never }
  | { label: string; href?: never; action: () => void };

const hasContent = (value?: string | null) => Boolean(value && value.trim().length > 0);
const resolveLink = (value?: string | null) => (value && value.trim().length ? value.trim() : "#");

// ---------------------------------------------------------------------------
// YouTube Embed — respects user mute setting (browser may block unmuted autoplay)
// ---------------------------------------------------------------------------
function YouTubeEmbed({ videoId, autoplay, muted, className }: {
  videoId: string;
  autoplay: boolean;
  muted: boolean;
  className?: string;
}) {
  // Use the muted setting as provided (browser may block unmuted autoplay)
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? "1" : "0"}&mute=${muted ? "1" : "0"}&loop=${autoplay ? "1" : "0"}&playlist=${videoId}&rel=0&modestbranding=1&playsinline=1`;

  return (
    <iframe
      key={`${videoId}-${autoplay}`}
      src={src}
      className={["absolute inset-0 h-full w-full", className].filter(Boolean).join(" ")}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="eager"
    />
  );
}

// ---------------------------------------------------------------------------
// FAQ Item Component (accordion)
// ---------------------------------------------------------------------------
function FaqItem({
  item,
  primaryColor,
  ink = "#111827",
  muted = "#4B5563",
  surface = "#FFFFFF",
  hairline = "rgba(17,24,39,0.08)",
}: {
  item: { question: string; answer: string };
  primaryColor: string;
  ink?: string;
  muted?: string;
  surface?: string;
  hairline?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="overflow-hidden rounded-2xl transition-colors duration-300"
      style={{ backgroundColor: surface, border: `1px solid ${open ? hexToRgba(primaryColor, 0.35) : hairline}` }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="lt-focus w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-body text-sm sm:text-base font-semibold" style={{ color: ink }}>{item.question}</span>
        <span
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
          style={{
            backgroundColor: open ? primaryColor : hexToRgba(primaryColor, 0.1),
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke={open ? "#fff" : primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {/* grid-rows trick animates to the answer's natural height without measuring it */}
      <div
        className="grid transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <p className="font-body px-6 pb-5 text-sm leading-relaxed" style={{ color: muted }}>
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Countdown — live timer to an ISO instant.
// Renders nothing until mounted, so the server-rendered HTML and the first
// client render always agree (the remaining time differs between them by
// definition, which would otherwise be a hydration mismatch).
// ---------------------------------------------------------------------------
function useCountdown(target?: string) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const end = new Date(target).getTime();
    if (Number.isNaN(end)) return;
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target]);
  if (remaining === null) return null;
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: remaining <= 0,
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function Countdown({
  target,
  label,
  variant = "boxed",
  accent,
  onDark = true,
}: {
  target?: string;
  label?: string;
  variant?: "inline" | "boxed";
  accent: string;
  onDark?: boolean;
}) {
  const time = useCountdown(target);
  if (!time) return null;

  const parts = [
    ...(time.days > 0 ? [{ value: time.days, unit: "Days" }] : []),
    { value: time.hours, unit: "Hrs" },
    { value: time.minutes, unit: "Min" },
    { value: time.seconds, unit: "Sec" },
  ];

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold tabular-nums sm:text-sm">
        {hasContent(label) && <span className="opacity-80">{label}</span>}
        <span className="inline-flex items-center gap-1">
          {parts.map((p, i) => (
            <React.Fragment key={p.unit}>
              {i > 0 && <span className="opacity-50">:</span>}
              <span className="rounded-md px-1.5 py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.22)" }}>
                {pad2(p.value)}
              </span>
            </React.Fragment>
          ))}
        </span>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {hasContent(label) && (
        <span
          className="font-body text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: onDark ? "rgba(255,255,255,0.66)" : "#6B7280" }}
        >
          {label}
        </span>
      )}
      <div className="flex items-center gap-2 sm:gap-3">
        {parts.map((p) => (
          <div
            key={p.unit}
            className="flex min-w-[58px] flex-col items-center rounded-2xl px-2.5 py-2.5 sm:min-w-[74px] sm:px-4 sm:py-3"
            style={{
              backgroundColor: onDark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
              border: `1px solid ${onDark ? "rgba(255,255,255,0.16)" : hexToRgba(accent, 0.22)}`,
              boxShadow: onDark ? "none" : "0 12px 30px -22px rgba(17,24,39,.45)",
            }}
          >
            <span
              className="font-display text-2xl font-bold leading-none tabular-nums sm:text-3xl"
              style={{ color: onDark ? "#fff" : "#111827" }}
            >
              {pad2(p.value)}
            </span>
            <span
              className="font-body mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px]"
              style={{ color: onDark ? "rgba(255,255,255,0.55)" : "#6B7280" }}
            >
              {p.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat values roll up from zero the first time they scroll into view. Motivated,
// not decorative: on a funnel page these numbers ARE the argument ("45%+ higher
// margins", "5 Days to launch"), so counting draws the eye to the claim rather
// than to the layout.
//
// Renders the final string on the server, so with JS off, before hydration, or
// under reduced motion the real number is what shows. Frames are written
// straight to the DOM node — setState per frame would re-render the section
// ~60 times a second.
// ---------------------------------------------------------------------------
function CountUpValue({ value, className, style }: { value: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parts = /^(\D*)(\d[\d,]*)(.*)$/.exec(value || "");
    if (!parts) return;                       // "Zero", "Live on Zoom" — nothing to count
    const grouped = parts[2].includes(",");
    const target = Number(parts[2].replace(/,/g, ""));
    if (!Number.isFinite(target) || target <= 0) return;

    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1100);
        const eased = 1 - Math.pow(1 - p, 3);
        const n = Math.round(target * eased);
        el.textContent = `${parts[1]}${grouped ? n.toLocaleString("en-IN") : n}${parts[3]}`;
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      el.textContent = `${parts[1]}0${parts[3]}`;
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);

  return <span ref={ref} className={className} style={style}>{value}</span>;
}

// ---------------------------------------------------------------------------
// Countdown sized for the docked mobile bar: accent-lit chips with unit
// captions, a live pulse dot, and a seconds chip that ticks. Separate from
// <Countdown> because that one is tuned for full-width sections and its chips
// go invisible against an already-dark strip.
// ---------------------------------------------------------------------------
function DockedCountdown({ target, label, accent }: { target?: string; label?: string; accent: string }) {
  const time = useCountdown(target);
  if (!time) return null;

  const parts = [
    ...(time.days > 0 ? [{ value: time.days, unit: "Days" }] : []),
    { value: time.hours, unit: "Hrs" },
    { value: time.minutes, unit: "Min" },
    { value: time.seconds, unit: "Sec" },
  ];

  return (
    <div className="min-w-0">
      {hasContent(label) && (
        <span className="mb-1 flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span className="lt-seat-ping absolute inline-flex h-full w-full rounded-full" style={{ backgroundColor: accent }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span
            className="font-body truncate text-[9px] font-bold uppercase leading-none tracking-[0.18em] sm:text-[10px]"
            style={{ color: accent }}
          >
            {label}
          </span>
        </span>
      )}
      <span className="flex items-center gap-[3px] sm:gap-1.5">
        {parts.map((p, i) => (
          <React.Fragment key={p.unit}>
            {i > 0 && <span className="font-display text-[11px] font-bold leading-none text-white/25">:</span>}
            <span
              className={`flex min-w-[27px] flex-col items-center rounded-[9px] px-1 py-[3px] sm:min-w-[32px] sm:px-1.5 ${
                p.unit === "Sec" ? "lt-tick" : ""
              }`}
              style={{
                backgroundColor: hexToRgba(accent, 0.2),
                border: `1px solid ${hexToRgba(accent, 0.5)}`,
                boxShadow: `0 0 12px -4px ${hexToRgba(accent, 0.9)}`,
              }}
            >
              <span className="font-display text-[15px] font-bold leading-none tabular-nums text-white sm:text-base">
                {pad2(p.value)}
              </span>
              <span className="font-body mt-[3px] text-[6.5px] font-semibold uppercase leading-none tracking-[0.1em] text-white/60 sm:text-[7.5px]">
                {p.unit}
              </span>
            </span>
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Curriculum accordion row — numbered, expands to a bullet list.
// ---------------------------------------------------------------------------
function CurriculumRow({
  module,
  index,
  defaultOpen,
  accent,
  ink,
  muted,
  surface,
  hairline,
}: {
  module: { label: string; title: string; description?: string; bullets: string[] };
  index: number;
  defaultOpen: boolean;
  accent: string;
  ink: string;
  muted: string;
  surface: string;
  hairline: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="overflow-hidden rounded-2xl transition-colors duration-300"
      style={{ backgroundColor: surface, border: `1px solid ${open ? hexToRgba(accent, 0.35) : hairline}` }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="lt-focus flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-6 sm:py-5"
      >
        <span
          className="font-display flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold sm:h-11 sm:w-11 sm:text-base"
          style={{ backgroundColor: hexToRgba(accent, 0.14), color: accent }}
        >
          {pad2(index + 1)}
        </span>
        <span className="min-w-0 flex-1">
          {hasContent(module.label) && (
            <span
              className="font-body block text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              {module.label}
            </span>
          )}
          <span className="font-body mt-0.5 block text-sm font-semibold sm:text-base" style={{ color: ink }}>
            {module.title}
          </span>
        </span>
        <span
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
          style={{
            backgroundColor: open ? accent : hexToRgba(accent, 0.1),
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke={open ? "#fff" : accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div
        className="grid transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 pl-[3.25rem] sm:px-6 sm:pl-[4.75rem]">
            {hasContent(module.description) && (
              <p className="font-body mb-3 text-sm leading-relaxed" style={{ color: muted }}>
                {module.description}
              </p>
            )}
            <ul className="space-y-2.5">
              {(module.bullets || []).filter(hasContent).map((b, i) => (
                <li key={i} className="flex gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: accent }} />
                  <span className="font-body text-sm leading-relaxed" style={{ color: muted }}>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live social-proof toast — rotates through recent-signup notices in a corner
// card. Dismissible, and it sits above the sticky CTA bar on small screens.
// ---------------------------------------------------------------------------
function LiveProofToast({
  items,
  intervalMs = 5000,
  accent,
}: {
  items: { text: string; meta?: string; image?: string }[];
  intervalMs?: number;
  accent: string;
}) {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  // Delays the first appearance so it doesn't fight the hero for attention,
  // and keeps SSR output free of the toast entirely.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(
      () => setIndex((p) => (p + 1) % items.length),
      Math.max(intervalMs, 2500)
    );
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  if (dismissed || !shown || items.length === 0) return null;
  const item = items[index % items.length];

  return (
    // Deliberately narrow on phones and tucked just above the docked CTA bar —
    // a full-width toast here sits over the middle of the screen and blocks
    // whatever the reader is actually looking at.
    <div className="pointer-events-none fixed bottom-[76px] left-2.5 z-30 w-[268px] sm:bottom-6 sm:left-6 sm:w-auto sm:max-w-sm">
      <div
        key={index}
        className="lt-proof-pop pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-white/95 px-2.5 py-2 shadow-2xl backdrop-blur sm:gap-3 sm:px-4 sm:py-3"
        style={{ border: `1px solid ${hexToRgba(accent, 0.2)}` }}
      >
        {hasContent(item.image) ? (
          <img src={item.image} alt="" className="h-7 w-7 flex-shrink-0 rounded-full object-cover sm:h-9 sm:w-9" />
        ) : (
          <span
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9"
            style={{ backgroundColor: hexToRgba(accent, 0.12) }}
          >
            <BadgeCheck className="h-4 w-4" style={{ color: accent }} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-body line-clamp-2 text-[11px] font-semibold leading-snug text-gray-900 sm:text-[13px]">{item.text}</p>
          {hasContent(item.meta) && (
            <p className="font-body mt-0.5 text-[9.5px] text-gray-500 sm:text-[11px]">{item.meta}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notification"
          className="lt-focus -mr-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:text-gray-700 sm:h-7 sm:w-7"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Marquee Component
// ---------------------------------------------------------------------------
function Marquee({ items, color, accent }: { items: string[]; color: string; accent?: string }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div
      className="relative overflow-hidden whitespace-nowrap py-4"
      style={{ backgroundColor: color, borderTop: "1px solid rgba(255,255,255,0.10)", borderBottom: "1px solid rgba(255,255,255,0.10)" }}
    >
      <div className="inline-flex animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="mx-7 font-body text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-white/85">
            {item}
            <span className="mx-7 inline-block h-1.5 w-1.5 rotate-45 align-middle" style={{ backgroundColor: accent || "rgba(255,255,255,.45)" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Video Testimonials Slider — 1 card mobile / 3 cards desktop, same pattern
// as Featured Products. Active (most visible) card plays, others pause.
// ---------------------------------------------------------------------------
function VideoTestimonialsSlider({ items, primaryColor, autoplay = true, muted = true }: {
  items: { url: string; name: string; role: string }[];
  primaryColor: string;
  // The slider used to hard-code autoplay+muted+loop, so the Style tab's media
  // settings had no effect on it. Sound-on autoplay is blocked by browsers
  // anyway, so when autoplay is on the embed stays muted regardless.
  autoplay?: boolean;
  muted?: boolean;
}) {
  const n = items.length;

  // Stable key based on content — prevents tripled from rebuilding on re-renders
  // when the parent passes a new array reference with the same data
  const itemsKey = useMemo(() => items.map((it) => it.url).join("|"), [items]);

  // Triple the list: clone-before + real + clone-after for infinite illusion
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tripled = useMemo(() => [...items, ...items, ...items], [itemsKey]);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);
  // activeIdx is an index into `tripled`; start at first real item (index n)
  const [activeIdx, setActiveIdx] = useState(n);
  const isJumping = React.useRef(false);
  // Track whether we've seeded the scroll position yet
  const seeded = React.useRef(false);

  const extractYTId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
    return null;
  };

  // Extract Instagram post/reel shortcode from various URL formats
  const extractIGId = (url: string) => {
    const patterns = [
      /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/reels?\/([A-Za-z0-9_-]+)/,
    ];
    for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
    return null;
  };

  const getMediaType = (url: string): "youtube" | "instagram" | "video" | "empty" => {
    if (!url) return "empty";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("instagram.com")) return "instagram";
    if (/\.(mp4|webm|ogg)$/i.test(url)) return "video";
    return "empty";
  };

  const getStep = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    const isMobile = window.innerWidth < 640;
    const cardW = isMobile ? el.clientWidth : el.clientWidth / 5;
    return cardW + 16;
  }, []);

  // On desktop 5 cards visible; 3rd card (index offset 2) is active/focused.
  const getActiveOffset = React.useCallback(() => {
    return window.innerWidth >= 640 ? 2 : 0;
  }, []);

  // Silently jump scroll position to a tripled index
  const jumpTo = React.useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    isJumping.current = true;
    // Jump to idx - offset so the center card lands on idx
    el.scrollLeft = (idx - getActiveOffset()) * getStep();
    requestAnimationFrame(() => { isJumping.current = false; });
  }, [getStep, getActiveOffset]);

  // Seed to first real item — only once, and only after tripled is stable
  useEffect(() => {
    if (seeded.current) return;
    const raf = requestAnimationFrame(() => {
      jumpTo(n);
      seeded.current = true;
    });
    return () => cancelAnimationFrame(raf);
  // itemsKey ensures we re-seed only when content actually changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, n]);

  // Scroll listener: track active card + wrap at boundaries
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (isJumping.current) return;
      const step = getStep();
      if (step === 0) return;
      // leftmost visible card index + offset = center (active) card index
      const leftmost = Math.round(el.scrollLeft / step);
      const idx = leftmost + getActiveOffset();
      setActiveIdx(idx);
      if (idx < n) { jumpTo(idx + n); setActiveIdx(idx + n); }
      if (idx >= n * 2) { jumpTo(idx - n); setActiveIdx(idx - n); }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [n, jumpTo, getStep, getActiveOffset]);

  // Play active native video, pause + reset others
  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === activeIdx) { el.play().catch(() => {}); }
      else { el.pause(); el.currentTime = 0; }
    });
  }, [activeIdx]);

  function scrollBy(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const step = getStep();
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  if (n === 0) return null;

  const realActive = ((activeIdx % n) + n) % n;

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        type="button"
        onClick={() => scrollBy("left")}
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Scrollable track — no snap so silent jumps are invisible */}
      <div
        ref={scrollRef}
        // overflow-y pinned + touch-action pan-x so vertical swipes over the
        // slider scroll the page rather than this track (see the guides rail).
        className="flex touch-pan-x gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide"
        style={{ scrollSnapType: "none" }}
      >
        {tripled.map((item, i) => {
          const isActive = i === activeIdx;
          const type = getMediaType(item.url);
          const ytId = type === "youtube" ? extractYTId(item.url) : null;
          const igId = type === "instagram" ? extractIGId(item.url) : null;

          const shouldAutoplay = autoplay && isActive;
          // Autoplay only works muted; with autoplay off, mute follows the
          // setting so a tapped video plays with sound. loop follows autoplay
          // so a non-autoplaying video doesn't restart itself forever.
          const embedMuted = shouldAutoplay ? true : muted;
          const ytSrc = ytId
            ? `https://www.youtube.com/embed/${ytId}?autoplay=${shouldAutoplay ? "1" : "0"}&mute=${embedMuted ? "1" : "0"}&loop=${autoplay ? "1" : "0"}&playlist=${ytId}&rel=0&modestbranding=1&playsinline=1`
            : null;
          const igSrc = igId
            ? `https://www.instagram.com/p/${igId}/embed/?autoplay=${autoplay ? "1" : "0"}&muted=${embedMuted ? "1" : "0"}`
            : null;

          return (
            <div
              key={i}
              className="flex-shrink-0 w-full sm:w-[calc(20%-13px)] transition-all duration-300"
              style={{ opacity: isActive ? 1 : 0.5, transform: isActive ? "scale(1)" : "scale(0.97)" }}
            >
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white flex flex-col">
                {/* Video area — true 9:16 portrait */}
                <div
                  className="relative bg-black overflow-hidden"
                  style={{ aspectRatio: "9/16" }}
                >
                  {type === "youtube" && ytSrc ? (
                    <iframe
                      src={ytSrc}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : type === "instagram" && igSrc ? (
                    <iframe
                      src={igSrc}
                      className="absolute inset-0 w-full h-full bg-white"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : type === "video" ? (
                    <video
                      ref={(el) => { videoRefs.current[i] = el; }}
                      src={item.url}
                      muted
                      playsInline
                      loop={false}
                      onEnded={() => scrollBy("right")}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Author */}
                {(item.name || item.role) && (
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {item.name ? item.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="min-w-0">
                      {item.name && <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>}
                      {item.role && <p className="text-xs text-gray-500 truncate">{item.role}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => scrollBy("right")}
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dot indicators mapped to real items */}
      {n > 1 && (
        <div className="flex justify-center mt-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { jumpTo(n + i); setActiveIdx(n + i); }}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === realActive}
              className="lt-focus flex h-11 w-7 items-center justify-center"
            >
              <span
                className="block h-2 rounded-full transition-all duration-300"
                style={{
                  width: i === realActive ? 24 : 8,
                  backgroundColor: i === realActive ? primaryColor : "#d1d5db",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Template Component
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Editor bridge — only passed by the admin canvas. When present, every
// section gets an Elementor-style overlay: hover outline, floating toolbar
// (drag / move / hide / duplicate / settings) and "+" insert points between
// sections that accept both clicks and drag-drops from the blocks palette.
// ---------------------------------------------------------------------------
export const SECTION_DND_TYPE = "text/x-landing-section"; // move an existing section
export const NEW_BLOCK_DND_TYPE = "text/x-landing-new-block"; // insert a fresh content block
// Drag payload for an Elements-tab widget (Button, Heading, Video, ...)
// dropped directly onto the canvas — either into the currently-focused rich
// block (handled by rich-editor's own drop capture) or onto a template-level
// gap between sections, which auto-creates a brand new rich block there.
export const RICH_ELEMENT_DND_TYPE = "text/x-rich-element";

export interface TemplateEditorBridge {
  selectedSection: string | null;
  onSelectSection: (key: string) => void;
  onMoveSection: (key: string, dir: -1 | 1) => void;
  // Move `key` so it lands in the gap `gapIndex` (0 = before first section).
  onMoveSectionTo: (key: string, gapIndex: number) => void;
  onToggleVisibility: (key: string) => void;
  // Insert a block at a gap: an existing hidden section key, or "__newContentBlock".
  onInsertBlock: (key: string, gapIndex: number) => void;
  onDuplicateSection?: (key: string) => void;
  // Palette shown by the "+" insert points.
  insertableBlocks: { key: string; label: string }[];
  // sectionOrder-style key of whichever rich block is currently live/
  // editable: "richContent" (legacy singleton, the default) or
  // "richContent:<uuid>" for a focused dynamic block.
  focusedBlockId: string | null;
  onFocusRichBlock: (key: string) => void;
  // A widget was dropped at a template-level gap (not inside an existing
  // rich block) — create a new rich block there seeded with that widget.
  onInsertRichBlockWithElement: (elementType: string, gapIndex: number) => void;
  // Full delete (not hide) — only dynamic rich blocks get this.
  onRemoveRichBlock: (key: string) => void;
}

interface LandingTemplateProps {
  data?: Partial<LandingTemplateData>;
  pageContent?: any;
  landingPageId?: string;
  pageSlug?: string;
  editorInstance?: any;
  editorBridge?: TemplateEditorBridge;
}

// The legacy page-level "Rich Content" slot predates per-widget rich blocks.
// Its doc counts as empty when every top-level node is a contentless
// textblock — no widgets, no text. An empty legacy slot renders nothing
// anywhere (editor canvas, sidebar, public page): new pages compose rich
// content exclusively from individual blocks, so a dropped element always
// creates its own block instead of landing in one big catch-all editor.
export function isLegacyRichContentEmpty(pageContent: any): boolean {
  const nodes = pageContent?.doc?.content;
  if (!Array.isArray(nodes) || nodes.length === 0) return true;
  return nodes.every(
    (n: any) =>
      (n.type === "paragraph" || n.type === "heading") &&
      !(Array.isArray(n.content) && n.content.length)
  );
}

// Reads a section key out of a drag event, for all supported drag payloads.
function readSectionDrag(e: React.DragEvent): { kind: "move" | "new" | "richElement"; key: string } | null {
  if (e.dataTransfer.types.includes(SECTION_DND_TYPE)) {
    return { kind: "move", key: e.dataTransfer.getData(SECTION_DND_TYPE) };
  }
  if (e.dataTransfer.types.includes(NEW_BLOCK_DND_TYPE)) {
    return { kind: "new", key: e.dataTransfer.getData(NEW_BLOCK_DND_TYPE) };
  }
  if (e.dataTransfer.types.includes(RICH_ELEMENT_DND_TYPE)) {
    return { kind: "richElement", key: e.dataTransfer.getData(RICH_ELEMENT_DND_TYPE) };
  }
  return null;
}

function isSectionDrag(e: React.DragEvent): boolean {
  return (
    e.dataTransfer.types.includes(SECTION_DND_TYPE) ||
    e.dataTransfer.types.includes(NEW_BLOCK_DND_TYPE) ||
    e.dataTransfer.types.includes(RICH_ELEMENT_DND_TYPE)
  );
}

// The dropEffect a dragover handler reports must match the effectAllowed
// the drag source declared at dragstart (SECTION_DND_TYPE: "move";
// NEW_BLOCK_DND_TYPE / RICH_ELEMENT_DND_TYPE: "copy" — see their onDragStart
// handlers). Some browsers use this compatibility to decide the cursor only,
// but per spec a mismatched dropEffect can cause the browser to refuse to
// ever fire 'drop' at all. Only .types is readable during dragover (getData
// is drop/dragstart-only), which is all this needs.
function dropEffectForDrag(e: React.DragEvent): "move" | "copy" {
  return e.dataTransfer.types.includes(SECTION_DND_TYPE) ? "move" : "copy";
}

// Auto-scroll the canvas while dragging a section/block near the top or
// bottom edge of its scrollable viewport. Without this, any insert target
// below the fold — the common case on a page with a dozen-plus sections —
// is simply unreachable: native drag suspends normal wheel/trackpad
// scrolling, and the browser's own edge-autoscroll for HTML5 DnD is
// inconsistent enough not to rely on. Mirrors the same pattern already used
// for the sidebar's card list (see handleCardDragOver in template-editor).
export function autoScrollCanvasDuringDrag(e: React.DragEvent) {
  const container = (e.currentTarget as HTMLElement).closest(".overflow-y-auto");
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const EDGE = 90;
  if (e.clientY < rect.top + EDGE) container.scrollBy({ top: -22 });
  else if (e.clientY > rect.bottom - EDGE) container.scrollBy({ top: 22 });
}

// Hover affordance shown over an unfocused rich block's static preview,
// inviting the click that swaps the live editor onto it. Purely visual
// (pointer-events-none) — the actual click handler lives on the ancestor.
function RichBlockFocusOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 rounded-lg transition-all group-hover/richblock:ring-2 group-hover/richblock:ring-violet-400 group-hover/richblock:ring-inset">
      <span className="absolute top-2 left-2 opacity-0 group-hover/richblock:opacity-100 transition-opacity bg-violet-600 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-lg">
        Click to edit
      </span>
    </div>
  );
}

// Thin hoverable strip between sections: shows a "+" that opens a block
// palette, and doubles as a drop target while dragging sections/blocks.
function SectionInsertPoint({ index, bridge }: { index: number; bridge: TemplateEditorBridge }) {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className="relative h-0 z-30"
      data-insert-point={index}
      onDragOver={(e) => {
        if (!isSectionDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = dropEffectForDrag(e);
        setDragOver(true);
        autoScrollCanvasDuringDrag(e);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        const payload = readSectionDrag(e);
        setDragOver(false);
        if (!payload) return;
        e.preventDefault();
        e.stopPropagation();
        if (payload.kind === "move") bridge.onMoveSectionTo(payload.key, index);
        else if (payload.kind === "new") bridge.onInsertBlock(payload.key, index);
        else bridge.onInsertRichBlockWithElement(payload.key, index);
      }}
    >
      {/* Hover/drop capture strip (taller than the visible line, but kept
          narrow so it doesn't steal clicks from adjacent section content) */}
      <div className="group/ip absolute left-0 right-0 -top-2 h-4">
        <div
          className={`pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 transition-all ${
            dragOver ? "h-1.5 bg-violet-500" : "h-0.5 bg-transparent group-hover/ip:bg-violet-400"
          }`}
        />
        <button
          type="button"
          title="Insert block here"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-violet-600 text-white shadow-lg flex items-center justify-center transition-opacity hover:bg-violet-700 hover:scale-110 ${
            open || dragOver
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none group-hover/ip:opacity-100 group-hover/ip:pointer-events-auto"
          }`}
        >
          <Plus className="h-4 w-4" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-1/2 -translate-x-1/2 top-6 z-50 w-64 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                Insert block
              </p>
              {bridge.insertableBlocks.length === 0 && (
                <p className="text-xs text-gray-400 px-2 py-2">
                  All blocks are already on the page. Hide one to re-insert it elsewhere, or add a Content Block.
                </p>
              )}
              {bridge.insertableBlocks.map((block) => (
                <button
                  key={block.key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    bridge.onInsertBlock(block.key, index);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                  {block.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Wraps a rendered section in the editor canvas: hover outline, selection
// ring, floating toolbar and drop-target behaviour. Hidden sections render a
// slim dashed placeholder so they can still be selected, shown and reordered.
function EditorSectionShell({
  sectionKey,
  index,
  total,
  order,
  visible,
  bridge,
  children,
}: {
  sectionKey: string;
  index: number;
  total: number;
  order: string[];
  visible: boolean;
  bridge: TemplateEditorBridge;
  children: React.ReactNode;
}) {
  const [dropPos, setDropPos] = useState<"top" | "bottom" | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const selected = bridge.selectedSection === sectionKey;
  const label = getSectionLabel(sectionKey, order);
  const isDynamicRichBlock = isRichBlockKey(sectionKey);
  const isRichContent = sectionKey === "richContent" || isDynamicRichBlock;
  const canToggle = sectionKey !== "richContent";
  const canDuplicate = !!bridge.onDuplicateSection && sectionKey === "contentBlocks";

  // Close the section menu on Escape / resize. It deliberately does NOT close
  // on scroll — the menu is position:fixed, so it stays put while the canvas
  // scrolls beneath it, and users found scroll-to-close jarring. Click-outside
  // (the backdrop) and Escape remain the ways to dismiss it.
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [ctxMenu]);

  const runCtx = (fn: () => void) => {
    fn();
    setCtxMenu(null);
  };

  return (
    <div
      className="relative group/es"
      data-section-shell={sectionKey}
      onClickCapture={(e) => {
        // richContent hosts the TipTap canvas — clicks there manage their own
        // element selection, so only the toolbar selects that section.
        if (isRichContent) return;
        bridge.onSelectSection(sectionKey);
      }}
      onContextMenu={(e) => {
        // Right-clicks landing on the TipTap surface get the rich text/element
        // menu (wired up inside the editor) — leave those alone.
        if ((e.target as HTMLElement).closest?.(".ProseMirror")) return;
        e.preventDefault();
        e.stopPropagation();
        // NB: intentionally do NOT select the section here. onSelectSection
        // scrolls its sidebar card into view, and that programmatic scroll
        // would fire the scroll-to-close listener below and dismiss the menu
        // the instant it opened. The menu header names the section, and every
        // action targets `sectionKey` directly, so pre-selection isn't needed.
        setCtxMenu({ x: e.clientX, y: e.clientY });
      }}
      onDragOver={(e) => {
        if (!isSectionDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = dropEffectForDrag(e);
        const rect = e.currentTarget.getBoundingClientRect();
        setDropPos(e.clientY < rect.top + rect.height / 2 ? "top" : "bottom");
        autoScrollCanvasDuringDrag(e);
      }}
      onDragLeave={() => setDropPos(null)}
      onDrop={(e) => {
        const payload = readSectionDrag(e);
        const pos = dropPos;
        setDropPos(null);
        if (!payload) return;
        e.preventDefault();
        e.stopPropagation();
        const gap = index + (pos === "bottom" ? 1 : 0);
        if (payload.kind === "move") bridge.onMoveSectionTo(payload.key, gap);
        else if (payload.kind === "new") bridge.onInsertBlock(payload.key, gap);
        else bridge.onInsertRichBlockWithElement(payload.key, gap);
      }}
    >
      {/* Hover / selection outline */}
      <div
        className={`pointer-events-none absolute inset-0 z-20 transition-shadow ${
          selected
            ? "shadow-[inset_0_0_0_2px_rgb(124,58,237)]"
            : "group-hover/es:shadow-[inset_0_0_0_1px_rgb(196,181,253)]"
        }`}
      />

      {/* Drop indicators */}
      {dropPos === "top" && (
        <div className="absolute -top-0.5 left-0 right-0 h-1.5 bg-violet-500 z-30 rounded-full" />
      )}
      {dropPos === "bottom" && (
        <div className="absolute -bottom-0.5 left-0 right-0 h-1.5 bg-violet-500 z-30 rounded-full" />
      )}

      {/* Floating section toolbar, anchored top-RIGHT so it never sits over
          headings/text at a section's top-center (hovering would materialize
          it mid-click and steal the user's text selection). pointer-events
          disabled while invisible so it can't swallow clicks either. Gated on
          `children` (not `visible`) — some sections are `visible=true` but
          still render nothing when empty (e.g. gallery/testimonials with no
          items), which falls through to the placeholder below just like a
          hidden section. Its "Show" button sits in that same top-right
          corner, and reorder/toggle for a collapsed section is already
          covered by the sidebar cards. */}
      {!!children && (
      <div
        className={`absolute top-1.5 right-2 z-30 transition-opacity ${
          selected
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none group-hover/es:opacity-100 group-hover/es:pointer-events-auto"
        }`}
      >
        <div className="flex items-center gap-0.5 bg-violet-600 text-white rounded-lg shadow-xl px-1.5 py-1">
          <button
            type="button"
            title="Drag to reorder"
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData(SECTION_DND_TYPE, sectionKey);
              e.dataTransfer.effectAllowed = "move";
            }}
            className="h-6 px-1 flex items-center gap-1 rounded-md cursor-grab active:cursor-grabbing hover:bg-white/15 select-none [-webkit-user-drag:element]"
          >
            <GripVertical className="h-3.5 w-3.5" />
            <span className="text-[11px] font-semibold whitespace-nowrap">{label}</span>
          </button>
          <div className="w-px h-4 bg-white/25 mx-0.5" />
          <button
            type="button"
            title="Move up"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              bridge.onMoveSection(sectionKey, -1);
            }}
            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Move down"
            disabled={index === total - 1}
            onClick={(e) => {
              e.stopPropagation();
              bridge.onMoveSection(sectionKey, 1);
            }}
            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          {canToggle && (
            <button
              type="button"
              title={visible ? "Hide section" : "Show section"}
              onClick={(e) => {
                e.stopPropagation();
                bridge.onToggleVisibility(sectionKey);
              }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/15"
            >
              {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          )}
          {bridge.onDuplicateSection && sectionKey === "contentBlocks" && (
            <button
              type="button"
              title="Add another content block"
              onClick={(e) => {
                e.stopPropagation();
                bridge.onDuplicateSection!(sectionKey);
              }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/15"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            title={isDynamicRichBlock ? "Edit this block" : "Edit section settings"}
            onClick={(e) => {
              e.stopPropagation();
              // Dynamic rich blocks have no sidebar settings card — there's
              // nothing for onSelectSection to open. "Edit" means "make this
              // the live block," same as clicking its canvas overlay.
              if (isDynamicRichBlock) bridge.onFocusRichBlock(sectionKey);
              else bridge.onSelectSection(sectionKey);
            }}
            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/15"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
          {isDynamicRichBlock && (
            <button
              type="button"
              title="Delete this block"
              onClick={(e) => {
                e.stopPropagation();
                bridge.onRemoveRichBlock(sectionKey);
              }}
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/15"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      )}

      {children || (
        // Hidden (or empty) section placeholder — keeps it reachable in the canvas.
        <div className="mx-4 my-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 flex items-center justify-between bg-gray-50/70">
          <span className="text-xs font-medium text-gray-400 flex items-center gap-2">
            <EyeOff className="h-3.5 w-3.5" /> {label} (hidden)
          </span>
          {canToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                bridge.onToggleVisibility(sectionKey);
              }}
              className="text-[11px] font-semibold text-violet-600 hover:text-violet-800"
            >
              Show
            </button>
          )}
        </div>
      )}

      {/* Right-click section menu — portalled to <body> so the canvas'
          `zoom` transform doesn't scale or clip it, and positioned with raw
          viewport (client) coordinates. */}
      {ctxMenu &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onMouseDown={() => setCtxMenu(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setCtxMenu(null);
              }}
            />
            <div
              role="menu"
              className="fixed z-[9999] w-56 max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-2xl"
              style={{
                left: Math.min(ctxMenu.x, (typeof window !== "undefined" ? window.innerWidth : 1280) - 236),
                top: Math.max(8, Math.min(ctxMenu.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 260)),
              }}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 flex items-center gap-2 text-xs font-semibold text-violet-700">
                <GripVertical className="h-3.5 w-3.5" />
                {label}
              </div>
              <div className="my-1 h-px bg-gray-100" />

              <SectionMenuItem
                icon={<Settings2 />}
                label={isDynamicRichBlock ? "Edit this block" : "Edit content"}
                onClick={() =>
                  runCtx(() => {
                    if (isDynamicRichBlock) bridge.onFocusRichBlock(sectionKey);
                    else bridge.onSelectSection(sectionKey);
                  })
                }
              />
              <SectionMenuItem
                icon={<ArrowUp />}
                label="Move up"
                disabled={index === 0}
                onClick={() => runCtx(() => bridge.onMoveSection(sectionKey, -1))}
              />
              <SectionMenuItem
                icon={<ArrowDown />}
                label="Move down"
                disabled={index === total - 1}
                onClick={() => runCtx(() => bridge.onMoveSection(sectionKey, 1))}
              />
              {canToggle && (
                <SectionMenuItem
                  icon={visible ? <EyeOff /> : <Eye />}
                  label={visible ? "Hide section" : "Show section"}
                  onClick={() => runCtx(() => bridge.onToggleVisibility(sectionKey))}
                />
              )}
              {canDuplicate && (
                <SectionMenuItem
                  icon={<Copy />}
                  label="Add another content block"
                  onClick={() => runCtx(() => bridge.onDuplicateSection!(sectionKey))}
                />
              )}
              {isDynamicRichBlock && (
                <>
                  <div className="my-1 h-px bg-gray-100" />
                  <SectionMenuItem
                    icon={<Trash2 />}
                    label="Delete this block"
                    danger
                    onClick={() => runCtx(() => bridge.onRemoveRichBlock(sectionKey))}
                  />
                </>
              )}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

// A single row in the right-click section menu.
function SectionMenuItem({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-left transition-colors ${
        disabled
          ? "opacity-40 cursor-not-allowed text-gray-400"
          : danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      } [&>span>svg]:h-3.5 [&>span>svg]:w-3.5`}
    >
      <span className="flex h-4 w-4 items-center justify-center flex-shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}

// Native <video> with a custom play/pause overlay. Defined at module level so
// it keeps a stable identity across parent re-renders (otherwise the <video>
// remounts and reloads on every keystroke/render — the "page keeps refreshing"
// bug while filling the form).
function VideoWithControls({
  src,
  className,
  autoplay,
  mute,
}: {
  src?: string;
  className?: string;
  autoplay?: boolean;
  mute?: boolean;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // If settings say unmuted but the browser forced mute, unmute after play.
    const handlePlay = () => {
      if (!mute && video.muted) video.muted = false;
    };
    video.addEventListener("play", handlePlay);
    return () => video.removeEventListener("play", handlePlay);
  }, [mute]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={src}
        className={className}
        style={{ objectFit: "cover" }}
        autoPlay={autoplay}
        muted={mute}
        loop={autoplay}
        controls={true}
        controlsList="nodownload"
        playsInline
      />
      <button
        type="button"
        onClick={togglePlayPause}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-white/50 hover:bg-white/80 text-gray-900 shadow-md transition-all hover:scale-110"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// Invitation / sign-up form in its own component so that typing only re-renders
// THIS component — not the whole landing page (hero, carousels, 16 iframes…).
// That whole-page re-render-per-keystroke was the "page keeps refreshing /
// can't submit" production bug.
const formatInr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Razorpay's checkout script is only fetched when someone actually opens a paid
// form, so free pages never pay for it.
function loadRazorpayCheckout(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function InvitationDialog({
  open,
  onOpenChange,
  invitation,
  primaryColor,
  accentColor,
  landingPageId,
  pageSlug,
  isPreviewMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: LandingTemplateData["invitation"];
  primaryColor: string;
  accentColor: string;
  landingPageId?: string;
  pageSlug?: string;
  isPreviewMode: boolean;
}) {
  const router = useRouter();
  const createEmpty = () => ({ firstName: "", email: "", whatsapp: "", countryCode: "+91", location: "" });
  const [form, setForm] = useState(createEmpty);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paid webinars route through Razorpay before anyone is enrolled. The amount
  // shown here is display only — the server re-reads it from the saved page.
  const paidAmount = Number(invitation.amount) || 0;
  const isPaidWebinar = invitation.pricingMode === "paid" && paidAmount > 0;
  const submitLabel = isPaidWebinar
    ? hasContent(invitation.payButtonText)
      ? invitation.payButtonText!
      : `Pay ${formatInr(paidAmount)}`
    : invitation.formButtonText;

  const update = (field: keyof ReturnType<typeof createEmpty>, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Lock background scroll while the dialog is open. iOS Safari (and Radix's
  // default lock) let touch drags fall through to the page behind the form, so
  // we (1) pin the body with position:fixed and (2) intercept touchmove at the
  // document level — allowing scroll only inside the form's scroll area and
  // cancelling it everywhere else (overlay, the form's non-scrolling regions).
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    let startY = 0;
    // Movement (px) below which a gesture is treated as a tap, not a scroll.
    // Cancelling these tiny jitters on iOS also cancels tap-to-focus, which
    // stops the keyboard from opening — so we leave them entirely alone.
    const TAP_THRESHOLD = 8;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = (e.touches[0]?.clientY ?? 0) - startY;
      if (Math.abs(dy) < TAP_THRESHOLD) return; // tap, not a scroll — let it focus
      const area = scrollAreaRef.current;
      const target = e.target as Node | null;
      // Drag outside the form's scroll area → never let it move the page.
      if (!area || !target || !area.contains(target)) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      // Inside the scroll area: block the rubber-band overscroll at the edges
      // that otherwise chains to the background.
      const atTop = area.scrollTop <= 0;
      const atBottom = area.scrollTop + area.clientHeight >= area.scrollHeight;
      if ((atTop && dy > 0) || (atBottom && dy < 0)) {
        if (e.cancelable) e.preventDefault();
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    // Keyboard handling (mobile only): on phones the popup is full-screen at
    // 100dvh, which does NOT shrink when the on-screen keyboard opens — so the
    // lower fields end up hidden behind the keyboard with no room to scroll.
    // We resize the popup to the VisualViewport's *visible* height, which makes
    // the form area shorter than its content and therefore scrollable, letting
    // the user reach every field above the keyboard.
    const vv = window.visualViewport;
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const syncViewport = () => {
      const el = contentRef.current;
      if (!el || !isMobile || !vv) return;
      el.style.height = `${vv.height}px`;
      el.style.top = `${vv.offsetTop}px`;
    };
    if (isMobile && vv) {
      syncViewport();
      vv.addEventListener("resize", syncViewport);
      vv.addEventListener("scroll", syncViewport);
    }

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      if (vv) {
        vv.removeEventListener("resize", syncViewport);
        vv.removeEventListener("scroll", syncViewport);
      }
      const el = contentRef.current;
      if (el) {
        el.style.height = "";
        el.style.top = "";
      }
    };
  }, [open]);

  // When a field gains focus, wait for the keyboard/viewport to settle, then
  // bring the field comfortably into the visible area so it's never hidden
  // behind the keyboard.
  const handleFieldFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;
    if (!el.matches("input, select, textarea")) return;
    window.setTimeout(() => {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 300);
  };

  const handleOpenChange = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setSuccess(false);
      setError(null);
      setLoading(false);
      setForm(createEmpty());
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setError("Please provide your name, email, and WhatsApp number.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      landingPageId,
      landingPageSlug: pageSlug,
      firstName: form.firstName.trim(),
      email: form.email.trim(),
      whatsappNumber: form.whatsapp.trim()
        ? `${form.countryCode}${form.whatsapp.trim().replace(/^0+/, "")}`
        : "",
      location: form.location.trim(),
    };

    const goToThankYou = () => {
      const thankYouData = {
        title: invitation.successTitle,
        description: invitation.successDescription,
        buttons: invitation.thankYouButtons || [],
        from: pageSlug || "",
      };
      sessionStorage.setItem("thankYouData", JSON.stringify(thankYouData));
      router.push(`/${pageSlug}/thank-you`);
      setForm(createEmpty());
    };

    try {
      if (isPreviewMode) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setSuccess(true);
        setForm(createEmpty());
        return;
      }

      if (isPaidWebinar) {
        // 1. Reserve a pending registration and open a Razorpay order. No
        //    amount is sent — the server prices it from the saved page.
        const createRes = await fetch("/api/invitations/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const createData = await createRes.json().catch(() => ({}));
        if (!createRes.ok) {
          throw new Error(createData.error || "Unable to start payment. Please try again.");
        }

        // 2. Load the gateway.
        const loaded = await loadRazorpayCheckout();
        if (!loaded) {
          throw new Error("Couldn't load the payment gateway. Check your connection and try again.");
        }

        // 3. Get out of Razorpay's way before it opens.
        //    Razorpay mounts its sheet on document.body, i.e. outside this
        //    dialog. Radix's modal marks everything outside the dialog
        //    inert (pointer-events:none + aria-hidden + focus trap), and the
        //    scroll lock above cancels touchmove anywhere but the form's own
        //    scroller — between them the sheet renders but nothing in it can
        //    be tapped. Closing first hands the screen over cleanly.
        //    onOpenChange, not handleOpenChange, so the details they typed
        //    survive for a retry.
        onOpenChange(false);
        // Let Radix unmount and undo its body styles before the sheet mounts.
        await new Promise((r) => setTimeout(r, 280));
        if (typeof document !== "undefined") {
          // Belt and braces: if an exit animation is still in flight the body
          // can briefly keep pointer-events:none, which swallows the first tap.
          document.body.style.pointerEvents = "";
        }

        // 4. Hand off to Razorpay, then verify server-side before enrolling.
        await new Promise<void>((resolve) => {
          const rzp = new (window as any).Razorpay({
            key: createData.key_id,
            amount: createData.amount,
            currency: createData.currency,
            name: siteConfig.razorpayDisplayName,
            description: createData.webinarTitle,
            order_id: createData.razorpay_order_id,
            prefill: {
              name: payload.firstName,
              email: payload.email,
              contact: payload.whatsappNumber,
            },
            theme: { color: accentColor },
            handler: async (response: any) => {
              try {
                const verifyRes = await fetch("/api/invitations/verify-payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    invitationId: createData.invitationId,
                  }),
                });
                const verifyData = await verifyRes.json().catch(() => ({}));
                if (!verifyRes.ok) {
                  throw new Error(verifyData.error || "We couldn't confirm your payment.");
                }
                goToThankYou();
              } catch (verifyErr: any) {
                // Money may well have left their account here, so never imply
                // the payment failed — point them at support with the id.
                setError(
                  `${verifyErr.message || "We couldn't confirm your payment."} If you were charged, contact us with payment id ${response?.razorpay_payment_id || "(unknown)"} and we'll sort it out.`
                );
                setLoading(false);
                // Bring the form back so the message is actually visible.
                onOpenChange(true);
              } finally {
                resolve();
              }
            },
            modal: {
              // Closing the sheet is a cancellation, not an error. Reopen the
              // form with their details intact so retrying is one tap.
              ondismiss: () => {
                setLoading(false);
                onOpenChange(true);
                resolve();
              },
            },
          });
          rzp.open();
        });
        return;
      }

      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      goToThankYou();
    } catch (err: any) {
      setError(err.message || "Unable to submit right now. Please try again later.");
      // Covers the paid branch failing before the sheet ever opens, which the
      // finally below deliberately skips.
      setLoading(false);
    } finally {
      // The paid branch owns its own spinner once the sheet is up: it has to
      // stay on through Razorpay and only clear on dismiss or verification.
      if (!isPaidWebinar) setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={contentRef}
        className="flex flex-col gap-0 border-0 p-0 overflow-hidden
          max-sm:left-0 max-sm:top-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:h-[100dvh] max-sm:w-screen max-sm:max-w-none max-sm:rounded-none
          sm:w-[95vw] sm:max-w-2xl sm:max-h-[90dvh] sm:rounded-3xl"
      >
        <div className="flex flex-1 min-h-0 flex-col md:flex-row">
          <div ref={scrollAreaRef} onFocusCapture={handleFieldFocus} className="flex-1 min-h-0 p-6 pb-24 sm:p-8 sm:pb-8 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl sm:text-2xl" style={{ color: primaryColor }}>{invitation.formTitle}</DialogTitle>
              <DialogDescription className="text-gray-500 text-xs sm:text-sm">
                {invitation.subtitle}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {invitation.formHighlights.map((item, i) => (
                <span key={i} className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide px-2.5 sm:px-3 py-1 rounded-full" style={{ backgroundColor: hexToRgba(accentColor, 0.14), color: accentColor }}>
                  ✓ {item}
                </span>
              ))}
            </div>

            {/* Placeholder-only by request. Labels are kept as sr-only rather
                than deleted: screen readers and browser autofill both rely on
                them, and a placeholder vanishes the moment someone types. */}
            <form className="mt-5 space-y-2.5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="lt-inv-name" className="sr-only">First name</Label>
                <Input
                  id="lt-inv-name"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                  className="h-11 rounded-xl text-base sm:text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lt-inv-email" className="sr-only">Email</Label>
                <Input
                  id="lt-inv-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="h-11 rounded-xl text-base sm:text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lt-inv-whatsapp" className="sr-only">WhatsApp number</Label>
                <div className="flex gap-2">
                  <select
                    aria-label="Country code"
                    value={form.countryCode}
                    onChange={(e) => update("countryCode", e.target.value)}
                    className="h-11 rounded-xl border border-input bg-background px-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring w-[80px] sm:w-[90px] flex-shrink-0"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+64">🇳🇿 +64</option>
                    <option value="+27">🇿🇦 +27</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+52">🇲🇽 +52</option>
                    <option value="+92">🇵🇰 +92</option>
                    <option value="+880">🇧🇩 +880</option>
                    <option value="+94">🇱🇰 +94</option>
                    <option value="+977">🇳🇵 +977</option>
                  </select>
                  <Input
                    id="lt-inv-whatsapp"
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    placeholder="WhatsApp number"
                    autoComplete="tel-national"
                    className="h-11 rounded-xl flex-1 text-base sm:text-sm"
                    type="tel"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lt-inv-location" className="sr-only">Location (city, country)</Label>
                <Input
                  id="lt-inv-location"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="Location (city, country)"
                  autoComplete="address-level2"
                  className="h-11 rounded-xl text-base sm:text-sm"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {success ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-emerald-700 mt-3">{invitation.successTitle}</p>
                  <p className="text-sm text-emerald-600 mt-1">{invitation.successDescription}</p>
                </div>
              ) : (
                // Matches the CTA language used everywhere else on the page
                // (gradient fill + sheen sweep + sliding arrow) instead of the
                // flat block this used to be, so the highest-intent button on
                // the page is no longer the plainest one.
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="lt-cta lt-focus group/cta relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-70 sm:h-[52px] sm:text-base"
                    style={{
                      ...ctaStyle(primaryColor, accentColor),
                      ...(invitation.buttonTextColor ? { color: invitation.buttonTextColor } : {}),
                    }}
                  >
                    {!loading && <span className="lt-cta-sheen" aria-hidden="true" />}
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {isPaidWebinar ? "Opening payment…" : "Confirming…"}
                      </>
                    ) : (
                      <>
                        {submitLabel}
                        <CtaArrow className="ml-0" />
                      </>
                    )}
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                    <Lock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                    {isPaidWebinar
                      ? "Secure payment via Razorpay. Your seat is confirmed the moment it succeeds."
                      : "Your details stay private. No spam, ever."}
                  </p>
                </div>
              )}
            </form>
          </div>
          <div
            className="hidden md:flex md:w-64 text-white p-8 flex-col justify-between overflow-y-auto"
            style={{ backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, ${hexToRgba(primaryColor, 0.85)}, ${accentColor})` }}
          >
            <div>
              <h3 className="text-xl font-display font-semibold">Live Masterclass</h3>
              <p className="text-sm text-white/80 mt-2">Experience a powerful energetic breakthrough session.</p>
            </div>
            <div className="mt-10 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Community</p>
                  <p className="text-white/70 text-xs mt-0.5">Join {invitation.supportText}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Live Q&A</p>
                  <p className="text-white/70 text-xs mt-0.5">Ask your biggest transformation questions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Private Access</p>
                  <p className="text-white/70 text-xs mt-0.5">Receive a Zoom link after approval.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LandingTemplate({ data, pageContent, landingPageId, pageSlug, editorInstance, editorBridge }: LandingTemplateProps) {
  const t = normalizeTemplateData(data);
  const c = t.colors;
  // Returns override bg color for a section, or falls back to the provided default
  const sbg = (key: string, fallback: string) => (t.sectionBg?.[key]) || fallback;
  const sectionOrder = resolveSectionOrder(t.sectionOrder);
  const mediaSettings = t.mediaSettings || {};
  // The invitation form lives in its own component (InvitationDialog) below so
  // that typing in it does NOT re-render the whole landing page (which caused
  // the "page keeps refreshing" / unsubmittable-form bug). Parent only owns the
  // open state so any CTA can trigger it.
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const isPreviewMode = !landingPageId;

  // Design tokens derived from the page's own palette, so each landing page
  // gets this treatment in its own colors.
  const onDarkBody = isDarkColor(c.bodyBg);
  // Starts true so SSR and the first client render agree; the effect below only
  // ever turns it off, which can't cause a hydration mismatch.
  const [stageAnimated, setStageAnimated] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const sync = () => setStageAnimated(!mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  const stage = stageBackground(c.secondary, c.primary, c.accent, stageAnimated);
  const deepStage = stageBackground(c.darkBg, c.primary, c.accent, stageAnimated);
  // Surface tokens for the calm "reading" sections that sit on the body color.
  const ink = onDarkBody ? "#FFFFFF" : "#111827";
  const muted = onDarkBody ? "rgba(255,255,255,0.70)" : "#4B5563";
  const surface = onDarkBody ? "rgba(255,255,255,0.05)" : "#FFFFFF";
  const hairline = onDarkBody ? "rgba(255,255,255,0.12)" : hexToRgba(c.secondary, 0.11);
  // Light cards used a flat neutral drop shadow, which is what makes a card grid
  // read as a generic template. This is a three-layer shadow tinted with the
  // page's own deep token — a tight contact edge, a lift, and a wide ambient
  // pool — so cards sit in the palette instead of on top of it.
  const cardShadow = onDarkBody
    ? "0 18px 44px -26px rgba(0,0,0,.9)"
    : `0 1px 2px ${hexToRgba(c.secondary, 0.07)}, 0 10px 22px -14px ${hexToRgba(c.secondary, 0.3)}, 0 30px 60px -42px ${hexToRgba(c.secondary, 0.5)}`;

  // Scroll choreography. Skipped entirely in the admin editor: the canvas is a
  // CSS-zoomed, independently-scrolled container, so IntersectionObserver
  // wouldn't fire reliably there and sections could sit invisible mid-edit.
  const rootRef = useRef<HTMLDivElement>(null);
  const isEditorMode = Boolean(editorBridge || editorInstance);
  const orderSignature = sectionOrder.join(",");

  useEffect(() => {
    if (isEditorMode) return;
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("lt-anim");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    root.querySelectorAll(".lt-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isEditorMode, orderSignature]);

  const isCheckoutBar = t.floatingButton?.variant === "bar";
  const floatingOnDesktop = !!t.floatingButton?.showOnDesktop;

  const floatingButtonProps: FloatingButtonRenderProps | null = (() => {
    if (!t.floatingButton?.enabled) return null;
    switch (t.floatingButton.section) {
      case "hero":
        if (!t.hero.visible || !hasContent(t.hero.ctaButtonText)) return null;
        if (t.hero.ctaButtonAction === "url") {
          return { label: t.hero.ctaButtonText, href: resolveLink(t.hero.ctaButtonLink) };
        }
        return { label: t.hero.ctaButtonText, action: () => setInvitationDialogOpen(true) };
      case "program":
        if (!t.program.visible || !hasContent(t.program.ctaButtonText)) return null;
        if (t.program.ctaButtonAction === "url") {
          return { label: t.program.ctaButtonText, href: resolveLink(t.program.ctaButtonLink) };
        }
        return { label: t.program.ctaButtonText, action: () => setInvitationDialogOpen(true) };
      case "invitation":
        if (!t.invitation.enabled || !hasContent(t.invitation.buttonText)) return null;
        if (t.invitation.buttonAction === "url") {
          return { label: t.invitation.buttonText, href: resolveLink(t.invitation.buttonLink) };
        }
        return { label: t.invitation.buttonText, action: () => setInvitationDialogOpen(true) };
      case "footer":
        if (!t.footer.enabled || !hasContent(t.footer.cta.ctaButtonText)) return null;
        if (t.footer.cta.ctaButtonAction === "url") {
          return { label: t.footer.cta.ctaButtonText, href: resolveLink(t.footer.cta.ctaButtonLink) };
        }
        return { label: t.footer.cta.ctaButtonText, action: () => setInvitationDialogOpen(true) };
      default:
        return null;
    }
  })();

  // The docked bar is far narrower than an in-page CTA, so it may carry its own
  // shorter label rather than the full section button text.
  const floatingCtaLabel =
    hasContent(t.floatingButton?.ctaTextOverride)
      ? t.floatingButton!.ctaTextOverride!
      : floatingButtonProps?.label;

  const heroSlides = useMemo(() => {
    const slides = (t.hero.heroMedia || [])
      .filter((item) => item?.url && item.url.trim().length > 0)
      .map((item) => ({ ...item, url: item.url.trim() }));
    if (slides.length === 0 && hasContent(t.hero.heroImage)) {
      return [{ url: t.hero.heroImage, label: t.hero.highlightedWord || "" }];
    }
    return slides;
  }, [t.hero.heroMedia, t.hero.heroImage, t.hero.highlightedWord]);

  // Stable reference for video testimonial items — prevents slider from re-initializing
  // when parent re-renders produce a new array reference with the same content
  const videoTestimonialItems = useMemo(
    () => t.videoTestimonials.items,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(t.videoTestimonials.items)]
  );

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // "Format Carousel" section — single rotating image with dot pagination.
  // State lives at the top level (not inside renderSection) so it obeys the
  // rules of hooks regardless of section order.
  const formatsSlides = t.formats?.slides || [];
  const [currentFormatsSlide, setCurrentFormatsSlide] = useState(0);
  useEffect(() => {
    setCurrentFormatsSlide((prev) => (formatsSlides.length === 0 ? 0 : Math.min(prev, formatsSlides.length - 1)));
  }, [formatsSlides.length]);
  useEffect(() => {
    if (formatsSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentFormatsSlide((prev) => (prev + 1) % formatsSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [formatsSlides.length]);

  useEffect(() => {
    setCurrentHeroSlide((prev) => {
      if (heroSlides.length === 0) return 0;
      return Math.min(prev, heroSlides.length - 1);
    });
  }, [heroSlides.length]);

  useEffect(() => {
    if (!t.hero.carouselAutoplay || heroSlides.length <= 1) return;
    const intervalDuration = Math.max(t.hero.carouselInterval || 5000, 2000);
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, intervalDuration);
    return () => clearInterval(timer);
  }, [t.hero.carouselAutoplay, t.hero.carouselInterval, heroSlides.length]);

  const handleHeroSlideChange = (direction: "prev" | "next") => {
    if (heroSlides.length <= 1) return;
    setCurrentHeroSlide((prev) => {
      if (direction === "prev") {
        return prev === 0 ? heroSlides.length - 1 : prev - 1;
      }
      return prev === heroSlides.length - 1 ? 0 : prev + 1;
    });
  };

  const renderHeroCarousel = (fitClassName: string = "object-cover object-top") => {
    if (heroSlides.length === 0) {
      return renderMedia(t.hero.heroImage, mediaKey("hero", "heroImage"), {
        wrapperClassName: "absolute inset-0 w-full h-full",
        className: `w-full h-full ${fitClassName}`,
        alt: "Hero",
      });
    }

    return (
      <div className="group relative w-full h-full">
        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => {
            const isSlideActive = index === currentHeroSlide;
            return (
            <div
              key={`${slide.url}-${index}-${isSlideActive ? 'active' : 'inactive'}`}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isSlideActive
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {renderMedia(slide.url, mediaKey("hero", "heroMedia", index, "url"), {
                wrapperClassName: "absolute inset-0 w-full h-full",
                className: `w-full h-full ${fitClassName}`,
                alt: slide.label || `Hero slide ${index + 1}`,
                isActive: isSlideActive,
              })}
            </div>
            );
          })}
        </div>

        {heroSlides.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 text-gray-900 flex items-center justify-center shadow-lg opacity-70 transition md:opacity-0 md:group-hover:opacity-100"
              onClick={() => handleHeroSlideChange("prev")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 text-gray-900 flex items-center justify-center shadow-lg opacity-70 transition md:opacity-0 md:group-hover:opacity-100"
              onClick={() => handleHeroSlideChange("next")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* The visible dot stays small; the button around it is padded out
                to a finger-sized hit area. */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center">
              {heroSlides.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentHeroSlide}
                  onClick={() => setCurrentHeroSlide(index)}
                  className="lt-focus flex h-11 w-7 items-center justify-center"
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all ${
                      index === currentHeroSlide ? "w-8 bg-white" : "w-2 bg-white/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const withWrapper = (
    element: React.ReactNode,
    wrapperClassName?: string
  ) => {
    if (!wrapperClassName) return element;
    return <div className={wrapperClassName}>{element}</div>;
  };

  const renderMedia = (
    url?: string,
    key?: string,
    options: { className?: string; wrapperClassName?: string; alt?: string; isActive?: boolean } = {}
  ) => {
    if (!url) return null;
    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
    const isVideo = VIDEO_REGEX.test(url);

    if (isYouTube) {
      const youtubeId = extractYouTubeId(url);
      if (!youtubeId) return null;
      
      // For hero carousel slides, fallback to hero.heroImage settings if no specific slide settings
      let settings = key ? mediaSettings[key] : undefined;
      if (!settings && key?.startsWith('hero.heroMedia.')) {
        settings = mediaSettings['hero.heroImage'];
      }
      settings = settings || DEFAULT_MEDIA_SETTINGS;
      
      const shouldAutoplay = settings.autoplay;
      const isMuted = settings.mute;
      return withWrapper(
        <YouTubeEmbed
          videoId={youtubeId}
          autoplay={shouldAutoplay && options.isActive !== false}
          muted={isMuted}
          className={options.className}
        />,
        options.wrapperClassName || "relative w-full overflow-hidden aspect-video"
      );
    }

    if (isVideo) {
      // For hero carousel slides, fallback to hero.heroImage settings if no specific slide settings
      let settings = key ? mediaSettings[key] : undefined;
      if (!settings && key?.startsWith('hero.heroMedia.')) {
        settings = mediaSettings['hero.heroImage'];
      }
      settings = settings || DEFAULT_MEDIA_SETTINGS;
      
      const videoId = `video-${key || Date.now()}`;
      
      // Module-level component (see VideoWithControls) — must NOT be defined
      // inline here, or it remounts (and the video reloads) on every render.
      return withWrapper(
        <VideoWithControls
          src={url}
          className={options.className}
          autoplay={settings.autoplay}
          mute={settings.mute}
        />,
        options.wrapperClassName
      );
    }

    return withWrapper(
      <img src={url} alt={options.alt || ""} className={options.className} />,
      options.wrapperClassName
    );
  };

  // Renders a dynamic free-floating rich block (`richContent:<id>`) —
  // mirrors the literal `richContent` case below exactly, just sourced from
  // its own `richBlocks` entry instead of the page-level `content` prop.
  function renderRichBlock(sectionKey: string) {
    const id = richBlockId(sectionKey);
    const block = (t.richBlocks || []).find((b) => b.id === id);
    if (!block || block.hidden) return null;
    const isFocused = !!editorInstance && editorBridge?.focusedBlockId === sectionKey;

    if (isFocused) {
      const doc = editorInstance.state?.doc;
      const isEmpty =
        editorInstance.isEmpty ||
        (doc && doc.childCount === 1 && doc.firstChild && doc.firstChild.content.size === 0);
      return (
        <div key={sectionKey} className="landing-rich-content relative">
          {isEmpty && (
            <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40">
              
            </div>
          )}
          <div style={isEmpty ? { minHeight: 140 } : undefined}>
            <EditorContent editor={editorInstance} />
          </div>
        </div>
      );
    }

    if (!block.content?.doc) return null;
    return (
      <div
        key={sectionKey}
        className={editorInstance ? "landing-rich-content relative group/richblock cursor-pointer" : "landing-rich-content"}
        onClick={editorInstance ? () => editorBridge?.onFocusRichBlock(sectionKey) : undefined}
      >
        <DynamicPageRenderer
          content={block.content}
          theme={{ primary: c.primary, secondary: c.secondary, accent: c.accent, background: c.bodyBg }}
          title=""
          pageSlug={pageSlug}
          landingPageId={landingPageId}
          embedded
        />
        {editorInstance && <RichBlockFocusOverlay />}
      </div>
    );
  }

  const renderSection = (sectionKey: string) => {
    if (isRichBlockKey(sectionKey)) return renderRichBlock(sectionKey);
    switch (sectionKey) {
      case 'hero': {
        if (!t.hero.visible) return null;
        const heroBg = t.sectionBg?.['hero'] ? { backgroundColor: t.sectionBg['hero'] } : stage;

        if (t.hero.layout === "fullBleed") {
          return (
            <section
              className="relative flex min-h-[100svh] flex-col overflow-hidden px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8"
              style={heroBg}
            >
              <span className="lt-grain-layer" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="lt-aura pointer-events-none absolute left-1/2 top-[10%] -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] sm:h-[760px] sm:w-[760px] rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${hexToRgba(c.accent, 0.4)} 0%, ${hexToRgba(c.primary, 0.22)} 45%, transparent 70%)` }}
              />

              <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-shrink-0 flex-col items-center gap-5 text-center">
                {hasContent(t.hero.badge) && (
                  <span
                    className="lt-rise inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur-sm"
                    style={{ ["--lt-i" as string]: 0, color: "#fff", backgroundColor: "rgba(255,255,255,0.10)", border: `1px solid ${hexToRgba(c.accent, 0.45)}` }}
                  >
                    {t.hero.badge}
                  </span>
                )}
                <h1
                  className="lt-rise font-display font-bold text-white text-[clamp(2rem,5.4vw,3.6rem)] leading-[1.06] tracking-[-0.02em]"
                  style={{ ["--lt-i" as string]: 1 }}
                >
                  {t.hero.headline}{" "}
                  {hasContent(t.hero.highlightedWord) && (
                    <span className="relative inline-block sm:whitespace-nowrap">
                      <span style={{ color: c.accent, textShadow: `0 0 38px ${hexToRgba(c.accent, 0.5)}` }}>
                        {t.hero.highlightedWord}
                      </span>
                    </span>
                  )}
                </h1>
                {hasContent(t.hero.subheadline) && (
                  <p className="lt-rise font-body max-w-2xl text-base sm:text-lg leading-relaxed text-white" style={{ ["--lt-i" as string]: 2 }}>
                    {t.hero.subheadline}
                  </p>
                )}
                <div className="lt-rise" style={{ ["--lt-i" as string]: 3 }}>
                  {t.hero.ctaButtonAction === "url" ? (
                    <a href={resolveLink(t.hero.ctaButtonLink)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                      <span className="lt-cta-sheen" aria-hidden="true" />
                      {hasContent(t.hero.ctaButtonText) ? t.hero.ctaButtonText : "Get Started"}
                      <CtaArrow />
                    </a>
                  ) : (
                    <button type="button" onClick={() => setInvitationDialogOpen(true)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                      <span className="lt-cta-sheen" aria-hidden="true" />
                      {hasContent(t.hero.ctaButtonText) ? t.hero.ctaButtonText : "Get Started"}
                      <CtaArrow />
                    </button>
                  )}
                </div>
              </div>

              {heroSlides.length > 0 && (
                <div className="relative z-0 mt-6 min-h-0 flex-1">
                  <div className="absolute inset-0">{renderHeroCarousel("object-contain object-bottom")}</div>
                  {hasContent(t.hero.scrollIndicatorText) && (
                    <a
                      href={t.hero.scrollIndicatorTarget || "#"}
                      className="animate-bounce absolute inset-x-0 bottom-4 z-10 flex flex-col items-center gap-1 text-center text-white/90"
                    >
                      <span className="font-body text-xs sm:text-sm">{t.hero.scrollIndicatorText}</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </section>
          );
        }

        return (
            <section
              className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20"
              style={heroBg}
            >
              <span className="lt-grain-layer" aria-hidden="true" />
              {/* Aura — the page signature: a slow bloom of charged light */}
              <span
                aria-hidden="true"
                className="lt-aura pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] sm:h-[760px] sm:w-[760px] rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${hexToRgba(c.accent, 0.4)} 0%, ${hexToRgba(c.primary, 0.22)} 45%, transparent 70%)` }}
              />

              <div className="relative max-w-4xl mx-auto text-center">
                {hasContent(t.hero.badge) && (
                  <span
                    className="lt-rise inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur-sm"
                    style={{
                      ["--lt-i" as string]: 0,
                      color: "#fff",
                      backgroundColor: "rgba(255,255,255,0.10)",
                      border: `1px solid ${hexToRgba(c.accent, 0.45)}`,
                    }}
                  >
                    {t.hero.badge}
                  </span>
                )}

                <h1
                  className="lt-rise font-display font-bold text-white mt-7 text-[clamp(2.1rem,5.4vw,4.1rem)] leading-[1.04] tracking-[-0.025em]"
                  style={{ ["--lt-i" as string]: 1 }}
                >
                  {t.hero.headline}{" "}
                  {hasContent(t.hero.highlightedWord) && (
                    <span className="relative inline-block sm:whitespace-nowrap">
                      <span style={{ color: c.accent, textShadow: `0 0 38px ${hexToRgba(c.accent, 0.5)}` }}>
                        {t.hero.highlightedWord}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-2 left-0 h-px w-full"
                        style={{ background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }}
                      />
                    </span>
                  )}
                </h1>

                {heroSlides.length > 0 && (
                  <div className="lt-rise relative mt-10" style={{ ["--lt-i" as string]: 2 }}>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-6 rounded-[40px] blur-2xl"
                      style={{ background: `radial-gradient(60% 60% at 50% 60%, ${hexToRgba(c.accent, 0.4)} 0%, transparent 70%)` }}
                    />
                    <div
                      className="relative w-full aspect-video rounded-[24px] overflow-hidden"
                      style={{
                        border: "1px solid rgba(255,255,255,0.16)",
                        boxShadow: `0 40px 80px -30px rgba(0,0,0,.7), 0 0 0 1px ${hexToRgba(c.accent, 0.14)}`,
                      }}
                    >
                      <div className="absolute inset-0">{renderHeroCarousel()}</div>
                    </div>
                  </div>
                )}

                {hasContent(t.hero.subheadline) && (
                  <p
                    className="lt-rise font-body mx-auto mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-white"
                    style={{ ["--lt-i" as string]: 3 }}
                  >
                    {t.hero.subheadline}
                  </p>
                )}

                {Array.isArray(t.hero.bulletPoints) && t.hero.bulletPoints.filter(Boolean).length > 0 && (
                  <ul className="lt-rise mt-8 flex flex-wrap justify-center gap-2.5" style={{ ["--lt-i" as string]: 4 }}>
                    {t.hero.bulletPoints.filter(Boolean).map((point, i) => (
                      <li
                        key={i}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-body text-white backdrop-blur-sm"
                        style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: c.accent }} />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="lt-rise mt-11 flex flex-col items-center gap-8" style={{ ["--lt-i" as string]: 5 }}>
                  {t.hero.ctaButtonAction === "url" ? (
                    <a href={resolveLink(t.hero.ctaButtonLink)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                      <span className="lt-cta-sheen" aria-hidden="true" />
                      {hasContent(t.hero.ctaButtonText) ? t.hero.ctaButtonText : "Get Started"}
                      <CtaArrow />
                    </a>
                  ) : (
                    <button type="button" onClick={() => setInvitationDialogOpen(true)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                      <span className="lt-cta-sheen" aria-hidden="true" />
                      {hasContent(t.hero.ctaButtonText) ? t.hero.ctaButtonText : "Get Started"}
                      <CtaArrow />
                    </button>
                  )}

                  {Array.isArray(t.hero.floatingStats) && t.hero.floatingStats.filter((s) => s?.value || s?.label).length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
                      {t.hero.floatingStats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className="font-display text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                          <div className="mt-1 font-body text-[10px] uppercase tracking-[0.2em] text-white/55">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
        );
      }

      case 'marquee':
        return t.marquee.enabled && <Marquee items={t.marquee.items} color={sbg('marquee', c.secondary)} accent={c.accent} />;
      
      case 'why': {
        if (!t.why.visible) return null;

        if (t.why.layoutVariant === "splitAlternating") {
          const reverse = t.why.imageSide === "right";
          const images = t.why.points.slice(0, 6);
          return (
            <section className="relative overflow-hidden py-8 sm:py-11 lg:py-14" style={t.sectionBg?.['why'] ? { backgroundColor: t.sectionBg['why'] } : deepStage}>
              <span className="lt-grain-layer" aria-hidden="true" />
              <div className={`relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 lg:gap-16 lg:px-8 ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
                <div className="grid w-full max-w-[560px] grid-cols-3 gap-3 lg:gap-5">
                  {images.map((point, i) => (
                    <div
                      key={i}
                      className="lt-reveal aspect-square overflow-hidden rounded-[16px]"
                      style={{ ["--lt-i" as string]: i, boxShadow: "0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1)" }}
                    >
                      {renderMedia(point.image, mediaKey("why", "points", i, "image"), {
                        className: "w-full h-full object-cover",
                        alt: point.title,
                      })}
                    </div>
                  ))}
                </div>
                <div className="lt-reveal flex-1">
                  <SectionHeading title={t.why.title} subtitle={t.why.subtitle} accent={c.accent} onDark align="left" />
                </div>
              </div>
            </section>
          );
        }

        // Exactly three points render as a 1+2 bento: one tall feature tile
        // beside a stacked pair. Three identical cards in a row is the single
        // most templated shape on the web, and the first point is always the
        // strongest, so it earns the larger tile. Any other count keeps the
        // plain grid, which stays correct for the other pages on this template.
        const whyBento = t.why.points.length === 3;

        const renderWhyCard = (point: WhySection["points"][number], i: number) => {
          const featured = whyBento && i === 0;
          // A bento of three photo cards is still three of the same thing. A
          // cell with no image becomes an accent-washed type tile, which gives
          // the grid real material variation without inventing content to fill.
          const tinted = whyBento && !featured && !hasContent(point.image);
          // Default is object-contain: these are usually brand posters with
          // the headline baked into the artwork, and a square poster in a
          // wide bento box was losing half of itself to the crop. Contained
          // on a tinted plinth nothing is lost, and it reads as a deliberate
          // product shot rather than a botched crop. Per-point imageFit:
          // "cover" opts a specific point out of that when the page author
          // wants the frame filled instead (accepting the crop); "natural"
          // (see below) skips the fixed well entirely.
          const natural = point.imageFit === "natural";
          const pointMedia = renderMedia(point.image, mediaKey("why", "points", i, "image"), {
            className: natural ? "w-full h-auto block" : `w-full h-full ${point.imageFit === "cover" ? "object-cover" : "object-contain"}`,
            alt: point.title,
          });
          return (
            <div
              key={i}
              className={`lt-reveal lt-card lt-zoom group overflow-hidden rounded-[20px] sm:rounded-[26px] ${
                featured ? "lg:col-span-3" : whyBento ? "lg:flex lg:flex-col" : ""
              }`}
              style={{
                ["--lt-i" as string]: i,
                backgroundColor: surface,
                ...(tinted
                  ? {
                      backgroundImage: `linear-gradient(150deg, ${hexToRgba(c.accent, 0.14)} 0%, ${hexToRgba(c.primary, 0.1)} 55%, ${hexToRgba(c.secondary, 0.06)} 100%)`,
                    }
                  : null),
                border: `1px solid ${tinted ? hexToRgba(c.accent, 0.28) : hairline}`,
                boxShadow: cardShadow,
              }}
            >
              {pointMedia && (
                <div
                  // Boxes are sized so a contained image still fills most of
                  // them: the feature gets a near-square well (its posters are
                  // 1:1), the stacked pair a 3:2 well. "natural" (opt-in per
                  // point) skips this fixed well entirely — the card's height
                  // follows the image's own aspect ratio instead, for a
                  // point whose photo doesn't match either preset ratio.
                  className={natural ? "overflow-hidden" : `overflow-hidden ${
                    featured
                      ? "aspect-[4/3] sm:aspect-[16/11] lg:aspect-[7/5]"
                      : whyBento
                        ? "aspect-[16/10] lg:aspect-[3/2]"
                        : "h-44 sm:h-56"
                  }`}
                  style={
                    whyBento && !natural
                      ? { backgroundColor: hexToRgba(c.primary, 0.06) }
                      : undefined
                  }
                >
                  {pointMedia}
                </div>
              )}
              <div className={`p-5 text-center sm:p-7 sm:text-left ${featured ? "" : tinted ? "lg:p-7" : "lg:p-6"}`}>
                {/* RitualRule is an inline-flex atom, so it needs a flex parent
                    to center; on its own it hugs the left edge. Only the tiles
                    without a photo keep it. Repeating the same divider on every
                    tile is what made this grid read as a template. */}
                {(featured || tinted) && (
                  <div className="mb-4 flex justify-center sm:justify-start">
                    <RitualRule color={c.accent} />
                  </div>
                )}
                <h3
                  className={`font-display font-bold leading-snug ${featured ? "text-xl sm:text-3xl" : "text-lg sm:text-2xl lg:text-xl"}`}
                  style={{ color: ink }}
                >
                  {point.title}
                </h3>
                <p
                  className={`font-body mt-2 leading-relaxed sm:mt-3 ${featured ? "" : "text-sm sm:text-base"}`}
                  style={{ color: muted }}
                >
                  {point.description}
                </p>
              </div>
            </div>
          );
        };

        return (
        <section className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('why', c.bodyBg) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading title={t.why.title} subtitle={t.why.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6 lg:mb-9" />
            <div className={`grid gap-4 sm:gap-6 lg:gap-7 ${whyBento ? "lg:grid-cols-5 lg:items-stretch" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {whyBento ? (
                <>
                  {renderWhyCard(t.why.points[0], 0)}
                  <div className="grid gap-4 sm:gap-6 lg:col-span-2 lg:flex lg:flex-col lg:gap-7">
                    {t.why.points.slice(1).map((point, n) => renderWhyCard(point, n + 1))}
                  </div>
                </>
              ) : (
                t.why.points.map((point, i) => renderWhyCard(point, i))
              )}
            </div>
          </div>
        </section>
      );
      }

      case 'about':
        return t.about.visible && (
        <section className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('about', hexToRgba(c.primary, 0.05)) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-16 items-center">
              <div className="lt-reveal relative mx-auto w-full max-w-sm">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-5 rounded-[40px] blur-2xl"
                  style={{ background: `radial-gradient(circle at 50% 45%, ${hexToRgba(c.accent, 0.32)} 0%, transparent 70%)` }}
                />
                <div className="lt-zoom relative aspect-square overflow-hidden rounded-[28px]" style={{ border: `1px solid ${hexToRgba(c.accent, 0.28)}`, boxShadow: cardShadow }}>
                  {renderMedia(t.about.image, mediaKey("about", "image"), {
                    className: "w-full h-full object-cover",
                    wrapperClassName: "absolute inset-0",
                    alt: t.about.name,
                  })}
                </div>
              </div>
              <div>
                {hasContent(t.about.title) && (
                  <span
                    className="lt-reveal inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ backgroundColor: hexToRgba(c.accent, 0.12), color: c.accent, border: `1px solid ${hexToRgba(c.accent, 0.3)}` }}
                  >
                    {t.about.title}
                  </span>
                )}
                <h2
                  className="lt-reveal font-display mt-6 text-[clamp(1.9rem,4vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.02em]"
                  style={{ ["--lt-i" as string]: 1, color: ink }}
                >
                  {t.about.name}
                </h2>
                <p
                  className="lt-reveal font-body mt-5 text-base sm:text-lg leading-relaxed whitespace-pre-line"
                  style={{ ["--lt-i" as string]: 2, color: muted }}
                >
                  {t.about.description}
                </p>
                {t.about.credentials.length > 0 && (
                  <ul className="lt-reveal mt-8 flex flex-wrap gap-2.5" style={{ ["--lt-i" as string]: 3 }}>
                    {t.about.credentials.map((cred, i) => (
                      <li
                        key={i}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm"
                        style={{ backgroundColor: surface, border: `1px solid ${hairline}`, color: ink }}
                      >
                        <span className="h-1.5 w-1.5 rotate-45 flex-shrink-0" style={{ backgroundColor: c.accent }} />
                        {cred}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      );
      
      case 'guidesRail': {
        const rail = t.guidesRail;
        if (!rail || !rail.visible || rail.items.length === 0) return null;
        return (
          <section id="guidesRail" className="relative overflow-hidden py-8 sm:py-11 lg:py-14" style={t.sectionBg?.['guidesRail'] ? { backgroundColor: t.sectionBg['guidesRail'] } : deepStage}>
            <span className="lt-grain-layer" aria-hidden="true" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeading title={rail.title} subtitle={rail.subtitle} accent={c.accent} onDark className="mb-5 lg:mb-7" />
            </div>
            {/* Horizontal-only rail. overflow-x-auto on its own is not enough:
                per spec a non-visible value on one axis promotes the other from
                `visible` to `auto`, so the rail also became vertically
                scrollable and swallowed vertical swipes on touch. overflow-y
                is pinned to hidden and touch-action limited to pan-x so
                up/down gestures scroll the page instead. pb-7 leaves room for
                the lt-reveal translateY(26px) so cards aren't clipped mid-
                animation now that the box clips vertically. */}
            <div className="relative mt-2 flex touch-pan-x gap-5 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide px-4 pb-7 sm:px-6 lg:px-20">
              {rail.items.map((person, i) => (
                <a
                  key={i}
                  href={resolveLink(person.link || "#")}
                  className="lt-reveal group relative w-[220px] sm:w-[250px] flex-shrink-0 overflow-hidden rounded-[32px]"
                  style={{ ["--lt-i" as string]: i, aspectRatio: "2 / 3", boxShadow: cardShadow }}
                >
                  {renderMedia(person.image, mediaKey("guidesRail", "items", i, "image"), {
                    className: "absolute inset-0 w-full h-full object-cover",
                    alt: person.name,
                  })}
                  <div
                    className="absolute inset-x-0 bottom-0 flex flex-col justify-end gap-1.5 p-5"
                    style={{ height: "62%", backgroundImage: `linear-gradient(180deg, transparent 0%, ${hexToRgba(c.darkBg, 0.9)} 65%)` }}
                  >
                    <p className="font-display text-xl font-bold leading-tight text-white">{person.name}</p>
                    <div className="relative h-5 overflow-hidden">
                      <span className="font-body absolute inset-x-0 bottom-0 text-sm text-white/75 transition-all duration-300 group-hover:-translate-y-5 group-hover:opacity-0">
                        {person.role}
                      </span>
                      <span
                        className="font-body absolute inset-x-0 bottom-0 flex translate-y-5 items-center gap-1 text-sm font-semibold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                        style={{ color: c.accent }}
                      >
                        Explore
                        <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      }

      case 'logos':
        return t.logos.enabled && t.logos.logos.length > 0 && (
        <section className="py-12" style={{ backgroundColor: sbg('logos', c.bodyBg), borderTop: `1px solid ${hairline}`, borderBottom: `1px solid ${hairline}` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="lt-reveal text-center font-body text-[11px] font-semibold uppercase tracking-[0.28em] mb-6" style={{ color: muted }}>
              {t.logos.title}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-60">
              {t.logos.logos.map((logo, i) => (
                <div key={i} className="h-8 flex items-center">
                  {logo.image ? (
                    renderMedia(logo.image, mediaKey("logos", "logos", i, "image"), {
                      className: "h-full w-auto object-contain grayscale hover:grayscale-0 transition-all",
                      alt: logo.alt,
                    })
                  ) : (
                    <div className="h-8 w-24 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 font-semibold uppercase">
                      {logo.alt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
      
      case 'gallery':
        return t.gallery.visible && t.gallery.images.length > 0 && (
        <section className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('gallery', c.bodyBg) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading title={t.gallery.title} subtitle={t.gallery.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6" />
            <div className="flex flex-wrap justify-center gap-4">
              {t.gallery.images.map((img, i) => (
                <div
                  key={i}
                  className="lt-reveal lt-card lt-zoom group relative aspect-[4/3] w-[calc(50%-0.5rem)] overflow-hidden rounded-[22px] lg:w-[calc(33.333%-0.667rem)]"
                  style={{ ["--lt-i" as string]: i % 3, border: `1px solid ${hairline}`, boxShadow: cardShadow }}
                >
                  {renderMedia(img.url, mediaKey("gallery", "images", i, "url"), {
                    className: "w-full h-full object-cover",
                    alt: img.caption,
                  })}
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm font-medium">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
      
      case 'stats': {
        if (!t.stats.visible) return null;
        const isTrustRail = t.stats.cardStyle === "lightOnDark";
        return (
        <section
          id="stats"
          className="relative overflow-hidden py-8 sm:py-11 lg:py-16"
          style={t.sectionBg?.['stats'] ? { backgroundColor: t.sectionBg['stats'] } : deepStage}
        >
          <span className="lt-grain-layer" aria-hidden="true" />
          {t.stats.backgroundImage && (
            <div
              className="absolute inset-0 opacity-15 bg-cover bg-center"
              style={{ backgroundImage: `url(${t.stats.backgroundImage})` }}
            />
          )}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading title={t.stats.title} subtitle={t.stats.subtitle} accent={c.accent} onDark className="mb-7" />
            {isTrustRail ? (
              <div
                className={`lt-reveal grid grid-cols-1 gap-6 rounded-[16px] p-6 md:p-10 ${
                  // A 4-item rail in a 3-column grid strands the last one on its
                  // own row; 4-up (2-up on tablet) keeps every row full.
                  t.stats.stats.length % 4 === 0 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"
                }`}
                style={{ backgroundColor: "#FFFFFF", border: `2px solid ${hexToRgba(c.accent, 0.25)}` }}
              >
                {t.stats.stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: c.darkBg }}>
                      <ProgramIcon name={stat.icon} className="h-6 w-6" style={{ color: "#fff" } as React.CSSProperties} />
                    </div>
                    <div>
                      <CountUpValue value={stat.value} className="font-display block text-lg font-bold leading-snug tabular-nums" style={{ color: "#111827" }} />
                      <div className="font-body mt-0.5 text-sm leading-snug" style={{ color: "#4B5563" }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className={`grid gap-3.5 sm:gap-5 lg:gap-6 grid-cols-2 ${t.stats.stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {t.stats.stats.map((stat, i) => {
                // Labels are used two ways across pages: short captions
                // ("Students") and full sentences used as a checklist. Micro-caps
                // only suits the former, so long labels fall back to plain body text.
                const isSentence = (stat.label || "").length > 28;
                return (
                <div
                  key={i}
                  className="lt-reveal lt-card rounded-2xl p-6 text-center backdrop-blur-sm"
                  style={{
                    ["--lt-i" as string]: i,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.13)",
                  }}
                >
                  <CountUpValue value={stat.value} className="font-display block text-2xl font-bold leading-tight tabular-nums text-white lg:text-3xl" />
                  <div
                    className={
                      isSentence
                        ? "font-body mt-3 text-sm leading-relaxed text-white/70"
                        : "font-body mt-2 text-[10px] uppercase tracking-[0.2em] text-white/55"
                    }
                  >
                    {stat.label}
                  </div>
                </div>
              );})}
            </div>
            )}
            {hasContent(t.stats.ctaButtonText) && (
              <div className="lt-reveal mt-8 text-center">
                {t.stats.ctaButtonAction === "url" ? (
                  <a href={resolveLink(t.stats.ctaButtonLink)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                    <span className="lt-cta-sheen" aria-hidden="true" />
                    {t.stats.ctaButtonText}
                    <CtaArrow />
                  </a>
                ) : (
                  <button type="button" onClick={() => setInvitationDialogOpen(true)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                    <span className="lt-cta-sheen" aria-hidden="true" />
                    {t.stats.ctaButtonText}
                    <CtaArrow />
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      );
      }

      case 'formats': {
        const fmt = t.formats;
        if (!fmt || !fmt.visible || formatsSlides.length === 0) return null;
        const activeSlide = formatsSlides[Math.min(currentFormatsSlide, formatsSlides.length - 1)];
        return (
          <section id="formats" className="relative overflow-hidden py-8 sm:py-11 lg:py-14" style={t.sectionBg?.['formats'] ? { backgroundColor: t.sectionBg['formats'] } : deepStage}>
            <span className="lt-grain-layer" aria-hidden="true" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeading title={fmt.title} subtitle={fmt.subtitle} accent={c.accent} onDark className="mb-5 lg:mb-7" />
              <div className="lt-reveal relative w-full overflow-hidden rounded-[28px]" style={{ aspectRatio: "1310 / 440", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 40px 80px -30px rgba(0,0,0,.7)" }}>
                {formatsSlides.map((slide, index) => (
                  <div
                    key={`${slide.image}-${index}`}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentFormatsSlide ? "opacity-100 scale-100" : "opacity-0 scale-[1.02] pointer-events-none"}`}
                  >
                    {renderMedia(slide.image, mediaKey("formats", "slides", index, "image"), {
                      wrapperClassName: "absolute inset-0 w-full h-full",
                      className: "w-full h-full object-cover",
                      alt: slide.label || activeSlide?.label || "",
                      isActive: index === currentFormatsSlide,
                    })}
                  </div>
                ))}
              </div>
              {formatsSlides.length > 1 && (
                <div className="mt-3 flex items-center justify-center">
                  {formatsSlides.map((_, index) => (
                    <button
                      key={`formats-dot-${index}`}
                      type="button"
                      onClick={() => setCurrentFormatsSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      aria-current={index === currentFormatsSlide}
                      className="lt-focus flex h-11 w-7 items-center justify-center"
                    >
                      <span
                        className="block h-2 rounded-full transition-all duration-300"
                        style={{
                          width: index === currentFormatsSlide ? 24 : 8,
                          backgroundColor: index === currentFormatsSlide ? c.accent : "rgba(255,255,255,0.3)",
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      }

      case 'testimonials': {
        if (!t.testimonials.visible || t.testimonials.items.length === 0) return null;

        if (t.testimonials.displayMode === "marquee") {
          const items = t.testimonials.items;
          const rowForward = [...items, ...items];
          const rowReverse = [...[...items].reverse(), ...[...items].reverse()];
          const renderMarqueeCard = (item: TestimonialItem, key: string) => (
            <div
              key={key}
              className="flex h-[152px] w-[280px] sm:w-[300px] flex-shrink-0 flex-col gap-2 rounded-[16px] p-4"
              style={{ backgroundColor: surface, border: `1px solid ${hairline}`, boxShadow: cardShadow }}
            >
              <div className="flex items-center gap-3">
                {item.image ? (
                  renderMedia(item.image, undefined, {
                    className: "h-9 w-9 rounded-full object-cover",
                    wrapperClassName: "h-9 w-9 rounded-full overflow-hidden flex-shrink-0",
                    alt: item.name,
                  })
                ) : (
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
                    style={{ backgroundImage: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }}
                  >
                    {item.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-bold" style={{ color: ink }}>{item.name}</p>
                  {hasContent(item.role) && <p className="truncate font-body text-xs" style={{ color: muted }}>{item.role}</p>}
                </div>
                <div className="flex flex-shrink-0 items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="h-3 w-3" viewBox="0 0 20 20" fill={c.accent}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="line-clamp-3 font-body text-xs leading-snug" style={{ color: muted }}>{item.quote}</p>
            </div>
          );
          const maskStyle: React.CSSProperties = {
            maskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          };
          return (
            <section id="testimonials" className="overflow-hidden py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('testimonials', c.bodyBg) }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading title={t.testimonials.title} subtitle={t.testimonials.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6 lg:mb-9" />
              </div>
              <div className="lt-reveal flex flex-col gap-5">
                <div className="lt-marquee-row overflow-hidden" style={maskStyle}>
                  <div className="lt-marquee-track flex w-max gap-5">
                    {rowForward.map((item, i) => renderMarqueeCard(item, `a-${i}`))}
                  </div>
                </div>
                <div className="lt-marquee-row overflow-hidden" style={maskStyle}>
                  <div className="lt-marquee-track lt-marquee-reverse flex w-max gap-5">
                    {rowReverse.map((item, i) => renderMarqueeCard(item, `b-${i}`))}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        return (
        <section id="testimonials" className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('testimonials', c.bodyBg) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading title={t.testimonials.title} subtitle={t.testimonials.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6 lg:mb-9" />
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {t.testimonials.items.map((item, i) => (
                <div
                  key={i}
                  className="lt-reveal lt-card relative flex flex-col overflow-hidden rounded-[26px] p-8"
                  style={{
                    ["--lt-i" as string]: i,
                    backgroundColor: surface,
                    border: `1px solid ${hairline}`,
                    boxShadow: cardShadow,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="font-display pointer-events-none absolute -top-3 right-6 select-none text-[6rem] leading-none"
                    style={{ color: hexToRgba(c.accent, 0.12) }}
                  >
                    &ldquo;
                  </span>
                  <div className="relative flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="h-4 w-4" viewBox="0 0 20 20" fill={c.accent}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-body relative mt-5 flex-1 text-base leading-relaxed" style={{ color: ink }}>
                    {item.quote}
                  </p>
                  <div className="relative mt-7 flex items-center gap-3.5 pt-5" style={{ borderTop: `1px solid ${hairline}` }}>
                    {item.image ? (
                      renderMedia(item.image, mediaKey("testimonials", "items", i, "image"), {
                        className: "h-12 w-12 rounded-full object-cover",
                        wrapperClassName: "h-12 w-12 rounded-full overflow-hidden flex-shrink-0",
                        alt: item.name,
                      })
                    ) : (
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-white"
                        style={{ backgroundImage: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }}
                      >
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-body font-semibold truncate" style={{ color: ink }}>{item.name}</div>
                      {hasContent(item.role) && (
                        <div className="font-body text-sm truncate" style={{ color: muted }}>{item.role}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
      }

      case 'videoTestimonials':
        return t.videoTestimonials.visible && t.videoTestimonials.items.length > 0 && (
        <section className="py-8 sm:py-11 lg:py-16 overflow-hidden" style={{ backgroundColor: sbg('videoTestimonials', hexToRgba(c.secondary, 0.05)) }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading title={t.videoTestimonials.title} subtitle={t.videoTestimonials.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6" />
            <VideoTestimonialsSlider
              items={videoTestimonialItems}
              primaryColor={c.accent}
              // Driven by the first item's media settings, since the slider
              // shares one embed policy across all of its slides.
              autoplay={(mediaSettings[mediaKey("videoTestimonials", "items", 0, "url")] ?? DEFAULT_MEDIA_SETTINGS).autoplay}
              muted={(mediaSettings[mediaKey("videoTestimonials", "items", 0, "url")] ?? DEFAULT_MEDIA_SETTINGS).mute}
            />
          </div>
        </section>
      );
      
      case 'program':
        return t.program.visible && (
      <section className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('program', hexToRgba(c.primary, 0.05)) }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title={t.program.title} subtitle={t.program.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6 lg:mb-9" />
          {/* 4 points in a 3-column grid leave the last card alone on row 2 —
              a 2x2 grid reads as intentional. */}
          <div className={`grid gap-5 lg:gap-6 sm:grid-cols-2 ${t.program.points.length === 4 ? "" : "lg:grid-cols-3"}`}>
            {t.program.points.map((point, i) => (
              <div
                key={i}
                className="lt-reveal lt-card group relative overflow-hidden rounded-[26px] p-5 text-left sm:p-7"
                style={{
                  ["--lt-i" as string]: i,
                  backgroundColor: surface,
                  border: `1px solid ${hairline}`,
                  boxShadow: cardShadow,
                }}
              >
                {/* Corner bloom, lit on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${hexToRgba(c.accent, 0.35)} 0%, transparent 70%)` }}
                />
                <div className="relative">
                  {/* Icon and title share a row; the description sits under
                      both at full card width. */}
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 sm:h-14 sm:w-14"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${hexToRgba(c.primary, 0.16)} 0%, ${hexToRgba(c.accent, 0.22)} 100%)`,
                        border: `1px solid ${hexToRgba(c.accent, 0.28)}`,
                      }}
                    >
                      <ProgramIcon name={point.icon} className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: c.accent } as React.CSSProperties} />
                    </div>
                    <h3 className="font-display min-w-0 flex-1 text-lg font-bold leading-snug sm:text-xl" style={{ color: ink }}>
                      {point.title}
                    </h3>
                  </div>
                  <p className="font-body mt-3.5 text-sm leading-relaxed sm:mt-4 sm:text-base" style={{ color: muted }}>
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {hasContent(t.program.ctaButtonText) && (
            <div className="lt-reveal text-center mt-10">
              {t.program.ctaButtonAction === "url" ? (
                <a href={resolveLink(t.program.ctaButtonLink)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                  <span className="lt-cta-sheen" aria-hidden="true" />
                  {t.program.ctaButtonText}
                  <CtaArrow />
                </a>
              ) : (
                <button type="button" onClick={() => setInvitationDialogOpen(true)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                  <span className="lt-cta-sheen" aria-hidden="true" />
                  {t.program.ctaButtonText}
                  <CtaArrow />
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      );
      
      case 'bonus':
        return t.bonus.enabled && t.bonus.items.length > 0 && (
        <section
          className="relative overflow-hidden py-8 sm:py-11 lg:py-16"
          style={t.sectionBg?.['bonus'] ? { backgroundColor: t.sectionBg['bonus'] } : stage}
        >
          <span className="lt-grain-layer" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading title={t.bonus.title} subtitle={t.bonus.subtitle} accent={c.accent} onDark className="mb-6 lg:mb-9" />
            <div className={`grid gap-4 sm:gap-6 lg:gap-8 mx-auto ${t.bonus.items.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3 max-w-6xl" : "sm:grid-cols-2 max-w-4xl"}`}>
              {t.bonus.items.map((item, i) => (
                <div
                  key={i}
                  // Cover-left row on phones, centred stack from sm. Centred,
                  // each 220px cover made a card nearly a full screen tall and
                  // the three bonuses cost three screens of scroll.
                  className="lt-reveal lt-card lt-zoom group relative flex items-center gap-4 overflow-hidden rounded-[20px] p-4 text-left backdrop-blur-sm sm:block sm:rounded-[26px] sm:p-6 sm:text-center"
                  style={{
                    ["--lt-i" as string]: i,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.13)",
                  }}
                >
                  <div className="relative w-[88px] flex-shrink-0 sm:mx-auto sm:w-full sm:max-w-[220px]">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-3 rounded-3xl blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: `radial-gradient(circle, ${hexToRgba(c.accent, 0.45)} 0%, transparent 70%)` }}
                    />
                    {item.image ? (
                      <div className="relative aspect-square overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.16)" }}>
                        {renderMedia(item.image, mediaKey("bonus", "items", i, "image"), {
                          className: "w-full h-full object-cover",
                          wrapperClassName: "absolute inset-0",
                          alt: item.title,
                        })}
                      </div>
                    ) : (
                      <div
                        className="relative flex aspect-square items-center justify-center rounded-2xl text-5xl"
                        style={{ backgroundColor: hexToRgba(c.accent, 0.14), border: "1px solid rgba(255,255,255,0.16)" }}
                      >
                        🎁
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 sm:mt-6">
                    <h3 className="font-display text-[15px] font-bold leading-snug text-white sm:text-xl">{item.title}</h3>
                    {hasContent(item.description) && (
                      <p className="font-body mt-1.5 text-[13px] leading-relaxed text-white sm:mt-2 sm:text-sm">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
      
      case 'appBanner': {
        const banner = t.appBanner;
        if (!banner || !banner.visible || !hasContent(banner.image)) return null;
        return (
          <section id="appBanner" className="py-8 sm:py-11 lg:py-14" style={{ backgroundColor: sbg('appBanner', c.bodyBg) }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <a
                href={resolveLink(banner.link)}
                className="lt-reveal lt-card lt-zoom block overflow-hidden rounded-[28px]"
                style={{ border: `1px solid ${hairline}`, boxShadow: cardShadow }}
              >
                {renderMedia(banner.image, mediaKey("appBanner", "image"), {
                  className: "w-full h-auto object-cover",
                  alt: banner.alt || "",
                })}
              </a>
            </div>
          </section>
        );
      }

      case 'invitation':
        return t.invitation.enabled && (
        <section className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('invitation', hexToRgba(c.primary, 0.06)) }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="lt-reveal relative overflow-hidden rounded-[24px] p-5 sm:rounded-[32px] sm:p-8 lg:p-12" style={stage}>
              <span className="lt-grain-layer" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="lt-aura pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${hexToRgba(c.accent, 0.5)} 0%, transparent 70%)` }}
              />
              <div className="relative z-10">
                <div className="text-center">
                  {(hasContent(t.invitation.badgeText) || hasContent(t.invitation.badgeEmoji)) && (
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[11px] sm:tracking-[0.2em]"
                      style={{ backgroundColor: "rgba(255,255,255,0.10)", border: `1px solid ${hexToRgba(c.accent, 0.45)}` }}
                    >
                      <span>{t.invitation.badgeEmoji}</span>
                      {t.invitation.badgeText}
                    </div>
                  )}
                  <h2 className="font-display mt-4 text-[clamp(1.55rem,3.6vw,2.9rem)] font-bold leading-[1.12] tracking-[-0.02em] text-white sm:mt-6">
                    {t.invitation.title}
                  </h2>
                  {hasContent(t.invitation.subtitle) && (
                    <p className="font-body mx-auto mt-3 max-w-2xl text-[13.5px] leading-relaxed text-white/75 sm:mt-4 sm:text-base">
                      {t.invitation.subtitle}
                    </p>
                  )}
                </div>

                {/* Compact icon-left rows on phones (a stack of three tall
                    centred cards wasted most of the width); reverts to the
                    3-up centred grid from sm. */}
                <div className="mt-6 grid gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-4">
                  {[
                    { Icon: CalendarDays, label: t.invitation.dateLabel, value: t.invitation.dateValue },
                    { Icon: Clock3, label: t.invitation.timeLabel, value: t.invitation.timeValue },
                    { Icon: MapPin, label: t.invitation.venueLabel, value: t.invitation.venueValue },
                  ].map(({ Icon, label, value }, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3.5 rounded-2xl p-3.5 text-left backdrop-blur-sm sm:flex-col sm:gap-0 sm:p-5 sm:text-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)" }}
                    >
                      <span
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl sm:mb-3"
                        style={{ backgroundColor: hexToRgba(c.accent, 0.16) }}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: c.accent }} />
                      </span>
                      <div className="min-w-0 flex-1 sm:flex-none">
                        <p className="font-body text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/55 sm:text-[10px] sm:tracking-[0.2em]">{label}</p>
                        <p className="font-display mt-0.5 text-[15px] font-bold leading-snug text-white sm:mt-1.5 sm:text-lg">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {hasContent(t.invitation.availabilityText) && (
                  <div className="mt-5 flex items-center justify-center gap-2 text-center sm:mt-6 sm:gap-2.5">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: c.accent }} />
                    <p className="font-body text-[13px] text-white/75 sm:text-sm">{t.invitation.availabilityText}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-col items-center gap-3 sm:mt-7">
                  {t.invitation.buttonAction === "url" ? (
                    <a
                      href={resolveLink(t.invitation.buttonLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${ctaClass("lg")} w-full sm:w-auto`}
                      style={{ ...ctaStyle(c.primary, c.ctaAccent || c.accent), ...(t.invitation.buttonTextColor ? { color: t.invitation.buttonTextColor } : {}) }}
                    >
                      <span className="lt-cta-sheen" aria-hidden="true" />
                      {t.invitation.buttonText}
                      <CtaArrow />
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={`${ctaClass("lg")} w-full sm:w-auto`}
                      style={{ ...ctaStyle(c.primary, c.ctaAccent || c.accent), ...(t.invitation.buttonTextColor ? { color: t.invitation.buttonTextColor } : {}) }}
                      onClick={() => setInvitationDialogOpen(true)}
                    >
                      <span className="lt-cta-sheen" aria-hidden="true" />
                      {t.invitation.buttonText}
                      <CtaArrow />
                    </button>
                  )}
                  {hasContent(t.invitation.supportText) && (
                    <p className="font-body text-center text-xs text-white/55">{t.invitation.supportText}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      );

      case 'contentBlocks':
        const contentBlocksArray = Array.isArray(t.contentBlocks) ? t.contentBlocks : [];
        return contentBlocksArray.map((block, blockIndex) => {
          if (!block.enabled) return null;
          
          const blockKey = mediaKey("contentBlocks", blockIndex, "mediaUrl");
          const isMediaLeft = block.layout === "media-left";
          
          // Render media based on type
          const renderBlockMedia = () => {
            if (block.mediaType === "youtube") {
              const videoId = extractYouTubeId(block.mediaUrl);
              if (!videoId) return null;
              const settings = mediaSettings[blockKey] || DEFAULT_MEDIA_SETTINGS;
              
              return (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                  <YouTubeEmbed
                    videoId={videoId}
                    autoplay={settings.autoplay}
                    muted={settings.mute}
                  />
                </div>
              );
            } else if (block.mediaType === "video") {
              const settings = mediaSettings[blockKey] || DEFAULT_MEDIA_SETTINGS;
              return (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                  <video
                    src={block.mediaUrl}
                    autoPlay={settings.autoplay}
                    muted={settings.mute}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            } else if (block.imageFit === "natural") {
              // No fixed well at all — the image sets its own height at the
              // column's width, so a self-contained poster/banner (copy
              // baked into the artwork) shows completely uncropped with no
              // letterboxing either. Only opt-in per block (see imageFit's
              // definition in template-types.ts) since this can make blocks
              // in this section vary in height, unlike the fixed-well default.
              return (
                <div className="w-full overflow-hidden rounded-xl shadow-lg">
                  {renderMedia(block.mediaUrl, blockKey, { className: "w-full h-auto block" })}
                </div>
              );
            } else {
              // image — same aspect-video well as its video/YouTube siblings
              // above, so blocks in this section don't jump around in height.
              // Default object-contain, not cover: these blocks are used for
              // both photos and brand posters with copy baked into the
              // artwork, and cover was cropping poster text off (see the
              // 'why' section's identical fix for the same failure mode).
              // Per-block imageFit: "cover" opts a specific block out of that
              // when the page author wants the frame filled instead.
              return (
                <div
                  className="relative w-full aspect-video overflow-hidden rounded-xl shadow-lg"
                  style={{ backgroundColor: hexToRgba(c.primary, 0.06) }}
                >
                  {renderMedia(block.mediaUrl, blockKey, {
                    className: `absolute inset-0 w-full h-full ${block.imageFit === "cover" ? "object-cover" : "object-contain"}`,
                  })}
                </div>
              );
            }
          };

          // Render text content
          const renderBlockText = () => {
            if (block.textFormat === "bullets") {
              const bullets = block.content.split('\n').filter(line => line.trim());
              return (
                <div className="text-center lg:text-left">
                  <div className="lt-reveal mb-5 flex justify-center lg:justify-start"><RitualRule color={c.accent} /></div>
                  {block.heading && (
                    <h3
                      className="lt-reveal font-display text-[clamp(1.7rem,3.4vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em]"
                      style={{ ["--lt-i" as string]: 1, color: ink }}
                    >
                      {block.heading}
                    </h3>
                  )}
                  <ul className="mt-6 space-y-3.5 sm:mt-7 sm:space-y-4">
                    {bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="lt-reveal flex items-start justify-center gap-3 text-left font-body text-[15px] leading-relaxed sm:gap-3.5 sm:text-lg lg:justify-start"
                        style={{ ["--lt-i" as string]: i + 2, color: muted }}
                      >
                        <span
                          className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: hexToRgba(c.accent, 0.14), border: `1px solid ${hexToRgba(c.accent, 0.32)}` }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: c.accent }} />
                        </span>
                        <span className="flex-1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            } else {
              // plain text
              return (
                <div className="text-center lg:text-left">
                  <div className="lt-reveal mb-5 flex justify-center lg:justify-start"><RitualRule color={c.accent} /></div>
                  {block.heading && (
                    <h3
                      className="lt-reveal font-display text-[clamp(1.7rem,3.4vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em]"
                      style={{ ["--lt-i" as string]: 1, color: ink }}
                    >
                      {block.heading}
                    </h3>
                  )}
                  <p
                    className="lt-reveal font-body mt-5 text-[15px] sm:text-lg leading-relaxed whitespace-pre-wrap sm:mt-6"
                    style={{ ["--lt-i" as string]: 2, color: muted }}
                  >
                    {block.content}
                  </p>
                </div>
              );
            }
          };

          return (
            <section
              key={`content-block-${blockIndex}`}
              className="py-8 sm:py-11 lg:py-16"
              style={{ backgroundColor: sbg(`contentBlock-${blockIndex}`, c.bodyBg) }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${isMediaLeft ? '' : 'lg:grid-flow-dense'}`}>
                  {/* Media — aura bloom behind, so imagery reads as lit rather than pasted on */}
                  <div className={`lt-reveal relative ${isMediaLeft ? '' : 'lg:col-start-2'}`}>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-5 rounded-[40px] blur-2xl"
                      style={{ background: `radial-gradient(circle at 50% 50%, ${hexToRgba(c.accent, 0.26)} 0%, transparent 70%)` }}
                    />
                    <div className="lt-zoom relative overflow-hidden rounded-[26px]" style={{ border: `1px solid ${hairline}`, boxShadow: cardShadow }}>
                      {renderBlockMedia()}
                    </div>
                  </div>

                  {/* Text */}
                  <div className={isMediaLeft ? '' : 'lg:col-start-1 lg:row-start-1'}>
                    {renderBlockText()}
                  </div>
                </div>
              </div>
            </section>
          );
        });

      case 'richContent': {
        // In the admin editor an `editorInstance` (live TipTap editor) is
        // passed down — render the real editable surface there so clicking
        // existing elements selects them and pops up their property panels.
        // Public storefront pages never pass `editorInstance`, so they keep
        // getting the static, non-interactive DynamicPageRenderer HTML.
        // With multiple rich blocks, the live editor only ever shows the doc
        // of whichever block is currently focused — `focusedBlockId` follows
        // the `sectionOrder` key scheme, and "richContent" (this legacy
        // singleton slot) is its default/unset value.
        const isLegacyFocused = !editorBridge || editorBridge.focusedBlockId === 'richContent';
        if (editorInstance && isLegacyFocused) {
          // editor.isEmpty only covers a single empty *paragraph*; select-all +
          // delete can leave a single empty heading instead — treat any lone
          // contentless block as empty so the drop hint still appears.
          const doc = editorInstance.state?.doc;
          const isEmpty =
            editorInstance.isEmpty ||
            (doc && doc.childCount === 1 && doc.firstChild && doc.firstChild.content.size === 0);
          return (
            <div key="richContent" className="landing-rich-content relative">
              {isEmpty && (
                <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40">
                 
                </div>
              )}
              <div style={isEmpty ? { minHeight: 140 } : undefined}>
                <EditorContent editor={editorInstance} />
              </div>
            </div>
          );
        }
        return pageContent && pageContent.doc && (
          <div
            key="richContent"
            className={editorInstance ? "landing-rich-content relative group/richblock cursor-pointer" : "landing-rich-content"}
            onClick={editorInstance ? () => editorBridge?.onFocusRichBlock('richContent') : undefined}
          >
            <DynamicPageRenderer
              content={pageContent}
              theme={{ primary: c.primary, secondary: c.secondary, accent: c.accent, background: c.bodyBg }}
              title=""
              pageSlug={pageSlug}
              landingPageId={landingPageId}
              embedded
            />
            {editorInstance && <RichBlockFocusOverlay />}
          </div>
        );
      }

      case 'faq':
        return t.faq?.enabled && t.faq.items.length > 0 && (
          <section className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('faq', c.bodyBg) }}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeading title={t.faq.title} subtitle={t.faq.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6" />
              <div className="space-y-3">
                {t.faq.items.map((item, i) => (
                  <div key={i} className="lt-reveal" style={{ ["--lt-i" as string]: i }}>
                    <FaqItem item={item} primaryColor={c.accent} ink={ink} muted={muted} surface={surface} hairline={hairline} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      // ---------------------------------------------------------------------
      // Conversion sections
      // ---------------------------------------------------------------------
      case 'announcementBar': {
        const bar = t.announcementBar;
        if (!bar?.visible) return null;
        if (!hasContent(bar.text) && !hasContent(bar.countdownTo)) return null;
        // Sticky is dropped inside the editor: the canvas is a CSS-zoomed,
        // independently scrolled box, where a position:sticky bar detaches and
        // floats over unrelated sections.
        const sticky = (bar.sticky ?? true) && !isEditorMode;
        return (
          <div
            id="announcementBar"
            className={`${sticky ? "sticky top-0" : "relative"} z-40 w-full`}
            style={t.sectionBg?.['announcementBar'] ? { backgroundColor: t.sectionBg['announcementBar'] } : { backgroundImage: `linear-gradient(90deg, ${c.ctaAccent || c.accent} 0%, ${c.primary} 100%)` }}
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-3 py-2 text-center sm:px-6 sm:py-2.5">
              {hasContent(bar.text) && (
                <span className="font-body text-[11.5px] font-semibold leading-snug text-white sm:text-sm">
                  {bar.text}
                </span>
              )}
              {hasContent(bar.countdownTo) && (
                <span className="text-white">
                  <Countdown target={bar.countdownTo} label={bar.countdownLabel} variant="inline" accent={c.ctaAccent || c.accent} />
                </span>
              )}
              {hasContent(bar.ctaText) && (
                bar.ctaAction === "url" ? (
                  <a
                    href={resolveLink(bar.ctaLink)}
                    className="lt-bar-cta lt-focus inline-flex flex-shrink-0 items-center rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-white sm:px-3 sm:py-1 sm:text-xs"
                    style={{ color: c.secondary }}
                  >
                    {bar.ctaText}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setInvitationDialogOpen(true)}
                    className="lt-bar-cta lt-focus inline-flex flex-shrink-0 items-center rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-white sm:px-3 sm:py-1 sm:text-xs"
                    style={{ color: c.secondary }}
                  >
                    {bar.ctaText}
                  </button>
                )
              )}
            </div>
          </div>
        );
      }

      case 'eventDetails': {
        const ev = t.eventDetails;
        if (!ev?.visible) return null;
        const seats = Math.max(0, Math.min(100, ev.seatsFilledPercent || 0));
        return (
          <section id="eventDetails" className="py-14 sm:py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('eventDetails', c.bodyBg) }}>
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <SectionHeading title={ev.title} subtitle={ev.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-5 lg:mb-7" />
              <div
                className="lt-reveal overflow-hidden rounded-[26px] sm:rounded-[32px]"
                style={{ backgroundColor: surface, border: `1px solid ${hairline}`, boxShadow: cardShadow }}
              >
                {(ev.pills || []).filter(hasContent).length > 0 && (
                  <div className="flex flex-wrap gap-2 border-b px-5 py-4 sm:px-8 sm:py-5" style={{ borderColor: hairline }}>
                    {(ev.pills || []).filter(hasContent).map((pill, i) => (
                      <span
                        key={i}
                        className="font-body inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold sm:text-xs"
                        style={{ backgroundColor: hexToRgba(c.accent, 0.1), color: onDarkBody ? "#fff" : c.secondary }}
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                )}

                {(ev.items || []).length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-5 py-6 sm:grid-cols-4 sm:px-8 sm:py-8">
                    {(ev.items || []).map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${hexToRgba(c.primary, 0.16)} 0%, ${hexToRgba(c.accent, 0.22)} 100%)`,
                            border: `1px solid ${hexToRgba(c.accent, 0.28)}`,
                          }}
                        >
                          <ProgramIcon name={item.icon} className="h-4 w-4" style={{ color: c.accent } as React.CSSProperties} />
                        </span>
                        <span className="font-body text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: muted }}>
                          {item.label}
                        </span>
                        <span className="font-body -mt-1 text-sm font-semibold leading-snug sm:text-[15px]" style={{ color: ink }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {(hasContent(ev.price) || hasContent(ev.ctaButtonText) || hasContent(ev.seatsNote) || seats > 0) && (
                  <div
                    className="border-t px-5 py-6 sm:px-8 sm:py-7"
                    style={{ borderColor: hairline, backgroundColor: hexToRgba(c.accent, 0.045) }}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      {hasContent(ev.price) && (
                        <div>
                          {hasContent(ev.priceLabel) && (
                            <span className="font-body block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: muted }}>
                              {ev.priceLabel}
                            </span>
                          )}
                          <span className="mt-1 flex flex-wrap items-baseline gap-2">
                            <span className="font-display text-3xl font-bold leading-none sm:text-4xl" style={{ color: ink }}>
                              {ev.price}
                            </span>
                            {hasContent(ev.originalPrice) && (
                              <span className="font-body text-base line-through sm:text-lg" style={{ color: muted }}>
                                {ev.originalPrice}
                              </span>
                            )}
                          </span>
                          {hasContent(ev.savingsNote) && (
                            <span
                              className="font-body mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
                              style={{ backgroundColor: hexToRgba(c.accent, 0.14), color: c.accent }}
                            >
                              {ev.savingsNote}
                            </span>
                          )}
                        </div>
                      )}
                      {hasContent(ev.ctaButtonText) && (
                        ev.ctaButtonAction === "url" ? (
                          <a href={resolveLink(ev.ctaButtonLink)} className={`${ctaClass("lg")} w-full sm:w-auto`} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                            <span className="lt-cta-sheen" aria-hidden="true" />
                            {ev.ctaButtonText}
                            <CtaArrow />
                          </a>
                        ) : (
                          <button type="button" onClick={() => setInvitationDialogOpen(true)} className={`${ctaClass("lg")} w-full sm:w-auto`} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                            <span className="lt-cta-sheen" aria-hidden="true" />
                            {ev.ctaButtonText}
                            <CtaArrow />
                          </button>
                        )
                      )}
                    </div>

                    {(seats > 0 || hasContent(ev.seatsNote)) && (
                      // lt-reveal drives the fill: it sits at width 0 until the
                      // row scrolls into view, then sweeps out to --lt-seat.
                      // The inline width stays the source of truth so the bar is
                      // still correct with JS off or inside the editor.
                      <div className="lt-reveal mt-5" style={{ ["--lt-seat" as string]: `${seats}%` }}>
                        {seats > 0 && (
                          <div className="lt-seat-track relative h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: hexToRgba(c.secondary, 0.12) }}>
                            <div
                              className="lt-seat-fill relative h-full rounded-full"
                              style={{ width: `${seats}%`, backgroundImage: `linear-gradient(90deg, ${c.primary}, ${c.accent})` }}
                            >
                              <span className="lt-seat-shimmer" aria-hidden="true" />
                            </div>
                          </div>
                        )}
                        {hasContent(ev.seatsNote) && (
                          <p className="font-body mt-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: c.accent }}>
                            <span className="lt-seat-dot relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
                              <span className="lt-seat-ping absolute inline-flex h-full w-full rounded-full" style={{ backgroundColor: c.accent }} />
                              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: c.accent }} />
                            </span>
                            {ev.seatsNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      }

      case 'problems': {
        const pr = t.problems;
        if (!pr?.visible) return null;
        const items = (pr.items || []).filter((p) => hasContent(p.title));
        const impacts = (pr.impacts || []).filter(hasContent);
        if (items.length === 0 && impacts.length === 0) return null;
        return (
          <section id="problems" className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('problems', c.bodyBg) }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeading title={pr.title} subtitle={pr.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6 lg:mb-6" />
              {items.length > 0 && (
                <div className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-5 ${items.length === 4 ? "" : "lg:grid-cols-3"}`}>
                  {items.map((item, i) => (
                    <div
                      key={i}
                      // Stacks and centers on phones, goes back to an icon-beside-text
                      // row from sm up.
                      // Icon-left row at every width. Stacking and centring these
                      // on phones made each card roughly twice as tall for no
                      // gain — six of them dominated the scroll.
                      className="lt-reveal lt-card group flex items-start gap-3 rounded-[18px] p-4 text-left sm:gap-4 sm:rounded-[22px] sm:p-6"
                      style={{ ["--lt-i" as string]: i % 3, backgroundColor: surface, border: `1px solid ${hairline}`, boxShadow: cardShadow }}
                    >
                      <span
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 sm:h-11 sm:w-11 sm:rounded-2xl"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${hexToRgba(c.primary, 0.16)} 0%, ${hexToRgba(c.accent, 0.22)} 100%)`,
                          border: `1px solid ${hexToRgba(c.accent, 0.28)}`,
                        }}
                      >
                        <ProgramIcon name={item.icon} className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: c.accent } as React.CSSProperties} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-body text-sm font-semibold leading-snug sm:text-base" style={{ color: ink }}>{item.title}</h3>
                        {hasContent(item.description) && (
                          <p className="font-body mt-1 text-[13px] leading-relaxed sm:mt-1.5 sm:text-sm" style={{ color: muted }}>{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {impacts.length > 0 && (
                <div className="lt-reveal relative mt-7 overflow-hidden rounded-[26px] p-6 sm:mt-10 sm:rounded-[32px] sm:p-10" style={stage}>
                  <span className="lt-grain-layer" aria-hidden="true" />
                  <div className="relative">
                    {hasContent(pr.impactTitle) && (
                      <h3 className="font-display text-[clamp(1.4rem,3.2vw,2.1rem)] font-bold leading-tight tracking-[-0.02em] text-white">
                        {pr.impactTitle}
                      </h3>
                    )}
                    <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:mt-6 sm:grid-cols-2 sm:gap-y-3.5">
                      {impacts.map((line, i) => (
                        <li key={i} className="flex gap-3">
                          <span
                            className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: hexToRgba(c.accent, 0.28) }}
                          >
                            <X className="h-3 w-3 text-white" />
                          </span>
                          <span className="font-body text-[13px] leading-relaxed text-white/75 sm:text-sm">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      }

      case 'curriculum': {
        const cur = t.curriculum;
        if (!cur?.visible) return null;
        const modules = (cur.modules || []).filter((m) => hasContent(m.title));
        if (modules.length === 0) return null;
        const asCards = cur.displayMode === "cards";
        return (
          <section id="curriculum" className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('curriculum', c.bodyBg) }}>
            <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${asCards ? "max-w-7xl" : "max-w-3xl"}`}>
              <SectionHeading title={cur.title} subtitle={cur.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6" />
              {asCards ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {modules.map((m, i) => (
                    <div
                      key={i}
                      className="lt-reveal lt-card lt-zoom group overflow-hidden rounded-[24px]"
                      style={{ ["--lt-i" as string]: i % 3, backgroundColor: surface, border: `1px solid ${hairline}`, boxShadow: cardShadow }}
                    >
                      {hasContent(m.image) && (
                        <div className="aspect-[16/9] w-full overflow-hidden">
                          {renderMedia(m.image, mediaKey("curriculum", "modules", i, "image"), {
                            className: "h-full w-full object-cover",
                            alt: m.title,
                          })}
                        </div>
                      )}
                      <div className="p-6">
                        {hasContent(m.label) && (
                          <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: c.accent }}>
                            {m.label}
                          </span>
                        )}
                        <h3 className="font-display mt-2 text-lg font-bold leading-snug" style={{ color: ink }}>{m.title}</h3>
                        {hasContent(m.description) && (
                          <p className="font-body mt-2 text-sm leading-relaxed" style={{ color: muted }}>{m.description}</p>
                        )}
                        {(m.bullets || []).filter(hasContent).length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {(m.bullets || []).filter(hasContent).map((b, j) => (
                              <li key={j} className="flex justify-center gap-2.5 text-left sm:justify-start">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: c.accent }} />
                                <span className="font-body text-sm leading-relaxed" style={{ color: muted }}>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.map((m, i) => (
                    <div key={i} className="lt-reveal" style={{ ["--lt-i" as string]: i }}>
                      <CurriculumRow
                        module={m}
                        index={i}
                        defaultOpen={i === 0}
                        accent={c.accent}
                        ink={ink}
                        muted={muted}
                        surface={surface}
                        hairline={hairline}
                      />
                    </div>
                  ))}
                </div>
              )}
              {hasContent(cur.ctaButtonText) && (
                <div className="lt-reveal mt-7 text-center">
                  {cur.ctaButtonAction === "url" ? (
                    <a href={resolveLink(cur.ctaButtonLink)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                      <span className="lt-cta-sheen" aria-hidden="true" />
                      {cur.ctaButtonText}
                      <CtaArrow />
                    </a>
                  ) : (
                    <button type="button" onClick={() => setInvitationDialogOpen(true)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                      <span className="lt-cta-sheen" aria-hidden="true" />
                      {cur.ctaButtonText}
                      <CtaArrow />
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      }

      case 'pricing': {
        const pricing = t.pricing;
        if (!pricing?.visible) return null;
        const tiers = (pricing.tiers || []).filter((tier) => hasContent(tier.name) || hasContent(tier.price));
        if (tiers.length === 0) return null;
        return (
          <section
            id="pricing"
            className="relative overflow-hidden py-8 sm:py-11 lg:py-16"
            style={t.sectionBg?.['pricing'] ? { backgroundColor: t.sectionBg['pricing'] } : stage}
          >
            <span className="lt-grain-layer" aria-hidden="true" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeading title={pricing.title} subtitle={pricing.subtitle} accent={c.accent} onDark className="mb-6 lg:mb-9" />
              <div
                className={`grid grid-cols-1 gap-5 sm:gap-6 ${tiers.length >= 3 ? "lg:grid-cols-3" : tiers.length === 2 ? "sm:grid-cols-2 lg:max-w-4xl lg:mx-auto" : "max-w-md mx-auto"}`}
              >
                {tiers.map((tier, i) => {
                  const hot = !!tier.highlighted;
                  return (
                    <div
                      key={i}
                      className={`lt-reveal lt-card relative flex flex-col rounded-[26px] p-5 text-center sm:p-7 sm:text-left ${hot ? "lg:-mt-4 lg:mb-4" : ""}`}
                      style={{
                        ["--lt-i" as string]: i,
                        backgroundColor: hot ? "#FFFFFF" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${hot ? hexToRgba(c.accent, 0.6) : "rgba(255,255,255,0.14)"}`,
                        boxShadow: hot ? `0 30px 70px -30px ${hexToRgba(c.accent, 0.8)}` : "0 20px 50px -34px rgba(0,0,0,.85)",
                        backdropFilter: hot ? undefined : "blur(6px)",
                      }}
                    >
                      {hasContent(tier.badge) && (
                        <span
                          className="font-body absolute -top-3 left-1/2 -translate-x-1/2 inline-flex sm:left-6 sm:translate-x-0 items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                          style={{ backgroundImage: `linear-gradient(135deg, ${c.accent}, ${c.primary})` }}
                        >
                          {tier.badge}
                        </span>
                      )}
                      <h3
                        className="font-body text-[11px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: hot ? c.accent : "rgba(255,255,255,0.7)" }}
                      >
                        {tier.name}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-baseline justify-center gap-2 sm:justify-start">
                        <span
                          className="font-display text-4xl font-bold leading-none"
                          style={{ color: hot ? "#111827" : "#FFFFFF" }}
                        >
                          {tier.price}
                        </span>
                        {hasContent(tier.originalPrice) && (
                          <span className="font-body text-base line-through" style={{ color: hot ? "#9CA3AF" : "rgba(255,255,255,0.5)" }}>
                            {tier.originalPrice}
                          </span>
                        )}
                        {hasContent(tier.period) && (
                          <span className="font-body text-sm" style={{ color: hot ? "#6B7280" : "rgba(255,255,255,0.6)" }}>
                            {tier.period}
                          </span>
                        )}
                      </div>
                      {hasContent(tier.description) && (
                        <p className="font-body mt-3 text-sm leading-relaxed" style={{ color: hot ? "#4B5563" : "rgba(255,255,255,0.66)" }}>
                          {tier.description}
                        </p>
                      )}
                      <div className="my-6 h-px w-full" style={{ backgroundColor: hot ? "rgba(17,24,39,0.08)" : "rgba(255,255,255,0.12)" }} />
                      <ul className="flex-1 space-y-3">
                        {(tier.features || []).filter(hasContent).map((f, j) => (
                          <li key={j} className="flex justify-center gap-2.5 text-left sm:justify-start">
                            <span
                              className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                              style={{ backgroundColor: hexToRgba(c.accent, hot ? 0.16 : 0.3) }}
                            >
                              <Check className="h-3 w-3" style={{ color: hot ? c.accent : "#FFFFFF" }} />
                            </span>
                            <span className="font-body text-sm leading-relaxed" style={{ color: hot ? "#374151" : "rgba(255,255,255,0.75)" }}>
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {hasContent(tier.ctaText) && (
                        <div className="mt-7">
                          {tier.ctaAction === "url" ? (
                            <a
                              href={resolveLink(tier.ctaLink)}
                              className={`${ctaClass("md")} w-full`}
                              style={hot ? ctaStyle(c.primary, c.ctaAccent || c.accent) : { backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.28)" }}
                            >
                              <span className="lt-cta-sheen" aria-hidden="true" />
                              {tier.ctaText}
                              <CtaArrow />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setInvitationDialogOpen(true)}
                              className={`${ctaClass("md")} w-full`}
                              style={hot ? ctaStyle(c.primary, c.ctaAccent || c.accent) : { backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.28)" }}
                            >
                              <span className="lt-cta-sheen" aria-hidden="true" />
                              {tier.ctaText}
                              <CtaArrow />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {hasContent(pricing.footnote) && (
                <p className="lt-reveal mt-8 text-center font-body text-xs text-white/55">{pricing.footnote}</p>
              )}
            </div>
          </section>
        );
      }

      case 'comparison': {
        const cmp = t.comparison;
        if (!cmp?.visible) return null;
        const columns = (cmp.columns || []).filter(hasContent);
        const rows = (cmp.rows || []).filter((r) => hasContent(r.feature));
        if (columns.length === 0 || rows.length === 0) return null;
        const hi = cmp.highlightColumn ?? -1;
        const renderCell = (value?: string) => {
          const v = (value || "").trim().toLowerCase();
          if (v === "yes" || v === "true") return <Check className="mx-auto h-5 w-5" style={{ color: c.accent }} />;
          if (v === "no" || v === "false") return <X className="mx-auto h-5 w-5" style={{ color: onDarkBody ? "rgba(255,255,255,0.3)" : "#D1D5DB" }} />;
          return <span className="font-body text-xs sm:text-sm" style={{ color: muted }}>{value}</span>;
        };
        return (
          <section id="comparison" className="py-8 sm:py-11 lg:py-16" style={{ backgroundColor: sbg('comparison', c.bodyBg) }}>
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <SectionHeading title={cmp.title} subtitle={cmp.subtitle} accent={c.accent} onDark={onDarkBody} className="mb-6" />
              {/* Wide table scrolls inside its own box so the page body never
                  scrolls sideways on a phone. The hint below only shows at the
                  widths where the table actually overflows. */}
              <p className="lt-reveal mb-3 text-center font-body text-[11px] font-medium sm:hidden" style={{ color: muted }}>
                Swipe the table sideways to compare →
              </p>
              <div
                className="lt-reveal touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-[22px]"
                style={{ backgroundColor: surface, border: `1px solid ${hairline}`, boxShadow: cardShadow }}
              >
                <table className="w-full min-w-[520px] border-collapse">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${hairline}` }}>
                      <th className="px-4 py-4 text-left sm:px-6" />
                      {columns.map((col, i) => (
                        <th
                          key={i}
                          className="px-3 py-4 text-center sm:px-5"
                          style={i === hi ? { backgroundColor: hexToRgba(c.accent, 0.07) } : undefined}
                        >
                          <span
                            className="font-body text-[11px] font-bold uppercase tracking-[0.14em] sm:text-xs"
                            style={{ color: i === hi ? c.accent : ink }}
                          >
                            {col}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} style={i < rows.length - 1 ? { borderBottom: `1px solid ${hairline}` } : undefined}>
                        <td className="px-4 py-3.5 sm:px-6">
                          <span className="font-body text-[13px] font-medium leading-snug sm:text-sm" style={{ color: ink }}>
                            {row.feature}
                          </span>
                        </td>
                        {columns.map((_, j) => (
                          <td
                            key={j}
                            className="px-3 py-3.5 text-center sm:px-5"
                            style={j === hi ? { backgroundColor: hexToRgba(c.accent, 0.07) } : undefined}
                          >
                            {renderCell(row.values?.[j])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      }

      case 'guarantee': {
        const g = t.guarantee;
        if (!g?.visible) return null;
        const items = (g.items || []).filter((i) => hasContent(i.title));
        if (items.length === 0) return null;
        return (
          <section
            id="guarantee"
            className="relative overflow-hidden py-8 sm:py-11 lg:py-16"
            style={t.sectionBg?.['guarantee'] ? { backgroundColor: t.sectionBg['guarantee'] } : deepStage}
          >
            <span className="lt-grain-layer" aria-hidden="true" />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <SectionHeading title={g.title} subtitle={g.subtitle} accent={c.accent} onDark className="mb-6 lg:mb-6" />
              <div className={`grid grid-cols-1 gap-5 sm:gap-6 ${items.length >= 3 ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="lt-reveal lt-card rounded-[24px] p-6 text-center sm:p-8"
                    style={{
                      ["--lt-i" as string]: i,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <span
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ backgroundImage: `linear-gradient(135deg, ${c.accent}, ${c.primary})` }}
                    >
                      <ProgramIcon name={item.icon} className="h-6 w-6" style={{ color: "#fff" } as React.CSSProperties} />
                    </span>
                    <h3 className="font-display mt-5 text-lg font-bold leading-snug text-white">{item.title}</h3>
                    <p className="font-body mt-2.5 text-sm leading-relaxed text-white/70">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case 'liveProof': {
        const lp = t.liveProof;
        if (!lp?.visible) return null;
        const items = (lp.items || []).filter((i) => hasContent(i.text));
        if (items.length === 0) return null;
        // Fixed-position overlay, so its slot in sectionOrder has no visual
        // effect — but it stays in the order so it's editable like any section.
        // Suppressed in the editor, where a fixed toast would hover over the
        // canvas chrome.
        if (isEditorMode) return null;
        return <LiveProofToast items={items} intervalMs={lp.intervalMs} accent={c.accent} />;
      }

      case 'footer':
        return t.footer.enabled && (
      <footer
        className="relative overflow-hidden"
        style={t.sectionBg?.['footer'] ? { backgroundColor: t.sectionBg['footer'] } : deepStage}
      >
        <span className="lt-grain-layer" aria-hidden="true" />
        <span
          aria-hidden="true"
          className="lt-aura pointer-events-none absolute left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${hexToRgba(c.accent, 0.32)} 0%, transparent 70%)` }}
        />
        {/* Closing CTA */}
        <div className="relative py-10 sm:py-12 lg:py-16 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lt-reveal mb-6 flex justify-center"><RitualRule color={c.accent} /></div>
            <h2
              className="lt-reveal font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.06] tracking-[-0.025em] text-white"
              style={{ ["--lt-i" as string]: 1 }}
            >
              {t.footer.cta.title}
            </h2>
            {hasContent(t.footer.cta.subtitle) && (
              <p
                className="lt-reveal font-body mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-white"
                style={{ ["--lt-i" as string]: 2 }}
              >
                {t.footer.cta.subtitle}
              </p>
            )}
            {(t.footer.cta.showCtaButton ?? true) && hasContent(t.footer.cta.ctaButtonText) && (
              <div className="lt-reveal mt-10" style={{ ["--lt-i" as string]: 3 }}>
                {t.footer.cta.ctaButtonAction === "url" ? (
                  <a href={resolveLink(t.footer.cta.ctaButtonLink)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                    <span className="lt-cta-sheen" aria-hidden="true" />
                    {t.footer.cta.ctaButtonText}
                    <CtaArrow />
                  </a>
                ) : (
                  <button type="button" onClick={() => setInvitationDialogOpen(true)} className={ctaClass("lg")} style={ctaStyle(c.primary, c.ctaAccent || c.accent)}>
                    <span className="lt-cta-sheen" aria-hidden="true" />
                    {t.footer.cta.ctaButtonText}
                    <CtaArrow />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Logo / address / social + link columns */}
        {(hasContent(t.footer.logo) || hasContent(t.footer.address) || (t.footer.socialLinks || []).length > 0 || (t.footer.linkColumns || []).length > 0) && (
          <div className="relative border-t border-white/10 py-9 sm:py-11">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10 md:flex-row md:justify-between">
              {(hasContent(t.footer.logo) || hasContent(t.footer.address) || (t.footer.socialLinks || []).length > 0) && (
                <div>
                  {hasContent(t.footer.logo) ? (
                    renderMedia(t.footer.logo, mediaKey("footer", "logo"), { className: "h-6 w-auto object-contain", alt: "" })
                  ) : (
                    <span className="font-display text-lg font-bold text-white">{t.footer.copyright.replace(/^©\s*\d{4}\s*/, "")}</span>
                  )}
                  {hasContent(t.footer.address) && (
                    <p className="font-body mt-4 max-w-xs whitespace-pre-line text-xs leading-relaxed text-white/50">{t.footer.address}</p>
                  )}
                  {(t.footer.socialLinks || []).length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {(t.footer.socialLinks || []).map((social, i) => {
                        const SocialIcon = SOCIAL_ICON_MAP[social.icon] || Globe;
                        return (
                          <a
                            key={i}
                            href={resolveLink(social.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lt-focus flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
                            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                          >
                            <SocialIcon className="h-4 w-4" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {(t.footer.linkColumns || []).length > 0 && (
                <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 md:justify-items-end">
                  {(t.footer.linkColumns || []).map((col, i) => (
                    <div key={i} className="flex flex-col">
                      <p className="font-body mb-3 text-sm font-semibold text-white">{col.heading}</p>
                      {col.links.map((link, j) => (
                        <a key={j} href={resolveLink(link.url)} className="lt-taplink lt-focus font-body text-xs text-white/50 transition-colors hover:text-white">
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Popular Links tag cloud */}
        {(t.footer.popularLinks || []).length > 0 && (
          <div className="relative border-t border-white/10 py-7 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="font-body mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Popular Links</p>
              <div className="flex flex-wrap gap-x-1 gap-y-2">
                {(t.footer.popularLinks || []).map((link, i) => (
                  <a key={i} href={resolveLink(link.url)} className="lt-focus font-body text-xs text-white/45 transition-colors hover:text-white">
                    {link.label}
                    {i < (t.footer.popularLinks || []).length - 1 && <span className="text-white/25">,&nbsp;</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* App download */}
        {t.footer.appDownload && hasContent(t.footer.appDownload.text) && (hasContent(t.footer.appDownload.iosUrl) || hasContent(t.footer.appDownload.androidUrl)) && (
          <div className="relative border-t border-white/10 py-7 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="font-body mb-3 text-sm font-medium text-white/70">{t.footer.appDownload.text}</p>
              <div className="flex flex-wrap gap-3">
                {hasContent(t.footer.appDownload.iosUrl) && (
                  <a href={resolveLink(t.footer.appDownload.iosUrl)} target="_blank" rel="noopener noreferrer" className="lt-focus inline-flex min-h-[40px] items-center rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    App Store
                  </a>
                )}
                {hasContent(t.footer.appDownload.androidUrl) && (
                  <a href={resolveLink(t.footer.appDownload.androidUrl)} target="_blank" rel="noopener noreferrer" className="lt-focus inline-flex min-h-[40px] items-center rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    Google Play
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="relative border-t border-white/10 py-5 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-sm text-white/45">{t.footer.copyright}</p>
            <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
              {t.footer.links.map((link, i) => (
                <a key={i} href={link.url} className="lt-taplink lt-focus font-body text-sm text-white/45 transition-colors hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      );
      
      default:
        return null;
    }
  };

  return (
    <div
      // Per the CSS spec, if one axis is non-visible and the other is
      // "visible" (explicitly OR by default), the visible one gets silently
      // promoted to "auto" — so overflow-x-hidden alone turned this div
      // (wrapping the ENTIRE page) into its own independently-scrollable
      // region nested inside the canvas's own scroll container, making
      // sections/blocks feel individually scrollable instead of one
      // continuous page. The marquee ticker already clips itself locally
      // (see the Marquee component below), so this wrapper doesn't need
      // vertical overflow visible — clip on both axes avoids the promotion
      // entirely. `clip`, not `hidden`: `overflow: hidden` establishes a
      // scroll container, which broke the announcementBar's `position:
      // sticky` (it stuck relative to this div instead of the viewport, so
      // it never visibly stayed put while scrolling). `clip` still clips
      // overflow but — unlike hidden/auto/scroll — doesn't create a
      // scrolling context, so sticky descendants look past it to the real
      // viewport as their scrolling ancestor.
      ref={rootRef}
      className="min-h-screen font-sans w-full max-w-full overflow-clip"
      style={{
        backgroundColor: c.bodyBg,
        // Consumed by the .lt-card seam so the crystalline top edge stays in
        // each page's own palette instead of a hardcoded brand color.
        ["--lt-seam" as string]: c.accent,
        ["--lt-seam-soft" as string]: hexToRgba(c.primary, 0.55),
        ...(t.fontFamily ? { fontFamily: t.fontFamily } : {}),
      }}
    >
      {/* Inject marquee animation + fonts. A chosen template font overrides the
          default body (and heading) fonts across the whole page. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes floating-cta-ring { 0% { transform: scale(0.85); opacity: 0.8; } 70% { transform: scale(1.25); opacity: 0; } 100% { opacity: 0; } }
        @keyframes floating-cta-bob { 0% { transform: translateY(0); } 50% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
        @keyframes lt-aura { 0%, 100% { transform: scale(1) translate3d(0,0,0); opacity: .7; } 50% { transform: scale(1.1) translate3d(0,-2%,0); opacity: 1; } }
        @keyframes lt-rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
        @keyframes lt-sheen { 0% { transform: translateX(-130%) skewX(-18deg); } 55%, 100% { transform: translateX(240%) skewX(-18deg); } }
        @keyframes lt-marquee-l { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes lt-marquee-r { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        /* Stage aura blooms wander and swell. Position alone was far too subtle
           to read at these sizes, so each layer also scales — that swell is what
           actually makes the light look alive. Each layer runs its own path so
           they never move as one sheet. */
        @keyframes lt-stage-drift {
          0% {
            background-position: 0% 0%, 100% 0%, 50% 100%;
            background-size: 150% 150%, 140% 140%, 160% 160%;
          }
          25% {
            background-position: 72% 28%, 28% 62%, 18% 58%;
            background-size: 210% 210%, 195% 195%, 145% 145%;
          }
          50% {
            background-position: 100% 82%, 0% 100%, 92% 18%;
            background-size: 160% 160%, 230% 230%, 205% 205%;
          }
          75% {
            background-position: 28% 100%, 82% 18%, 62% 92%;
            background-size: 225% 225%, 150% 150%, 175% 175%;
          }
          100% {
            background-position: 0% 0%, 100% 0%, 50% 100%;
            background-size: 150% 150%, 140% 140%, 160% 160%;
          }
        }
        @keyframes lt-proof-pop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
        .lt-proof-pop { animation: lt-proof-pop .5s cubic-bezier(.16,1,.3,1) both; }

        /* Seats-remaining bar. The fill only starts from zero once .lt-anim is
           on the root and the row has been revealed — with JS off, the inline
           width renders straight away and none of this applies. */
        @keyframes lt-seat-shimmer { 0% { transform: translateX(-100%); } 60%, 100% { transform: translateX(320%); } }
        @keyframes lt-seat-ping { 0% { transform: scale(1); opacity: .75; } 70% { transform: scale(2.4); opacity: 0; } 100% { transform: scale(2.4); opacity: 0; } }
        .lt-seat-shimmer {
          position: absolute; inset: 0 auto 0 0; width: 40%; pointer-events: none; border-radius: 9999px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
          animation: lt-seat-shimmer 2.6s ease-in-out 1.1s infinite;
        }
        .lt-seat-ping { animation: lt-seat-ping 1.9s cubic-bezier(0,0,.2,1) infinite; }

        /* Seconds chip in the docked-bar countdown — a 1s pulse so the strip
           reads as live rather than as a static date. */
        @keyframes lt-tick { 0%, 82% { transform: none; } 88% { transform: scale(1.08); } 100% { transform: none; } }
        .lt-tick { animation: lt-tick 1s ease-in-out infinite; }

        /* Docked-bar CTA. Everything here is unattended — there is no hover on
           the device this bar exists for. The pulse lives on the wrapper so the
           button's own :hover translate still works on desktop. */
        @keyframes lt-dock-glow { 0%, 100% { opacity: .4; transform: scale(.95); } 50% { opacity: .85; transform: scale(1.05); } }
        @keyframes lt-dock-pulse { 0%, 86%, 100% { transform: none; } 93% { transform: scale(1.035); } }
        @keyframes lt-dock-sheen { 0% { transform: translateX(-130%) skewX(-18deg); } 22%, 100% { transform: translateX(320%) skewX(-18deg); } }
        @keyframes lt-dock-arrow { 0%, 80%, 100% { transform: none; } 90% { transform: translateX(3px); } }
        /* Static, not looping: this bar is fixed and mounted for the whole
           session, so four overlapping infinite animations here (one with
           its own blur filter) meant continuous repaint for as long as the
           page stayed open — a real source of the reported slowness/heat on
           lower-end phones. The glow, sheen and arrow now hold their resting
           frame instead of animating forever. */
        .lt-dock-glow { opacity: .65; }
        .lt-anim .lt-reveal .lt-seat-fill { width: 0 !important; }
        .lt-anim .lt-reveal.is-in .lt-seat-fill {
          width: var(--lt-seat, 0%) !important;
          transition: width 1.5s cubic-bezier(.16,1,.3,1) .15s;
        }

        /* Tap targets. min-height does nothing to a non-replaced inline element,
           so this only targets things that already establish a box — the CTAs,
           icon buttons and carousel dots. Inline text links get their padding
           from .lt-taplink instead. */
        @media (hover: none) and (pointer: coarse) {
          .lt-cta, button.lt-focus:not(.lt-bar-cta) { min-height: 44px; }
        }
        /* Footer/nav text links: padded to a comfortable target without
           changing the visual rhythm (negative margin absorbs the padding). */
        .lt-taplink { display: inline-flex; align-items: center; min-height: 36px; }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .lt-marquee-track { animation: lt-marquee-l 46s linear infinite; }
        .lt-marquee-track.lt-marquee-reverse { animation-name: lt-marquee-r; }
        .lt-marquee-row:hover .lt-marquee-track { animation-play-state: paused; }
        .font-display { font-family: ${t.fontFamily ? t.fontFamily : "'Marcellus', serif"}; }
        .font-body { font-family: ${t.fontFamily ? t.fontFamily : "'Inter', sans-serif"}; }

        /* Scroll choreography. The hidden state only applies once JS has added
           .lt-anim to the root, so with JS disabled (or in the admin editor)
           every element stays visible and nothing can get stranded at opacity 0. */
        .lt-anim .lt-reveal { opacity: 0; transform: translateY(26px); will-change: opacity, transform; }
        .lt-anim .lt-reveal.is-in {
          opacity: 1; transform: none;
          transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1);
          transition-delay: calc(var(--lt-i, 0) * 85ms);
        }
        .lt-anim .lt-rise { animation: lt-rise .95s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--lt-i, 0) * 90ms); }

        /* Static, not animated: an infinite scale+opacity loop on a blur-3xl
           circle forces continuous GPU compositing of a large region for as
           long as the page is open, which on mid/low-end phones shows up as
           sustained CPU/GPU load and device heat. The still glow reads just
           as rich without that cost. */
        .lt-aura { opacity: .85; }
        .lt-grain-layer {
          position: absolute; inset: 0; pointer-events: none; opacity: .35; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='.55'/></svg>");
        }

        /* The seam: a crystalline hairline along a card's top edge that widens
           to the full width on hover. It is the one ornament the light half of
           the page carries — salt is the subject, and a struck line of mineral
           light is the closest the type system gets to it. Inset by default so
           it reads as a facet rather than a border. */
        .lt-card { position: relative; transition: transform .5s cubic-bezier(.16,1,.3,1), box-shadow .5s ease, border-color .5s ease; }
        .lt-card::before {
          content: ""; position: absolute; left: 18%; right: 18%; top: -1px; height: 1.5px;
          pointer-events: none; border-radius: 9999px;
          background: linear-gradient(90deg, transparent, var(--lt-seam-soft), var(--lt-seam), var(--lt-seam-soft), transparent);
          opacity: .5;
          transition: opacity .55s ease, left .55s cubic-bezier(.16,1,.3,1), right .55s cubic-bezier(.16,1,.3,1);
        }
        .lt-card:hover::before { left: 6%; right: 6%; opacity: 1; }
        .lt-card:hover { transform: translateY(-6px); }

        .lt-cta { overflow: hidden; isolation: isolate; transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease; }
        .lt-cta:hover { transform: translateY(-2px); }
        .lt-cta-sheen {
          position: absolute; top: 0; bottom: 0; width: 38%; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
          transform: translateX(-130%) skewX(-18deg);
        }
        .lt-cta:hover .lt-cta-sheen { animation: lt-sheen 1.1s ease-out; }

        .lt-zoom img, .lt-zoom video { transition: transform .8s cubic-bezier(.16,1,.3,1); }
        .lt-zoom:hover img, .lt-zoom:hover video { transform: scale(1.06); }

        .lt-focus:focus-visible { outline: 2px solid ${c.accent}; outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .lt-anim .lt-reveal, .lt-anim .lt-reveal.is-in { opacity: 1 !important; transform: none !important; transition: none !important; }
          .lt-anim .lt-rise { animation: none !important; }
          .lt-aura, .animate-marquee, .lt-marquee-track, .animate-bounce { animation: none !important; }
          .lt-proof-pop { animation: none !important; }
          .lt-seat-shimmer, .lt-seat-ping, .lt-tick { animation: none !important; }
          .lt-dock-glow, .lt-dock-cta, .lt-dock-cta .lt-cta-sheen, .lt-dock-arrow { animation: none !important; }
          .lt-anim .lt-reveal .lt-seat-fill,
          .lt-anim .lt-reveal.is-in .lt-seat-fill { width: var(--lt-seat, 0%) !important; transition: none !important; }
          .lt-card:hover, .lt-cta:hover { transform: none !important; }
          .lt-zoom:hover img, .lt-zoom:hover video { transform: none !important; }
        }
      `}} />

      {sectionOrder.map((sectionKey, index) => {
        // Empty legacy Rich Content slot: skipped entirely (not even the
        // editor's hidden-section placeholder shell) — see
        // isLegacyRichContentEmpty. Returning null from the map keeps the
        // surrounding gap indices aligned with the full section order.
        if (sectionKey === "richContent" && isLegacyRichContentEmpty(pageContent)) {
          return null;
        }
        const style = t.sectionStyles?.[sectionKey];
        const rendered = renderSection(sectionKey);
        // Spacing overrides wrap the section; the wrapper inherits the
        // section's bg override (if any) so the extra space doesn't read as a
        // gap of a different color.
        const content =
          rendered && style && (style.paddingTop || style.paddingBottom) ? (
            <div
              style={{
                paddingTop: style.paddingTop || 0,
                paddingBottom: style.paddingBottom || 0,
                backgroundColor: t.sectionBg?.[sectionKey] || undefined,
              }}
            >
              {rendered}
            </div>
          ) : (
            rendered
          );

        if (!editorBridge) {
          return <React.Fragment key={sectionKey}>{content}</React.Fragment>;
        }
        return (
          <React.Fragment key={sectionKey}>
            <SectionInsertPoint index={index} bridge={editorBridge} />
            <EditorSectionShell
              sectionKey={sectionKey}
              index={index}
              total={sectionOrder.length}
              order={sectionOrder}
              visible={getSectionVisibility(t, sectionKey)}
              bridge={editorBridge}
            >
              {content}
            </EditorSectionShell>
          </React.Fragment>
        );
      })}
      {editorBridge && (
        <SectionInsertPoint index={sectionOrder.length} bridge={editorBridge} />
      )}

      {/* Mounted once at the page level, not inside the 'invitation' case's
          section — every "Register Now" CTA across the template (hero,
          announcement bar, program, pricing, footer, ...) opens this same
          dialog via setInvitationDialogOpen, regardless of whether the
          'invitation' section itself is enabled or even in sectionOrder for
          this page. Nesting it inside that one case meant the dialog simply
          didn't exist in the tree — and every other Register button — on any
          page that didn't use the invitation section. */}
      <InvitationDialog
        open={invitationDialogOpen}
        onOpenChange={setInvitationDialogOpen}
        invitation={t.invitation}
        primaryColor={c.primary}
        accentColor={c.ctaAccent || c.accent}
        landingPageId={landingPageId}
        pageSlug={pageSlug}
        isPreviewMode={isPreviewMode}
      />

      {/* Reserves the strip the docked CTA occupies so it can never cover the
          last rows of the footer on a phone. */}
      {floatingButtonProps && (
        <div
          aria-hidden="true"
          className={`${
            isCheckoutBar
              // The countdown chips carry a label and unit captions, so a bar
              // with one is taller than a bare price/note bar. Under-reserving
              // here lets the strip cover the last rows of the footer.
              ? hasContent(t.floatingButton.countdownTo)
                ? "h-[88px]"
                : "h-[68px]"
              : "h-[88px]"
          } ${floatingOnDesktop ? "" : "md:hidden"}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        />
      )}

      {floatingButtonProps && (isCheckoutBar ? (
        // Docked checkout bar: countdown / price / note on the left, button on
        // the right — the pattern every reference landing page uses on mobile.
        // Sits above the home-indicator via env(safe-area-inset-bottom).
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t ${floatingOnDesktop ? "" : "md:hidden"}`}
          style={{
            // Backdrop-blur dropped: at 92% opacity it added negligible visual
            // softening, but backdrop-filter forces continuous GPU
            // recomposition of a fixed, always-mounted element on every
            // scroll frame — a real contributor to sustained device heat.
            backgroundColor: hexToRgba(c.darkBg, 0.96),
            borderColor: "rgba(255,255,255,0.12)",
            paddingBottom: "env(safe-area-inset-bottom)",
            boxShadow: "0 -12px 34px -18px rgba(0,0,0,.8)",
          }}
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-3 py-2.5 sm:gap-5 sm:px-6 sm:py-3">
            {(hasContent(t.floatingButton.countdownTo) ||
              hasContent(t.floatingButton.priceText) ||
              hasContent(t.floatingButton.noteText)) && (
              <div className="min-w-0 flex-1">
                {hasContent(t.floatingButton.countdownTo) && (
                  <DockedCountdown
                    target={t.floatingButton.countdownTo}
                    label={t.floatingButton.countdownLabel}
                    accent={c.ctaAccent || c.accent}
                  />
                )}
                {hasContent(t.floatingButton.priceText) && (
                  <span className="flex flex-wrap items-baseline gap-1.5">
                    <span className="font-display text-lg font-bold leading-none text-white sm:text-xl">
                      {t.floatingButton.priceText}
                    </span>
                    {hasContent(t.floatingButton.strikePriceText) && (
                      <span className="font-body text-xs line-through text-white/45 sm:text-sm">
                        {t.floatingButton.strikePriceText}
                      </span>
                    )}
                  </span>
                )}
                {hasContent(t.floatingButton.noteText) && (
                  <span className="font-body mt-0.5 block truncate text-[10.5px] font-medium text-white/60 sm:text-xs">
                    {t.floatingButton.noteText}
                  </span>
                )}
              </div>
            )}
            {/* The pill's own effects are hover-driven, which never fires on a
                phone — so the docked CTA gets a breathing aura, an unattended
                sheen sweep and a slow pulse from the wrapper. */}
            <span className="lt-dock-cta relative flex-shrink-0">
              <span
                aria-hidden="true"
                className="lt-dock-glow pointer-events-none absolute -inset-1.5 rounded-full blur-md"
                style={{ background: `linear-gradient(90deg, ${hexToRgba(c.primary, 0.85)}, ${hexToRgba(c.ctaAccent || c.accent, 0.95)})` }}
              />
              {"href" in floatingButtonProps ? (
                <a
                  href={floatingButtonProps.href}
                  className="lt-cta lt-focus group/cta relative inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold text-white shadow-lg sm:px-8 sm:text-base"
                  style={ctaStyle(c.primary, c.ctaAccent || c.accent)}
                >
                  <span className="lt-cta-sheen" aria-hidden="true" />
                  {floatingCtaLabel}
                  <CtaArrow className="lt-dock-arrow" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={floatingButtonProps.action}
                  className="lt-cta lt-focus group/cta relative inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold text-white shadow-lg sm:px-8 sm:text-base"
                  style={ctaStyle(c.primary, c.ctaAccent || c.accent)}
                >
                  <span className="lt-cta-sheen" aria-hidden="true" />
                  {floatingCtaLabel}
                  <CtaArrow className="lt-dock-arrow" />
                </button>
              )}
            </span>
          </div>
        </div>
      ) : (
        <div
          className={`fixed inset-x-0 bottom-4 flex justify-center z-40 px-4 pointer-events-none ${floatingOnDesktop ? "" : "md:hidden"}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="relative w-full max-w-sm pointer-events-auto">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-80 animate-pulse"
              style={{ backgroundImage: `linear-gradient(90deg, ${hexToRgba(c.primary, 0.6)}, ${hexToRgba(c.ctaAccent || c.accent, 0.5)}, ${hexToRgba(c.secondary, 0.6)})` }}
            />
            <span className="floating-cta-ring absolute inset-0 rounded-full border border-white/70" style={{ animation: "floating-cta-ring 2.5s ease-out infinite" }} />
            <span className="floating-cta-ring absolute inset-0 rounded-full border border-white/60" style={{ animation: "floating-cta-ring 2.5s ease-out infinite 1.25s" }} />
            {"href" in floatingButtonProps ? (
              <a
                href={floatingButtonProps.href}
                className="relative inline-flex w-full h-14 items-center justify-center rounded-full text-base font-semibold text-white shadow-2xl"
                style={{ backgroundColor: c.primary, animation: "floating-cta-bob 3.2s ease-in-out infinite" }}
              >
                {floatingCtaLabel}
              </a>
            ) : (
              <button
                type="button"
                onClick={floatingButtonProps.action}
                className="relative inline-flex w-full h-14 items-center justify-center rounded-full text-base font-semibold text-white shadow-2xl"
                style={{ backgroundColor: c.primary, animation: "floating-cta-bob 3.2s ease-in-out infinite" }}
              >
                {floatingCtaLabel}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

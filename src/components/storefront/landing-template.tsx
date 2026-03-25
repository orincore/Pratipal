"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LandingTemplateData } from "@/lib/template-types";
import { DEFAULT_MEDIA_SETTINGS, normalizeTemplateData } from "@/lib/template-types";
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
import { CalendarDays, Clock3, MapPin, CheckCircle2, ChevronLeft, ChevronRight, Zap, Radio, FlaskConical, BookOpen, Star, Heart, Leaf, Sun, Moon, Sparkles, Target, Trophy, Users, Brain, Lightbulb, Shield, Flame, Gem, Music, Globe, Camera, Smile, Coffee, Rocket, Award, MessageSquare, Lock } from "lucide-react";

// Icon resolver for why-section cards
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Radio, FlaskConical, BookOpen, Star, Heart, Leaf, Sun, Moon, Sparkles,
  Target, Trophy, Users, Brain, Lightbulb, Shield, Flame, Gem, Music, Globe,
  Camera, Smile, Coffee, Rocket, Award, CheckCircle2, CalendarDays, Clock3,
};
function ProgramIcon({ name, className, style }: { name?: string; className?: string; style?: React.CSSProperties }) {
  const Icon = name ? (ICON_MAP[name] ?? Sparkles) : Sparkles;
  return <Icon className={className} style={style} />;
}

// ---------------------------------------------------------------------------
// Helper: hex to rgba
// ---------------------------------------------------------------------------
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
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
// FAQ Item Component (accordion)
// ---------------------------------------------------------------------------
function FaqItem({ item, primaryColor }: { item: { question: string; answer: string }; primaryColor: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
      >
        <span className="font-semibold text-gray-900 text-sm sm:text-base font-body">{item.question}</span>
        <span
          className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-transform duration-300"
          style={{ backgroundColor: open ? primaryColor : "#f3f4f6", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke={open ? "#fff" : "#6b7280"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-gray-600 font-body leading-relaxed border-t border-gray-50 pt-3">
          {item.answer}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Marquee Component
// ---------------------------------------------------------------------------
function Marquee({ items, color }: { items: string[]; color: string }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden whitespace-nowrap py-3" style={{ backgroundColor: color }}>
      <div className="inline-flex animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="mx-8 text-sm font-semibold text-white uppercase tracking-widest">
            {item} <span className="mx-4 opacity-50">✦</span>
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
function VideoTestimonialsSlider({ items, primaryColor }: {
  items: { url: string; name: string; role: string }[];
  primaryColor: string;
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
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: "none" }}
      >
        {tripled.map((item, i) => {
          const isActive = i === activeIdx;
          const type = getMediaType(item.url);
          const ytId = type === "youtube" ? extractYTId(item.url) : null;
          const igId = type === "instagram" ? extractIGId(item.url) : null;

          const ytSrc = ytId
            ? `https://www.youtube.com/embed/${ytId}?${isActive ? "autoplay=1&" : ""}mute=1&loop=1&playlist=${ytId}&rel=0&modestbranding=1&playsinline=1`
            : null;
          // Instagram embed with autoplay
          const igSrc = igId
            ? `https://www.instagram.com/p/${igId}/embed/?autoplay=1&muted=1`
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
        <div className="flex justify-center gap-1.5 mt-5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { jumpTo(n + i); setActiveIdx(n + i); }}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === realActive ? 24 : 8,
                backgroundColor: i === realActive ? primaryColor : "#d1d5db",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Template Component
// ---------------------------------------------------------------------------
interface LandingTemplateProps {
  data?: Partial<LandingTemplateData>;
  landingPageId?: string;
  pageSlug?: string;
}

export function LandingTemplate({ data, landingPageId, pageSlug }: LandingTemplateProps) {
  const t = normalizeTemplateData(data);
  const c = t.colors;
  // Returns override bg color for a section, or falls back to the provided default
  const sbg = (key: string, fallback: string) => (t.sectionBg?.[key]) || fallback;
  const router = useRouter();
  const canonicalSections = ['hero', 'marquee', 'why', 'about', 'logos', 'gallery', 'stats', 'testimonials', 'videoTestimonials', 'program', 'contentBlocks', 'invitation', 'bonus', 'faq', 'footer'];
  const baseOrder = t.sectionOrder && t.sectionOrder.length ? t.sectionOrder : canonicalSections;
  const sectionOrder = [...baseOrder, ...canonicalSections.filter((key) => !baseOrder.includes(key))];
  const mediaSettings = t.mediaSettings || {};
  const createEmptyInvitationForm = () => ({
    firstName: "",
    email: "",
    whatsapp: "",
    countryCode: "+91",
    location: "",
  });
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationSuccess, setInvitationSuccess] = useState(false);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [invitationForm, setInvitationForm] = useState(createEmptyInvitationForm);
  const isPreviewMode = !landingPageId;

  const resetInvitationForm = () => setInvitationForm(createEmptyInvitationForm());

  const handleInvitationDialogChange = (open: boolean) => {
    setInvitationDialogOpen(open);
    if (!open) {
      setInvitationSuccess(false);
      setInvitationError(null);
      setInvitationLoading(false);
      resetInvitationForm();
    }
  };

  const handleInvitationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invitationForm.firstName.trim() || !invitationForm.email.trim() || !invitationForm.whatsapp.trim()) {
      setInvitationError("Please provide your name, email, and WhatsApp number.");
      return;
    }

    setInvitationLoading(true);
    setInvitationError(null);

    const payload = {
      landingPageId,
      landingPageSlug: pageSlug,
      firstName: invitationForm.firstName.trim(),
      email: invitationForm.email.trim(),
      whatsappNumber: invitationForm.whatsapp.trim()
        ? `${invitationForm.countryCode}${invitationForm.whatsapp.trim().replace(/^0+/, "")}`
        : "",
      location: invitationForm.location.trim(),
    };

    try {
      if (isPreviewMode) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        // In preview mode, just show a brief success indicator then close
        setInvitationSuccess(true);
        resetInvitationForm();
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

      // Redirect to thank-you page
      const thankYouData = {
        title: t.invitation.successTitle,
        description: t.invitation.successDescription,
        buttons: t.invitation.thankYouButtons || [],
        from: pageSlug || "",
      };
      sessionStorage.setItem("thankYouData", JSON.stringify(thankYouData));
      router.push(`/${pageSlug}/thank-you`);
      resetInvitationForm();
    } catch (err: any) {
      setInvitationError(err.message || "Unable to submit right now. Please try again later.");
    } finally {
      setInvitationLoading(false);
    }
  };

  const updateInvitationForm = (field: keyof typeof invitationForm, value: string) => {
    setInvitationForm((prev) => ({ ...prev, [field]: value }));
  };

  const floatingButtonProps: FloatingButtonRenderProps | null = (() => {
    if (!t.floatingButton?.enabled) return null;
    switch (t.floatingButton.section) {
      case "hero":
        if (!t.hero.visible || !hasContent(t.hero.ctaButtonText)) return null;
        return { label: t.hero.ctaButtonText, action: () => setInvitationDialogOpen(true) };
      case "program":
        if (!t.program.visible || !hasContent(t.program.ctaButtonText)) return null;
        return { label: t.program.ctaButtonText, action: () => setInvitationDialogOpen(true) };
      case "invitation":
        if (!t.invitation.enabled || !hasContent(t.invitation.buttonText)) return null;
        return { label: t.invitation.buttonText, action: () => setInvitationDialogOpen(true) };
      case "footer":
        if (!t.footer.enabled || !hasContent(t.footer.cta.ctaButtonText)) return null;
        return { label: t.footer.cta.ctaButtonText, action: () => setInvitationDialogOpen(true) };
      default:
        return null;
    }
  })();

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

  const renderHeroCarousel = () => {
    if (heroSlides.length === 0) {
      return renderMedia(t.hero.heroImage, mediaKey("hero", "heroImage"), {
        wrapperClassName: "absolute inset-0 w-full h-full",
        className: "w-full h-full object-cover",
        alt: "Hero",
      });
    }

    return (
      <div className="group relative w-full h-full">
        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={`${slide.url}-${index}`}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentHeroSlide
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {renderMedia(slide.url, mediaKey("hero", "heroMedia", index, "url"), {
                wrapperClassName: "absolute inset-0 w-full h-full",
                className: "w-full h-full object-cover",
                alt: slide.label || `Hero slide ${index + 1}`,
              })}
              {slide.label && index === currentHeroSlide && (
                <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-xs font-semibold text-gray-700">
                  {slide.label}
                </div>
              )}
            </div>
          ))}
        </div>

        {heroSlides.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 text-gray-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition"
              onClick={() => handleHeroSlideChange("prev")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 text-gray-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition"
              onClick={() => handleHeroSlideChange("next")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  onClick={() => setCurrentHeroSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentHeroSlide ? "w-8 bg-white" : "w-2 bg-white/60"
                  }`}
                />
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
    options: { className?: string; wrapperClassName?: string; alt?: string } = {}
  ) => {
    if (!url) return null;
    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
    const isVideo = VIDEO_REGEX.test(url);

    if (isYouTube) {
      const youtubeId = extractYouTubeId(url);
      if (!youtubeId) return null;
      const settings = key ? mediaSettings[key] || DEFAULT_MEDIA_SETTINGS : DEFAULT_MEDIA_SETTINGS;
      const params = new URLSearchParams({
        autoplay: settings.autoplay ? "1" : "0",
        mute: settings.mute ? "1" : "0",
        rel: "0",
        modestbranding: "1",
        playsinline: "1",
      });
      const iframe = (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?${params.toString()}`}
          className={[
            "absolute inset-0 h-full w-full",
            options.className,
          ].filter(Boolean).join(" ")}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
      return withWrapper(
        iframe,
        options.wrapperClassName || "relative w-full overflow-hidden aspect-video"
      );
    }

    if (isVideo) {
      const settings = key ? mediaSettings[key] || DEFAULT_MEDIA_SETTINGS : DEFAULT_MEDIA_SETTINGS;
      return withWrapper(
        <video
          src={url}
          className={options.className}
          autoPlay={settings.autoplay}
          muted={settings.mute}
          loop={settings.autoplay}
          controls={!settings.autoplay}
        />,
        options.wrapperClassName
      );
    }

    return withWrapper(
      <img src={url} alt={options.alt || ""} className={options.className} />,
      options.wrapperClassName
    );
  };

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return (
          t.hero.visible && (
            <section className="py-6 sm:py-8" style={{ backgroundColor: sbg('hero', c.heroBg) }}>
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-black/5 shadow-xl overflow-hidden bg-white/95">
                  {/* Content */}
                  <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 space-y-5">
                    {t.hero.badge && (
                      <span
                        className="inline-flex px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                        style={{ backgroundColor: hexToRgba(c.primary, 0.1), color: c.primary }}
                      >
                        {t.hero.badge}
                      </span>
                    )}
                    <h1 className="font-display text-[clamp(1.6rem,3.5vw,2.8rem)] leading-tight font-bold text-gray-900">
                      {t.hero.headline}{" "}
                      {t.hero.highlightedWord && (
                        <span className="relative inline-block">
                          <span style={{ color: c.secondary }}>{t.hero.highlightedWord}</span>
                          <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 10" fill="none">
                            <path d="M2 7 C50 2, 150 2, 198 7" stroke={c.primary} strokeWidth="3" strokeLinecap="round" />
                          </svg>
                        </span>
                      )}
                    </h1>

                  {/* Media — right after title, natural aspect ratio */}
                  {heroSlides.length > 0 && (
                    <div className="w-full aspect-video relative rounded-xl overflow-hidden">
                      <div className="absolute inset-0">{renderHeroCarousel()}</div>
                    </div>
                  )}
                    {hasContent(t.hero.subheadline) && (
                      <p className="text-sm sm:text-base text-gray-600 font-body leading-relaxed">
                        {t.hero.subheadline}
                      </p>
                    )}
                    {Array.isArray(t.hero.bulletPoints) && t.hero.bulletPoints.filter(Boolean).length > 0 && (
                      <ul className="grid sm:grid-cols-2 gap-2">
                        {t.hero.bulletPoints.filter(Boolean).map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-body">
                            <span
                              className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-white text-[10px]"
                              style={{ backgroundColor: c.primary }}
                            >✓</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => setInvitationDialogOpen(true)}
                        className="inline-flex items-center px-6 py-3 rounded-full text-white font-semibold text-sm sm:text-base shadow-md transition-all duration-300 hover:-translate-y-0.5"
                        style={{ backgroundColor: c.primary }}
                      >
                        {hasContent(t.hero.ctaButtonText) ? t.hero.ctaButtonText : "Get Started"}
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                      {Array.isArray(t.hero.floatingStats) && t.hero.floatingStats.length > 0 && (
                        <div className="flex gap-5">
                          {t.hero.floatingStats.map((stat, i) => (
                            <div key={i} className="text-center">
                              <div className="text-lg font-bold font-display" style={{ color: c.secondary }}>{stat.value}</div>
                              <div className="text-[10px] text-gray-500 font-body uppercase tracking-wider">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )
        );
      
      case 'marquee':
        return t.marquee.enabled && <Marquee items={t.marquee.items} color={c.secondary} />;
      
      case 'why':
        return t.why.visible && (
        <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('why', c.bodyBg) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-6 lg:mb-10">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t.why.title}
              </h2>
              <p className="text-lg text-gray-600 font-body">{t.why.subtitle}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {t.why.points.map((point, i) => {
                const pointMedia = renderMedia(point.image, mediaKey("why", "points", i, "image"), {
                  className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                  alt: point.title,
                });
                return (
                <div
                  key={i}
                  className="group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {pointMedia && (
                    <div className="h-52 overflow-hidden">
                      {pointMedia}
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{point.title}</h3>
                    <p className="text-gray-600 font-body leading-relaxed">{point.description}</p>
                  </div>
                </div>
              );})}
            </div>
          </div>
        </section>
      );
      
      case 'about':
        return t.about.visible && (
        <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('about', hexToRgba(c.primary, 0.04)) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-3xl rotate-2 opacity-10"
                  style={{ backgroundColor: c.secondary }}
                />
                {renderMedia(t.about.image, mediaKey("about", "image"), {
                  className: "relative rounded-3xl shadow-xl w-full h-full object-cover",
                  wrapperClassName:
                    "relative w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden",
                  alt: t.about.name,
                })}
              </div>
              <div className="space-y-6">
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: hexToRgba(c.secondary, 0.12), color: c.secondary }}
                >
                  {t.about.title}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">{t.about.name}</h2>
                <p className="text-gray-600 font-body text-lg leading-relaxed">{t.about.description}</p>
                {t.about.credentials.length > 0 && (
                  <ul className="space-y-2">
                    {t.about.credentials.map((cred, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700 font-body">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: c.primary }}
                        />
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
      
      case 'logos':
        return t.logos.enabled && t.logos.logos.length > 0 && (
        <section className="py-8 border-y border-gray-100" style={{ backgroundColor: sbg('logos', c.bodyBg) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
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
        <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('gallery', c.bodyBg) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-6 lg:mb-8">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.gallery.title}</h2>
              <p className="text-lg text-gray-600 font-body">{t.gallery.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.gallery.images.map((img, i) => (
                <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300">
                  {renderMedia(img.url, mediaKey("gallery", "images", i, "url"), {
                    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
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
      
      case 'stats':
        return t.stats.visible && (
        <section className="py-8 lg:py-14 relative overflow-hidden" style={{ backgroundColor: sbg('stats', c.darkBg) }}>
          {t.stats.backgroundImage && (
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center"
              style={{ backgroundImage: `url(${t.stats.backgroundImage})` }}
            />
          )}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{t.stats.title}</h2>
            <p className="text-lg text-white/80 font-body mb-12 max-w-2xl mx-auto">{t.stats.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
              {t.stats.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl lg:text-5xl font-bold font-display mb-1 text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70 font-body uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setInvitationDialogOpen(true)}
              className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: c.primary }}
            >
              {t.stats.ctaButtonText}
            </button>
          </div>
        </section>
      );
      
      case 'testimonials':
        return t.testimonials.visible && t.testimonials.items.length > 0 && (
        <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('testimonials', c.bodyBg) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-6 lg:mb-10">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t.testimonials.title}
              </h2>
              <p className="text-lg text-gray-600 font-body">{t.testimonials.subtitle}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {t.testimonials.items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-8 bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-6">
                    {item.image ? (
                      renderMedia(item.image, mediaKey("testimonials", "items", i, "image"), {
                        className: "h-14 w-14 rounded-full object-cover shadow-sm",
                        alt: item.name,
                      })
                    ) : (
                      <div
                        className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: c.secondary }}
                      >
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 font-body">{item.name}</div>
                      <div className="text-sm text-gray-500 font-body">{item.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 font-body leading-relaxed flex-1 italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="flex gap-1 mt-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="h-4 w-4" viewBox="0 0 20 20" fill={c.primary}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

      case 'videoTestimonials':
        return t.videoTestimonials.visible && t.videoTestimonials.items.length > 0 && (
        <section className="py-8 lg:py-14 overflow-hidden" style={{ backgroundColor: sbg('videoTestimonials', hexToRgba(c.darkBg, 0.04)) }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t.videoTestimonials.title}
              </h2>
              <p className="text-lg text-gray-600 font-body">{t.videoTestimonials.subtitle}</p>
            </div>
            <VideoTestimonialsSlider
              items={videoTestimonialItems}
              primaryColor={c.primary}
            />
          </div>
        </section>
      );
      
      case 'program':
        return t.program.visible && (
      <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('program', hexToRgba(c.secondary, 0.04)) }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6 lg:mb-8">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t.program.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-body">{t.program.subtitle}</p>
          </div>
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.program.points.map((point, i) => (
              <div
                key={i}
                className="flex items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${hexToRgba(c.secondary, 0.18)} 0%, ${hexToRgba(c.secondary, 0.32)} 100%)`,
                }}
              >
                {/* Icon box */}
                <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <ProgramIcon
                    name={point.icon}
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    style={{ color: c.primary } as React.CSSProperties}
                  />
                </div>
                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight line-clamp-2">
                    {point.title}
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-500 mt-0.5 line-clamp-2">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => setInvitationDialogOpen(true)}
              className="inline-flex items-center px-8 sm:px-10 py-3 sm:py-4 rounded-full text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: c.primary }}
            >
              {t.program.ctaButtonText}
              <svg className="ml-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      </section>
      );
      
      case 'bonus':
        return t.bonus.enabled && t.bonus.items.length > 0 && (
        <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('bonus', c.bodyBg) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-6 lg:mb-8">
              {t.bonus.title}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              {t.bonus.items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-5 rounded-2xl p-6 bg-white shadow-md border border-gray-100"
                >
                  {item.image ? (
                    renderMedia(item.image, mediaKey("bonus", "items", i, "image"), {
                      className: "h-20 w-20 rounded-xl object-cover flex-shrink-0",
                      alt: item.title,
                    })
                  ) : (
                    <div
                      className="h-20 w-20 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: hexToRgba(c.accent, 0.1) }}
                    >
                      🎁
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 font-body text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
      
      case 'invitation':
        return t.invitation.enabled && (
        <section className="py-8 sm:py-10" style={{ backgroundColor: sbg('invitation', hexToRgba(c.primary, 0.06)) }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-[32px] shadow-xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ background: hexToRgba(c.primary, 0.12) }} />
              <div className="relative z-10 space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
                      <span>{t.invitation.badgeEmoji}</span>
                      {t.invitation.badgeText}
                    </div>
                    <h2 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mt-4">{t.invitation.title}</h2>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">{t.invitation.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl bg-gray-50/80 p-4 shadow-inner">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <p className="text-sm font-semibold text-gray-700">{t.invitation.availabilityText}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <CalendarDays className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{t.invitation.dateLabel}</p>
                      <p className="text-xl font-bold text-gray-900">{t.invitation.dateValue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Clock3 className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{t.invitation.timeLabel}</p>
                      <p className="text-xl font-bold text-gray-900">{t.invitation.timeValue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border border-gray-100 rounded-2xl p-4 bg-gray-50/60">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <MapPin className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{t.invitation.venueLabel}</p>
                      <p className="text-sm font-semibold text-gray-900">{t.invitation.venueValue}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 pt-2">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-base font-semibold h-14 rounded-2xl px-10"
                    style={{ backgroundColor: c.primary, color: t.invitation.buttonTextColor || "#1B1F3A" }}
                    onClick={() => setInvitationDialogOpen(true)}
                  >
                    {t.invitation.buttonText}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    {t.invitation.supportText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Dialog open={invitationDialogOpen} onOpenChange={handleInvitationDialogChange}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] rounded-3xl border-0 p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row max-h-[90vh]">
                <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl sm:text-2xl text-violet-900">{t.invitation.formTitle}</DialogTitle>
                    <DialogDescription className="text-gray-500 text-xs sm:text-sm">
                      {t.invitation.subtitle}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {t.invitation.formHighlights.map((item, i) => (
                      <span key={i} className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide bg-purple-100 text-purple-600 px-2.5 sm:px-3 py-1 rounded-full">
                        ✓ {item}
                      </span>
                    ))}
                  </div>

                  <form className="mt-6 space-y-3.5 sm:space-y-4" onSubmit={handleInvitationSubmit}>
                    <div>
                      <Label className="text-xs text-gray-500">Your First Name</Label>
                      <Input
                        value={invitationForm.firstName}
                        onChange={(e) => updateInvitationForm("firstName", e.target.value)}
                        placeholder="Enter your name"
                        className="h-10 sm:h-11 mt-1 rounded-xl text-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Your Best Email</Label>
                      <Input
                        type="email"
                        value={invitationForm.email}
                        onChange={(e) => updateInvitationForm("email", e.target.value)}
                        placeholder="you@example.com"
                        className="h-10 sm:h-11 mt-1 rounded-xl text-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">WhatsApp Number</Label>
                      <div className="flex gap-2 mt-1">
                        <select
                          value={invitationForm.countryCode}
                          onChange={(e) => updateInvitationForm("countryCode", e.target.value)}
                          className="h-10 sm:h-11 rounded-xl border border-input bg-background px-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring w-[80px] sm:w-[90px] flex-shrink-0"
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
                          value={invitationForm.whatsapp}
                          onChange={(e) => updateInvitationForm("whatsapp", e.target.value)}
                          placeholder="98765 43210"
                          className="h-10 sm:h-11 rounded-xl flex-1 text-sm"
                          type="tel"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Location (City, Country)</Label>
                      <Input
                        value={invitationForm.location}
                        onChange={(e) => updateInvitationForm("location", e.target.value)}
                        placeholder="e.g. Mumbai, India"
                        className="h-10 sm:h-11 mt-1 rounded-xl text-sm"
                      />
                    </div>

                    {invitationError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        {invitationError}
                      </div>
                    )}

                    {invitationSuccess ? (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                        <p className="font-semibold text-emerald-700 mt-3">{t.invitation.successTitle}</p>
                        <p className="text-sm text-emerald-600 mt-1">{t.invitation.successDescription}</p>
                      </div>
                    ) : (
                      <Button
                        type="submit"
                        disabled={invitationLoading}
                        className="w-full h-11 sm:h-12 rounded-2xl text-sm sm:text-base font-semibold"
                        style={{ backgroundColor: c.primary, color: t.invitation.buttonTextColor || "#1B1F3A" }}
                      >
                        {invitationLoading ? "Submitting..." : t.invitation.formButtonText}
                      </Button>
                    )}
                  </form>
                </div>
                <div className="hidden md:flex md:w-64 bg-gradient-to-br from-[#1B1F3A] via-[#2C1F55] to-[#44106E] text-white p-8 flex-col justify-between overflow-y-auto">
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
                        <p className="text-white/70 text-xs mt-0.5">Join {t.invitation.supportText}</p>
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
              
              return (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
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
            } else {
              // image
              return renderMedia(block.mediaUrl, blockKey);
            }
          };

          // Render text content
          const renderBlockText = () => {
            if (block.textFormat === "bullets") {
              const bullets = block.content.split('\n').filter(line => line.trim());
              return (
                <div className="space-y-4">
                  {block.heading && (
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      {block.heading}
                    </h3>
                  )}
                  <ul className="space-y-3">
                    {bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-gray-700 font-body">
                        <span
                          className="mt-1 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: c.primary }}
                        >
                          ✓
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
                <div className="space-y-4">
                  {block.heading && (
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      {block.heading}
                    </h3>
                  )}
                  <p className="text-base sm:text-lg text-gray-700 font-body leading-relaxed whitespace-pre-wrap">
                    {block.content}
                  </p>
                </div>
              );
            }
          };

          return (
            <section 
              key={`content-block-${blockIndex}`} 
              className="py-10 lg:py-16" 
              style={{ backgroundColor: sbg(`contentBlock-${blockIndex}`, c.bodyBg) }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${isMediaLeft ? '' : 'lg:grid-flow-dense'}`}>
                  {/* Media */}
                  <div className={isMediaLeft ? '' : 'lg:col-start-2'}>
                    {renderBlockMedia()}
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

      case 'faq':
        return t.faq?.enabled && t.faq.items.length > 0 && (
          <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('faq', c.bodyBg) }}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6 lg:mb-8">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{t.faq.title}</h2>
                {t.faq.subtitle && <p className="text-gray-500 font-body">{t.faq.subtitle}</p>}
              </div>
              <div className="space-y-3">
                {t.faq.items.map((item, i) => (
                  <FaqItem key={i} item={item} primaryColor={c.primary} />
                ))}
              </div>
            </div>
          </section>
        );

      case 'footer':
        return t.footer.enabled && (
      <footer style={{ backgroundColor: sbg('footer', c.darkBg) }}>
        {/* CTA Banner */}
        <div className="py-8 lg:py-14 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t.footer.cta.title}
            </h2>
            <p className="text-lg text-gray-300 font-body mb-8 max-w-2xl mx-auto">
              {t.footer.cta.subtitle}
            </p>
            {(t.footer.cta.showCtaButton ?? true) && (
            <button
              type="button"
              onClick={() => setInvitationDialogOpen(true)}
              className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: c.primary }}
            >
              {t.footer.cta.ctaButtonText}
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
            )}
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 font-body">{t.footer.copyright}</p>
            <div className="flex gap-6">
              {t.footer.links.map((link, i) => (
                <a key={i} href={link.url} className="text-sm text-gray-400 hover:text-white font-body transition-colors">
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
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bodyBg }}>
      {/* Inject marquee animation + fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes floating-cta-ring { 0% { transform: scale(0.85); opacity: 0.8; } 70% { transform: scale(1.25); opacity: 0; } 100% { opacity: 0; } }
        @keyframes floating-cta-bob { 0% { transform: translateY(0); } 50% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}} />

      {sectionOrder.map((sectionKey) => (
        <React.Fragment key={sectionKey}>
          {renderSection(sectionKey)}
        </React.Fragment>
      ))}

      {floatingButtonProps && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center md:hidden z-40 px-4 pointer-events-none">
          <div className="relative w-full max-w-sm pointer-events-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/60 via-purple-500/50 to-amber-400/60 blur-2xl opacity-80 animate-pulse" />
            <span className="floating-cta-ring absolute inset-0 rounded-full border border-white/70" style={{ animation: "floating-cta-ring 2.5s ease-out infinite" }} />
            <span className="floating-cta-ring absolute inset-0 rounded-full border border-white/60" style={{ animation: "floating-cta-ring 2.5s ease-out infinite 1.25s" }} />
            {"href" in floatingButtonProps ? (
              <a
                href={floatingButtonProps.href}
                className="relative inline-flex w-full h-14 items-center justify-center rounded-full text-base font-semibold text-white shadow-2xl"
                style={{ backgroundColor: c.primary, animation: "floating-cta-bob 3.2s ease-in-out infinite" }}
              >
                {floatingButtonProps.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={floatingButtonProps.action}
                className="relative inline-flex w-full h-14 items-center justify-center rounded-full text-base font-semibold text-white shadow-2xl"
                style={{ backgroundColor: c.primary, animation: "floating-cta-bob 3.2s ease-in-out infinite" }}
              >
                {floatingButtonProps.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

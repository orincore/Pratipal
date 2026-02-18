"use client";

import React, { useState } from "react";
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
import { CalendarDays, Clock3, MapPin, CheckCircle2 } from "lucide-react";

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
  const canonicalSections = ['hero', 'marquee', 'why', 'about', 'logos', 'gallery', 'stats', 'testimonials', 'program', 'invitation', 'bonus', 'footer'];
  const baseOrder = t.sectionOrder && t.sectionOrder.length ? t.sectionOrder : canonicalSections;
  const sectionOrder = [...baseOrder, ...canonicalSections.filter((key) => !baseOrder.includes(key))];
  const mediaSettings = t.mediaSettings || {};
  const createEmptyInvitationForm = () => ({
    firstName: "",
    email: "",
    whatsapp: "",
    gender: "female" as "female" | "male",
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
    if (!invitationForm.firstName.trim() || !invitationForm.email.trim()) {
      setInvitationError("Please provide your name and email.");
      return;
    }

    setInvitationLoading(true);
    setInvitationError(null);

    const payload = {
      landingPageId,
      landingPageSlug: pageSlug,
      firstName: invitationForm.firstName.trim(),
      email: invitationForm.email.trim(),
      whatsappNumber: invitationForm.whatsapp.trim(),
      gender: invitationForm.gender,
    };

    try {
      if (isPreviewMode) {
        await new Promise((resolve) => setTimeout(resolve, 600));
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

      setInvitationSuccess(true);
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
        return { label: t.hero.ctaButtonText, href: resolveLink(t.hero.ctaButtonLink) };
      case "program":
        if (!t.program.visible || !hasContent(t.program.ctaButtonText)) return null;
        return { label: t.program.ctaButtonText, href: resolveLink(t.program.ctaButtonLink) };
      case "invitation":
        if (!t.invitation.enabled || !hasContent(t.invitation.buttonText)) return null;
        return { label: t.invitation.buttonText, action: () => setInvitationDialogOpen(true) };
      case "footer":
        if (!t.footer.enabled || !hasContent(t.footer.cta.ctaButtonText)) return null;
        return { label: t.footer.cta.ctaButtonText, href: resolveLink(t.footer.cta.ctaButtonLink) };
      default:
        return null;
    }
  })();

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
      return (
        <div
          className={
            [
              "relative w-full overflow-hidden aspect-video",
              options.wrapperClassName,
            ].filter(Boolean).join(" ")
          }
        >
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?${params.toString()}`}
            className={[
              "absolute inset-0 h-full w-full",
              options.className,
            ].filter(Boolean).join(" ")}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }

    if (isVideo) {
      return <video src={url} className={options.className} autoPlay controls muted={mediaSettings[key || ""]?.mute ?? true} />;
    }

    return <img src={url} alt={options.alt || ""} className={options.className} />;
  };

  const withWrapper = (
    element: React.ReactNode,
    wrapperClassName?: string
  ) => {
    if (!wrapperClassName) return element;
    return <div className={wrapperClassName}>{element}</div>;
  };

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return t.hero.visible && (
        <section className="relative overflow-hidden" style={{ backgroundColor: c.heroBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {t.hero.badge && (
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: hexToRgba(c.primary, 0.15), color: c.primary }}
                  >
                    {t.hero.badge}
                  </span>
                )}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                  {t.hero.headline}{" "}
                  {t.hero.highlightedWord && (
                    <span className="relative inline-block">
                      <span style={{ color: c.secondary }}>{t.hero.highlightedWord}</span>
                      <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                        <path d="M2 8 C50 2, 150 2, 198 8" stroke={c.primary} strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 font-body leading-relaxed max-w-2xl">
                  {t.hero.subheadline}
                </p>
                {t.hero.bulletPoints.length > 0 && (
                  <ul className="space-y-3">
                    {t.hero.bulletPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 font-body">
                        <span
                          className="mt-1 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: c.primary }}
                        >
                          ✓
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap items-center gap-4 pt-2 sm:gap-6">
                  <a
                    href={t.hero.ctaButtonLink}
                    className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: c.primary }}
                  >
                    {t.hero.ctaButtonText}
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </a>
                </div>
                {t.hero.floatingStats.length > 0 && (
                  <div className="flex flex-wrap gap-6 pt-4">
                    {t.hero.floatingStats.map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-2xl font-bold font-display" style={{ color: c.secondary }}>{stat.value}</div>
                        <div className="text-xs text-gray-500 font-body uppercase tracking-wider">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative mt-10 lg:mt-0">
                <div
                  className="absolute inset-4 rounded-3xl -rotate-3 opacity-20"
                  style={{ backgroundColor: c.primary }}
                />
                {renderMedia(t.hero.heroImage, mediaKey("hero", "heroImage"), {
                  wrapperClassName: "rounded-3xl shadow-2xl overflow-hidden",
                  className: "object-cover",
                  alt: "Hero",
                })}
              </div>
            </div>
          </div>
        </section>
      );
      
      case 'marquee':
        return t.marquee.enabled && <Marquee items={t.marquee.items} color={c.secondary} />;
      
      case 'why':
        return t.why.visible && (
        <section className="py-20 lg:py-28" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
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
        <section className="py-20 lg:py-28" style={{ backgroundColor: hexToRgba(c.primary, 0.04) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
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
        <section className="py-12 border-y border-gray-100" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
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
        <section className="py-20 lg:py-28" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
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
        <section className="py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor: c.darkBg }}>
          {t.stats.backgroundImage && (
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center"
              style={{ backgroundImage: `url(${t.stats.backgroundImage})` }}
            />
          )}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{t.stats.title}</h2>
            <p className="text-lg text-gray-300 font-body mb-12 max-w-2xl mx-auto">{t.stats.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
              {t.stats.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl lg:text-5xl font-bold font-display mb-1" style={{ color: c.primary }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 font-body uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
            <a
              href={t.stats.ctaButtonLink}
              className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: c.primary }}
            >
              {t.stats.ctaButtonText}
            </a>
          </div>
        </section>
      );
      
      case 'testimonials':
        return t.testimonials.visible && t.testimonials.items.length > 0 && (
        <section className="py-20 lg:py-28" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
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
      
      case 'program':
        return t.program.visible && (
      <section className="py-20 lg:py-28" style={{ backgroundColor: hexToRgba(c.secondary, 0.04) }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t.program.title}
            </h2>
            <p className="text-lg text-gray-600 font-body">{t.program.subtitle}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.program.points.map((point, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: hexToRgba(c.primary, 0.1) }}
                >
                  {point.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-gray-600 font-body text-sm leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href={t.program.ctaButtonLink}
              className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: c.primary }}
            >
              {t.program.ctaButtonText}
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
      </section>
      );
      
      case 'bonus':
        return t.bonus.enabled && t.bonus.items.length > 0 && (
        <section className="py-20 lg:py-28" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
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
        <section className="py-16" style={{ backgroundColor: hexToRgba(c.primary, 0.06) }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full" style={{ background: hexToRgba(c.primary, 0.15) }} />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
                    <span>{t.invitation.badgeEmoji}</span>
                    {t.invitation.badgeText}
                  </div>
                  <h2 className="font-display text-3xl font-bold text-gray-900 mt-4">{t.invitation.title}</h2>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">{t.invitation.subtitle}</p>
                </div>
              </div>

              <div className="space-y-5 relative z-10">
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

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="w-full text-base font-semibold h-14 rounded-2xl"
                    style={{ backgroundColor: c.primary, color: "#1B1F3A" }}
                    onClick={() => setInvitationDialogOpen(true)}
                  >
                    {t.invitation.buttonText}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">{t.invitation.availabilityText}</p>
                </div>
              </div>
            </div>
          </div>

          <Dialog open={invitationDialogOpen} onOpenChange={handleInvitationDialogChange}>
            <DialogContent className="w-[95vw] max-w-2xl rounded-3xl border-0 p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6 sm:p-8">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-violet-900">{t.invitation.formTitle}</DialogTitle>
                    <DialogDescription className="text-gray-500 text-sm">
                      {t.invitation.subtitle}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {t.invitation.formHighlights.map((item, i) => (
                      <span key={i} className="text-[11px] font-semibold uppercase tracking-wide bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
                        ✓ {item}
                      </span>
                    ))}
                  </div>

                  <form className="mt-6 space-y-4" onSubmit={handleInvitationSubmit}>
                    <div>
                      <Label className="text-xs text-gray-500">Your First Name</Label>
                      <Input
                        value={invitationForm.firstName}
                        onChange={(e) => updateInvitationForm("firstName", e.target.value)}
                        placeholder="Enter your name"
                        className="h-11 mt-1 rounded-xl"
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
                        className="h-11 mt-1 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">WhatsApp Number (Optional)</Label>
                      <Input
                        value={invitationForm.whatsapp}
                        onChange={(e) => updateInvitationForm("whatsapp", e.target.value)}
                        placeholder="Include country code"
                        className="h-11 mt-1 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Gender</Label>
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        {(["female", "male"] as const).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateInvitationForm("gender", option)}
                            className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                              invitationForm.gender === option
                                ? "border-violet-500 text-violet-600 bg-violet-50"
                                : "border-gray-200 text-gray-500"
                            }`}
                          >
                            {option === "female" ? "Female" : "Male"}
                          </button>
                        ))}
                      </div>
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
                        className="w-full h-12 rounded-2xl text-base font-semibold"
                        style={{ backgroundColor: c.primary, color: "#1B1F3A" }}
                      >
                        {invitationLoading ? "Submitting..." : t.invitation.formButtonText}
                      </Button>
                    )}
                  </form>
                </div>
                <div className="md:w-64 bg-gradient-to-br from-[#1B1F3A] via-[#2C1F55] to-[#44106E] text-white p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-display font-semibold">Live Masterclass</h3>
                    <p className="text-sm text-white/80 mt-2">Experience a powerful energetic breakthrough session.</p>
                  </div>
                  <div className="mt-10 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-semibold">A</span>
                      <div>
                        <p className="font-semibold">Community</p>
                        <p className="text-white/70 text-xs">Join {t.invitation.supportText}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-semibold">B</span>
                      <div>
                        <p className="font-semibold">Live Q&A</p>
                        <p className="text-white/70 text-xs">Ask your biggest transformation questions.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-semibold">C</span>
                      <div>
                        <p className="font-semibold">Private Access</p>
                        <p className="text-white/70 text-xs">Receive a Zoom link after approval.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>
      );

      case 'footer':
        return t.footer.enabled && (
      <footer style={{ backgroundColor: c.darkBg }}>
        {/* CTA Banner */}
        <div className="py-20 lg:py-28 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t.footer.cta.title}
            </h2>
            <p className="text-lg text-gray-300 font-body mb-8 max-w-2xl mx-auto">
              {t.footer.cta.subtitle}
            </p>
            <a
              href={t.footer.cta.ctaButtonLink}
              className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: c.primary }}
            >
              {t.footer.cta.ctaButtonText}
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
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

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { EditorContent } from "@tiptap/react";
import type { LandingTemplateData, RichBlockEntry } from "@/lib/template-types";
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
import { CalendarDays, Clock3, MapPin, CheckCircle2, ChevronLeft, ChevronRight, Zap, Radio, FlaskConical, BookOpen, Star, Heart, Leaf, Sun, Moon, Sparkles, Target, Trophy, Users, Brain, Lightbulb, Shield, Flame, Gem, Music, Globe, Camera, Smile, Coffee, Rocket, Award, MessageSquare, Lock, GripVertical, ArrowUp, ArrowDown, Eye, EyeOff, Settings2, Plus, Copy, Trash2, Hourglass, Languages, TrendingUp, BadgeCheck, X, Check } from "lucide-react";
import { DynamicPageRenderer } from "@/components/storefront/dynamic-page-renderer";

// Icon resolver for why-section cards
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Radio, FlaskConical, BookOpen, Star, Heart, Leaf, Sun, Moon, Sparkles,
  Target, Trophy, Users, Brain, Lightbulb, Shield, Flame, Gem, Music, Globe,
  Camera, Smile, Coffee, Rocket, Award, CheckCircle2, CalendarDays, Clock3,
  Hourglass, Languages, TrendingUp, BadgeCheck,
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

// ---------------------------------------------------------------------------
// Countdown — live timer to an ISO instant, used by announcementBar.
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
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

// Rotating corner toast of recent-signup notifications (liveProof section).
// Fixed position, cycles through items on an interval — purely client-side
// decoration, so it renders nothing until mounted (avoids a hydration
// mismatch on which item is "current").
function LiveProofToast({ items, intervalMs, accent }: { items: { text: string; meta?: string; image?: string }[]; intervalMs: number; accent: string }) {
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => {
    if (items.length === 0) return;
    setIndex(0);
    const timer = setInterval(() => setIndex((i) => ((i ?? 0) + 1) % items.length), intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);
  if (index === null || !items[index]) return null;
  const item = items[index];
  return (
    <div className="fixed bottom-4 left-4 z-30 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl border border-gray-100">
        {item.image ? (
          <img src={item.image} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <span className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: hexToRgba(accent, 0.12) }}>
            <CheckCircle2 className="h-4 w-4" style={{ color: accent }} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 font-body leading-snug truncate">{item.text}</p>
          {item.meta && <p className="text-[11px] text-gray-400 font-body">{item.meta}</p>}
        </div>
      </div>
    </div>
  );
}

function InlineCountdown({ target, label }: { target?: string; label?: string }) {
  const time = useCountdown(target);
  if (!time) return null;
  const parts = [
    ...(time.days > 0 ? [{ value: time.days, unit: "d" }] : []),
    { value: time.hours, unit: "h" },
    { value: time.minutes, unit: "m" },
    { value: time.seconds, unit: "s" },
  ];
  return (
    <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold tabular-nums text-white sm:text-sm">
      {label && <span className="opacity-80">{label}</span>}
      <span className="inline-flex items-center gap-1">
        {parts.map((p, i) => (
          <React.Fragment key={p.unit}>
            {i > 0 && <span className="opacity-60">:</span>}
            <span className="rounded-md bg-black/20 px-1.5 py-0.5">{pad2(p.value)}{p.unit}</span>
          </React.Fragment>
        ))}
      </span>
    </span>
  );
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
function InvitationDialog({
  open,
  onOpenChange,
  invitation,
  primaryColor,
  landingPageId,
  pageSlug,
  isPreviewMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: LandingTemplateData["invitation"];
  primaryColor: string;
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

    try {
      if (isPreviewMode) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setSuccess(true);
        setForm(createEmpty());
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
      const thankYouData = {
        title: invitation.successTitle,
        description: invitation.successDescription,
        buttons: invitation.thankYouButtons || [],
        from: pageSlug || "",
      };
      sessionStorage.setItem("thankYouData", JSON.stringify(thankYouData));
      router.push(`/${pageSlug}/thank-you`);
      setForm(createEmpty());
    } catch (err: any) {
      setError(err.message || "Unable to submit right now. Please try again later.");
    } finally {
      setLoading(false);
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
              <DialogTitle className="font-display text-xl sm:text-2xl text-violet-900">{invitation.formTitle}</DialogTitle>
              <DialogDescription className="text-gray-500 text-xs sm:text-sm">
                {invitation.subtitle}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2 mt-4">
              {invitation.formHighlights.map((item, i) => (
                <span key={i} className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide bg-purple-100 text-purple-600 px-2.5 sm:px-3 py-1 rounded-full">
                  ✓ {item}
                </span>
              ))}
            </div>

            <form className="mt-6 space-y-3.5 sm:space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label className="text-xs text-gray-500">Your First Name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="Enter your name"
                  className="h-10 sm:h-11 mt-1 rounded-xl text-base sm:text-sm"
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Your Best Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  className="h-10 sm:h-11 mt-1 rounded-xl text-base sm:text-sm"
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">WhatsApp Number</Label>
                <div className="flex gap-2 mt-1">
                  <select
                    value={form.countryCode}
                    onChange={(e) => update("countryCode", e.target.value)}
                    className="h-10 sm:h-11 rounded-xl border border-input bg-background px-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring w-[80px] sm:w-[90px] flex-shrink-0"
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
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    placeholder="98765 43210"
                    className="h-10 sm:h-11 rounded-xl flex-1 text-base sm:text-sm"
                    type="tel"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Location (City, Country)</Label>
                <Input
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. Mumbai, India"
                  className="h-10 sm:h-11 mt-1 rounded-xl text-base sm:text-sm"
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
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 rounded-2xl text-sm sm:text-base font-semibold"
                  style={{ backgroundColor: primaryColor, color: invitation.buttonTextColor || "#1B1F3A" }}
                >
                  {loading ? "Submitting..." : invitation.formButtonText}
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
        className: "w-full h-full object-cover object-top",
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
                className: "w-full h-full object-cover object-top",
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
                      {t.hero.ctaButtonAction === "url" ? (
                        <a
                          href={resolveLink(t.hero.ctaButtonLink)}
                          className="inline-flex items-center px-6 py-3 rounded-full text-white font-semibold text-sm sm:text-base shadow-md transition-all duration-300 hover:-translate-y-0.5"
                          style={{ backgroundColor: c.primary }}
                        >
                          {hasContent(t.hero.ctaButtonText) ? t.hero.ctaButtonText : "Get Started"}
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      ) : (
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
                      )}
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
                // Default object-cover (crops to fill the fixed h-52 well) is
                // right for ordinary photos, but wrong for a self-contained
                // poster/banner with copy baked into the artwork — cropping
                // cuts the text off. "natural" (opt-in per point) skips the
                // fixed well entirely so the card follows the image's own
                // aspect ratio instead, same as Adhyatmik Sutraa's template.
                const natural = point.imageFit === "natural";
                const pointMedia = renderMedia(point.image, mediaKey("why", "points", i, "image"), {
                  className: natural
                    ? "w-full h-auto block"
                    : "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                  alt: point.title,
                });
                return (
                <div
                  key={i}
                  className="group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {pointMedia && (
                    <div className={natural ? "overflow-hidden" : "h-52 overflow-hidden"}>
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
            <div className="flex flex-wrap justify-center gap-4">
              {t.gallery.images.map((img, i) => (
                <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]">
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
            {t.stats.ctaButtonAction === "url" ? (
              <a
                href={resolveLink(t.stats.ctaButtonLink)}
                className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: c.primary }}
              >
                {t.stats.ctaButtonText}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setInvitationDialogOpen(true)}
                className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: c.primary }}
              >
                {t.stats.ctaButtonText}
              </button>
            )}
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
            {t.program.ctaButtonAction === "url" ? (
              <a
                href={resolveLink(t.program.ctaButtonLink)}
                className="inline-flex items-center px-8 sm:px-10 py-3 sm:py-4 rounded-full text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: c.primary }}
              >
                {t.program.ctaButtonText}
                <svg className="ml-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setInvitationDialogOpen(true)}
                className="inline-flex items-center px-8 sm:px-10 py-3 sm:py-4 rounded-full text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: c.primary }}
              >
                {t.program.ctaButtonText}
                <svg className="ml-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            )}
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
                  {t.invitation.buttonAction === "url" ? (
                    <a
                      href={resolveLink(t.invitation.buttonLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto text-base font-semibold h-14 rounded-2xl px-10 inline-flex items-center justify-center"
                      style={{ backgroundColor: c.primary, color: t.invitation.buttonTextColor || "#1B1F3A" }}
                    >
                      {t.invitation.buttonText}
                    </a>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full sm:w-auto text-base font-semibold h-14 rounded-2xl px-10"
                      style={{ backgroundColor: c.primary, color: t.invitation.buttonTextColor || "#1B1F3A" }}
                      onClick={() => setInvitationDialogOpen(true)}
                    >
                      {t.invitation.buttonText}
                    </Button>
                  )}
                  <p className="text-xs text-gray-500 text-center">
                    {t.invitation.supportText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <InvitationDialog
            open={invitationDialogOpen}
            onOpenChange={setInvitationDialogOpen}
            invitation={t.invitation}
            primaryColor={c.primary}
            landingPageId={landingPageId}
            pageSlug={pageSlug}
            isPreviewMode={isPreviewMode}
          />
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
              t.footer.cta.ctaButtonAction === "url" ? (
                <a
                  href={resolveLink(t.footer.cta.ctaButtonLink)}
                  className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{ backgroundColor: c.primary }}
                >
                  {t.footer.cta.ctaButtonText}
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setInvitationDialogOpen(true)}
                  className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{ backgroundColor: c.primary }}
                >
                  {t.footer.cta.ctaButtonText}
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              )
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
      
      case 'announcementBar': {
        const bar = t.announcementBar;
        if (!bar?.visible) return null;
        if (!hasContent(bar.text) && !hasContent(bar.countdownTo)) return null;
        const sticky = bar.sticky ?? true;
        return (
          <div className={`${sticky ? "sticky top-0" : "relative"} z-40 w-full`} style={{ backgroundColor: c.primary }}>
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-3 py-2 text-center sm:px-6 sm:py-2.5">
              {hasContent(bar.text) && (
                <span className="font-body text-[11.5px] font-semibold leading-snug text-white sm:text-sm">{bar.text}</span>
              )}
              {hasContent(bar.countdownTo) && <InlineCountdown target={bar.countdownTo} label={bar.countdownLabel} />}
              {hasContent(bar.ctaText) && (
                bar.ctaAction === "url" ? (
                  <a href={resolveLink(bar.ctaLink)} className="inline-flex flex-shrink-0 items-center rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-white/90 sm:px-3 sm:py-1 sm:text-xs" style={{ color: c.primary }}>
                    {bar.ctaText}
                  </a>
                ) : (
                  <button type="button" onClick={() => setInvitationDialogOpen(true)} className="inline-flex flex-shrink-0 items-center rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-white/90 sm:px-3 sm:py-1 sm:text-xs" style={{ color: c.primary }}>
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
          <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('eventDetails', c.bodyBg) }}>
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-6 lg:mb-10">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">{ev.title}</h2>
                <p className="text-lg text-gray-600 font-body">{ev.subtitle}</p>
              </div>
              <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
                {(ev.pills || []).filter(hasContent).length > 0 && (
                  <div className="flex flex-wrap gap-2 border-b border-gray-100 px-5 py-4 sm:px-8 sm:py-5">
                    {(ev.pills || []).filter(hasContent).map((pill, i) => (
                      <span key={i} className="font-body inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold sm:text-xs" style={{ backgroundColor: hexToRgba(c.primary, 0.1), color: c.secondary }}>
                        {pill}
                      </span>
                    ))}
                  </div>
                )}
                {(ev.items || []).length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-5 py-6 sm:grid-cols-4 sm:px-8 sm:py-8">
                    {(ev.items || []).map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: hexToRgba(c.primary, 0.1) }}>
                          <ProgramIcon name={item.icon} className="h-4 w-4" style={{ color: c.primary }} />
                        </span>
                        <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</span>
                        <span className="font-body -mt-1 text-sm font-semibold leading-snug text-gray-900 sm:text-[15px]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(hasContent(ev.price) || hasContent(ev.ctaButtonText) || hasContent(ev.seatsNote) || seats > 0) && (
                  <div className="border-t border-gray-100 px-5 py-6 sm:px-8 sm:py-7" style={{ backgroundColor: hexToRgba(c.primary, 0.04) }}>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      {hasContent(ev.price) && (
                        <div>
                          {hasContent(ev.priceLabel) && <span className="font-body block text-[10px] font-semibold uppercase tracking-wider text-gray-400">{ev.priceLabel}</span>}
                          <span className="mt-1 flex flex-wrap items-baseline gap-2">
                            <span className="font-display text-3xl font-bold leading-none text-gray-900 sm:text-4xl">{ev.price}</span>
                            {hasContent(ev.originalPrice) && <span className="font-body text-base line-through text-gray-400 sm:text-lg">{ev.originalPrice}</span>}
                          </span>
                          {hasContent(ev.savingsNote) && (
                            <span className="font-body mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: hexToRgba(c.primary, 0.12), color: c.primary }}>
                              {ev.savingsNote}
                            </span>
                          )}
                        </div>
                      )}
                      {hasContent(ev.ctaButtonText) && (
                        ev.ctaButtonAction === "url" ? (
                          <a href={resolveLink(ev.ctaButtonLink)} className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto" style={{ backgroundColor: c.primary }}>
                            {ev.ctaButtonText}
                          </a>
                        ) : (
                          <button type="button" onClick={() => setInvitationDialogOpen(true)} className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto" style={{ backgroundColor: c.primary }}>
                            {ev.ctaButtonText}
                          </button>
                        )
                      )}
                    </div>
                    {(seats > 0 || hasContent(ev.seatsNote)) && (
                      <div className="mt-5">
                        {seats > 0 && (
                          <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: hexToRgba(c.secondary, 0.12) }}>
                            <div className="h-full rounded-full" style={{ width: `${seats}%`, backgroundColor: c.primary }} />
                          </div>
                        )}
                        {hasContent(ev.seatsNote) && (
                          <p className="font-body mt-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: c.primary }}>
                            <span className="relative flex h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: c.primary }} />
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
        return (
          <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('problems', c.bodyBg) }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">{pr.title}</h2>
                <p className="text-lg text-gray-600 font-body">{pr.subtitle}</p>
              </div>
              {(pr.items || []).length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {pr.items.map((item, i) => (
                    <div key={i} className="rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 text-center">
                      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: hexToRgba(c.primary, 0.1) }}>
                        <ProgramIcon name={item.icon} className="h-5 w-5" style={{ color: c.primary }} />
                      </span>
                      <h3 className="font-display text-base font-bold text-gray-900 mb-1.5">{item.title}</h3>
                      {hasContent(item.description) && <p className="text-sm text-gray-600 font-body leading-relaxed">{item.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              {hasContent(pr.impactTitle) && (pr.impacts || []).length > 0 && (
                <div className="mt-10 rounded-2xl p-6 sm:p-8" style={{ backgroundColor: hexToRgba(c.secondary, 0.06) }}>
                  <h3 className="font-display text-lg font-bold text-gray-900 mb-4">{pr.impactTitle}</h3>
                  <ul className="space-y-2.5">
                    {pr.impacts!.map((impact, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 font-body">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.primary }} />
                        {impact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        );
      }

      case 'guidesRail': {
        const rail = t.guidesRail;
        if (!rail?.visible || (rail.items || []).length === 0) return null;
        return (
          <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('guidesRail', c.bodyBg) }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{rail.title}</h2>
                <p className="text-lg text-gray-600 font-body">{rail.subtitle}</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                {rail.items.map((item, i) => (
                  <a
                    key={i}
                    href={item.link || undefined}
                    className="group relative flex-shrink-0 w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-md"
                  >
                    {renderMedia(item.image, mediaKey("guidesRail", "items", i, "image"), { className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" })}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-display text-white font-bold text-base">{item.name}</p>
                      <p className="text-white/75 text-xs font-body">{item.role}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case 'curriculum': {
        const cur = t.curriculum;
        if (!cur?.visible || (cur.modules || []).length === 0) return null;
        return (
          <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('curriculum', c.bodyBg) }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">{cur.title}</h2>
                <p className="text-lg text-gray-600 font-body">{cur.subtitle}</p>
              </div>
              <div className="space-y-4">
                {cur.modules.map((mod, i) => (
                  <div key={i} className="rounded-2xl bg-white shadow-md border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center justify-center h-8 px-3 rounded-full text-xs font-bold text-white font-body" style={{ backgroundColor: c.primary }}>
                        {mod.label}
                      </span>
                      <h3 className="font-display text-lg font-bold text-gray-900">{mod.title}</h3>
                    </div>
                    {hasContent(mod.description) && <p className="text-gray-600 font-body mb-3">{mod.description}</p>}
                    {(mod.bullets || []).length > 0 && (
                      <ul className="space-y-1.5">
                        {mod.bullets.map((b, bi) => (
                          <li key={bi} className="flex items-start gap-2.5 text-sm text-gray-700 font-body">
                            <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: c.primary }} />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              {hasContent(cur.ctaButtonText) && (
                <div className="text-center mt-8">
                  {cur.ctaButtonAction === "url" ? (
                    <a href={resolveLink(cur.ctaButtonLink)} className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" style={{ backgroundColor: c.primary }}>
                      {cur.ctaButtonText}
                    </a>
                  ) : (
                    <button type="button" onClick={() => setInvitationDialogOpen(true)} className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" style={{ backgroundColor: c.primary }}>
                      {cur.ctaButtonText}
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
        if (!fmt?.visible || (fmt.slides || []).length === 0) return null;
        return (
          <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('formats', c.bodyBg) }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{fmt.title}</h2>
                <p className="text-lg text-gray-600 font-body">{fmt.subtitle}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fmt.slides.map((slide, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden shadow-md border border-gray-100 relative aspect-[4/3]">
                    {renderMedia(slide.image, mediaKey("formats", "slides", i, "image"), { className: "w-full h-full object-cover" })}
                    {hasContent(slide.label) && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white font-display font-bold">{slide.label}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case 'pricing': {
        const pricing = t.pricing;
        if (!pricing?.visible || (pricing.tiers || []).length === 0) return null;
        return (
          <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('pricing', c.bodyBg) }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">{pricing.title}</h2>
                <p className="text-lg text-gray-600 font-body">{pricing.subtitle}</p>
              </div>
              <div className={`grid gap-6 ${pricing.tiers.length === 1 ? "max-w-sm mx-auto" : pricing.tiers.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                {pricing.tiers.map((tier, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl p-7 flex flex-col ${tier.highlighted ? "shadow-2xl scale-[1.03] border-2" : "shadow-md border border-gray-100"} bg-white transition-all duration-300`}
                    style={tier.highlighted ? { borderColor: c.primary } : undefined}
                  >
                    {hasContent(tier.badge) && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white font-body" style={{ backgroundColor: c.primary }}>
                        {tier.badge}
                      </span>
                    )}
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                    {hasContent(tier.description) && <p className="text-sm text-gray-500 font-body mb-4">{tier.description}</p>}
                    <div className="mb-5 flex items-baseline gap-2 flex-wrap">
                      <span className="font-display text-4xl font-bold text-gray-900">{tier.price}</span>
                      {hasContent(tier.originalPrice) && <span className="text-base text-gray-400 line-through font-body">{tier.originalPrice}</span>}
                      {hasContent(tier.period) && <span className="text-sm text-gray-500 font-body">{tier.period}</span>}
                    </div>
                    {(tier.features || []).length > 0 && (
                      <ul className="space-y-2.5 mb-7 flex-1">
                        {tier.features.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-2.5 text-sm text-gray-700 font-body">
                            <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: c.primary }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    {tier.ctaAction === "url" ? (
                      <a href={resolveLink(tier.ctaLink)} className={`text-center inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${tier.highlighted ? "text-white shadow-lg hover:shadow-xl" : "text-gray-900 border border-gray-200 hover:border-gray-300"}`} style={tier.highlighted ? { backgroundColor: c.primary } : undefined}>
                        {tier.ctaText}
                      </a>
                    ) : (
                      <button type="button" onClick={() => setInvitationDialogOpen(true)} className={`text-center inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${tier.highlighted ? "text-white shadow-lg hover:shadow-xl" : "text-gray-900 border border-gray-200 hover:border-gray-300"}`} style={tier.highlighted ? { backgroundColor: c.primary } : undefined}>
                        {tier.ctaText}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {hasContent(pricing.footnote) && <p className="text-center text-sm text-gray-500 font-body mt-6">{pricing.footnote}</p>}
            </div>
          </section>
        );
      }

      case 'comparison': {
        const comp = t.comparison;
        if (!comp?.visible || (comp.rows || []).length === 0) return null;
        return (
          <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('comparison', c.bodyBg) }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{comp.title}</h2>
                {hasContent(comp.subtitle) && <p className="text-lg text-gray-600 font-body">{comp.subtitle}</p>}
              </div>
              <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-md">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3.5 font-display font-bold text-gray-900">Feature</th>
                      {comp.columns.map((col, i) => (
                        <th key={i} className="px-5 py-3.5 font-display font-bold text-center" style={i === comp.highlightColumn ? { color: c.primary } : { color: "#111827" }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {comp.rows.map((row, ri) => (
                      <tr key={ri}>
                        <td className="px-5 py-3.5 text-gray-700 font-medium">{row.feature}</td>
                        {row.values.map((val, vi) => (
                          <td key={vi} className="px-5 py-3.5 text-center" style={vi === comp.highlightColumn ? { backgroundColor: hexToRgba(c.primary, 0.05) } : undefined}>
                            {val.toLowerCase() === "yes" ? (
                              <Check className="h-4 w-4 mx-auto" style={{ color: c.primary }} />
                            ) : val.toLowerCase() === "no" ? (
                              <X className="h-4 w-4 mx-auto text-gray-300" />
                            ) : (
                              <span className="text-gray-700">{val}</span>
                            )}
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
        const guar = t.guarantee;
        if (!guar?.visible || (guar.items || []).length === 0) return null;
        return (
          <section className="py-8 lg:py-14" style={{ backgroundColor: sbg('guarantee', hexToRgba(c.primary, 0.04)) }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{guar.title}</h2>
                {hasContent(guar.subtitle) && <p className="text-lg text-gray-600 font-body">{guar.subtitle}</p>}
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {guar.items.map((item, i) => (
                  <div key={i} className="text-center">
                    <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
                      <ProgramIcon name={item.icon} className="h-6 w-6" style={{ color: c.primary }} />
                    </span>
                    <h3 className="font-display text-lg font-bold text-gray-900 mb-1.5">{item.title}</h3>
                    <p className="text-sm text-gray-600 font-body">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case 'appBanner': {
        const banner = t.appBanner;
        if (!banner?.visible || !hasContent(banner.image)) return null;
        const content = renderMedia(banner.image, mediaKey("appBanner", "image"), { className: "w-full h-auto block", alt: banner.alt || "" });
        return (
          <section className="py-6 lg:py-10" style={{ backgroundColor: sbg('appBanner', c.bodyBg) }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {hasContent(banner.link) ? (
                <a href={resolveLink(banner.link)} className="block rounded-2xl overflow-hidden shadow-md">{content}</a>
              ) : (
                <div className="rounded-2xl overflow-hidden shadow-md">{content}</div>
              )}
            </div>
          </section>
        );
      }

      case 'liveProof': {
        const proof = t.liveProof;
        if (!proof?.visible || (proof.items || []).length === 0) return null;
        return <LiveProofToast items={proof.items} intervalMs={proof.intervalMs || 5000} accent={c.primary} />;
      }

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
      // scroll container, which would break any `position: sticky`
      // descendant (it would stick relative to this div instead of the
      // viewport). `clip` still clips overflow but — unlike
      // hidden/auto/scroll — doesn't create a scrolling context, so sticky
      // descendants correctly look past it to the viewport.
      className="min-h-screen font-sans w-full max-w-full overflow-clip"
      style={{ backgroundColor: c.bodyBg, ...(t.fontFamily ? { fontFamily: t.fontFamily } : {}) }}
    >
      {/* Inject marquee animation + fonts. A chosen template font overrides the
          default body (and heading) fonts across the whole page. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes floating-cta-ring { 0% { transform: scale(0.85); opacity: 0.8; } 70% { transform: scale(1.25); opacity: 0; } 100% { opacity: 0; } }
        @keyframes floating-cta-bob { 0% { transform: translateY(0); } 50% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .font-display { font-family: ${t.fontFamily ? t.fontFamily : "'Playfair Display', serif"}; }
        .font-body { font-family: ${t.fontFamily ? t.fontFamily : "'Inter', sans-serif"}; }
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

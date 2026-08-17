"use client";

import React, { useState, useCallback, useContext, useMemo, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  EyeOff,
  Copy,
  ArrowUpDown,
  Code2,
  Plus,
  Trash2,
  Upload,
  Palette,
  Image as ImageIcon,
  Type,
  Star,
  Users,
  LayoutGrid,
  Award,
  MessageSquare,
  BookOpen,
  Gift,
  Globe,
  CalendarCheck2,
  Clock3,
  MapPin,
  GripVertical,
  Video,
  Link as LinkIcon,
  Youtube,
  MousePointerClick,
  Zap,
  Target,
  Lightbulb,
  Shield,
  Flame,
  Gem,
  Music,
  Camera,
  Smile,
  Coffee,
  Rocket,
  Heart,
  Leaf,
  Sun,
  Moon,
  Sparkles,
  Brain,
  Trophy,
  Radio,
  FlaskConical,
  CheckCircle2,
  Infinity,
  Layers,
  TrendingUp,
  Lock,
  Headphones,
  Mic,
  Play,
  Eye,
  Compass,
  Feather,
  Anchor,
  Activity,
  HelpCircle,
  Megaphone,
  ListChecks,
  Tag,
  Table2,
  CalendarDays,
  Hourglass,
  Languages,
  ShieldCheck,
  RefreshCcw,
  BadgeCheck,
  Wallet,
  CircleDollarSign,
  AlertTriangle,
  Frown,
  CloudRain,
  Ban,
  PlayCircle,
  Ticket,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  DEFAULT_MEDIA_SETTINGS,
  SECTION_LABELS,
  CANONICAL_SECTIONS,
  resolveSectionOrder,
  getSectionVisibility,
  applySectionVisibility,
  DEFAULT_SECTION_GRADIENT,
  sectionGradientCss,
  type LandingTemplateData,
  type MediaFieldOptions,
  type SectionStyleOptions,
  type SectionGradient,
  type SectionGradientType,
  type SectionGradientAnimation,
} from "@/lib/template-types";
import { SECTION_DND_TYPE, NEW_BLOCK_DND_TYPE } from "@/components/storefront/landing-template";
import { FONT_OPTIONS } from "@/lib/fonts";

// Shares the live template data with deeply nested field components (e.g. the
// per-section style panel) without threading props through every call site.
const TemplateEditorCtx = React.createContext<{
  data: LandingTemplateData;
  onChange: (d: LandingTemplateData) => void;
} | null>(null);

const mediaKey = (...parts: (string | number)[]) => parts.join(".");

// <input type="datetime-local"> speaks local wall-clock time with no zone,
// while the stored countdown target is a full ISO instant. These convert
// between the two without shifting the moment.
function toDatetimeLocal(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

// ---------------------------------------------------------------------------
// Icon Picker
// ---------------------------------------------------------------------------
const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "Sparkles", icon: Sparkles },
  { name: "Zap", icon: Zap },
  { name: "Target", icon: Target },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Star", icon: Star },
  { name: "Trophy", icon: Trophy },
  { name: "Award", icon: Award },
  { name: "Rocket", icon: Rocket },
  { name: "Flame", icon: Flame },
  { name: "Gem", icon: Gem },
  { name: "Shield", icon: Shield },
  { name: "Brain", icon: Brain },
  { name: "Heart", icon: Heart },
  { name: "Users", icon: Users },
  { name: "Globe", icon: Globe },
  { name: "BookOpen", icon: BookOpen },
  { name: "Layers", icon: Layers },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "CheckCircle2", icon: CheckCircle2 },
  { name: "Infinity", icon: Infinity },
  { name: "Lock", icon: Lock },
  { name: "Eye", icon: Eye },
  { name: "Compass", icon: Compass },
  { name: "Feather", icon: Feather },
  { name: "Leaf", icon: Leaf },
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
  { name: "Music", icon: Music },
  { name: "Headphones", icon: Headphones },
  { name: "Mic", icon: Mic },
  { name: "Play", icon: Play },
  { name: "Camera", icon: Camera },
  { name: "Coffee", icon: Coffee },
  { name: "Smile", icon: Smile },
  { name: "Activity", icon: Activity },
  { name: "Anchor", icon: Anchor },
  { name: "Radio", icon: Radio },
  { name: "FlaskConical", icon: FlaskConical },
  { name: "Gift", icon: Gift },
  { name: "MessageSquare", icon: MessageSquare },
  // Conversion sections (event details, problems, guarantee)
  { name: "CalendarDays", icon: CalendarDays },
  { name: "Clock3", icon: Clock3 },
  { name: "Hourglass", icon: Hourglass },
  { name: "Languages", icon: Languages },
  { name: "MapPin", icon: MapPin },
  { name: "Video", icon: Video },
  { name: "PlayCircle", icon: PlayCircle },
  { name: "Ticket", icon: Ticket },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "RefreshCcw", icon: RefreshCcw },
  { name: "BadgeCheck", icon: BadgeCheck },
  { name: "Wallet", icon: Wallet },
  { name: "CircleDollarSign", icon: CircleDollarSign },
  { name: "AlertTriangle", icon: AlertTriangle },
  { name: "Frown", icon: Frown },
  { name: "CloudRain", icon: CloudRain },
  { name: "Ban", icon: Ban },
];

// Per-section style panel: background color plus Elementor-style outer
// spacing. Reads/writes sectionStyles through TemplateEditorCtx so the 15+
// existing call sites didn't need new props.
function SectionBgField({ sectionKey, value, onChange }: { sectionKey: string; value: string; onChange: (key: string, v: string) => void }) {
  const ctx = useContext(TemplateEditorCtx);
  const styles: SectionStyleOptions = ctx?.data.sectionStyles?.[sectionKey] || {};
  const setStyles = (patch: Partial<SectionStyleOptions>) => {
    if (!ctx) return;
    ctx.onChange({
      ...ctx.data,
      sectionStyles: {
        ...(ctx.data.sectionStyles || {}),
        [sectionKey]: { ...styles, ...patch },
      },
    });
  };

  const bgMode = styles.bgMode ?? "solid";

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-2.5 space-y-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Section Style</p>

      {ctx && (
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-500">Background</Label>
          <div className="flex rounded-md border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setStyles({ bgMode: "solid" })}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                bgMode === "solid" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Solid
            </button>
            <button
              type="button"
              onClick={() => setStyles({ bgMode: "gradient", bgGradient: styles.bgGradient || DEFAULT_SECTION_GRADIENT })}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                bgMode === "gradient" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Gradient
            </button>
          </div>
        </div>
      )}

      {bgMode === "gradient" && ctx ? (
        <GradientEditorFields
          gradient={styles.bgGradient || DEFAULT_SECTION_GRADIENT}
          onChange={(g) => setStyles({ bgGradient: g })}
        />
      ) : (
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-500">Background color</Label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={value || "#ffffff"}
              onChange={(e) => onChange(sectionKey, e.target.value)}
              className="h-6 w-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange(sectionKey, "")}
                className="text-[10px] text-gray-400 hover:text-red-500 transition"
                title="Reset to default"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {ctx && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-gray-400">Spacing top (px)</Label>
            <Input
              type="number"
              min={0}
              max={400}
              value={styles.paddingTop ?? 0}
              onChange={(e) => setStyles({ paddingTop: Math.max(0, Number(e.target.value) || 0) })}
              className="h-7 text-xs bg-white border-gray-200 mt-0.5"
            />
          </div>
          <div>
            <Label className="text-[10px] text-gray-400">Spacing bottom (px)</Label>
            <Input
              type="number"
              min={0}
              max={400}
              value={styles.paddingBottom ?? 0}
              onChange={(e) => setStyles({ paddingBottom: Math.max(0, Number(e.target.value) || 0) })}
              className="h-7 text-xs bg-white border-gray-200 mt-0.5"
            />
          </div>
        </div>
      )}
      {ctx && (
        <div className="space-y-2 pt-1 border-t border-gray-200/70">
          <SectionStyleColorRow
            label="Heading color"
            value={styles.headingColor}
            onChange={(v) => setStyles({ headingColor: v || undefined })}
          />
          <SectionStyleColorRow
            label="Button color"
            value={styles.buttonColor}
            onChange={(v) => setStyles({ buttonColor: v || undefined })}
          />
          <SectionStyleColorRow
            label="Button text color"
            value={styles.buttonTextColor}
            onChange={(v) => setStyles({ buttonTextColor: v || undefined })}
          />
        </div>
      )}
    </div>
  );
}

// Full gradient authoring UI for a section's background: pattern (linear /
// radial / conic), angle, any number of color stops with a 0–100% position
// each, and an optional animation. Mirrors the CSS `sectionGradientCss`
// builds in lib/template-types so the preview swatch always matches what
// the live page renders.
function GradientEditorFields({ gradient, onChange }: { gradient: SectionGradient; onChange: (g: SectionGradient) => void }) {
  const g = gradient;
  const patch = (p: Partial<SectionGradient>) => onChange({ ...g, ...p });
  const setStop = (i: number, p: Partial<{ color: string; position: number }>) => {
    const stops = g.stops.map((s, j) => (j === i ? { ...s, ...p } : s));
    patch({ stops });
  };
  const addStop = () => {
    const last = g.stops[g.stops.length - 1];
    const pos = last ? Math.min(100, last.position + 20) : 50;
    patch({ stops: [...g.stops, { color: "#ffffff", position: pos }] });
  };
  const removeStop = (i: number) => {
    if (g.stops.length <= 2) return;
    patch({ stops: g.stops.filter((_, j) => j !== i) });
  };
  const canRotate = g.type !== "radial";
  const angleIsEditable = g.type !== "radial" && !(g.animation === "rotate" && canRotate);

  return (
    <div className="space-y-2.5">
      <div
        className="h-10 rounded-lg border border-gray-200"
        style={{ backgroundImage: sectionGradientCss({ ...g, animation: "none" }) }}
        title="Preview"
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] text-gray-400">Pattern</Label>
          <select
            value={g.type}
            onChange={(e) => {
              const type = e.target.value as SectionGradientType;
              patch({ type, animation: type === "radial" && g.animation === "rotate" ? "none" : g.animation });
            }}
            className="w-full h-7 rounded-md border border-gray-200 bg-white px-1.5 text-xs mt-0.5"
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="conic">Conic</option>
          </select>
        </div>
        <div>
          <Label className="text-[10px] text-gray-400">Animation</Label>
          <select
            value={g.animation}
            onChange={(e) => patch({ animation: e.target.value as SectionGradientAnimation })}
            className="w-full h-7 rounded-md border border-gray-200 bg-white px-1.5 text-xs mt-0.5"
          >
            <option value="none">None</option>
            <option value="shift">Shift (drift)</option>
            <option value="pulse">Pulse (breathe)</option>
            {canRotate && <option value="rotate">Rotate</option>}
          </select>
        </div>
      </div>

      {angleIsEditable && (
        <div>
          <Label className="text-[10px] text-gray-400">Angle ({g.angle}°)</Label>
          <input
            type="range"
            min={0}
            max={360}
            value={g.angle}
            onChange={(e) => patch({ angle: Number(e.target.value) })}
            className="w-full mt-0.5"
          />
        </div>
      )}

      {g.animation !== "none" && (
        <div>
          <Label className="text-[10px] text-gray-400">Speed ({g.animationDuration}s)</Label>
          <input
            type="range"
            min={1}
            max={30}
            value={g.animationDuration}
            onChange={(e) => patch({ animationDuration: Number(e.target.value) })}
            className="w-full mt-0.5"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-[10px] text-gray-400">Colors</Label>
        {g.stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => setStop(i, { color: e.target.value })}
              className="h-7 w-8 flex-shrink-0 rounded border border-gray-200 cursor-pointer p-0.5 bg-white"
            />
            <Input
              value={stop.color}
              onChange={(e) => setStop(i, { color: e.target.value })}
              className="h-7 text-[11px] font-mono bg-white border-gray-200 flex-1 min-w-0"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={stop.position}
              onChange={(e) => setStop(i, { position: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
              className="h-7 w-14 flex-shrink-0 text-[11px] bg-white border-gray-200"
              title="Position %"
            />
            <span className="text-[10px] text-gray-400 flex-shrink-0">%</span>
            {g.stops.length > 2 && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0 text-red-500" onClick={() => removeStop(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addStop}>
          <Plus className="h-3 w-3 mr-1" /> Add Color Stop
        </Button>
      </div>
    </div>
  );
}

// One reset-able color swatch row, used for the per-section heading/button
// color overrides above. Unlike the section background field (always has a
// value), these three are optional — an unset value means "use the theme
// default," which the ✕ button restores.
function SectionStyleColorRow({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-[10px] text-gray-400">{label}</Label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-8 rounded border border-gray-200 cursor-pointer p-0.5 bg-white"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[10px] text-gray-400 hover:text-red-500 transition"
            title="Reset to default"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = ICON_OPTIONS.find((o) => o.name === value);
  const SelectedIcon = selected?.icon ?? Sparkles;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-8 px-2 rounded-md border border-gray-200 bg-white text-xs text-gray-700 hover:border-gray-300 transition w-full"
      >
        <SelectedIcon className="h-4 w-4 flex-shrink-0 text-gray-600" />
        <span className="flex-1 text-left truncate">{value || "Pick icon"}</span>
        <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 top-9 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
          <div className="grid grid-cols-8 gap-1">
            {ICON_OPTIONS.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => { onChange(name); setOpen(false); }}
                className={`flex items-center justify-center h-7 w-7 rounded-lg transition ${
                  value === name
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// "Add Template Element" — one button that covers both halves of "add
// something back": brand-new repeatable blocks (Content Block, Rich Content
// Block — the only element types a page can have more than one of) and
// restoring any section that was deleted earlier. The Blocks palette below
// already lets you restore a deleted section by clicking its chip; this is
// the more discoverable, explicitly-labeled entry point for the same action
// plus the "add another" case the palette doesn't cover.
// ---------------------------------------------------------------------------
function AddElementMenu({
  deletedSections,
  onRestoreSection,
  onAddContentBlock,
  onAddRichBlock,
}: {
  deletedSections: string[];
  onRestoreSection: (key: string) => void;
  onAddContentBlock: () => void;
  onAddRichBlock?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl bg-violet-600 text-white text-[12px] font-semibold shadow-sm hover:bg-violet-700 transition"
      >
        <Plus className="h-4 w-4" />
        Add Template Element
        {deletedSections.length > 0 && (
          <span className="ml-0.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-white/20 text-[10px] leading-none">
            {deletedSections.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-11 left-0 right-0 rounded-xl border border-gray-200 bg-white shadow-xl p-2 max-h-96 overflow-y-auto">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-1.5 pt-1 pb-1.5">
              New block
            </p>
            <button
              type="button"
              onClick={() => {
                onAddContentBlock();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" /> Content Block
            </button>
            {onAddRichBlock && (
              <button
                type="button"
                onClick={() => {
                  onAddRichBlock();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition"
              >
                <Plus className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" /> Rich Content Block
              </button>
            )}

            <div className="my-1.5 h-px bg-gray-100" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-1.5 pb-1.5">
              Deleted sections
            </p>
            {deletedSections.length === 0 ? (
              <p className="px-1.5 pb-1 text-[11px] text-gray-400 leading-relaxed">
                Nothing deleted right now — sections you delete from the page will show up here to bring back.
              </p>
            ) : (
              deletedSections.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onRestoreSection(key);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                  <span className="truncate">{SECTION_LABELS[key] || key}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible Section card
// Dragging starts ONLY from the grip handle (so the rest of the card stays
// freely clickable/selectable), shows a slim drop-position indicator instead
// of relying on "drop exactly on the header", and every reorderable card also
// gets explicit up/down arrows plus a show/hide toggle.
// ---------------------------------------------------------------------------
interface SectionDnd {
  isDragSource: boolean;
  indicator: "top" | "bottom" | null;
  onGripDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onCardDragOver: (e: React.DragEvent) => void;
  onCardDrop: (e: React.DragEvent) => void;
  onCardDragLeave: () => void;
}

function Section({
  title,
  icon,
  children,
  defaultOpen = false,
  sectionKey,
  dnd,
  onMove,
  isFirst,
  isLast,
  isActive,
  activeNonce,
  visible,
  onToggleVisible,
  onDelete,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  sectionKey?: string;
  dnd?: SectionDnd;
  onMove?: (dir: -1 | 1) => void;
  isFirst?: boolean;
  isLast?: boolean;
  isActive?: boolean;
  activeNonce?: number;
  visible?: boolean;
  onToggleVisible?: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = React.useRef<HTMLDivElement>(null);
  const lastNonce = React.useRef(0);

  // When this section is selected from the canvas, open the card and bring it
  // into view — even when re-selecting the same section again.
  React.useEffect(() => {
    if (isActive && activeNonce && activeNonce !== lastNonce.current) {
      lastNonce.current = activeNonce;
      setOpen(true);
      requestAnimationFrame(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }, [isActive, activeNonce]);

  return (
    <div
      ref={ref}
      data-section-card={sectionKey}
      className={`relative border rounded-xl bg-white transition-all ${
        isActive ? "border-violet-400 ring-1 ring-violet-300 shadow-sm" : "border-gray-200"
      } ${dnd?.isDragSource ? "opacity-40" : ""}`}
      onDragOver={dnd?.onCardDragOver}
      onDrop={dnd?.onCardDrop}
      onDragLeave={dnd?.onCardDragLeave}
    >
      {dnd?.indicator === "top" && (
        <div className="absolute -top-[3px] left-2 right-2 h-1 rounded-full bg-violet-500 z-10 pointer-events-none" />
      )}
      {dnd?.indicator === "bottom" && (
        <div className="absolute -bottom-[3px] left-2 right-2 h-1 rounded-full bg-violet-500 z-10 pointer-events-none" />
      )}

      <div className="w-full flex items-center gap-1 pl-1.5 pr-2 py-2 hover:bg-gray-50 transition-colors rounded-t-xl">
        {dnd && (
          <button
            type="button"
            title="Drag to reorder"
            draggable
            onDragStart={dnd.onGripDragStart}
            onDragEnd={dnd.onDragEnd}
            onClick={(e) => e.stopPropagation()}
            className="h-7 w-5 flex items-center justify-center text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 select-none [-webkit-user-drag:element]"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left py-1"
        >
          <span className="text-gray-500 flex-shrink-0">{icon}</span>
          <span
            className={`text-[13px] font-semibold flex-1 truncate ${
              visible === false ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {title}
          </span>
        </button>
        {onMove && (
          <div className="flex flex-col flex-shrink-0">
            <button
              type="button"
              title="Move up"
              disabled={isFirst}
              onClick={() => onMove(-1)}
              className="h-3.5 w-5 flex items-center justify-center text-gray-300 hover:text-violet-600 disabled:opacity-30 disabled:hover:text-gray-300"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Move down"
              disabled={isLast}
              onClick={() => onMove(1)}
              className="h-3.5 w-5 flex items-center justify-center text-gray-300 hover:text-violet-600 disabled:opacity-30 disabled:hover:text-gray-300"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {onToggleVisible && (
          <button
            type="button"
            title={visible === false ? "Show section" : "Hide section"}
            onClick={onToggleVisible}
            className={`h-6 w-6 flex items-center justify-center rounded-md flex-shrink-0 transition-colors ${
              visible === false ? "text-gray-300 hover:text-gray-500" : "text-violet-500 hover:text-violet-700"
            }`}
          >
            {visible === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            title="Delete section"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-6 w-6 flex items-center justify-center rounded-md flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="h-6 w-6 flex items-center justify-center text-gray-400 flex-shrink-0"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Color Picker Row
// ---------------------------------------------------------------------------
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <Label className="text-xs text-gray-500 w-20 flex-shrink-0">{label}</Label>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="h-8 w-8 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:border-gray-300"
          style={{ backgroundColor: value }}
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-xs font-mono bg-gray-50 border-gray-200 flex-1"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enhanced Media Upload Field (Image/Video/YouTube)
// ---------------------------------------------------------------------------
function MediaField({
  label,
  value,
  onChange,
  settings,
  onSettingsChange,
  onClearSettings,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  settings?: MediaFieldOptions;
  onSettingsChange?: (value: Partial<MediaFieldOptions>) => void;
  onClearSettings?: () => void;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<'link' | 'upload' | 'youtube' | 'instagram'>(() => {
    if (!value) return 'link';
    if (value.includes('youtube.com') || value.includes('youtu.be')) return 'youtube';
    if (value.includes('instagram.com')) return 'instagram';
    if (value.match(/\.(mp4|webm|ogg)$/i) || value.match(/\/uploads\/.*\.(mp4|webm|ogg)/i)) return 'upload';
    return 'link';
  });
  const currentSettings = settings || DEFAULT_MEDIA_SETTINGS;

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) { toast.error("Please select an image or video"); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("Max 50MB"); return; }
    const toastId = "tpl-upload";
    let dismissed = false;
    
    // Calculate timeout based on file size (10s per MB, min 30s, max 5min)
    const fileSizeMB = file.size / (1024 * 1024);
    const uploadTimeout = Math.max(30000, Math.min(300000, fileSizeMB * 10000));
    
    // Auto-dismiss toast after timeout to prevent stuck state
    const timeoutId = setTimeout(() => {
      if (!dismissed) {
        toast.dismiss(toastId);
        toast.error("Upload timed out. Check your network or R2 configuration.", { id: toastId });
        dismissed = true;
      }
    }, uploadTimeout);

    try {
      toast.loading("Uploading...", { id: toastId });

      // Add timeout to fetch (slightly shorter than toast timeout)
      const controller = new AbortController();
      const fetchTimeout = uploadTimeout - 5000;
      const timeoutId2 = setTimeout(() => controller.abort(), fetchTimeout);

      // 1. Ask the app for a presigned R2 URL (tiny JSON request/response).
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
        signal: controller.signal,
      });
      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Upload failed");
      }
      const { uploadUrl, url, storage } = await presignRes.json();

      // 2. Upload the file bytes straight to R2, bypassing the Vercel
      // function body limit that rejects anything over ~4.5MB.
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
        signal: controller.signal,
      });

      clearTimeout(timeoutId2);

      if (!putRes.ok) {
        throw new Error("Upload failed");
      }
      onChange(url);
      toast.success(`Uploaded${storage === 'r2' ? ' to R2' : ' locally'}!`, { id: toastId });
    } catch (err: any) {
      console.error("Upload error:", err);
      // Check if it's a network/extension blocking error
      if (err.name === 'AbortError') {
        toast.error("Upload timed out. Check R2 configuration on Vercel or network connection.", { id: toastId });
      } else if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
        toast.error("Upload blocked. Check browser extensions or R2 configuration.", { id: toastId });
      } else {
        toast.error(err.message || "Upload failed", { id: toastId });
      }
    } finally {
      clearTimeout(timeoutId);
      if (!dismissed) {
        toast.dismiss(toastId);
        dismissed = true;
      }
      e.target.value = "";
    }
  }, [onChange]);

  const extractYouTubeId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const isYouTube = value.includes('youtube.com') || value.includes('youtu.be');
  const isInstagram = value.includes('instagram.com');
  const isVideo = value.match(/\.(mp4|webm|ogg)$/i) || value.match(/\/uploads\/.*\.(mp4|webm|ogg)/i);
  const isImage = !isYouTube && !isInstagram && !isVideo;
  const youtubeId = isYouTube ? extractYouTubeId(value) : null;
  const youtubeEmbedUrl = youtubeId
    ? (() => {
        const params = new URLSearchParams({
          autoplay: currentSettings.autoplay ? "1" : "0",
          mute: currentSettings.mute ? "1" : "0",
          rel: "0",
          modestbranding: "1",
          playsinline: "1",
        });
        return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
      })()
    : null;

  const extractInstagramId = (url: string) => {
    const patterns = [
      /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/reels?\/([A-Za-z0-9_-]+)/,
    ];
    for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
    return null;
  };
  const igId = isInstagram ? extractInstagramId(value) : null;
  const igEmbedUrl = igId ? `https://www.instagram.com/p/${igId}/embed/captioned/` : null;

  return (
    <div>
      <Label className="text-xs text-gray-500">{label}</Label>
      
      <div className="flex gap-1 mt-1 mb-2">
        <Button 
          type="button"
          variant={mediaType === 'link' ? 'default' : 'outline'} 
          size="sm" 
          className="h-7 text-[10px] flex-1"
          onClick={() => setMediaType('link')}
        >
          <LinkIcon className="h-3 w-3 mr-1" /> Link
        </Button>
        <Button 
          type="button"
          variant={mediaType === 'upload' ? 'default' : 'outline'} 
          size="sm" 
          className="h-7 text-[10px] flex-1"
          onClick={() => setMediaType('upload')}
        >
          <Upload className="h-3 w-3 mr-1" /> Upload
        </Button>
        <Button 
          type="button"
          variant={mediaType === 'youtube' ? 'default' : 'outline'} 
          size="sm" 
          className="h-7 text-[10px] flex-1"
          onClick={() => setMediaType('youtube')}
        >
          <Youtube className="h-3 w-3 mr-1" /> YouTube
        </Button>
        <Button
          type="button"
          variant={mediaType === 'instagram' ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-[10px] flex-1"
          onClick={() => setMediaType('instagram')}
        >
          <Video className="h-3 w-3 mr-1" /> Instagram
        </Button>
      </div>

      {mediaType === 'link' && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs bg-gray-50 border-gray-200"
          placeholder="Paste image/video URL..."
        />
      )}

      {mediaType === 'upload' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="h-8 w-full text-xs" 
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-2" /> Choose Image or Video
          </Button>
        </div>
      )}

      {mediaType === 'youtube' && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs bg-gray-50 border-gray-200"
          placeholder="Paste YouTube URL..."
        />
      )}

      {mediaType === 'instagram' && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs bg-gray-50 border-gray-200"
          placeholder="Paste Instagram post/reel URL..."
        />
      )}

      {(mediaType === 'youtube' || mediaType === 'upload' || isVideo) && onSettingsChange && (
        <div className="mt-3 space-y-2 rounded-lg border border-gray-100 bg-gray-50/70 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">Autoplay</span>
            <Switch
              checked={currentSettings.autoplay}
              onCheckedChange={(checked) => onSettingsChange({ autoplay: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">Mute</span>
            <Switch
              checked={currentSettings.mute}
              onCheckedChange={(checked) => onSettingsChange({ mute: checked })}
            />
          </div>
        </div>
      )}

      {value && (
        <div className="mt-2 relative group">
          {isYouTube ? (
            <div className="aspect-video rounded-lg border border-gray-200 overflow-hidden">
              <iframe
                src={youtubeEmbedUrl || ''}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : isInstagram && igEmbedUrl ? (
            <div className="rounded-lg border border-gray-200 overflow-hidden" style={{ aspectRatio: '4/5', maxHeight: 320 }}>
              <iframe
                src={igEmbedUrl}
                className="w-full h-full bg-white"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : isVideo ? (
            <video src={value} className="w-full h-32 object-cover rounded-lg border border-gray-200" controls />
          ) : (
            <img src={value} alt="" className="h-20 w-full object-cover rounded-lg border border-gray-200" />
          )}
          <Button
            type="button"
            onClick={() => {
              onChange("");
              onClearSettings && onClearSettings();
            }}
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legacy Image Upload Field (for backward compatibility)
// ---------------------------------------------------------------------------
function ImageField({
  label,
  value,
  onChange,
  settings,
  onSettingsChange,
  onClearSettings,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  settings?: MediaFieldOptions;
  onSettingsChange?: (value: Partial<MediaFieldOptions>) => void;
  onClearSettings?: () => void;
}) {
  return (
    <MediaField
      label={label}
      value={value}
      onChange={onChange}
      settings={settings}
      onSettingsChange={onSettingsChange}
      onClearSettings={onClearSettings}
    />
  );
}

// ---------------------------------------------------------------------------
// Main Template Editor
// ---------------------------------------------------------------------------
interface TemplateEditorProps {
  data: LandingTemplateData;
  onChange: (data: LandingTemplateData) => void;
  landingPageId?: string;
  // Section selected on the canvas — opens/scrolls to its card here.
  activeSection?: string | null;
  activeNonce?: number;
  onSelectSection?: (key: string) => void;
  // True when the legacy page-level Rich Content slot is empty and therefore
  // absent from the canvas — hide its sidebar card too (see
  // isLegacyRichContentEmpty in landing-template.tsx).
  hideLegacyRichContent?: boolean;
  // Creates a brand-new, independent rich-content block at the end of the
  // page and focuses it on the canvas — only the canvas/rich-editor side
  // knows how to allocate one (see insertRichBlockAt in rich-editor.tsx), so
  // the "Add Template Element" button calls back up for it. Omitted (e.g. in
  // contexts with no live canvas) simply hides that option from the menu.
  onAddRichBlock?: () => void;
}

export function TemplateEditor({
  data,
  onChange,
  landingPageId,
  activeSection,
  activeNonce,
  onSelectSection,
  hideLegacyRichContent,
  onAddRichBlock,
}: TemplateEditorProps) {
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<{ key: string; pos: "top" | "bottom" } | null>(null);
  const dragGhostRef = useRef<HTMLElement | null>(null);
  const [testEmailTo, setTestEmailTo] = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const handleSendTestInvitationEmail = useCallback(async () => {
    if (!landingPageId) return;
    setSendingTestEmail(true);
    try {
      const whatsappGroupLink = (data.invitation.thankYouButtons || []).find(
        (b) => b.icon === "whatsapp" && b.url
      )?.url;
      const res = await fetch(`/api/landing-pages/${landingPageId}/test-invitation-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmailTo.trim() || undefined, whatsappGroupLink }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(result.error || "Failed to send test email");
        return;
      }
      toast.success(
        result.whatsappGroupLinkIncluded
          ? `Test email sent to ${result.sentTo} (WhatsApp group button included)`
          : `Test email sent to ${result.sentTo} (no WhatsApp group button set below)`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to send test email");
    } finally {
      setSendingTestEmail(false);
    }
  }, [landingPageId, testEmailTo, data.invitation.thankYouButtons]);
  
  const sectionOrder = useMemo(
    () => resolveSectionOrder(data.sectionOrder, data.deletedSections),
    [data.sectionOrder, data.deletedSections]
  );
  const mediaSettings = data.mediaSettings || {};

  const update = useCallback(
    <K extends keyof LandingTemplateData>(section: K, value: Partial<LandingTemplateData[K]>) => {
      onChange({ ...data, [section]: { ...(data[section] as object), ...value } });
    },
    [data, onChange]
  );

  const updateColors = useCallback(
    (key: string, value: string) => {
      onChange({ ...data, colors: { ...data.colors, [key]: value } });
    },
    [data, onChange]
  );

  const updateSectionBg = useCallback(
    (key: string, value: string) => {
      const current = data.sectionBg || {};
      if (value) {
        onChange({ ...data, sectionBg: { ...current, [key]: value } });
      } else {
        const updated = { ...current };
        delete updated[key];
        onChange({ ...data, sectionBg: updated });
      }
    },
    [data, onChange]
  );

  const handleMediaSettingsChange = useCallback(
    (key: string, value: Partial<MediaFieldOptions>) => {
      const current = mediaSettings[key] || DEFAULT_MEDIA_SETTINGS;
      const newSettings = { ...current, ...value };
      onChange({
        ...data,
        mediaSettings: {
          ...mediaSettings,
          [key]: newSettings,
        },
      });
    },
    [data, mediaSettings, onChange]
  );

  const clearMediaSettings = useCallback(
    (key: string) => {
      if (!mediaSettings[key]) return;
      const updated = { ...mediaSettings } as Record<string, MediaFieldOptions>;
      delete updated[key];
      onChange({ ...data, mediaSettings: updated });
    },
    [data, mediaSettings, onChange]
  );

  // -------------------------------------------------------------------------
  // Section reordering (drag from grip handle, arrows, drop indicators)
  // -------------------------------------------------------------------------
  const moveSection = useCallback(
    (key: string, dir: -1 | 1) => {
      const order = [...sectionOrder];
      const i = order.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return;
      [order[i], order[j]] = [order[j], order[i]];
      onChange({ ...data, sectionOrder: order });
    },
    [sectionOrder, data, onChange]
  );

  // Full delete (not hide) — pulls the key out of sectionOrder and records it
  // in deletedSections so resolveSectionOrder stops re-appending it as "new".
  // The section's own data is left in place, so restoring it from the Blocks
  // palette brings its old content straight back.
  const deleteSection = useCallback(
    (key: string) => {
      const order = sectionOrder.filter((k) => k !== key);
      onChange({
        ...data,
        sectionOrder: order,
        deletedSections: [...new Set([...(data.deletedSections || []), key])],
      });
    },
    [sectionOrder, data, onChange]
  );

  // Restores a previously-deleted canonical section: re-appends it to
  // sectionOrder and drops it from deletedSections so resolveSectionOrder
  // stops excluding it. Its data was never touched by delete, so this brings
  // the section back exactly as it was left.
  const restoreSection = useCallback(
    (key: string) => {
      onChange({
        ...data,
        sectionOrder: [...sectionOrder, key],
        deletedSections: (data.deletedSections || []).filter((k) => k !== key),
      });
      onSelectSection?.(key);
    },
    [sectionOrder, data, onChange, onSelectSection]
  );

  // Adds a new instance to the repeatable contentBlocks list — shared by the
  // "Add Template Element" menu and the draggable palette chip below.
  const addContentBlock = useCallback(() => {
    const blocks = [...(data.contentBlocks || [])];
    blocks.push({
      enabled: true,
      layout: "media-left" as const,
      mediaType: "image" as const,
      mediaUrl: "",
      textFormat: "plain" as const,
      heading: "New Content Block",
      content: "Write your content here...",
    });
    onChange({ ...data, contentBlocks: blocks });
    onSelectSection?.("contentBlocks");
  }, [data, onChange, onSelectSection]);

  const cleanupDrag = useCallback(() => {
    setDraggedSection(null);
    setDragOver(null);
    dragGhostRef.current?.remove();
    dragGhostRef.current = null;
  }, []);

  const handleGripDragStart = useCallback(
    (sectionKey: string) => (e: React.DragEvent) => {
      setDraggedSection(sectionKey);
      e.dataTransfer.setData(SECTION_DND_TYPE, sectionKey);
      e.dataTransfer.setData("text/plain", sectionKey);
      e.dataTransfer.effectAllowed = "move";
      // Small labeled chip as the drag image, instead of the browser dragging
      // a screenshot of the whole card around the screen.
      const ghost = document.createElement("div");
      ghost.textContent = SECTION_LABELS[sectionKey] || sectionKey;
      Object.assign(ghost.style, {
        position: "fixed",
        top: "-100px",
        left: "-100px",
        padding: "6px 14px",
        background: "#7c3aed",
        color: "#fff",
        fontSize: "12px",
        fontWeight: "600",
        borderRadius: "8px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        pointerEvents: "none",
        zIndex: "9999",
      } as CSSStyleDeclaration);
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 16, 16);
      dragGhostRef.current = ghost;
    },
    []
  );

  const handleCardDragOver = useCallback(
    (sectionKey: string) => (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes(SECTION_DND_TYPE)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = e.currentTarget.getBoundingClientRect();
      const pos: "top" | "bottom" = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom";
      setDragOver((prev) => (prev?.key === sectionKey && prev.pos === pos ? prev : { key: sectionKey, pos }));
      // Auto-scroll the sidebar while dragging near its edges.
      const container = (e.currentTarget as HTMLElement).closest(".overflow-y-auto");
      if (container) {
        const cRect = container.getBoundingClientRect();
        if (e.clientY < cRect.top + 64) container.scrollBy({ top: -16 });
        else if (e.clientY > cRect.bottom - 64) container.scrollBy({ top: 16 });
      }
    },
    []
  );

  const handleCardDrop = useCallback(
    (targetSection: string) => (e: React.DragEvent) => {
      e.preventDefault();
      const source = e.dataTransfer.getData(SECTION_DND_TYPE) || draggedSection;
      const rect = e.currentTarget.getBoundingClientRect();
      const pos: "top" | "bottom" = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom";
      cleanupDrag();
      if (!source || source === targetSection) return;

      const order = [...sectionOrder];
      const from = order.indexOf(source);
      if (from === -1) return;
      order.splice(from, 1);
      let target = order.indexOf(targetSection);
      if (target === -1) return;
      if (pos === "bottom") target += 1;
      order.splice(target, 0, source);
      onChange({ ...data, sectionOrder: order });
    },
    [draggedSection, sectionOrder, data, onChange, cleanupDrag]
  );

  // Bundles every per-card prop (drag, arrows, visibility, active highlight)
  // for a reorderable section — used by all section cards below.
  const sectionProps = (key: string) => ({
    sectionKey: key,
    dnd: {
      isDragSource: draggedSection === key,
      indicator: dragOver?.key === key ? dragOver.pos : null,
      onGripDragStart: handleGripDragStart(key),
      onDragEnd: cleanupDrag,
      onCardDragOver: handleCardDragOver(key),
      onCardDrop: handleCardDrop(key),
      onCardDragLeave: () => setDragOver((p) => (p?.key === key ? null : p)),
    } as SectionDnd,
    onMove: (dir: -1 | 1) => moveSection(key, dir),
    isFirst: sectionOrder.indexOf(key) === 0,
    isLast: sectionOrder.indexOf(key) === sectionOrder.length - 1,
    isActive: activeSection === key,
    activeNonce,
    visible: getSectionVisibility(data, key),
    onToggleVisible:
      key === "richContent"
        ? undefined
        : () => onChange(applySectionVisibility(data, key, !getSectionVisibility(data, key))),
    onDelete:
      key === "richContent"
        ? undefined
        : () => {
            if (window.confirm(`Delete the "${SECTION_LABELS[key] || key}" section? You can add it back later from "Add Template Element" above.`)) {
              deleteSection(key);
            }
          },
  });

  // -------------------------------------------------------------------------
  // Content-block list helpers (reorder / duplicate keep media settings in
  // sync because those are keyed by block index).
  // -------------------------------------------------------------------------
  const swapContentBlocks = useCallback(
    (i: number, j: number) => {
      const blocks = [...(data.contentBlocks || [])];
      if (j < 0 || j >= blocks.length) return;
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      const ms = { ...(data.mediaSettings || {}) };
      const ki = mediaKey("contentBlocks", i, "mediaUrl");
      const kj = mediaKey("contentBlocks", j, "mediaUrl");
      const vi = ms[ki];
      const vj = ms[kj];
      if (vj) ms[ki] = vj; else delete ms[ki];
      if (vi) ms[kj] = vi; else delete ms[kj];
      onChange({ ...data, contentBlocks: blocks, mediaSettings: ms });
    },
    [data, onChange]
  );

  const duplicateContentBlock = useCallback(
    (i: number) => {
      const blocks = [...(data.contentBlocks || [])];
      blocks.splice(i + 1, 0, { ...blocks[i] });
      onChange({ ...data, contentBlocks: blocks });
    },
    [data, onChange]
  );

  const sectionComponents: Record<string, JSX.Element> = {
    richContent: (
      <Section
        key="richContent"
        title="Rich Editor Content Block"
        icon={<Code2 className="h-4 w-4" />}
        {...sectionProps('richContent')}
      >
        <div className="space-y-2">
          <SectionBgField sectionKey="richContent" value={data.sectionBg?.['richContent'] || ''} onChange={updateSectionBg} />
          <p className="text-xs text-gray-500 leading-relaxed font-body">
            This is the content block you compose in the <strong>Rich Editor</strong> tab. Drag this section card to reposition it relative to other page components.
          </p>
        </div>
      </Section>
    ),
    colors: (
      <Section key="colors" title="Theme Colors" icon={<Palette className="h-4 w-4" />} defaultOpen>
        <ColorField label="Primary" value={data.colors.primary} onChange={(v) => updateColors("primary", v)} />
        <ColorField label="Secondary" value={data.colors.secondary} onChange={(v) => updateColors("secondary", v)} />
        <ColorField label="Accent" value={data.colors.accent} onChange={(v) => updateColors("accent", v)} />
        <ColorField label="Hero BG" value={data.colors.heroBg} onChange={(v) => updateColors("heroBg", v)} />
        <ColorField label="Dark BG" value={data.colors.darkBg} onChange={(v) => updateColors("darkBg", v)} />
        <ColorField label="Body BG" value={data.colors.bodyBg} onChange={(v) => updateColors("bodyBg", v)} />
        <div className="pt-1">
          <Label className="text-xs text-gray-600">Font</Label>
          <select
            value={data.fontFamily || ""}
            onChange={(e) => onChange({ ...data, fontFamily: e.target.value })}
            className="w-full h-9 mt-1 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.label} value={f.stack} style={{ fontFamily: f.stack || undefined }}>
                {f.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400 mt-1">Applies to the whole landing page.</p>
        </div>
      </Section>
    ),
    floatingButton: (
      <Section
        key="floatingButton"
        title="Floating CTA Button"
        icon={<MousePointerClick className="h-4 w-4" />}
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enable floating button</Label>
          <Switch
            checked={data.floatingButton.enabled}
            onCheckedChange={(v) => update("floatingButton", { enabled: v })}
          />
        </div>
        <p className="text-[11px] text-gray-500">
          When enabled, a single CTA button will float near the bottom of the page on mobile for quick access.
        </p>
        {data.floatingButton.enabled && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Button Source</Label>
            <select
              value={data.floatingButton.section}
              onChange={(e) => update("floatingButton", { section: e.target.value as LandingTemplateData["floatingButton"]["section"] })}
              className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="hero">Hero CTA Button</option>
              <option value="program">Program CTA Button</option>
              <option value="invitation">Request Invitation Button</option>
              <option value="footer">Footer CTA Button</option>
            </select>
            <p className="text-[10px] text-gray-400">
              Only one floating button can be active at a time. Update the source button text inside its section.
            </p>

            <Label className="text-xs text-gray-500 pt-1 block">Style</Label>
            <select
              value={data.floatingButton.variant ?? "pill"}
              onChange={(e) => update("floatingButton", { variant: e.target.value as "pill" | "bar" })}
              className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="pill">Floating Pill (glowing)</option>
              <option value="bar">Docked Checkout Bar (price + button)</option>
            </select>

            <div className="flex items-center justify-between pt-1">
              <Label className="text-xs text-gray-600">Also show on desktop</Label>
              <Switch
                checked={data.floatingButton.showOnDesktop ?? false}
                onCheckedChange={(v) => update("floatingButton", { showOnDesktop: v })}
              />
            </div>

            {data.floatingButton.variant === "bar" && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  <Input
                    value={data.floatingButton.priceText ?? ''}
                    onChange={(e) => update("floatingButton", { priceText: e.target.value })}
                    className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
                    placeholder="₹99"
                  />
                  <Input
                    value={data.floatingButton.strikePriceText ?? ''}
                    onChange={(e) => update("floatingButton", { strikePriceText: e.target.value })}
                    className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
                    placeholder="₹2,999"
                  />
                </div>
                <Input
                  value={data.floatingButton.noteText ?? ''}
                  onChange={(e) => update("floatingButton", { noteText: e.target.value })}
                  className="h-8 text-xs bg-gray-50 border-gray-200"
                  placeholder="Only 23 seats left · closes Sunday"
                />
                <div>
                  <Label className="text-xs text-gray-500">Countdown ends at</Label>
                  <Input
                    type="datetime-local"
                    value={toDatetimeLocal(data.floatingButton.countdownTo)}
                    onChange={(e) => update("floatingButton", { countdownTo: fromDatetimeLocal(e.target.value) })}
                    className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                  />
                </div>
                <Input
                  value={data.floatingButton.countdownLabel ?? ''}
                  onChange={(e) => update("floatingButton", { countdownLabel: e.target.value })}
                  className="h-8 text-xs bg-gray-50 border-gray-200"
                  placeholder="Countdown label — e.g. Starts in"
                />
                <div>
                  <Label className="text-xs text-gray-500">Short button label (bar only)</Label>
                  <Input
                    value={data.floatingButton.ctaTextOverride ?? ''}
                    onChange={(e) => update("floatingButton", { ctaTextOverride: e.target.value })}
                    className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                    placeholder="Register Now"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Section>
    ),
    hero: (
      (() => {
        const heroImageKey = mediaKey("hero", "heroImage");
        return (
      <Section 
        key="hero"
        title="Hero Section" 
        icon={<Star className="h-4 w-4" />} 
        defaultOpen
        {...sectionProps('hero')}
      >
        <SectionBgField sectionKey="hero" value={data.sectionBg?.['hero'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show hero block</Label>
          <Switch
            checked={data.hero.visible}
            onCheckedChange={(v) => update("hero", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Badge Text</Label>
          <Input value={data.hero.badge} onChange={(e) => update("hero", { badge: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Headline</Label>
          <Input value={data.hero.headline} onChange={(e) => update("hero", { headline: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Highlighted Word</Label>
          <Input value={data.hero.highlightedWord} onChange={(e) => update("hero", { highlightedWord: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subheadline</Label>
          <Textarea value={data.hero.subheadline} onChange={(e) => update("hero", { subheadline: e.target.value })} rows={2} className="text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Bullet Points</Label>
          {data.hero.bulletPoints.map((bp, i) => (
            <div key={i} className="flex gap-1 mt-1">
              <Input
                value={bp}
                onChange={(e) => {
                  const arr = [...data.hero.bulletPoints];
                  arr[i] = e.target.value;
                  update("hero", { bulletPoints: arr });
                }}
                className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
              />
              <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
                const arr = data.hero.bulletPoints.filter((_, j) => j !== i);
                update("hero", { bulletPoints: arr });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => update("hero", { bulletPoints: [...data.hero.bulletPoints, ""] })}>
            <Plus className="h-3 w-3 mr-1" /> Add Point
          </Button>
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Text</Label>
          <Input value={data.hero.ctaButtonText} onChange={(e) => update("hero", { ctaButtonText: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Action</Label>
          <select
            value={data.hero.ctaButtonAction}
            onChange={(e) => update("hero", { ctaButtonAction: e.target.value as "invitation" | "url" })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="invitation">Open Request Invitation Form</option>
            <option value="url">Redirect to Custom URL</option>
          </select>
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Link</Label>
          <Input value={data.hero.ctaButtonLink} onChange={(e) => update("hero", { ctaButtonLink: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder={data.hero.ctaButtonAction === "url" ? "https://example.com" : "#register"} />
        </div>
        <ImageField
          label="Hero Image (Controls autoplay/mute for all carousel slides)"
          value={data.hero.heroImage}
          onChange={(v) => update("hero", { heroImage: v })}
          settings={mediaSettings[heroImageKey]}
          onSettingsChange={(value) => handleMediaSettingsChange(heroImageKey, value)}
          onClearSettings={() => clearMediaSettings(heroImageKey)}
        />
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">Carousel Slides</Label>
          <p className="text-[11px] text-gray-400">Add images, videos, or YouTube links. Autoplay/mute settings are controlled by Hero Image above.</p>
          {data.hero.heroMedia.map((media, i) => {
            const slideKey = mediaKey("hero", "heroMedia", i, "url");
            return (
              <div key={slideKey} className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Slide {i + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-red-500"
                    onClick={() => {
                      clearMediaSettings(slideKey);
                      update("hero", {
                        heroMedia: data.hero.heroMedia.filter((_, idx) => idx !== i),
                      });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <MediaField
                  label="Media URL"
                  value={media.url}
                  onChange={(v) => {
                    const arr = [...data.hero.heroMedia];
                    arr[i] = { ...arr[i], url: v };
                    update("hero", { heroMedia: arr });
                  }}
                  // Note: Settings inherited from Hero Image above
                />
                <Input
                  value={media.label || ""}
                  onChange={(e) => {
                    const arr = [...data.hero.heroMedia];
                    arr[i] = { ...arr[i], label: e.target.value };
                    update("hero", { heroMedia: arr });
                  }}
                  placeholder="Optional label"
                  className="h-8 text-xs bg-white border-gray-200"
                />
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => update("hero", { heroMedia: [...data.hero.heroMedia, { url: "", label: "" }] })}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Slide
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs text-gray-500">Autoplay Carousel</Label>
            <p className="text-[11px] text-gray-400">Automatically advance slides.</p>
          </div>
          <Switch
            checked={data.hero.carouselAutoplay}
            onCheckedChange={(v) => update("hero", { carouselAutoplay: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Slide Interval (ms)</Label>
          <Input
            type="number"
            min={2000}
            step={500}
            value={data.hero.carouselInterval}
            onChange={(e) => update("hero", { carouselInterval: Number(e.target.value) || 0 })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Floating Stats</Label>
          {data.hero.floatingStats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-1 mt-1">
              <Input
                value={stat.value}
                onChange={(e) => {
                  const arr = [...data.hero.floatingStats];
                  arr[i] = { ...arr[i], value: e.target.value };
                  update("hero", { floatingStats: arr });
                }}
                className="h-8 text-xs bg-gray-50 border-gray-200 w-24"
                placeholder="Value"
              />
              <Input
                value={stat.label}
                onChange={(e) => {
                  const arr = [...data.hero.floatingStats];
                  arr[i] = { ...arr[i], label: e.target.value };
                  update("hero", { floatingStats: arr });
                }}
                className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
                placeholder="Label"
              />
              <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
                update("hero", { floatingStats: data.hero.floatingStats.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => update("hero", { floatingStats: [...data.hero.floatingStats, { value: "", label: "" }] })}>
            <Plus className="h-3 w-3 mr-1" /> Add Stat
          </Button>
        </div>
      </Section>
    );
      })()
    ),
    marquee: (
      <Section 
        key="marquee"
        title="Marquee / Ticker" 
        icon={<Type className="h-4 w-4" />}
        {...sectionProps('marquee')}
      >
        <SectionBgField sectionKey="marquee" value={data.sectionBg?.['marquee'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enabled</Label>
          <Switch checked={data.marquee.enabled} onCheckedChange={(v) => update("marquee", { enabled: v })} />
        </div>
        {data.marquee.items.map((item, i) => (
          <div key={i} className="flex gap-1">
            <Input
              value={item}
              onChange={(e) => {
                const arr = [...data.marquee.items];
                arr[i] = e.target.value;
                update("marquee", { items: arr });
              }}
              className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
            />
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
              update("marquee", { items: data.marquee.items.filter((_, j) => j !== i) });
            }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("marquee", { items: [...data.marquee.items, ""] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Item
        </Button>
      </Section>
    ),
    why: (
      <Section 
        key="why"
        title="Why Section" 
        icon={<LayoutGrid className="h-4 w-4" />}
        {...sectionProps('why')}
      >
        <SectionBgField sectionKey="why" value={data.sectionBg?.['why'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch
            checked={data.why.visible}
            onCheckedChange={(v) => update("why", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.why.title} onChange={(e) => update("why", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Textarea value={data.why.subtitle} onChange={(e) => update("why", { subtitle: e.target.value })} rows={2} className="text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.why.points.map((point, i) => {
          const pointImageKey = mediaKey("why", "points", i, "image");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Point {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(pointImageKey);
                update("why", { points: data.why.points.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input value={point.title} onChange={(e) => {
              const arr = [...data.why.points]; arr[i] = { ...arr[i], title: e.target.value }; update("why", { points: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Title" />
            <Textarea value={point.description} onChange={(e) => {
              const arr = [...data.why.points]; arr[i] = { ...arr[i], description: e.target.value }; update("why", { points: arr });
            }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Description" />
            <ImageField
              label="Image"
              value={point.image}
              onChange={(v) => {
                const arr = [...data.why.points]; arr[i] = { ...arr[i], image: v }; update("why", { points: arr });
              }}
              settings={mediaSettings[pointImageKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(pointImageKey, value)}
              onClearSettings={() => clearMediaSettings(pointImageKey)}
            />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("why", { points: [...data.why.points, { title: "", description: "", image: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Point
        </Button>
      </Section>
    ),
    about: (
      <Section 
        key="about"
        title="About Section" 
        icon={<Users className="h-4 w-4" />}
        {...sectionProps('about')}
      >
        <SectionBgField sectionKey="about" value={data.sectionBg?.['about'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch
            checked={data.about.visible}
            onCheckedChange={(v) => update("about", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Section Title</Label>
          <Input value={data.about.title} onChange={(e) => update("about", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Name</Label>
          <Input value={data.about.name} onChange={(e) => update("about", { name: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subheadline</Label>
          <Input value={data.about.subtitle ?? ''} onChange={(e) => update("about", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder="Short line under the name" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Description</Label>
          <Textarea value={data.about.description} onChange={(e) => update("about", { description: e.target.value })} rows={3} className="text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <ImageField
          label="Photo"
          value={data.about.image}
          onChange={(v) => update("about", { image: v })}
          settings={mediaSettings[mediaKey("about", "image")]}
          onSettingsChange={(value) => handleMediaSettingsChange(mediaKey("about", "image"), value)}
          onClearSettings={() => clearMediaSettings(mediaKey("about", "image"))}
        />
        <div>
          <Label className="text-xs text-gray-500">Credentials</Label>
          {data.about.credentials.map((cred, i) => (
            <div key={i} className="flex gap-1 mt-1">
              <Input value={cred} onChange={(e) => {
                const arr = [...data.about.credentials]; arr[i] = e.target.value; update("about", { credentials: arr });
              }} className="h-8 text-xs bg-gray-50 border-gray-200 flex-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
                update("about", { credentials: data.about.credentials.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => update("about", { credentials: [...data.about.credentials, ""] })}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      </Section>
    ),
    announcementBar: (
      <Section
        key="announcementBar"
        title="Announcement Bar"
        icon={<Megaphone className="h-4 w-4" />}
        {...sectionProps('announcementBar')}
      >
        <SectionBgField sectionKey="announcementBar" value={data.sectionBg?.['announcementBar'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show bar</Label>
          <Switch checked={data.announcementBar?.visible ?? false} onCheckedChange={(v) => update("announcementBar", { visible: v })} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Stick to top on scroll</Label>
          <Switch checked={data.announcementBar?.sticky ?? true} onCheckedChange={(v) => update("announcementBar", { sticky: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Message</Label>
          <Input value={data.announcementBar?.text ?? ''} onChange={(e) => update("announcementBar", { text: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder="Only 7 seats left at this price" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Countdown ends at</Label>
          <Input
            type="datetime-local"
            value={toDatetimeLocal(data.announcementBar?.countdownTo)}
            onChange={(e) => update("announcementBar", { countdownTo: fromDatetimeLocal(e.target.value) })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
          <p className="text-[10px] text-gray-400 mt-1">Leave empty to hide the timer.</p>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Countdown label</Label>
          <Input value={data.announcementBar?.countdownLabel ?? ''} onChange={(e) => update("announcementBar", { countdownLabel: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder="Offer ends in" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Button text</Label>
          <Input value={data.announcementBar?.ctaText ?? ''} onChange={(e) => update("announcementBar", { ctaText: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Button action</Label>
          <select
            value={data.announcementBar?.ctaAction ?? "invitation"}
            onChange={(e) => update("announcementBar", { ctaAction: e.target.value as "invitation" | "url" })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="invitation">Open invitation form</option>
            <option value="url">Go to URL</option>
          </select>
        </div>
        {data.announcementBar?.ctaAction === "url" && (
          <div>
            <Label className="text-xs text-gray-500">Button link</Label>
            <Input value={data.announcementBar?.ctaLink ?? ''} onChange={(e) => update("announcementBar", { ctaLink: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
          </div>
        )}
      </Section>
    ),
    eventDetails: (
      <Section
        key="eventDetails"
        title="Event Details"
        icon={<CalendarDays className="h-4 w-4" />}
        {...sectionProps('eventDetails')}
      >
        <SectionBgField sectionKey="eventDetails" value={data.sectionBg?.['eventDetails'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch checked={data.eventDetails?.visible ?? false} onCheckedChange={(v) => update("eventDetails", { visible: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.eventDetails?.title ?? ''} onChange={(e) => update("eventDetails", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.eventDetails?.subtitle ?? ''} onChange={(e) => update("eventDetails", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>

        <Label className="text-xs font-semibold text-gray-600 pt-1 block">Pills</Label>
        {(data.eventDetails?.pills ?? []).map((pill, i) => (
          <div key={i} className="flex gap-1">
            <Input value={pill} onChange={(e) => {
              const arr = [...(data.eventDetails?.pills ?? [])]; arr[i] = e.target.value; update("eventDetails", { pills: arr });
            }} className="h-8 text-xs bg-white border-gray-200 flex-1" placeholder="Recording Available" />
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => update("eventDetails", { pills: (data.eventDetails?.pills ?? []).filter((_, j) => j !== i) })}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("eventDetails", { pills: [...(data.eventDetails?.pills ?? []), ""] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Pill
        </Button>

        <Label className="text-xs font-semibold text-gray-600 pt-2 block">Detail rows</Label>
        {(data.eventDetails?.items ?? []).map((item, i) => {
          const items = data.eventDetails?.items ?? [];
          return (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Detail {i + 1}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => update("eventDetails", { items: items.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <IconPicker value={item.icon ?? ''} onChange={(name) => {
                const arr = [...items]; arr[i] = { ...arr[i], icon: name }; update("eventDetails", { items: arr });
              }} />
              <Input value={item.label} onChange={(e) => {
                const arr = [...items]; arr[i] = { ...arr[i], label: e.target.value }; update("eventDetails", { items: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Label (Date)" />
              <Input value={item.value} onChange={(e) => {
                const arr = [...items]; arr[i] = { ...arr[i], value: e.target.value }; update("eventDetails", { items: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Value (Sunday, 15 Feb)" />
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("eventDetails", { items: [...(data.eventDetails?.items ?? []), { icon: "CalendarDays", label: "", value: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Detail
        </Button>

        <Label className="text-xs font-semibold text-gray-600 pt-2 block">Price &amp; seats</Label>
        <div>
          <Label className="text-xs text-gray-500">Price label</Label>
          <Input value={data.eventDetails?.priceLabel ?? ''} onChange={(e) => update("eventDetails", { priceLabel: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div className="flex gap-1">
          <Input value={data.eventDetails?.price ?? ''} onChange={(e) => update("eventDetails", { price: e.target.value })} className="h-8 text-xs bg-gray-50 border-gray-200 flex-1" placeholder="₹99" />
          <Input value={data.eventDetails?.originalPrice ?? ''} onChange={(e) => update("eventDetails", { originalPrice: e.target.value })} className="h-8 text-xs bg-gray-50 border-gray-200 flex-1" placeholder="₹2,999" />
        </div>
        <Input value={data.eventDetails?.savingsNote ?? ''} onChange={(e) => update("eventDetails", { savingsNote: e.target.value })} className="h-8 text-xs bg-gray-50 border-gray-200" placeholder="Save 96% today" />
        <Input value={data.eventDetails?.seatsNote ?? ''} onChange={(e) => update("eventDetails", { seatsNote: e.target.value })} className="h-8 text-xs bg-gray-50 border-gray-200" placeholder="Only 23 of 100 seats left" />
        <div>
          <Label className="text-xs text-gray-500">Seats filled ({data.eventDetails?.seatsFilledPercent ?? 0}%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={data.eventDetails?.seatsFilledPercent ?? 0}
            onChange={(e) => update("eventDetails", { seatsFilledPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Button text</Label>
          <Input value={data.eventDetails?.ctaButtonText ?? ''} onChange={(e) => update("eventDetails", { ctaButtonText: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Button action</Label>
          <select
            value={data.eventDetails?.ctaButtonAction ?? "invitation"}
            onChange={(e) => update("eventDetails", { ctaButtonAction: e.target.value as "invitation" | "url" })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="invitation">Open invitation form</option>
            <option value="url">Go to URL</option>
          </select>
        </div>
        {data.eventDetails?.ctaButtonAction === "url" && (
          <Input value={data.eventDetails?.ctaButtonLink ?? ''} onChange={(e) => update("eventDetails", { ctaButtonLink: e.target.value })} className="h-8 text-xs bg-gray-50 border-gray-200" placeholder="https://..." />
        )}
      </Section>
    ),
    problems: (
      <Section
        key="problems"
        title="Problems / Pain Points"
        icon={<AlertTriangle className="h-4 w-4" />}
        {...sectionProps('problems')}
      >
        <SectionBgField sectionKey="problems" value={data.sectionBg?.['problems'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch checked={data.problems?.visible ?? false} onCheckedChange={(v) => update("problems", { visible: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.problems?.title ?? ''} onChange={(e) => update("problems", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.problems?.subtitle ?? ''} onChange={(e) => update("problems", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {(data.problems?.items ?? []).map((item, i) => {
          const items = data.problems?.items ?? [];
          return (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Problem {i + 1}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => update("problems", { items: items.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <IconPicker value={item.icon ?? ''} onChange={(name) => {
                const arr = [...items]; arr[i] = { ...arr[i], icon: name }; update("problems", { items: arr });
              }} />
              <Input value={item.title} onChange={(e) => {
                const arr = [...items]; arr[i] = { ...arr[i], title: e.target.value }; update("problems", { items: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Title" />
              <Textarea value={item.description ?? ''} onChange={(e) => {
                const arr = [...items]; arr[i] = { ...arr[i], description: e.target.value }; update("problems", { items: arr });
              }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Description" />
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("problems", { items: [...(data.problems?.items ?? []), { icon: "AlertTriangle", title: "", description: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Problem
        </Button>

        <Label className="text-xs font-semibold text-gray-600 pt-2 block">Consequence panel</Label>
        <Input value={data.problems?.impactTitle ?? ''} onChange={(e) => update("problems", { impactTitle: e.target.value })} className="h-8 text-xs bg-gray-50 border-gray-200" placeholder="Left unaddressed, this costs you…" />
        {(data.problems?.impacts ?? []).map((line, i) => (
          <div key={i} className="flex gap-1">
            <Input value={line} onChange={(e) => {
              const arr = [...(data.problems?.impacts ?? [])]; arr[i] = e.target.value; update("problems", { impacts: arr });
            }} className="h-8 text-xs bg-white border-gray-200 flex-1" />
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => update("problems", { impacts: (data.problems?.impacts ?? []).filter((_, j) => j !== i) })}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("problems", { impacts: [...(data.problems?.impacts ?? []), ""] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Consequence
        </Button>
      </Section>
    ),
    curriculum: (
      <Section
        key="curriculum"
        title="Curriculum"
        icon={<ListChecks className="h-4 w-4" />}
        {...sectionProps('curriculum')}
      >
        <SectionBgField sectionKey="curriculum" value={data.sectionBg?.['curriculum'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch checked={data.curriculum?.visible ?? false} onCheckedChange={(v) => update("curriculum", { visible: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.curriculum?.title ?? ''} onChange={(e) => update("curriculum", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.curriculum?.subtitle ?? ''} onChange={(e) => update("curriculum", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Display</Label>
          <select
            value={data.curriculum?.displayMode ?? "accordion"}
            onChange={(e) => update("curriculum", { displayMode: e.target.value as "accordion" | "cards" })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="accordion">Accordion (numbered rows)</option>
            <option value="cards">Cards with images</option>
          </select>
        </div>
        {(data.curriculum?.modules ?? []).map((m, i) => {
          const modules = data.curriculum?.modules ?? [];
          const moduleKey = mediaKey("curriculum", "modules", i, "image");
          return (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Module {i + 1}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                  clearMediaSettings(moduleKey);
                  update("curriculum", { modules: modules.filter((_, j) => j !== i) });
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input value={m.label} onChange={(e) => {
                const arr = [...modules]; arr[i] = { ...arr[i], label: e.target.value }; update("curriculum", { modules: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Day 1 / Module 01" />
              <Input value={m.title} onChange={(e) => {
                const arr = [...modules]; arr[i] = { ...arr[i], title: e.target.value }; update("curriculum", { modules: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Title" />
              <Textarea value={m.description ?? ''} onChange={(e) => {
                const arr = [...modules]; arr[i] = { ...arr[i], description: e.target.value }; update("curriculum", { modules: arr });
              }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Short description (optional)" />
              <Textarea
                value={(m.bullets ?? []).join("\n")}
                onChange={(e) => {
                  const arr = [...modules]; arr[i] = { ...arr[i], bullets: e.target.value.split("\n") }; update("curriculum", { modules: arr });
                }}
                rows={4}
                className="text-xs bg-white border-gray-200"
                placeholder="One bullet per line"
              />
              {data.curriculum?.displayMode === "cards" && (
                <ImageField
                  label="Image"
                  value={m.image ?? ''}
                  onChange={(v) => {
                    const arr = [...modules]; arr[i] = { ...arr[i], image: v }; update("curriculum", { modules: arr });
                  }}
                  settings={mediaSettings[moduleKey]}
                  onSettingsChange={(value) => handleMediaSettingsChange(moduleKey, value)}
                  onClearSettings={() => clearMediaSettings(moduleKey)}
                />
              )}
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("curriculum", { modules: [...(data.curriculum?.modules ?? []), { label: `Module ${(data.curriculum?.modules ?? []).length + 1}`, title: "", description: "", bullets: [""], image: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Module
        </Button>
        <div>
          <Label className="text-xs text-gray-500">Button text (optional)</Label>
          <Input value={data.curriculum?.ctaButtonText ?? ''} onChange={(e) => update("curriculum", { ctaButtonText: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Button action</Label>
          <select
            value={data.curriculum?.ctaButtonAction ?? "invitation"}
            onChange={(e) => update("curriculum", { ctaButtonAction: e.target.value as "invitation" | "url" })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="invitation">Open invitation form</option>
            <option value="url">Go to URL</option>
          </select>
        </div>
        {data.curriculum?.ctaButtonAction === "url" && (
          <Input value={data.curriculum?.ctaButtonLink ?? ''} onChange={(e) => update("curriculum", { ctaButtonLink: e.target.value })} className="h-8 text-xs bg-gray-50 border-gray-200" placeholder="https://..." />
        )}
      </Section>
    ),
    pricing: (
      <Section
        key="pricing"
        title="Pricing Tiers"
        icon={<Tag className="h-4 w-4" />}
        {...sectionProps('pricing')}
      >
        <SectionBgField sectionKey="pricing" value={data.sectionBg?.['pricing'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch checked={data.pricing?.visible ?? false} onCheckedChange={(v) => update("pricing", { visible: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.pricing?.title ?? ''} onChange={(e) => update("pricing", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.pricing?.subtitle ?? ''} onChange={(e) => update("pricing", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {(data.pricing?.tiers ?? []).map((tier, i) => {
          const tiers = data.pricing?.tiers ?? [];
          const patch = (p: Partial<typeof tier>) => {
            const arr = [...tiers]; arr[i] = { ...arr[i], ...p }; update("pricing", { tiers: arr });
          };
          return (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Tier {i + 1}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => update("pricing", { tiers: tiers.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input value={tier.name} onChange={(e) => patch({ name: e.target.value })} className="h-8 text-xs bg-white border-gray-200" placeholder="Tier name" />
              <div className="flex gap-1">
                <Input value={tier.price} onChange={(e) => patch({ price: e.target.value })} className="h-8 text-xs bg-white border-gray-200 flex-1" placeholder="₹599" />
                <Input value={tier.originalPrice ?? ''} onChange={(e) => patch({ originalPrice: e.target.value })} className="h-8 text-xs bg-white border-gray-200 flex-1" placeholder="₹1,999" />
              </div>
              <div className="flex gap-1">
                <Input value={tier.period ?? ''} onChange={(e) => patch({ period: e.target.value })} className="h-8 text-xs bg-white border-gray-200 flex-1" placeholder="one-time" />
                <Input value={tier.badge ?? ''} onChange={(e) => patch({ badge: e.target.value })} className="h-8 text-xs bg-white border-gray-200 flex-1" placeholder="Most Popular" />
              </div>
              <Textarea value={tier.description ?? ''} onChange={(e) => patch({ description: e.target.value })} rows={2} className="text-xs bg-white border-gray-200" placeholder="Short description" />
              <Textarea
                value={(tier.features ?? []).join("\n")}
                onChange={(e) => patch({ features: e.target.value.split("\n") })}
                rows={4}
                className="text-xs bg-white border-gray-200"
                placeholder="One feature per line"
              />
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-600">Highlight this tier</Label>
                <Switch checked={tier.highlighted ?? false} onCheckedChange={(v) => patch({ highlighted: v })} />
              </div>
              <Input value={tier.ctaText} onChange={(e) => patch({ ctaText: e.target.value })} className="h-8 text-xs bg-white border-gray-200" placeholder="Button text" />
              <select
                value={tier.ctaAction ?? "invitation"}
                onChange={(e) => patch({ ctaAction: e.target.value as "invitation" | "url" })}
                className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs"
              >
                <option value="invitation">Open invitation form</option>
                <option value="url">Go to URL</option>
              </select>
              {tier.ctaAction === "url" && (
                <Input value={tier.ctaLink} onChange={(e) => patch({ ctaLink: e.target.value })} className="h-8 text-xs bg-white border-gray-200" placeholder="https://..." />
              )}
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("pricing", { tiers: [...(data.pricing?.tiers ?? []), { name: "", price: "", originalPrice: "", period: "", badge: "", description: "", features: [""], ctaText: "Get Started", ctaLink: "#register", ctaAction: "invitation" as const, highlighted: false }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Tier
        </Button>
        <div>
          <Label className="text-xs text-gray-500">Footnote</Label>
          <Input value={data.pricing?.footnote ?? ''} onChange={(e) => update("pricing", { footnote: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder="7-day refund, no questions asked." />
        </div>
      </Section>
    ),
    comparison: (
      <Section
        key="comparison"
        title="Comparison Table"
        icon={<Table2 className="h-4 w-4" />}
        {...sectionProps('comparison')}
      >
        <SectionBgField sectionKey="comparison" value={data.sectionBg?.['comparison'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch checked={data.comparison?.visible ?? false} onCheckedChange={(v) => update("comparison", { visible: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.comparison?.title ?? ''} onChange={(e) => update("comparison", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.comparison?.subtitle ?? ''} onChange={(e) => update("comparison", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Columns (one per line)</Label>
          <Textarea
            value={(data.comparison?.columns ?? []).join("\n")}
            onChange={(e) => update("comparison", { columns: e.target.value.split("\n") })}
            rows={3}
            className="text-xs mt-1 bg-gray-50 border-gray-200"
            placeholder={"This Workshop\nOther Courses"}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Highlight column</Label>
          <select
            value={String(data.comparison?.highlightColumn ?? 0)}
            onChange={(e) => update("comparison", { highlightColumn: Number(e.target.value) })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="-1">None</option>
            {(data.comparison?.columns ?? []).map((col, i) => (
              <option key={i} value={String(i)}>{col || `Column ${i + 1}`}</option>
            ))}
          </select>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          In each row, type <code className="font-mono">yes</code> or <code className="font-mono">no</code> for a tick/cross — anything else shows as text.
        </p>
        {(data.comparison?.rows ?? []).map((row, i) => {
          const rows = data.comparison?.rows ?? [];
          const cols = data.comparison?.columns ?? [];
          return (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Row {i + 1}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => update("comparison", { rows: rows.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input value={row.feature} onChange={(e) => {
                const arr = [...rows]; arr[i] = { ...arr[i], feature: e.target.value }; update("comparison", { rows: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Feature" />
              {cols.map((col, j) => (
                <Input
                  key={j}
                  value={row.values?.[j] ?? ''}
                  onChange={(e) => {
                    const arr = [...rows];
                    const values = [...(arr[i].values ?? [])];
                    values[j] = e.target.value;
                    arr[i] = { ...arr[i], values };
                    update("comparison", { rows: arr });
                  }}
                  className="h-8 text-xs bg-white border-gray-200"
                  placeholder={col || `Column ${j + 1}`}
                />
              ))}
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("comparison", { rows: [...(data.comparison?.rows ?? []), { feature: "", values: (data.comparison?.columns ?? []).map(() => "") }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Row
        </Button>
      </Section>
    ),
    guarantee: (
      <Section
        key="guarantee"
        title="Guarantee"
        icon={<ShieldCheck className="h-4 w-4" />}
        {...sectionProps('guarantee')}
      >
        <SectionBgField sectionKey="guarantee" value={data.sectionBg?.['guarantee'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch checked={data.guarantee?.visible ?? false} onCheckedChange={(v) => update("guarantee", { visible: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.guarantee?.title ?? ''} onChange={(e) => update("guarantee", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.guarantee?.subtitle ?? ''} onChange={(e) => update("guarantee", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {(data.guarantee?.items ?? []).map((item, i) => {
          const items = data.guarantee?.items ?? [];
          return (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Promise {i + 1}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => update("guarantee", { items: items.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <IconPicker value={item.icon ?? ''} onChange={(name) => {
                const arr = [...items]; arr[i] = { ...arr[i], icon: name }; update("guarantee", { items: arr });
              }} />
              <Input value={item.title} onChange={(e) => {
                const arr = [...items]; arr[i] = { ...arr[i], title: e.target.value }; update("guarantee", { items: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Title" />
              <Textarea value={item.description} onChange={(e) => {
                const arr = [...items]; arr[i] = { ...arr[i], description: e.target.value }; update("guarantee", { items: arr });
              }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Description" />
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("guarantee", { items: [...(data.guarantee?.items ?? []), { icon: "ShieldCheck", title: "", description: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Promise
        </Button>
      </Section>
    ),
    liveProof: (
      <Section
        key="liveProof"
        title="Live Social Proof"
        icon={<BadgeCheck className="h-4 w-4" />}
        {...sectionProps('liveProof')}
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show notifications</Label>
          <Switch checked={data.liveProof?.visible ?? false} onCheckedChange={(v) => update("liveProof", { visible: v })} />
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          A rotating toast pinned to the bottom-left of the live page. It is hidden here in the editor, so preview it on the published page.
        </p>
        <div>
          <Label className="text-xs text-gray-500">Rotate every (ms)</Label>
          <Input
            type="number"
            min={2500}
            value={data.liveProof?.intervalMs ?? 5000}
            onChange={(e) => update("liveProof", { intervalMs: Math.max(2500, Number(e.target.value) || 5000) })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        {(data.liveProof?.items ?? []).map((item, i) => {
          const items = data.liveProof?.items ?? [];
          const itemKey = mediaKey("liveProof", "items", i, "image");
          return (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Notice {i + 1}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                  clearMediaSettings(itemKey);
                  update("liveProof", { items: items.filter((_, j) => j !== i) });
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input value={item.text} onChange={(e) => {
                const arr = [...items]; arr[i] = { ...arr[i], text: e.target.value }; update("liveProof", { items: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Priya from Mumbai just reserved a seat" />
              <Input value={item.meta ?? ''} onChange={(e) => {
                const arr = [...items]; arr[i] = { ...arr[i], meta: e.target.value }; update("liveProof", { items: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="2 minutes ago" />
              <ImageField
                label="Avatar (optional)"
                value={item.image ?? ''}
                onChange={(v) => {
                  const arr = [...items]; arr[i] = { ...arr[i], image: v }; update("liveProof", { items: arr });
                }}
                settings={mediaSettings[itemKey]}
                onSettingsChange={(value) => handleMediaSettingsChange(itemKey, value)}
                onClearSettings={() => clearMediaSettings(itemKey)}
              />
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("liveProof", { items: [...(data.liveProof?.items ?? []), { text: "", meta: "", image: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Notice
        </Button>
      </Section>
    ),
    guidesRail: (
      <Section
        key="guidesRail"
        title="People Rail"
        icon={<Users className="h-4 w-4" />}
        {...sectionProps('guidesRail')}
      >
        <SectionBgField sectionKey="guidesRail" value={data.sectionBg?.['guidesRail'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show people rail</Label>
          <Switch
            checked={data.guidesRail?.visible ?? false}
            onCheckedChange={(v) => update("guidesRail", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.guidesRail?.title ?? ''} onChange={(e) => update("guidesRail", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.guidesRail?.subtitle ?? ''} onChange={(e) => update("guidesRail", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {(data.guidesRail?.items ?? []).map((item, i) => {
          const items = data.guidesRail?.items ?? [];
          const itemKey = mediaKey("guidesRail", "items", i, "image");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Person {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(itemKey);
                update("guidesRail", { items: items.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <ImageField
              label="Photo"
              value={item.image}
              onChange={(v) => {
                const arr = [...items]; arr[i] = { ...arr[i], image: v }; update("guidesRail", { items: arr });
              }}
              settings={mediaSettings[itemKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(itemKey, value)}
              onClearSettings={() => clearMediaSettings(itemKey)}
            />
            <Input value={item.name} onChange={(e) => {
              const arr = [...items]; arr[i] = { ...arr[i], name: e.target.value }; update("guidesRail", { items: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Name" />
            <Input value={item.role} onChange={(e) => {
              const arr = [...items]; arr[i] = { ...arr[i], role: e.target.value }; update("guidesRail", { items: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Role" />
            <Input value={item.link ?? ''} onChange={(e) => {
              const arr = [...items]; arr[i] = { ...arr[i], link: e.target.value }; update("guidesRail", { items: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Link (optional)" />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("guidesRail", { items: [...(data.guidesRail?.items ?? []), { name: "", role: "", image: "", link: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Person
        </Button>
      </Section>
    ),
    formats: (
      <Section
        key="formats"
        title="Format Carousel"
        icon={<ImageIcon className="h-4 w-4" />}
        {...sectionProps('formats')}
      >
        <SectionBgField sectionKey="formats" value={data.sectionBg?.['formats'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show format carousel</Label>
          <Switch
            checked={data.formats?.visible ?? false}
            onCheckedChange={(v) => update("formats", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.formats?.title ?? ''} onChange={(e) => update("formats", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.formats?.subtitle ?? ''} onChange={(e) => update("formats", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {(data.formats?.slides ?? []).map((slide, i) => {
          const slides = data.formats?.slides ?? [];
          const slideKey = mediaKey("formats", "slides", i, "image");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Slide {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(slideKey);
                update("formats", { slides: slides.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <ImageField
              label="Image"
              value={slide.image}
              onChange={(v) => {
                const arr = [...slides]; arr[i] = { ...arr[i], image: v }; update("formats", { slides: arr });
              }}
              settings={mediaSettings[slideKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(slideKey, value)}
              onClearSettings={() => clearMediaSettings(slideKey)}
            />
            <Input value={slide.label ?? ''} onChange={(e) => {
              const arr = [...slides]; arr[i] = { ...arr[i], label: e.target.value }; update("formats", { slides: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Label (optional)" />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("formats", { slides: [...(data.formats?.slides ?? []), { image: "", label: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Slide
        </Button>
      </Section>
    ),
    appBanner: (
      <Section
        key="appBanner"
        title="App Banner"
        icon={<MousePointerClick className="h-4 w-4" />}
        {...sectionProps('appBanner')}
      >
        <SectionBgField sectionKey="appBanner" value={data.sectionBg?.['appBanner'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show banner</Label>
          <Switch
            checked={data.appBanner?.visible ?? false}
            onCheckedChange={(v) => update("appBanner", { visible: v })}
          />
        </div>
        <ImageField
          label="Banner Image"
          value={data.appBanner?.image ?? ''}
          onChange={(v) => update("appBanner", { image: v })}
          settings={mediaSettings[mediaKey("appBanner", "image")]}
          onSettingsChange={(value) => handleMediaSettingsChange(mediaKey("appBanner", "image"), value)}
          onClearSettings={() => clearMediaSettings(mediaKey("appBanner", "image"))}
        />
        <div>
          <Label className="text-xs text-gray-500">Link</Label>
          <Input value={data.appBanner?.link ?? ''} onChange={(e) => update("appBanner", { link: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder="https://example.com or #anchor" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Alt Text</Label>
          <Input value={data.appBanner?.alt ?? ''} onChange={(e) => update("appBanner", { alt: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
      </Section>
    ),
    logos: (
      <Section 
        key="logos"
        title="Logo Bar" 
        icon={<Award className="h-4 w-4" />}
        {...sectionProps('logos')}
      >
        <SectionBgField sectionKey="logos" value={data.sectionBg?.['logos'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enabled</Label>
          <Switch checked={data.logos.enabled} onCheckedChange={(v) => update("logos", { enabled: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.logos.title} onChange={(e) => update("logos", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subheadline</Label>
          <Input value={data.logos.subtitle ?? ''} onChange={(e) => update("logos", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder="Short line under the title" />
        </div>
        {data.logos.logos.map((logo, i) => {
          const logoKey = mediaKey("logos", "logos", i, "image");
          return (
          <div key={i} className="flex gap-1 items-end">
            <div className="flex-1">
              <ImageField
                label={`Logo ${i + 1}`}
                value={logo.image}
                onChange={(v) => {
                  const arr = [...data.logos.logos]; arr[i] = { ...arr[i], image: v }; update("logos", { logos: arr });
                }}
                settings={mediaSettings[logoKey]}
                onSettingsChange={(value) => handleMediaSettingsChange(logoKey, value)}
                onClearSettings={() => clearMediaSettings(logoKey)}
              />
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 mb-1" onClick={() => {
              clearMediaSettings(logoKey);
              update("logos", { logos: data.logos.logos.filter((_, j) => j !== i) });
            }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("logos", { logos: [...data.logos.logos, { image: "", alt: "Logo" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Logo
        </Button>
      </Section>
    ),
    gallery: (
      <Section 
        key="gallery"
        title="Gallery" 
        icon={<ImageIcon className="h-4 w-4" />}
        {...sectionProps('gallery')}
      >
        <SectionBgField sectionKey="gallery" value={data.sectionBg?.['gallery'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show gallery</Label>
          <Switch
            checked={data.gallery.visible}
            onCheckedChange={(v) => update("gallery", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.gallery.title} onChange={(e) => update("gallery", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.gallery.subtitle} onChange={(e) => update("gallery", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.gallery.images.map((img, i) => {
          const galleryKey = mediaKey("gallery", "images", i, "url");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Image {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(galleryKey);
                update("gallery", { images: data.gallery.images.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <ImageField
              label="URL"
              value={img.url}
              onChange={(v) => {
                const arr = [...data.gallery.images]; arr[i] = { ...arr[i], url: v }; update("gallery", { images: arr });
              }}
              settings={mediaSettings[galleryKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(galleryKey, value)}
              onClearSettings={() => clearMediaSettings(galleryKey)}
            />
            <Input value={img.caption} onChange={(e) => {
              const arr = [...data.gallery.images]; arr[i] = { ...arr[i], caption: e.target.value }; update("gallery", { images: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Caption" />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("gallery", { images: [...data.gallery.images, { url: "", caption: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Image
        </Button>
      </Section>
    ),
    stats: (
      <Section 
        key="stats"
        title="Stats / CTA Section" 
        icon={<Globe className="h-4 w-4" />}
        {...sectionProps('stats')}
      >
        <SectionBgField sectionKey="stats" value={data.sectionBg?.['stats'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show stats section</Label>
          <Switch
            checked={data.stats.visible}
            onCheckedChange={(v) => update("stats", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.stats.title} onChange={(e) => update("stats", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.stats.subtitle} onChange={(e) => update("stats", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.stats.stats.map((stat, i) => (
          <div key={i} className="flex gap-1">
            <Input value={stat.value} onChange={(e) => {
              const arr = [...data.stats.stats]; arr[i] = { ...arr[i], value: e.target.value }; update("stats", { stats: arr });
            }} className="h-8 text-xs bg-gray-50 border-gray-200 w-24" placeholder="Value" />
            <Input value={stat.label} onChange={(e) => {
              const arr = [...data.stats.stats]; arr[i] = { ...arr[i], label: e.target.value }; update("stats", { stats: arr });
            }} className="h-8 text-xs bg-gray-50 border-gray-200 flex-1" placeholder="Label" />
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
              update("stats", { stats: data.stats.stats.filter((_, j) => j !== i) });
            }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("stats", { stats: [...data.stats.stats, { value: "", label: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Stat
        </Button>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Text</Label>
          <Input value={data.stats.ctaButtonText} onChange={(e) => update("stats", { ctaButtonText: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Action</Label>
          <select
            value={data.stats.ctaButtonAction}
            onChange={(e) => update("stats", { ctaButtonAction: e.target.value as "invitation" | "url" })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="invitation">Open Request Invitation Form</option>
            <option value="url">Redirect to Custom URL</option>
          </select>
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Link</Label>
          <Input value={data.stats.ctaButtonLink} onChange={(e) => update("stats", { ctaButtonLink: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder={data.stats.ctaButtonAction === "url" ? "https://example.com" : "#register"} />
        </div>
        <ImageField
          label="Background Image"
          value={data.stats.backgroundImage}
          onChange={(v) => update("stats", { backgroundImage: v })}
          settings={mediaSettings[mediaKey("stats", "backgroundImage")]}
          onSettingsChange={(value) => handleMediaSettingsChange(mediaKey("stats", "backgroundImage"), value)}
          onClearSettings={() => clearMediaSettings(mediaKey("stats", "backgroundImage"))}
        />
      </Section>
    ),
    testimonials: (
      <Section 
        key="testimonials"
        title="Testimonials" 
        icon={<MessageSquare className="h-4 w-4" />}
        {...sectionProps('testimonials')}
      >
        <SectionBgField sectionKey="testimonials" value={data.sectionBg?.['testimonials'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show testimonials</Label>
          <Switch
            checked={data.testimonials.visible}
            onCheckedChange={(v) => update("testimonials", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.testimonials.title} onChange={(e) => update("testimonials", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.testimonials.subtitle} onChange={(e) => update("testimonials", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.testimonials.items.map((item, i) => {
          const testimonialKey = mediaKey("testimonials", "items", i, "image");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Testimonial {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(testimonialKey);
                update("testimonials", { items: data.testimonials.items.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input value={item.name} onChange={(e) => {
              const arr = [...data.testimonials.items]; arr[i] = { ...arr[i], name: e.target.value }; update("testimonials", { items: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Name" />
            <Input value={item.role} onChange={(e) => {
              const arr = [...data.testimonials.items]; arr[i] = { ...arr[i], role: e.target.value }; update("testimonials", { items: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Role" />
            <Textarea value={item.quote} onChange={(e) => {
              const arr = [...data.testimonials.items]; arr[i] = { ...arr[i], quote: e.target.value }; update("testimonials", { items: arr });
            }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Quote" />
            <ImageField
              label="Photo"
              value={item.image}
              onChange={(v) => {
                const arr = [...data.testimonials.items]; arr[i] = { ...arr[i], image: v }; update("testimonials", { items: arr });
              }}
              settings={mediaSettings[testimonialKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(testimonialKey, value)}
              onClearSettings={() => clearMediaSettings(testimonialKey)}
            />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("testimonials", { items: [...data.testimonials.items, { name: "", quote: "", image: "", role: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Testimonial
        </Button>
      </Section>
    ),
    videoTestimonials: (
      <Section
        key="videoTestimonials"
        title="Video Testimonials"
        icon={<Video className="h-4 w-4" />}
        {...sectionProps('videoTestimonials')}
      >
        <SectionBgField sectionKey="videoTestimonials" value={data.sectionBg?.['videoTestimonials'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show video testimonials</Label>
          <Switch
            checked={data.videoTestimonials.visible}
            onCheckedChange={(v) => update("videoTestimonials", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.videoTestimonials.title} onChange={(e) => update("videoTestimonials", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.videoTestimonials.subtitle} onChange={(e) => update("videoTestimonials", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <p className="text-[11px] text-gray-400">Upload video files or paste YouTube links. Videos autoplay muted when visible on screen.</p>
        {data.videoTestimonials.items.map((item, i) => {
          const vtKey = mediaKey("videoTestimonials", "items", i, "url");
          return (
            <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Video {i + 1}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                  clearMediaSettings(vtKey);
                  update("videoTestimonials", { items: data.videoTestimonials.items.filter((_, j) => j !== i) });
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <MediaField
                label="Video (upload or YouTube link)"
                value={item.url}
                onChange={(v) => {
                  const arr = [...data.videoTestimonials.items];
                  arr[i] = { ...arr[i], url: v };
                  update("videoTestimonials", { items: arr });
                }}
                settings={mediaSettings[vtKey]}
                onSettingsChange={(value) => handleMediaSettingsChange(vtKey, value)}
                onClearSettings={() => clearMediaSettings(vtKey)}
              />
              <Input value={item.name} onChange={(e) => {
                const arr = [...data.videoTestimonials.items]; arr[i] = { ...arr[i], name: e.target.value }; update("videoTestimonials", { items: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Person's name" />
              <Input value={item.role} onChange={(e) => {
                const arr = [...data.videoTestimonials.items]; arr[i] = { ...arr[i], role: e.target.value }; update("videoTestimonials", { items: arr });
              }} className="h-8 text-xs bg-white border-gray-200" placeholder="Role / title" />
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("videoTestimonials", { items: [...data.videoTestimonials.items, { url: "", name: "", role: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Video
        </Button>
      </Section>
    ),
    program: (
      <Section 
        key="program"
        title="Program / What You'll Learn" 
        icon={<BookOpen className="h-4 w-4" />}
        {...sectionProps('program')}
      >
        <SectionBgField sectionKey="program" value={data.sectionBg?.['program'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show program section</Label>
          <Switch
            checked={data.program.visible}
            onCheckedChange={(v) => update("program", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.program.title} onChange={(e) => update("program", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.program.subtitle} onChange={(e) => update("program", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.program.points.map((point, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Point {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                update("program", { points: data.program.points.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-1">
              <div className="w-36 flex-shrink-0">
                <IconPicker value={point.icon} onChange={(name) => {
                  const arr = [...data.program.points]; arr[i] = { ...arr[i], icon: name }; update("program", { points: arr });
                }} />
              </div>
              <Input value={point.title} onChange={(e) => {
                const arr = [...data.program.points]; arr[i] = { ...arr[i], title: e.target.value }; update("program", { points: arr });
              }} className="h-8 text-xs bg-white border-gray-200 flex-1" placeholder="Title" />
            </div>
            <Textarea value={point.description} onChange={(e) => {
              const arr = [...data.program.points]; arr[i] = { ...arr[i], description: e.target.value }; update("program", { points: arr });
            }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Description" />
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("program", { points: [...data.program.points, { title: "", description: "", icon: "Sparkles" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Point
        </Button>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Text</Label>
          <Input value={data.program.ctaButtonText} onChange={(e) => update("program", { ctaButtonText: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Action</Label>
          <select
            value={data.program.ctaButtonAction}
            onChange={(e) => update("program", { ctaButtonAction: e.target.value as "invitation" | "url" })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="invitation">Open Request Invitation Form</option>
            <option value="url">Redirect to Custom URL</option>
          </select>
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Link</Label>
          <Input value={data.program.ctaButtonLink} onChange={(e) => update("program", { ctaButtonLink: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder={data.program.ctaButtonAction === "url" ? "https://example.com" : "#register"} />
        </div>
      </Section>
    ),
    bonus: (
      <Section 
        key="bonus"
        title="Bonus Section" 
        icon={<Gift className="h-4 w-4" />}
        {...sectionProps('bonus')}
      >
        <SectionBgField sectionKey="bonus" value={data.sectionBg?.['bonus'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enabled</Label>
          <Switch checked={data.bonus.enabled} onCheckedChange={(v) => update("bonus", { enabled: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.bonus.title} onChange={(e) => update("bonus", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.bonus.items.map((item, i) => {
          const bonusKey = mediaKey("bonus", "items", i, "image");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Bonus {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(bonusKey);
                update("bonus", { items: data.bonus.items.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input value={item.title} onChange={(e) => {
              const arr = [...data.bonus.items]; arr[i] = { ...arr[i], title: e.target.value }; update("bonus", { items: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Title" />
            <Textarea value={item.description} onChange={(e) => {
              const arr = [...data.bonus.items]; arr[i] = { ...arr[i], description: e.target.value }; update("bonus", { items: arr });
            }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Description" />
            <ImageField
              label="Image"
              value={item.image}
              onChange={(v) => {
                const arr = [...data.bonus.items]; arr[i] = { ...arr[i], image: v }; update("bonus", { items: arr });
              }}
              settings={mediaSettings[bonusKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(bonusKey, value)}
              onClearSettings={() => clearMediaSettings(bonusKey)}
            />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("bonus", { items: [...data.bonus.items, { title: "", description: "", image: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Bonus
        </Button>
      </Section>
    ),
    contentBlocks: (
      <Section 
        key="contentBlocks"
        title="Content Blocks" 
        icon={<Layers className="h-4 w-4" />}
        {...sectionProps('contentBlocks')}
      >
        <div className="text-xs text-gray-500 mb-3">
          Add multiple content blocks with media (image/video/YouTube) and text side by side
        </div>
        {Array.isArray(data.contentBlocks) && data.contentBlocks.map((block, i) => {
          const blockKey = mediaKey("contentBlocks", i, "mediaUrl");
          return (
          <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Block {i + 1}</span>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="sm" title="Move block up" disabled={i === 0} className="h-6 px-1.5 text-gray-400 hover:text-violet-600 disabled:opacity-30" onClick={() => swapContentBlocks(i, i - 1)}>
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" title="Move block down" disabled={i === (data.contentBlocks?.length || 0) - 1} className="h-6 px-1.5 text-gray-400 hover:text-violet-600 disabled:opacity-30" onClick={() => swapContentBlocks(i, i + 1)}>
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" title="Duplicate block" className="h-6 px-1.5 text-gray-400 hover:text-violet-600" onClick={() => duplicateContentBlock(i)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" title="Delete block" className="h-6 px-1.5 text-red-500" onClick={() => {
                  clearMediaSettings(blockKey);
                  const blocks = Array.isArray(data.contentBlocks) ? data.contentBlocks : [];
                  onChange({ ...data, contentBlocks: blocks.filter((_, j) => j !== i) });
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-600">Enabled</Label>
              <Switch checked={block.enabled} onCheckedChange={(v) => {
                const blocks = Array.isArray(data.contentBlocks) ? [...data.contentBlocks] : [];
                blocks[i] = { ...blocks[i], enabled: v };
                onChange({ ...data, contentBlocks: blocks });
              }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500">Layout</Label>
                <select 
                  value={block.layout} 
                  onChange={(e) => {
                    const blocks = Array.isArray(data.contentBlocks) ? [...data.contentBlocks] : [];
                    blocks[i] = { ...blocks[i], layout: e.target.value as "media-left" | "media-right" };
                    onChange({ ...data, contentBlocks: blocks });
                  }}
                  className="w-full h-8 text-xs mt-1 bg-white border border-gray-200 rounded-md px-2"
                >
                  <option value="media-left">Media Left</option>
                  <option value="media-right">Media Right</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Media Type</Label>
                <select 
                  value={block.mediaType} 
                  onChange={(e) => {
                    const blocks = Array.isArray(data.contentBlocks) ? [...data.contentBlocks] : [];
                    blocks[i] = { ...blocks[i], mediaType: e.target.value as "image" | "video" | "youtube" };
                    onChange({ ...data, contentBlocks: blocks });
                  }}
                  className="w-full h-8 text-xs mt-1 bg-white border border-gray-200 rounded-md px-2"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">
                {block.mediaType === "youtube" ? "YouTube URL" : block.mediaType === "video" ? "Video URL" : "Image URL"}
              </Label>
              <MediaField
                label={block.mediaType === "youtube" ? "YouTube URL" : block.mediaType === "video" ? "Video URL" : "Image URL"}
                value={block.mediaUrl}
                onChange={(v) => {
                  const blocks = Array.isArray(data.contentBlocks) ? [...data.contentBlocks] : [];
                  blocks[i] = { ...blocks[i], mediaUrl: v };
                  onChange({ ...data, contentBlocks: blocks });
                }}
                settings={mediaSettings[blockKey]}
                onSettingsChange={(value) => handleMediaSettingsChange(blockKey, value)}
                onClearSettings={() => clearMediaSettings(blockKey)}
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Text Format</Label>
              <select 
                value={block.textFormat} 
                onChange={(e) => {
                  const blocks = Array.isArray(data.contentBlocks) ? [...data.contentBlocks] : [];
                  blocks[i] = { ...blocks[i], textFormat: e.target.value as "plain" | "bullets" };
                  onChange({ ...data, contentBlocks: blocks });
                }}
                className="w-full h-8 text-xs mt-1 bg-white border border-gray-200 rounded-md px-2"
              >
                <option value="plain">Plain Text</option>
                <option value="bullets">Bullet Points</option>
              </select>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Heading (Optional)</Label>
              <Input 
                value={block.heading || ""} 
                onChange={(e) => {
                  const blocks = Array.isArray(data.contentBlocks) ? [...data.contentBlocks] : [];
                  blocks[i] = { ...blocks[i], heading: e.target.value };
                  onChange({ ...data, contentBlocks: blocks });
                }} 
                className="h-8 text-xs mt-1 bg-white border-gray-200" 
                placeholder="Section heading"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">
                Content {block.textFormat === "bullets" ? "(one per line)" : ""}
              </Label>
              <Textarea 
                value={block.content} 
                onChange={(e) => {
                  const blocks = Array.isArray(data.contentBlocks) ? [...data.contentBlocks] : [];
                  blocks[i] = { ...blocks[i], content: e.target.value };
                  onChange({ ...data, contentBlocks: blocks });
                }} 
                rows={6} 
                className="text-xs mt-1 bg-white border-gray-200" 
                placeholder={block.textFormat === "bullets" ? "Enter each bullet point on a new line" : "Enter your content here"}
              />
            </div>
          </div>
        )})}
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs w-full" 
          onClick={() => {
            const blocks = Array.isArray(data.contentBlocks) ? [...data.contentBlocks] : [];
            const newBlocks = [
              ...blocks,
              { 
                enabled: true, 
                layout: "media-left" as const,
                mediaType: "image" as const,
                mediaUrl: "", 
                textFormat: "plain" as const,
                heading: "", 
                content: "" 
              }
            ];
            onChange({ ...data, contentBlocks: newBlocks });
          }}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Content Block
        </Button>
      </Section>
    ),
    invitation: (
      (() => {
        const highlights = data.invitation.formHighlights;
        return (
      <Section 
        key="invitation"
        title="Request Invitation"
        icon={<CalendarCheck2 className="h-4 w-4" />}
        {...sectionProps('invitation')}
      >
        <SectionBgField sectionKey="invitation" value={data.sectionBg?.['invitation'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch
            checked={data.invitation.enabled}
            onCheckedChange={(v) => update("invitation", { enabled: v })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-gray-500">Badge Emoji</Label>
            <Input
              value={data.invitation.badgeEmoji}
              onChange={(e) => update("invitation", { badgeEmoji: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Badge Text</Label>
            <Input
              value={data.invitation.badgeText}
              onChange={(e) => update("invitation", { badgeText: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input
            value={data.invitation.title}
            onChange={(e) => update("invitation", { title: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Textarea
            value={data.invitation.subtitle}
            onChange={(e) => update("invitation", { subtitle: e.target.value })}
            rows={2}
            className="text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-[11px] text-gray-500 flex items-center gap-1">
              <CalendarCheck2 className="h-3.5 w-3.5" /> Date Label
            </Label>
            <Input
              value={data.invitation.dateLabel}
              onChange={(e) => update("invitation", { dateLabel: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
            <Input
              value={data.invitation.dateValue}
              onChange={(e) => update("invitation", { dateValue: e.target.value })}
              className="h-8 text-xs mt-1 bg-white border-gray-200"
              placeholder="15 Feb 2026"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-500 flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" /> Time Label
            </Label>
            <Input
              value={data.invitation.timeLabel}
              onChange={(e) => update("invitation", { timeLabel: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
            <Input
              value={data.invitation.timeValue}
              onChange={(e) => update("invitation", { timeValue: e.target.value })}
              className="h-8 text-xs mt-1 bg-white border-gray-200"
              placeholder="03:00 PM"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-[11px] text-gray-500 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Venue Label
            </Label>
            <Input
              value={data.invitation.venueLabel}
              onChange={(e) => update("invitation", { venueLabel: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-500">Venue Details</Label>
            <Input
              value={data.invitation.venueValue}
              onChange={(e) => update("invitation", { venueValue: e.target.value })}
              className="h-8 text-xs mt-1 bg-white border-gray-200"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">Availability Text</Label>
          <Input
            value={data.invitation.availabilityText}
            onChange={(e) => update("invitation", { availabilityText: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>

        <div>
          <Label className="text-xs text-gray-500">Primary Button Text</Label>
          <Input
            value={data.invitation.buttonText}
            onChange={(e) => update("invitation", { buttonText: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Action</Label>
          <select
            value={data.invitation.buttonAction}
            onChange={(e) => update("invitation", { buttonAction: e.target.value as "invitation" | "url" })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="invitation">Open Request Invitation Form</option>
            <option value="url">Redirect to Custom URL</option>
          </select>
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Link</Label>
          <Input
            value={data.invitation.buttonLink}
            onChange={(e) => update("invitation", { buttonLink: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            placeholder={data.invitation.buttonAction === "url" ? "https://example.com" : "#register"}
          />
        </div>

        <div>
          <Label className="text-xs text-gray-500">Button Text Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={data.invitation.buttonTextColor || "#1B1F3A"}
              onChange={(e) => update("invitation", { buttonTextColor: e.target.value })}
              className="h-8 w-12 rounded border border-gray-200 cursor-pointer p-0.5 bg-white"
            />
            <Input
              value={data.invitation.buttonTextColor || "#1B1F3A"}
              onChange={(e) => update("invitation", { buttonTextColor: e.target.value })}
              className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
              placeholder="#1B1F3A"
            />
            {data.invitation.buttonTextColor && (
              <button
                type="button"
                onClick={() => update("invitation", { buttonTextColor: undefined })}
                className="text-xs text-gray-400 hover:text-red-500 transition px-2"
                title="Reset to default"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">Form Title</Label>
          <Input
            value={data.invitation.formTitle}
            onChange={(e) => update("invitation", { formTitle: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>

        <div>
          <Label className="text-xs text-gray-500">Form Highlights</Label>
          {highlights.map((item, i) => (
            <div key={i} className="flex gap-1 mt-1">
              <Input
                value={item}
                onChange={(e) => {
                  const arr = [...highlights];
                  arr[i] = e.target.value;
                  update("invitation", { formHighlights: arr });
                }}
                className="h-8 text-xs bg-white border-gray-200 flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-red-500"
                onClick={() => update("invitation", { formHighlights: highlights.filter((_, j) => j !== i) })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs mt-1"
            onClick={() => update("invitation", { formHighlights: [...highlights, ""] })}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Highlight
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-gray-500">Form Button Text</Label>
            <Input
              value={data.invitation.formButtonText}
              onChange={(e) => update("invitation", { formButtonText: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Support Text</Label>
            <Input
              value={data.invitation.supportText}
              onChange={(e) => update("invitation", { supportText: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">Success Title</Label>
          <Input
            value={data.invitation.successTitle}
            onChange={(e) => update("invitation", { successTitle: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Success Description</Label>
          <Textarea
            value={data.invitation.successDescription}
            onChange={(e) => update("invitation", { successDescription: e.target.value })}
            rows={2}
            className="text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-gray-600 font-semibold">Thank You Page Buttons</Label>
            <button
              type="button"
              className="text-xs text-violet-600 hover:text-violet-800 font-medium"
              onClick={() => {
                const buttons = [...(data.invitation.thankYouButtons || []), { label: "", url: "", icon: "none" as const }];
                update("invitation", { thankYouButtons: buttons });
              }}
            >
              + Add Button
            </button>
          </div>
          {(data.invitation.thankYouButtons || []).map((btn, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 mb-2 space-y-2 bg-gray-50/60">
              <div className="flex gap-2">
                <Input
                  value={btn.label}
                  onChange={(e) => {
                    const buttons = [...(data.invitation.thankYouButtons || [])];
                    buttons[i] = { ...buttons[i], label: e.target.value };
                    update("invitation", { thankYouButtons: buttons });
                  }}
                  placeholder="Button label"
                  className="h-7 text-xs bg-white border-gray-200 flex-1"
                />
                <button
                  type="button"
                  className="text-xs text-red-400 hover:text-red-600 px-1"
                  onClick={() => {
                    const buttons = (data.invitation.thankYouButtons || []).filter((_, idx) => idx !== i);
                    update("invitation", { thankYouButtons: buttons });
                  }}
                >✕</button>
              </div>
              <Input
                value={btn.url}
                onChange={(e) => {
                  const buttons = [...(data.invitation.thankYouButtons || [])];
                  buttons[i] = { ...buttons[i], url: e.target.value };
                  update("invitation", { thankYouButtons: buttons });
                }}
                placeholder="https://..."
                className="h-7 text-xs bg-white border-gray-200"
              />
              <select
                value={btn.icon}
                onChange={(e) => {
                  const buttons = [...(data.invitation.thankYouButtons || [])];
                  buttons[i] = { ...buttons[i], icon: e.target.value as any };
                  update("invitation", { thankYouButtons: buttons });
                }}
                className="w-full h-7 text-xs rounded-md border border-gray-200 bg-white px-2"
              >
                <option value="none">No icon</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="x">X (Twitter)</option>
              </select>
            </div>
          ))}
        </div>

        {landingPageId && (
          <div className="border border-violet-200 bg-violet-50/60 rounded-xl p-3 mt-3">
            <Label className="text-xs text-gray-600 font-semibold">
              Test Registration Confirmation Email
            </Label>
            <p className="text-[11px] text-gray-500 mt-1 mb-2">
              Sends a preview of the confirmation email (with the WhatsApp group button
              above, if set) to check formatting before it goes out for real.
            </p>
            <div className="flex gap-2">
              <Input
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
                placeholder="you@example.com"
                className="h-8 text-xs bg-white border-gray-200 flex-1"
              />
              <button
                type="button"
                disabled={sendingTestEmail}
                onClick={handleSendTestInvitationEmail}
                className="h-8 px-3 text-xs font-medium rounded-md bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white whitespace-nowrap"
              >
                {sendingTestEmail ? "Sending..." : "Send Test Email"}
              </button>
            </div>
          </div>
        )}
      </Section>
    );
      })()
    ),
    footer: (
      <Section 
        key="footer"
        title="Footer" 
        icon={<Globe className="h-4 w-4" />}
        {...sectionProps('footer')}
      >
        <SectionBgField sectionKey="footer" value={data.sectionBg?.['footer'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show footer CTA</Label>
          <Switch
            checked={data.footer.enabled}
            onCheckedChange={(v) => update("footer", { enabled: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Title</Label>
          <Input value={data.footer.cta.title} onChange={(e) => update("footer", { cta: { ...data.footer.cta, title: e.target.value } })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Subtitle</Label>
          <Textarea value={data.footer.cta.subtitle} onChange={(e) => update("footer", { cta: { ...data.footer.cta, subtitle: e.target.value } })} rows={2} className="text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Text</Label>
          <Input value={data.footer.cta.ctaButtonText} onChange={(e) => update("footer", { cta: { ...data.footer.cta, ctaButtonText: e.target.value } })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Action</Label>
          <select
            value={data.footer.cta.ctaButtonAction}
            onChange={(e) => update("footer", { cta: { ...data.footer.cta, ctaButtonAction: e.target.value as "invitation" | "url" } })}
            className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs mt-1"
          >
            <option value="invitation">Open Request Invitation Form</option>
            <option value="url">Redirect to Custom URL</option>
          </select>
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Link</Label>
          <Input value={data.footer.cta.ctaButtonLink} onChange={(e) => update("footer", { cta: { ...data.footer.cta, ctaButtonLink: e.target.value } })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" placeholder={data.footer.cta.ctaButtonAction === "url" ? "https://example.com" : "#register"} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show CTA button</Label>
          <Switch
            checked={data.footer.cta.showCtaButton ?? true}
            onCheckedChange={(v) => update("footer", { cta: { ...data.footer.cta, showCtaButton: v } })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Copyright</Label>
          <Input value={data.footer.copyright} onChange={(e) => update("footer", { copyright: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Footer Links</Label>
          {data.footer.links.map((link, i) => (
            <div key={i} className="flex gap-1 mt-1">
              <Input value={link.label} onChange={(e) => {
                const arr = [...data.footer.links]; arr[i] = { ...arr[i], label: e.target.value }; update("footer", { links: arr });
              }} className="h-8 text-xs bg-gray-50 border-gray-200 w-28" placeholder="Label" />
              <Input value={link.url} onChange={(e) => {
                const arr = [...data.footer.links]; arr[i] = { ...arr[i], url: e.target.value }; update("footer", { links: arr });
              }} className="h-8 text-xs bg-gray-50 border-gray-200 flex-1" placeholder="URL" />
              <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
                update("footer", { links: data.footer.links.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => update("footer", { links: [...data.footer.links, { label: "", url: "#" }] })}>
            <Plus className="h-3 w-3 mr-1" /> Add Link
          </Button>
        </div>
      </Section>
    ),
    faq: (
      <Section
        key="faq"
        title="FAQ Section"
        icon={<HelpCircle className="h-4 w-4" />}
        {...sectionProps('faq')}
      >
        <SectionBgField sectionKey="faq" value={data.sectionBg?.['faq'] || ''} onChange={updateSectionBg} />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enabled</Label>
          <Switch
            checked={data.faq?.enabled ?? true}
            onCheckedChange={(v) => update("faq", { enabled: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.faq?.title ?? ''} onChange={(e) => update("faq", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.faq?.subtitle ?? ''} onChange={(e) => update("faq", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {(data.faq?.items ?? []).map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Q {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                update("faq", { items: (data.faq?.items ?? []).filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={item.question}
              onChange={(e) => {
                const arr = [...(data.faq?.items ?? [])];
                arr[i] = { ...arr[i], question: e.target.value };
                update("faq", { items: arr });
              }}
              className="h-8 text-xs bg-white border-gray-200"
              placeholder="Question"
            />
            <Textarea
              value={item.answer}
              onChange={(e) => {
                const arr = [...(data.faq?.items ?? [])];
                arr[i] = { ...arr[i], answer: e.target.value };
                update("faq", { items: arr });
              }}
              rows={2}
              className="text-xs bg-white border-gray-200"
              placeholder="Answer"
            />
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("faq", { items: [...(data.faq?.items ?? []), { question: "", answer: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Question
        </Button>
      </Section>
    ),
  };

  const newContentBlockDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(NEW_BLOCK_DND_TYPE, "__newContentBlock");
    e.dataTransfer.effectAllowed = "copy";
    const ghost = document.createElement("div");
    ghost.textContent = "New Content Block";
    Object.assign(ghost.style, {
      position: "fixed",
      top: "-100px",
      left: "-100px",
      padding: "6px 14px",
      background: "#7c3aed",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "600",
      borderRadius: "8px",
      pointerEvents: "none",
      zIndex: "9999",
    } as CSSStyleDeclaration);
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 16, 16);
    dragGhostRef.current = ghost;
  };

  return (
    <TemplateEditorCtx.Provider value={{ data, onChange }}>
      <div className="space-y-3 p-1">
        <AddElementMenu
          deletedSections={data.deletedSections || []}
          onRestoreSection={restoreSection}
          onAddContentBlock={addContentBlock}
          onAddRichBlock={onAddRichBlock}
        />

        {/* ===== Blocks palette — drag chips onto the canvas (Elementor-style) ===== */}
        <div className="border border-gray-200 rounded-xl bg-white p-3">
          <p className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5 mb-1">
            <ArrowUpDown className="h-3.5 w-3.5 text-violet-500" /> Blocks
          </p>
          <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
            Drag a block onto the canvas to position it, or click to edit. Grayed-out blocks are hidden; dashed ones were deleted — click to bring one back.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(CANONICAL_SECTIONS as readonly string[])
              // Dynamic rich blocks are created via the Elements-tab drag
              // path (or the canvas "+" popup), not re-added from this
              // fixed-sections palette — they're managed entirely on the
              // canvas via their own floating toolbar. Iterates the full
              // canonical list (not just sectionOrder) so a deleted section's
              // chip stays here as the only way back in.
              .filter((key) => key !== "richContent")
              .map((key) => {
                const isDeleted = (data.deletedSections || []).includes(key);
                const isVisible = !isDeleted && getSectionVisibility(data, key);
                return (
                  <div
                    key={key}
                    draggable={!isDeleted}
                    onDragStart={isDeleted ? undefined : handleGripDragStart(key)}
                    onDragEnd={cleanupDrag}
                    onClick={() => {
                      if (isDeleted) restoreSection(key);
                      else onSelectSection?.(key);
                    }}
                    title={
                      isDeleted
                        ? `${SECTION_LABELS[key] || key} — deleted, click to restore`
                        : `${SECTION_LABELS[key] || key} — drag to canvas or click to edit`
                    }
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-medium select-none [-webkit-user-drag:element] transition ${
                      isDeleted
                        ? "cursor-pointer border-dashed border-red-200 bg-red-50/50 text-red-400 hover:border-red-300 hover:bg-red-50"
                        : `cursor-grab active:cursor-grabbing ${
                            isVisible
                              ? "border-gray-200 bg-gray-50 text-gray-700 hover:border-violet-300 hover:bg-violet-50"
                              : "border-dashed border-gray-300 bg-white text-gray-400 hover:border-violet-300"
                          }`
                    }`}
                  >
                    <GripVertical className="h-3 w-3 text-gray-300 flex-shrink-0" />
                    <span className="truncate flex-1">{SECTION_LABELS[key] || key}</span>
                    {isDeleted ? (
                      <Trash2 className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      !isVisible && <EyeOff className="h-3 w-3 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            <div
              draggable
              onDragStart={newContentBlockDragStart}
              onDragEnd={cleanupDrag}
              onClick={addContentBlock}
              title="New content block — drag to canvas or click to add"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-semibold cursor-grab active:cursor-grabbing select-none [-webkit-user-drag:element] hover:bg-violet-100 transition"
            >
              <Plus className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Content Block</span>
            </div>
          </div>
        </div>

        {sectionComponents.colors}
        {sectionComponents.floatingButton}
        {sectionOrder
          .filter((key) => !(key === "richContent" && hideLegacyRichContent))
          .map(key => sectionComponents[key])
          .filter(Boolean)}
      </div>
    </TemplateEditorCtx.Provider>
  );
}

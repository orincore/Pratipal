"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { YoutubeEmbed } from "@/lib/tiptap/extensions/youtube-embed";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import FontFamily from "@tiptap/extension-font-family";
import { FontSize } from "@/lib/tiptap/extensions/font-size";
import { FONT_OPTIONS } from "@/lib/fonts";
import {
  CustomButton,
  DEFAULT_BUTTON_ATTRS,
  type ButtonAttrs,
} from "@/lib/tiptap/extensions/custom-button";
import { ResizableImage } from "@/lib/tiptap/extensions/resizable-image";
import {
  TwoColumnSection,
  ColumnMedia,
  ColumnContent,
  DEFAULT_TWO_COL_ATTRS,
  type TwoColumnAttrs,
} from "@/lib/tiptap/extensions/two-column";
import {
  PageSection,
  DEFAULT_SECTION_ATTRS,
  type PageSectionAttrs,
} from "@/lib/tiptap/extensions/page-section";
import {
  LeadForm,
  DEFAULT_LEAD_FORM_ATTRS,
  type LeadFormAttrs,
} from "@/lib/tiptap/extensions/lead-form";
import {
  FlexboxContainer,
  FlexItem,
  GridContainer,
  GridItem,
  DEFAULT_FLEXBOX_ATTRS,
  DEFAULT_FLEX_ITEM_ATTRS,
  DEFAULT_GRID_ATTRS,
  DEFAULT_GRID_ITEM_ATTRS,
  type FlexboxAttrs,
  type FlexItemAttrs,
  type GridAttrs,
  type GridItemAttrs,
} from "@/lib/tiptap/extensions/flex-grid";
import { FeatureGrid, DEFAULT_FEATURE_ITEM } from "@/lib/tiptap/extensions/feature-grid";
import { StatsRow, DEFAULT_STAT_ITEM } from "@/lib/tiptap/extensions/stats-row";
import { FaqAccordion, DEFAULT_FAQ_ITEM } from "@/lib/tiptap/extensions/faq-accordion";
import { TestimonialCards, DEFAULT_TESTIMONIAL_ITEM } from "@/lib/tiptap/extensions/testimonial-cards";
import { MarqueeStrip } from "@/lib/tiptap/extensions/marquee-strip";
import { ImageGallery, DEFAULT_GALLERY_ITEM } from "@/lib/tiptap/extensions/image-gallery";
import {
  DEFAULT_CONTENT_SETTINGS,
  normalizeLandingContent,
  type LandingContent,
  type LandingContentSettings,
} from "@/lib/tiptap/content";
import { LandingTemplate, type TemplateEditorBridge, autoScrollCanvasDuringDrag, RICH_ELEMENT_DND_TYPE, isLegacyRichContentEmpty } from "@/components/storefront/landing-template";
import { TemplateEditor } from "./template-editor";
import type { LandingTemplateData, RichBlockEntry } from "@/lib/template-types";
import {
  CANONICAL_SECTIONS,
  SECTION_LABELS,
  resolveSectionOrder,
  getSectionVisibility,
  applySectionVisibility,
  getSectionLabel,
  isRichBlockKey,
  richBlockId,
} from "@/lib/template-types";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Upload,
  Highlighter,
  Palette,
  Pilcrow,
  Code2,
  MousePointerClick,
  X,
  ChevronRight,
  PanelLeftDashed,
  PanelRightDashed,
  Layers,
  Type,
  LayoutGrid,
  Columns,
  Maximize2,
  Paintbrush,
  Trash2,
  Replace,
  ArrowDownToLine,
  ArrowLeft,
  Copy,
  LayoutTemplate,
  RemoveFormatting,
  WrapText,
  FormInput,
  Sparkles,
  BarChart3,
  HelpCircle,
  MessageSquare,
  Images,
  Plus,
  StretchHorizontal,
  Grid3x3,
  Scissors,
  ClipboardPaste,
  ClipboardCopy,
  MoveUp,
  MoveDown,
  SlidersHorizontal,
  Baseline,
  CornerDownLeft,
  MousePointer2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RichEditorProps {
  content: LandingContent;
  onChange: (content: LandingContent) => void;
  themeColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  templateData?: any;
  setTemplateData?: any;
  landingPageId?: string;
  pageSlug?: string;
}

// ---------------------------------------------------------------------------
// Left Panel Section Component
// ---------------------------------------------------------------------------

function PanelSection({
  title,
  icon,
  defaultOpen = false,
  children,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors group"
      >
        <span className="text-gray-400 group-hover:text-gray-600 transition-colors">{icon}</span>
        <span className="text-[13px] font-medium text-gray-700 flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">
            {badge}
          </span>
        )}
        <ChevronRight
          className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-3 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Color Picker Row
// ---------------------------------------------------------------------------

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <div className="relative">
          <input
            type="color"
            value={value === "transparent" ? "#ffffff" : value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="h-8 w-8 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
            style={{ backgroundColor: value === "transparent" ? "#ffffff" : value }}
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs font-mono flex-1 bg-gray-50 border-gray-200"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segmented Control
// ---------------------------------------------------------------------------

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 h-7 text-[11px] font-medium rounded-md transition-all ${
            value === opt.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Insert Widget Button
// ---------------------------------------------------------------------------

function WidgetButton({
  icon,
  label,
  onClick,
  color = "gray",
  dragType,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
  // When set, the widget can also be dragged onto the canvas and dropped at
  // an exact position in the rich content (Elementor-style).
  dragType?: string;
}) {
  const colorClasses: Record<string, string> = {
    gray: "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200",
    violet: "bg-violet-50 hover:bg-violet-100 text-violet-600 border-violet-200",
    blue: "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200",
    green: "bg-green-50 hover:bg-green-100 text-green-600 border-green-200",
    amber: "bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200",
    rose: "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      draggable={!!dragType}
      onDragStart={
        dragType
          ? (e) => {
              e.dataTransfer.setData(RICH_ELEMENT_DND_TYPE, dragType);
              e.dataTransfer.effectAllowed = "copy";
            }
          : undefined
      }
      title={dragType ? `${label} — click to insert, or drag onto the canvas` : label}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-sm active:scale-[0.98] ${
        dragType ? "cursor-grab active:cursor-grabbing select-none [-webkit-user-drag:element]" : ""
      } ${colorClasses[color] || colorClasses.gray}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Array items editor — generic add / remove / edit for a block's items[]
// ---------------------------------------------------------------------------

interface ItemFieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
}

function ArrayItemsEditor({
  items,
  onChange,
  fields,
  makeDefault,
  addLabel,
}: {
  items: any[];
  onChange: (items: any[]) => void;
  fields: ItemFieldDef[];
  makeDefault: () => any;
  addLabel: string;
}) {
  const list = Array.isArray(items) ? items : [];
  const updateField = (index: number, key: string, value: string) =>
    onChange(list.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  const removeItem = (index: number) => onChange(list.filter((_, i) => i !== index));
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {list.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Item {i + 1}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"
                title="Move up"
              >
                <ChevronRight className="h-3.5 w-3.5 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === list.length - 1}
                className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"
                title="Move down"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="h-6 w-6 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                title="Remove item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {fields.map((f) =>
            f.type === "textarea" ? (
              <Textarea
                key={f.key}
                value={item[f.key] ?? ""}
                onChange={(e) => updateField(i, f.key, e.target.value)}
                placeholder={f.placeholder || f.label}
                rows={2}
                className="text-xs bg-white border-gray-200 resize-none"
              />
            ) : (
              <Input
                key={f.key}
                value={item[f.key] ?? ""}
                onChange={(e) => updateField(i, f.key, e.target.value)}
                placeholder={f.placeholder || f.label}
                className="h-8 text-xs bg-white border-gray-200"
              />
            )
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, makeDefault()])}
        className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-dashed border-violet-300 bg-violet-50 text-violet-600 text-[11px] font-medium hover:bg-violet-100 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contextual editor for the selected content block (feature grid, stats, …)
// ---------------------------------------------------------------------------

function ContentBlockPanel({
  block,
  onAttr,
  onItems,
  onDelete,
}: {
  block: { type: string; attrs: any };
  onAttr: (key: string, value: any) => void;
  onItems: (items: any[]) => void;
  onDelete: () => void;
}) {
  const a = block.attrs || {};
  const removeBtn = (
    <button
      type="button"
      onClick={onDelete}
      className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" /> Remove Block
    </button>
  );

  const HeadingField = (
    <div>
      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Heading</Label>
      <Input value={a.heading ?? ""} onChange={(e) => onAttr("heading", e.target.value)} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
    </div>
  );

  const ColumnsField = (
    <div>
      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Columns</Label>
      <SegmentedControl
        options={[{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]}
        value={String(a.columns ?? 3)}
        onChange={(v) => onAttr("columns", Number(v))}
      />
    </div>
  );

  if (block.type === "featureGrid") {
    return (
      <div className="space-y-3">
        {removeBtn}
        {HeadingField}
        <div>
          <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Subheading</Label>
          <Input value={a.subheading ?? ""} onChange={(e) => onAttr("subheading", e.target.value)} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {ColumnsField}
        <ColorRow label="Accent" value={a.accentColor ?? "#7c3aed"} onChange={(v) => onAttr("accentColor", v)} />
        <ColorRow label="Card Background" value={a.cardBackground ?? "#ffffff"} onChange={(v) => onAttr("cardBackground", v)} />
        <ColorRow label="Section Background" value={a.backgroundColor ?? "transparent"} onChange={(v) => onAttr("backgroundColor", v)} />
        <div>
          <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Features</Label>
          <ArrayItemsEditor
            items={a.items}
            onChange={onItems}
            makeDefault={() => ({ ...DEFAULT_FEATURE_ITEM })}
            addLabel="Add feature"
            fields={[
              { key: "icon", label: "Icon (emoji)", placeholder: "✨ emoji" },
              { key: "title", label: "Title" },
              { key: "description", label: "Description", type: "textarea" },
            ]}
          />
        </div>
      </div>
    );
  }

  if (block.type === "statsRow") {
    return (
      <div className="space-y-3">
        {removeBtn}
        <ColorRow label="Value Color" value={a.valueColor ?? "#7c3aed"} onChange={(v) => onAttr("valueColor", v)} />
        <ColorRow label="Label Color" value={a.labelColor ?? "#6b7280"} onChange={(v) => onAttr("labelColor", v)} />
        <ColorRow label="Section Background" value={a.backgroundColor ?? "transparent"} onChange={(v) => onAttr("backgroundColor", v)} />
        <div>
          <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Stats</Label>
          <ArrayItemsEditor
            items={a.items}
            onChange={onItems}
            makeDefault={() => ({ ...DEFAULT_STAT_ITEM })}
            addLabel="Add stat"
            fields={[
              { key: "value", label: "Value", placeholder: "e.g. 10k+" },
              { key: "label", label: "Label", placeholder: "e.g. Members" },
            ]}
          />
        </div>
      </div>
    );
  }

  if (block.type === "faqAccordion") {
    return (
      <div className="space-y-3">
        {removeBtn}
        {HeadingField}
        <ColorRow label="Accent" value={a.accentColor ?? "#7c3aed"} onChange={(v) => onAttr("accentColor", v)} />
        <ColorRow label="Card Background" value={a.cardBackground ?? "#ffffff"} onChange={(v) => onAttr("cardBackground", v)} />
        <ColorRow label="Section Background" value={a.backgroundColor ?? "transparent"} onChange={(v) => onAttr("backgroundColor", v)} />
        <div>
          <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Questions</Label>
          <ArrayItemsEditor
            items={a.items}
            onChange={onItems}
            makeDefault={() => ({ ...DEFAULT_FAQ_ITEM })}
            addLabel="Add question"
            fields={[
              { key: "question", label: "Question" },
              { key: "answer", label: "Answer", type: "textarea" },
            ]}
          />
        </div>
      </div>
    );
  }

  if (block.type === "testimonialCards") {
    return (
      <div className="space-y-3">
        {removeBtn}
        {HeadingField}
        {ColumnsField}
        <ColorRow label="Accent" value={a.accentColor ?? "#7c3aed"} onChange={(v) => onAttr("accentColor", v)} />
        <ColorRow label="Card Background" value={a.cardBackground ?? "#ffffff"} onChange={(v) => onAttr("cardBackground", v)} />
        <ColorRow label="Section Background" value={a.backgroundColor ?? "transparent"} onChange={(v) => onAttr("backgroundColor", v)} />
        <div>
          <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Testimonials</Label>
          <ArrayItemsEditor
            items={a.items}
            onChange={onItems}
            makeDefault={() => ({ ...DEFAULT_TESTIMONIAL_ITEM })}
            addLabel="Add testimonial"
            fields={[
              { key: "quote", label: "Quote", type: "textarea" },
              { key: "name", label: "Name" },
              { key: "role", label: "Role / title" },
              { key: "avatar", label: "Avatar URL (optional)" },
            ]}
          />
        </div>
      </div>
    );
  }

  if (block.type === "marqueeStrip") {
    const text = Array.isArray(a.items) ? a.items.join("\n") : "";
    return (
      <div className="space-y-3">
        {removeBtn}
        <ColorRow label="Background" value={a.backgroundColor ?? "#7c3aed"} onChange={(v) => onAttr("backgroundColor", v)} />
        <ColorRow label="Text Color" value={a.textColor ?? "#ffffff"} onChange={(v) => onAttr("textColor", v)} />
        <div>
          <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Speed (seconds)</Label>
          <Input
            type="number"
            min={4}
            value={a.speed ?? 25}
            onChange={(e) => onAttr("speed", Number(e.target.value) || 25)}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Items (one per line)</Label>
          <Textarea
            value={text}
            onChange={(e) => onItems(e.target.value.split("\n"))}
            rows={4}
            className="text-xs mt-1 bg-gray-50 border-gray-200 resize-none"
            placeholder={"Limited spots\n100% satisfaction\nTrusted by thousands"}
          />
        </div>
      </div>
    );
  }

  if (block.type === "imageGallery") {
    return (
      <div className="space-y-3">
        {removeBtn}
        {HeadingField}
        {ColumnsField}
        <div>
          <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Corner Radius (px)</Label>
          <Input
            type="number"
            min={0}
            value={a.rounded ?? 16}
            onChange={(e) => onAttr("rounded", Number(e.target.value) || 0)}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <ColorRow label="Section Background" value={a.backgroundColor ?? "transparent"} onChange={(v) => onAttr("backgroundColor", v)} />
        <div>
          <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Images</Label>
          <ArrayItemsEditor
            items={a.items}
            onChange={onItems}
            makeDefault={() => ({ ...DEFAULT_GALLERY_ITEM })}
            addLabel="Add image"
            fields={[
              { key: "url", label: "Image URL", placeholder: "https://…" },
              { key: "caption", label: "Caption (optional)" },
            ]}
          />
        </div>
      </div>
    );
  }

  return null;
}

// Atom content-block node types that share the consolidated block panel.
const CONTENT_BLOCK_TYPES = [
  "featureGrid",
  "statsRow",
  "faqAccordion",
  "testimonialCards",
  "marqueeStrip",
  "imageGallery",
];

const BLOCK_PANEL_LABELS: Record<string, string> = {
  featureGrid: "Feature Grid",
  statsRow: "Stats",
  faqAccordion: "FAQ",
  testimonialCards: "Testimonials",
  marqueeStrip: "Marquee",
  imageGallery: "Gallery",
};

// ---------------------------------------------------------------------------
// Right-click context menu — element/block detection
// ---------------------------------------------------------------------------

// Human labels for every node type the context menu can select as a "block".
const CTX_ELEMENT_LABELS: Record<string, string> = {
  image: "Image",
  customButton: "Button",
  leadForm: "Form",
  youtube: "Video",
  twoColumnSection: "Two-Column",
  pageSection: "Section",
  flexboxContainer: "Flexbox",
  gridContainer: "Grid",
  blockquote: "Quote",
  codeBlock: "Code Block",
  horizontalRule: "Divider",
  featureGrid: "Feature Grid",
  statsRow: "Stats",
  faqAccordion: "FAQ",
  testimonialCards: "Testimonials",
  marqueeStrip: "Marquee",
  imageGallery: "Gallery",
};

// Leaf/atom elements that sit directly under the click and always open the
// block menu (they carry no free-flowing text of their own to format).
const CTX_ATOM_TYPES = new Set([
  "image",
  "customButton",
  "leadForm",
  "youtube",
  "horizontalRule",
  ...CONTENT_BLOCK_TYPES,
]);

// Layout containers walked from the click's ancestors. Right-clicking their
// empty (non-text) area opens the block menu; right-clicking their text still
// opens the text menu but offers "Select <container>" shortcuts.
const CTX_CONTAINER_TYPES = new Set([
  "twoColumnSection",
  "pageSection",
  "flexboxContainer",
  "gridContainer",
  "blockquote",
  "codeBlock",
]);

// Swatches offered inline in the text menu.
const CTX_TEXT_COLORS = [
  "#111827",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#7c3aed",
  "#ec4899",
  "#ffffff",
];
const CTX_HIGHLIGHT_COLORS = [
  "#FEF08A",
  "#BBF7D0",
  "#BFDBFE",
  "#FBCFE8",
  "#FED7AA",
  "#E9D5FF",
];

// Font sizes (px) offered in the text menu's "Text size" row.
const CTX_FONT_SIZES = [
  11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 100,
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RichEditor({
  content,
  onChange,
  themeColors,
  templateData,
  setTemplateData,
  landingPageId,
  pageSlug,
}: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const suppressNextUpdate = useRef(false);
  // Snapshot of the doc JSON we last emitted upward via onChange. The parent
  // echoes it straight back as the `content` prop (a new object each time),
  // which would otherwise make the "sync external content" effect below
  // think a fresh external doc arrived and call setContent — wiping the live
  // selection out from under whatever the user is mid-editing. Comparing
  // against this snapshot instead of a freshly-computed editor.getJSON()
  // lets us tell "our own echo" apart from a genuinely external content swap
  // (e.g. switching pages) even when React's state updates lag the rapid
  // transactions a slider drag or fast typing produces.
  const lastEmittedDocJson = useRef<string | null>(null);

  // -------------------------------------------------------------------------
  // Multiple rich blocks: exactly one live/editable TipTap doc at a time.
  // `focusedRichBlockId` is null when the live editor is bound to the legacy
  // singleton `richContent` doc (the `content` prop, unchanged default
  // behavior); otherwise it's the id of whichever dynamic block
  // (`templateData.richBlocks`) is currently focused. The ref mirrors the
  // state so onUpdate/emitChange — closures baked into useEditor's config —
  // always write to whichever block is *currently* focused, never a value
  // stale from the render that created the closure.
  // -------------------------------------------------------------------------
  const [focusedRichBlockId, setFocusedRichBlockId] = useState<string | null>(null);
  const focusedBlockIdRef = useRef<string | null>(null);
  // Set right after creating a brand-new (empty) block that a dropped widget
  // should be seeded into — consumed by an effect once the editor's content
  // actually reflects that fresh empty doc (see the effect after
  // insertElementByType below).
  const [pendingSeedElementType, setPendingSeedElementType] = useState<string | null>(null);

  // The doc the live editor should currently hold: a focused dynamic block's
  // own doc, or the legacy singleton `content.doc` when nothing is focused.
  const activeDoc = useMemo(() => {
    if (focusedRichBlockId) {
      return (templateData?.richBlocks || []).find((b: RichBlockEntry) => b.id === focusedRichBlockId)?.content?.doc;
    }
    return content?.doc;
  }, [focusedRichBlockId, templateData?.richBlocks, content?.doc]);

  // Layout / page-level settings
  const [settings, setSettings] = useState<LandingContentSettings>(() => ({
    ...DEFAULT_CONTENT_SETTINGS,
    ...(content?.settings ?? {}),
  }));

  // Inline color pickers
  const [textColor, setTextColor] = useState(themeColors?.primary ?? "#111827");
  const [hlColor, setHlColor] = useState("#FFF3BF");

  // Button editor panel
  const [showBtnPanel, setShowBtnPanel] = useState(false);
  const [btnAttrs, setBtnAttrs] = useState<ButtonAttrs>({ ...DEFAULT_BUTTON_ATTRS });

  // Image editor panel
  const [showImgPanel, setShowImgPanel] = useState(false);
  const [imgWidth, setImgWidth] = useState("100%");
  const [imgAlign, setImgAlign] = useState<"left" | "center" | "right">("center");
  const [imgHeight, setImgHeight] = useState("auto");
  const [imgAspectRatio, setImgAspectRatio] = useState("auto");
  const [imgBorderRadius, setImgBorderRadius] = useState(12);
  const [imgShadow, setImgShadow] = useState("none");
  const [imgOpacity, setImgOpacity] = useState(100);
  const [imgObjectFit, setImgObjectFit] = useState("cover");
  const [imgObjectPosition, setImgObjectPosition] = useState("center");
  const [imgMarginTop, setImgMarginTop] = useState(24);
  const [imgMarginBottom, setImgMarginBottom] = useState(24);
  const [imgHoverEffect, setImgHoverEffect] = useState("none");

  // Section background image upload state refs
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  // Two-column section panel
  const [showTwoColPanel, setShowTwoColPanel] = useState(false);
  const [twoColAttrs, setTwoColAttrs] = useState<TwoColumnAttrs>({ ...DEFAULT_TWO_COL_ATTRS });

  // Page section panel
  const [showSectionPanel, setShowSectionPanel] = useState(false);
  const [sectionAttrs, setSectionAttrs] = useState<PageSectionAttrs>({ ...DEFAULT_SECTION_ATTRS });

  // Flexbox / Grid layout panels. Cell info tracks which cell of the
  // container the cursor currently sits in ("Cell 2 of 3") so the panel can
  // edit that cell's own sizing alongside the container settings.
  const [showFlexPanel, setShowFlexPanel] = useState(false);
  const [flexAttrs, setFlexAttrs] = useState<FlexboxAttrs>({ ...DEFAULT_FLEXBOX_ATTRS });
  const [flexItemAttrs, setFlexItemAttrs] = useState<FlexItemAttrs>({ ...DEFAULT_FLEX_ITEM_ATTRS });
  const [flexCellInfo, setFlexCellInfo] = useState<{ index: number; count: number } | null>(null);
  const [showGridPanel, setShowGridPanel] = useState(false);
  const [gridAttrs, setGridAttrs] = useState<GridAttrs>({ ...DEFAULT_GRID_ATTRS });
  const [gridItemAttrs, setGridItemAttrs] = useState<GridItemAttrs>({ ...DEFAULT_GRID_ITEM_ATTRS });
  const [gridCellInfo, setGridCellInfo] = useState<{ index: number; count: number } | null>(null);

  // Exact document positions of the currently-targeted flex/grid cell and
  // container. Property edits patch the node at these positions rather than
  // "the nearest one to the live selection" — sidebar inputs blur the editor
  // and the selection can drift (or land in a sibling/nested container), which
  // is what made cell/container edits leak onto the wrong element. Refs (not
  // state) so the latest value is always readable inside the update callbacks
  // without stale closures, and without re-rendering on every selection.
  const flexItemPosRef = useRef<number | null>(null);
  const gridItemPosRef = useRef<number | null>(null);
  const flexContainerPosRef = useRef<number | null>(null);
  const gridContainerPosRef = useRef<number | null>(null);

  // Lead form panel
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [formAttrs, setFormAttrs] = useState<LeadFormAttrs>({ ...DEFAULT_LEAD_FORM_ATTRS });

  // YouTube video panel
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoWidth, setVideoWidth] = useState("100%");
  const [videoAlign, setVideoAlign] = useState<"left" | "center" | "right">("center");
  const [videoAutoplay, setVideoAutoplay] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  // Content blocks (feature grid, stats, FAQ, testimonials, marquee, gallery).
  // These share one consolidated "active block" panel keyed off the selected
  // node's type — far less boilerplate than per-block state.
  const [activeBlock, setActiveBlock] = useState<{ type: string; attrs: any } | null>(null);

  // -------------------------------------------------------------------------
  // Right-click context menu. `mode: "text"` shows the full inline text-editor
  // menu (formatting, headings, alignment, lists, links, colors, clipboard);
  // `mode: "block"` shows the element/block menu (edit, replace, duplicate,
  // move, convert, delete). `element` is populated in block mode with the
  // selected node's type so the menu can offer the type-specific actions.
  // -------------------------------------------------------------------------
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    mode: "text" | "block";
    element?: { type: string; label: string; pos: number };
    // Whether the caret/selection sits inside a container we can "select up" to.
    containers?: { type: string; label: string; pos: number }[];
    hasSelection?: boolean;
  } | null>(null);

  // Whether the Elements tab is showing a selected element's properties
  // (replacing the Insert Elements grid) instead of the grid itself. This is
  // deliberately its own bit of state rather than something re-derived from
  // the live selection on every transaction: attribute edits (typing, color
  // pickers, slider drags) dispatch ProseMirror transactions that can
  // transiently report no matching node mid-update, and re-deriving from
  // that would slam the properties view shut while the user is still
  // editing. It only opens on a genuine new element selection and only
  // closes via the explicit Back button (see closeElementProperties).
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  // Left panel active tab (or Template tab for unified layouts)
  const [activeTab, setActiveTab] = useState<"widgets" | "style" | "template">(
    templateData ? "template" : "widgets"
  );

  // -------------------------------------------------------------------------
  // Template canvas editing (Elementor-style) — selection, reordering,
  // visibility and block insertion, shared between the canvas overlay and the
  // Template sidebar.
  // -------------------------------------------------------------------------
  const [selectedTplSection, setSelectedTplSection] = useState<string | null>(null);
  // Bumped on every canvas selection so the sidebar re-opens/scrolls to the
  // section card even when re-selecting the same section.
  const [tplFocusNonce, setTplFocusNonce] = useState(0);

  const selectTplSection = useCallback((key: string) => {
    setSelectedTplSection(key);
    setTplFocusNonce((n) => n + 1);
    setActiveTab("template");
    // Bring the section into view on the canvas ("nearest" = no jump when the
    // click originated on the canvas itself).
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-section-shell="${key}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  // The single function every focus-swap goes through: pass a dynamic
  // block's id to make it live, or null to return focus to the legacy
  // singleton `richContent` doc. `seedElementType`, when given, queues a
  // freshly-dropped widget to be inserted into the (empty) block once its
  // doc is actually live — see the pendingSeedElementType effect below.
  const focusRichBlock = useCallback(
    (blockId: string | null, opts?: { seedElementType?: string; settingsOverride?: LandingContentSettings }) => {
      if (focusedBlockIdRef.current === blockId && !opts?.seedElementType) return;
      focusedBlockIdRef.current = blockId;
      setFocusedRichBlockId(blockId);
      // Forces the content-sync effect to apply the new block's doc even if
      // it happens to JSON-match whatever was last emitted for the
      // previously-focused block (very plausible for two fresh empty docs).
      lastEmittedDocJson.current = null;
      // setContent (used by the sync effect) doesn't fire onUpdate/
      // onSelectionUpdate, so stale widget-property panels from the
      // previously-focused block would otherwise persist against the new
      // content — every focus swap must explicitly close them.
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      closeElementProperties();
      // `settingsOverride` lets a caller that just created the block (e.g.
      // insertRichBlockAt) pass its settings directly — reading them back
      // off `templateData.richBlocks` here would use this render's stale
      // closure, from BEFORE the synchronous setTemplateData call that
      // added the block, and silently fall back to DEFAULT_CONTENT_SETTINGS.
      const blockSettings = opts?.settingsOverride
        ?? (blockId
          ? (templateData?.richBlocks || []).find((b: RichBlockEntry) => b.id === blockId)?.content?.settings
          : content?.settings);
      setSettings({ ...DEFAULT_CONTENT_SETTINGS, ...(blockSettings ?? {}) });
      if (opts?.seedElementType) setPendingSeedElementType(opts.seedElementType);
    },
    // closeElementProperties is intentionally omitted: it's declared later
    // in this component and is only ever invoked from inside this callback
    // body (deferred), never read at definition time, so it's safe to omit
    // — matching the existing `editor` omission pattern a few effects down.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templateData, content?.settings]
  );

  const moveTplSectionTo = useCallback(
    (key: string, gapIndex: number) => {
      if (!templateData || !setTemplateData) return;
      const order = resolveSectionOrder(templateData.sectionOrder, templateData.deletedSections);
      const from = order.indexOf(key);
      if (from === -1) return;
      const newOrder = [...order];
      newOrder.splice(from, 1);
      const target = Math.max(0, Math.min(newOrder.length, gapIndex > from ? gapIndex - 1 : gapIndex));
      newOrder.splice(target, 0, key);
      // Dropping a block onto the canvas means "I want it on the page" — so a
      // hidden block dragged in from the palette becomes visible.
      const next = applySectionVisibility(templateData, key, true);
      setTemplateData({ ...next, sectionOrder: newOrder });
    },
    [templateData, setTemplateData]
  );

  const moveTplSection = useCallback(
    (key: string, dir: -1 | 1) => {
      if (!templateData || !setTemplateData) return;
      const order = resolveSectionOrder(templateData.sectionOrder, templateData.deletedSections);
      const i = order.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return;
      const newOrder = [...order];
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
      setTemplateData({ ...templateData, sectionOrder: newOrder });
    },
    [templateData, setTemplateData]
  );

  const toggleTplVisibility = useCallback(
    (key: string) => {
      if (!templateData || !setTemplateData) return;
      const nextVisible = !getSectionVisibility(templateData, key);
      // Hiding the block currently being edited would leave the live editor
      // bound to something the canvas no longer renders — return focus to
      // the legacy doc first.
      if (!nextVisible && isRichBlockKey(key) && focusedBlockIdRef.current === richBlockId(key)) {
        focusRichBlock(null);
      }
      setTemplateData(applySectionVisibility(templateData, key, nextVisible));
    },
    [templateData, setTemplateData, focusRichBlock]
  );

  // Creates a brand-new, independent rich-content block at a template-level
  // gap — either empty (the "+" popup's "Rich Content Block (new)" entry)
  // or seeded with one widget (a drag from the Elements tab landing directly
  // between two template sections). Mirrors insertTplBlock's shape.
  const insertRichBlockAt = useCallback(
    (gapIndex: number, seedElementType?: string) => {
      if (!templateData || !setTemplateData) return;
      const id = crypto.randomUUID();
      const sectionKey = `richContent:${id}`;
      // DEFAULT_CONTENT_SETTINGS' paddingY (32px) was sized for the legacy
      // singleton doc — a big, flexible page-body editor meant to hold a
      // lot of content. A new per-widget block starts as just one small
      // widget, and each block's settings are independent (see the Style
      // tab), so give it a tight default instead of inheriting that budget
      // — otherwise the unfocused static-preview rendering (DynamicPageRenderer,
      // which is what most blocks show most of the time) pads out 64px of
      // empty vertical space around a single Heading or Button.
      const newBlock: RichBlockEntry = { id, content: normalizeLandingContent(undefined, { paddingY: 8 }) };
      const order = resolveSectionOrder(templateData.sectionOrder, templateData.deletedSections);
      const newOrder = [...order];
      newOrder.splice(Math.max(0, Math.min(newOrder.length, gapIndex)), 0, sectionKey);
      setTemplateData({
        ...templateData,
        richBlocks: [...(templateData.richBlocks || []), newBlock],
        sectionOrder: newOrder,
      });
      setSelectedTplSection(sectionKey);
      setTplFocusNonce((n) => n + 1);
      // Deliberately does NOT switch to the Template tab (unlike
      // insertTplBlock) — dynamic rich blocks have no settings card there
      // (see the sidebar palette filter in template-editor.tsx), and a drop
      // from the Elements tab should keep the user right where they are.
      // settingsOverride passes newBlock's own settings directly — focusRichBlock
      // reading them back off templateData.richBlocks would hit this render's
      // stale closure, from before the setTemplateData call just above lands.
      focusRichBlock(id, { seedElementType, settingsOverride: newBlock.content.settings });
    },
    [templateData, setTemplateData, focusRichBlock]
  );

  // Full delete (not hide) — only dynamic rich blocks get this; fixed
  // template sections and the legacy singleton stay hide/show-only.
  const removeRichBlock = useCallback(
    (sectionKey: string) => {
      if (!templateData || !setTemplateData) return;
      const id = richBlockId(sectionKey);
      const order = resolveSectionOrder(templateData.sectionOrder, templateData.deletedSections).filter((k) => k !== sectionKey);
      setTemplateData({
        ...templateData,
        richBlocks: (templateData.richBlocks || []).filter((b: RichBlockEntry) => b.id !== id),
        sectionOrder: order,
      });
      if (focusedBlockIdRef.current === id) focusRichBlock(null);
      setSelectedTplSection((prev) => (prev === sectionKey ? null : prev));
      toast.success("Rich content block removed");
    },
    [templateData, setTemplateData, focusRichBlock]
  );

  // Full delete (not hide) for a fixed/canonical template section: pulls the
  // key out of sectionOrder and records it in deletedSections so
  // resolveSectionOrder doesn't silently re-append it as "new". The
  // section's own data is left untouched, so restoring it later (via the "+"
  // insert palette, which lists deleted sections alongside hidden ones)
  // brings its old content straight back.
  const deleteTplSection = useCallback(
    (key: string) => {
      if (!templateData || !setTemplateData) return;
      const order = resolveSectionOrder(templateData.sectionOrder, templateData.deletedSections).filter((k) => k !== key);
      setTemplateData({
        ...templateData,
        sectionOrder: order,
        deletedSections: [...new Set([...(templateData.deletedSections || []), key])],
      });
      setSelectedTplSection((prev) => (prev === key ? null : prev));
      toast.success(`${SECTION_LABELS[key] || key} deleted`);
    },
    [templateData, setTemplateData]
  );

  const insertTplBlock = useCallback(
    (key: string, gapIndex: number) => {
      if (key === "__newRichBlock") {
        insertRichBlockAt(gapIndex);
        return;
      }
      if (!templateData || !setTemplateData) return;
      let next: LandingTemplateData = templateData;
      let sectionKey = key;
      if (key === "__newContentBlock") {
        sectionKey = "contentBlocks";
        next = {
          ...next,
          contentBlocks: [
            ...(next.contentBlocks || []),
            {
              enabled: true,
              layout: "media-left" as const,
              mediaType: "image" as const,
              mediaUrl: "",
              textFormat: "plain" as const,
              heading: "New Content Block",
              content: "Write your content here...",
            },
          ],
        };
      } else {
        next = applySectionVisibility(next, key, true);
        // Restoring a previously-deleted section: drop it from deletedSections
        // first so resolveSectionOrder treats it as "new" again and re-appends
        // it, instead of continuing to exclude it.
        if ((next.deletedSections || []).includes(key)) {
          next = { ...next, deletedSections: (next.deletedSections || []).filter((k) => k !== key) };
        }
      }
      const order = resolveSectionOrder(next.sectionOrder, next.deletedSections);
      const from = order.indexOf(sectionKey);
      const newOrder = [...order];
      newOrder.splice(from, 1);
      const target = Math.max(0, Math.min(newOrder.length, gapIndex > from ? gapIndex - 1 : gapIndex));
      newOrder.splice(target, 0, sectionKey);
      setTemplateData({ ...next, sectionOrder: newOrder });
      setSelectedTplSection(sectionKey);
      setTplFocusNonce((n) => n + 1);
      setActiveTab("template");
      toast.success(`${SECTION_LABELS[sectionKey] || sectionKey} added to page`);
    },
    [templateData, setTemplateData, insertRichBlockAt]
  );

  const tplInsertableBlocks = useMemo(() => {
    if (!templateData) return [];
    const deletedSet = new Set(templateData.deletedSections || []);
    const hiddenOrDeleted = (CANONICAL_SECTIONS as readonly string[])
      .filter((k) => k !== "richContent" && (deletedSet.has(k) || !getSectionVisibility(templateData, k)))
      .map((k) => ({ key: k, label: deletedSet.has(k) ? `${SECTION_LABELS[k] || k} (deleted)` : SECTION_LABELS[k] || k }));
    return [
      { key: "__newContentBlock", label: "Content Block (new)" },
      { key: "__newRichBlock", label: "Rich Content Block (new)" },
      ...hiddenOrDeleted,
    ];
  }, [templateData]);

  const tplBridge: TemplateEditorBridge | undefined =
    templateData && setTemplateData
      ? {
          selectedSection: selectedTplSection,
          onSelectSection: selectTplSection,
          onMoveSection: moveTplSection,
          onMoveSectionTo: moveTplSectionTo,
          onToggleVisibility: toggleTplVisibility,
          onInsertBlock: insertTplBlock,
          onDuplicateSection: (key: string) => {
            if (key === "contentBlocks") {
              const order = resolveSectionOrder(templateData.sectionOrder, templateData.deletedSections);
              insertTplBlock("__newContentBlock", order.indexOf("contentBlocks") + 1);
            }
          },
          insertableBlocks: tplInsertableBlocks,
          focusedBlockId: focusedRichBlockId ? `richContent:${focusedRichBlockId}` : "richContent",
          onFocusRichBlock: (key: string) => focusRichBlock(key === "richContent" ? null : richBlockId(key)),
          onInsertRichBlockWithElement: (elementType: string, gapIndex: number) =>
            insertRichBlockAt(gapIndex, elementType),
          onRemoveRichBlock: removeRichBlock,
          onDeleteSection: deleteTplSection,
        }
      : undefined;

  // Propagate content/settings changes upward — routed to whichever rich
  // block is *currently* focused (read from the ref, never a value stale
  // from the render that created this closure), or the legacy page-level
  // `content` prop when nothing dynamic is focused.
  const emitChange = useCallback(
    (doc: any, s: LandingContentSettings) => {
      lastEmittedDocJson.current = JSON.stringify(doc);
      const blockId = focusedBlockIdRef.current;
      if (blockId && templateData && setTemplateData) {
        setTemplateData({
          ...templateData,
          richBlocks: (templateData.richBlocks || []).map((b: RichBlockEntry) =>
            b.id === blockId ? { ...b, content: { doc, settings: s } } : b
          ),
        });
        return;
      }
      onChange({ doc, settings: s });
    },
    [onChange, templateData, setTemplateData]
  );

  // When settings change, emit
  const updateSettings = useCallback(
    (patch: Partial<LandingContentSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        return next;
      });
    },
    []
  );

  // Emit settings changes (debounced via effect)
  useEffect(() => {
    if (!editor) return;
    emitChange(editor.getJSON(), settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Tracks which kind of element was last selected so we only auto-switch the
  // side panel to "Style" on a *new* selection (and not on every caret move).
  const lastElementKindRef = useRef<string | null>(null);
  // While a widget-grid insert is in flight, don't let the resulting
  // selection change auto-open an (ancestor) element's properties panel —
  // that would yank the Insert Elements grid away mid-flow when e.g. a Quote
  // is inserted inside a previously added Section or Two-Column block.
  const suppressPanelRef = useRef(0);
  // Human-readable label for the currently selected block (shown in the
  // floating action bar so the user always knows what they're editing).
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Contextual selection sync — THE core of "click an element to edit it".
  // Runs on BOTH content changes and selection changes (clicks, arrow keys) so
  // selecting any existing element immediately reveals its properties panel.
  // ---------------------------------------------------------------------------
  const syncSelection = useCallback((ed: Editor) => {
    const sel = ed.state.selection;
    const { $from } = sel;
    const nodeSel = (sel as any).node as
      | { type: { name: string }; attrs: Record<string, any> }
      | undefined;

    // --- Button: either the cursor sits inside it, or the node is selected ---
    let isButton = false;
    if (nodeSel?.type?.name === "customButton") {
      setBtnAttrs({ ...DEFAULT_BUTTON_ATTRS, ...(nodeSel.attrs as Partial<ButtonAttrs>) });
      isButton = true;
    } else if ($from.parent.type.name === "customButton") {
      setBtnAttrs({ ...DEFAULT_BUTTON_ATTRS, ...($from.parent.attrs as Partial<ButtonAttrs>) });
      isButton = true;
    }

    // --- Image (atom node → NodeSelection on click) ---
    const isImage = nodeSel?.type?.name === "image";
    if (isImage) {
      setImgWidth(nodeSel!.attrs.width || "100%");
      setImgAlign(nodeSel!.attrs.align || "center");
      setImgHeight(nodeSel!.attrs.height || "auto");
      setImgAspectRatio(nodeSel!.attrs.aspectRatio || "auto");
      setImgBorderRadius(nodeSel!.attrs.borderRadius !== undefined ? Number(nodeSel!.attrs.borderRadius) : 12);
      setImgShadow(nodeSel!.attrs.shadow || "none");
      setImgOpacity(nodeSel!.attrs.opacity !== undefined ? Number(nodeSel!.attrs.opacity) : 100);
      setImgObjectFit(nodeSel!.attrs.objectFit || "cover");
      setImgObjectPosition(nodeSel!.attrs.objectPosition || "center");
      setImgMarginTop(nodeSel!.attrs.marginTop !== undefined ? Number(nodeSel!.attrs.marginTop) : 24);
      setImgMarginBottom(nodeSel!.attrs.marginBottom !== undefined ? Number(nodeSel!.attrs.marginBottom) : 24);
      setImgHoverEffect(nodeSel!.attrs.hoverEffect || "none");
    }

    // --- Lead form (atom node → NodeSelection on click) ---
    const isLeadForm = nodeSel?.type?.name === "leadForm";
    if (isLeadForm) {
      setFormAttrs({ ...DEFAULT_LEAD_FORM_ATTRS, ...(nodeSel!.attrs as Partial<LeadFormAttrs>) });
    }

    // --- YouTube video (atom-like node → NodeSelection on click) ---
    const isVideo = nodeSel?.type?.name === "youtube";
    if (isVideo) {
      setVideoUrl((nodeSel!.attrs.src as string) || "");
      setVideoWidth((nodeSel!.attrs.containerWidth as string) || "100%");
      setVideoAlign((nodeSel!.attrs.align as any) || "center");
      setVideoAutoplay(!!nodeSel!.attrs.autoplay);
      setVideoMuted(!!nodeSel!.attrs.muted);
    }

    // --- Content blocks (atom nodes → NodeSelection on click) ---
    const isContentBlock = !!nodeSel && CONTENT_BLOCK_TYPES.includes(nodeSel.type.name);

    // --- Layout containers (two-col / section / flexbox / grid): the
    // selected node itself, else walk ancestors innermost-first so the
    // nearest container's panel wins when containers nest.
    const syncContainer = (name: string, attrs: Record<string, any>) => {
      if (name === "twoColumnSection") {
        setTwoColAttrs({ ...DEFAULT_TWO_COL_ATTRS, ...(attrs as Partial<TwoColumnAttrs>) });
        return "twocol" as const;
      }
      if (name === "pageSection") {
        setSectionAttrs({ ...DEFAULT_SECTION_ATTRS, ...(attrs as Partial<PageSectionAttrs>) });
        return "section" as const;
      }
      if (name === "flexboxContainer") {
        setFlexAttrs({ ...DEFAULT_FLEXBOX_ATTRS, ...(attrs as Partial<FlexboxAttrs>) });
        return "flexbox" as const;
      }
      if (name === "gridContainer") {
        setGridAttrs({ ...DEFAULT_GRID_ATTRS, ...(attrs as Partial<GridAttrs>) });
        return "grid" as const;
      }
      return null;
    };

    // Reset the targeting refs each sync; they're only repopulated for the
    // innermost matching node so edits always land on the cell/container the
    // panel is actually showing.
    flexItemPosRef.current = null;
    gridItemPosRef.current = null;
    flexContainerPosRef.current = null;
    gridContainerPosRef.current = null;

    let containerKind: "twocol" | "section" | "flexbox" | "grid" | null = nodeSel
      ? syncContainer(nodeSel.type.name, nodeSel.attrs)
      : null;
    // A directly-selected (NodeSelection) container: its position is sel.from.
    if (nodeSel?.type?.name === "flexboxContainer") flexContainerPosRef.current = sel.from;
    if (nodeSel?.type?.name === "gridContainer") gridContainerPosRef.current = sel.from;
    let flexCell: { index: number; count: number } | null = null;
    let gridCell: { index: number; count: number } | null = null;
    for (let depth = $from.depth; depth > 0; depth--) {
      const ancestor = $from.node(depth);
      // Only the nearest (innermost) container's attrs should ever populate
      // the panel — once containerKind is set (by the NodeSelection itself,
      // or by a deeper ancestor earlier in this same loop), skip calling
      // syncContainer for any further-out ancestor. Without this guard, a
      // flexbox nested inside a flexbox (or grid-in-grid) would call
      // setFlexAttrs/setGridAttrs a second time for the OUTER container and
      // clobber the inner one's values in the panel — even though
      // flexContainerPosRef below still (correctly) targets the inner one,
      // so edits would land on a different node than the one being shown.
      if (!containerKind) {
        const found = syncContainer(ancestor.type.name, ancestor.attrs);
        if (found) containerKind = found;
      }
      if (ancestor.type.name === "flexboxContainer" && flexContainerPosRef.current === null) {
        flexContainerPosRef.current = $from.before(depth);
      }
      if (ancestor.type.name === "gridContainer" && gridContainerPosRef.current === null) {
        gridContainerPosRef.current = $from.before(depth);
      }
      if (ancestor.type.name === "flexItem" && !flexCell) {
        setFlexItemAttrs({ ...DEFAULT_FLEX_ITEM_ATTRS, ...(ancestor.attrs as Partial<FlexItemAttrs>) });
        flexItemPosRef.current = $from.before(depth);
        flexCell = { index: $from.index(depth - 1), count: $from.node(depth - 1).childCount };
      }
      if (ancestor.type.name === "gridItem" && !gridCell) {
        setGridItemAttrs({ ...DEFAULT_GRID_ITEM_ATTRS, ...(ancestor.attrs as Partial<GridItemAttrs>) });
        gridItemPosRef.current = $from.before(depth);
        gridCell = { index: $from.index(depth - 1), count: $from.node(depth - 1).childCount };
      }
    }
    setFlexCellInfo(flexCell);
    setGridCellInfo(gridCell);

    // --- Determine selected kind ---
    const kind = isButton
      ? "button"
      : isImage
      ? "image"
      : isLeadForm
      ? "leadform"
      : isVideo
      ? "video"
      : isContentBlock
      ? nodeSel!.type.name
      : containerKind;

    // A transaction from one of OUR OWN attribute-update commands (typing in
    // a field, dragging a color/slider) can transiently resolve to no
    // matching node mid-update. Only touch "which panel is showing" state
    // when we found a genuine match this call — never clear it just because
    // this one call came up empty, or the properties panel would slam shut
    // on every keystroke. It only closes via the explicit Back button
    // (closeElementProperties).
    if (!kind) return;

    // Attribute state above is already synced; skip the panel reveal while a
    // widget-grid insert is in flight (see suppressPanelRef) so the Insert
    // Elements grid doesn't vanish mid-flow.
    if (Date.now() < suppressPanelRef.current) return;

    const labels: Record<string, string> = {
      button: "Button",
      image: "Image",
      leadform: "Form",
      video: "Video",
      twocol: "Two-Column",
      section: "Section",
      flexbox: "Flexbox",
      grid: "Grid",
      featureGrid: "Feature Grid",
      statsRow: "Stats",
      faqAccordion: "FAQ",
      testimonialCards: "Testimonials",
      marqueeStrip: "Marquee",
      imageGallery: "Gallery",
    };

    // These are mutually exclusive per selected kind, and only ever get
    // (re)written here — i.e. together, on a real match — never cleared
    // individually, so switching between element types can't leave two
    // panels simultaneously visible or briefly none at all.
    setShowBtnPanel(kind === "button");
    setShowImgPanel(kind === "image");
    setShowFormPanel(kind === "leadform");
    setShowVideoPanel(kind === "video");
    setShowTwoColPanel(kind === "twocol");
    setShowSectionPanel(kind === "section");
    setShowFlexPanel(kind === "flexbox");
    setShowGridPanel(kind === "grid");
    setActiveBlock(isContentBlock ? { type: nodeSel!.type.name, attrs: { ...nodeSel!.attrs } } : null);
    setSelectedLabel(labels[kind]);

    // The element-specific property panels live in the "Elements" tab, in
    // place of the Insert Elements grid. Reveal it on a *new* selection and
    // scroll to the top; re-selecting the same element (e.g. every keystroke
    // while editing its fields) leaves the scroll position alone.
    setActiveTab("widgets");
    setPropertiesOpen(true);
    if (kind !== lastElementKindRef.current) {
      requestAnimationFrame(() => {
        document
          .querySelector("[data-element-properties]")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    lastElementKindRef.current = kind;
  }, []);

  // Returns to the Insert Elements grid, closing whichever property panel
  // was open. This is the only place panel-visibility state gets cleared —
  // syncSelection above deliberately never clears it on its own so that
  // editing a property (which transiently unsettles the live selection)
  // can't close the panel out from under the user.
  const closeElementProperties = useCallback(() => {
    setPropertiesOpen(false);
    setShowBtnPanel(false);
    setShowImgPanel(false);
    setShowFormPanel(false);
    setShowVideoPanel(false);
    setShowTwoColPanel(false);
    setShowSectionPanel(false);
    setShowFlexPanel(false);
    setShowGridPanel(false);
    setActiveBlock(null);
    setSelectedLabel(null);
    lastElementKindRef.current = null;
  }, []);

  // ---- TipTap editor ----
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        // Violet insertion line while dragging widgets over the canvas.
        dropcursor: { color: "#7c3aed", width: 3 },
        // StarterKit v3 bundles TrailingNode, whose appendTransaction force-
        // appends an empty paragraph whenever the doc doesn't end in one —
        // so every widget dropped from the Elements tab grew a stray
        // paragraph under it that no delete/setContent could remove (the
        // plugin re-added it in the same dispatch). This canvas holds
        // discrete widgets, not free-flowing prose; typing after a trailing
        // widget still works via the gap cursor.
        trailingNode: false,
      }),
      ResizableImage.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      YoutubeEmbed.configure({
        width: 640,
        height: 360,
        // Clicking a video in the canvas should select it (opening the
        // Video Properties panel), not play it — see youtube-embed.ts.
        interactive: false,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Color,
      TextStyle,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Start writing your landing page content...",
      }),
      CustomButton,
      TwoColumnSection,
      ColumnMedia,
      ColumnContent,
      FlexboxContainer,
      FlexItem,
      GridContainer,
      GridItem,
      PageSection,
      LeadForm,
      FeatureGrid,
      StatsRow,
      FaqAccordion,
      TestimonialCards,
      MarqueeStrip,
      ImageGallery,
    ],
    content: content?.doc || "",
    onUpdate: ({ editor: ed }) => {
      if (suppressNextUpdate.current) {
        suppressNextUpdate.current = false;
        return;
      }
      emitChange(ed.getJSON(), settings);
      syncSelection(ed);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      // Fires on every click / caret move — this is what makes selecting an
      // existing element open its editor instantly.
      syncSelection(ed);
    },
    editorProps: {
      attributes: {
        // `tiptap` class is required for the canvas hover/selection styles in
        // globals.css to apply. The large min-height and generous vertical
        // padding only make sense for the legacy singleton doc (meant to
        // feel like a big flexible page body with room to work in) —
        // applying them to every small, freshly created per-widget block
        // left each one with hundreds of pixels of blank space below one
        // Heading/Button, since this class is shared by whichever block is
        // currently focused. Dynamic blocks just size to their own content;
        // the empty-state hint wrapper elsewhere already provides its own
        // small minHeight for a truly empty block.
        class: `tiptap prose prose-sm sm:prose-base max-w-none focus:outline-none px-6 ${
          focusedRichBlockId ? "py-2 rich-block-focused" : "py-4 min-h-[600px]"
        }`,
      },
      // Links must never navigate/open inside the editor — clicking one should
      // only place the cursor so editing flow isn't disturbed.
      handleClick(_view, _pos, event) {
        const anchor = (event.target as HTMLElement)?.closest?.("a");
        if (anchor) event.preventDefault();
        return false;
      },
    },
    immediatelyRender: false,
  });

  // Sync external content changes — `activeDoc` is the focused block's doc
  // (or the legacy page-level doc when nothing dynamic is focused), so this
  // also fires on every focus swap, since lastEmittedDocJson gets reset to
  // null there specifically to force it to run.
  useEffect(() => {
    if (!editor || !activeDoc) return;
    const nextJson = JSON.stringify(activeDoc);
    // This is just our own change echoed back through the parent — the
    // editor's live state (and selection) is already correct, so leave it
    // alone. Only a doc that differs from what we last emitted is a genuine
    // external change (initial load, switching pages/blocks, etc.) worth
    // applying.
    if (nextJson === lastEmittedDocJson.current) return;
    const currentJson = JSON.stringify(editor.getJSON());
    if (currentJson !== nextJson) {
      // setContent does NOT emit an update, so never arm suppressNextUpdate
      // here — an armed flag would swallow the user's next real edit (the
      // first keystroke/deletion after load never reached parent state).
      // Recording what we applied is enough to break any echo loop.
      editor.commands.setContent(activeDoc);
      lastEmittedDocJson.current = nextJson;
    }
  }, [editor, activeDoc]);

  // ---- Inject delete buttons on every block element in the canvas ----
  useEffect(() => {
    if (!editor) return;

    const SELECTORS = [
      "section[data-page-section]",
      "div[data-two-col]",
      "div[data-button]",
      "div[data-lead-form]",
      "div[data-image-frame]",
      "div[data-youtube-video]",
      "blockquote",
      "pre",
      "hr",
    ];
    const MARKER = "data-del-btn";

    function injectButtons() {
      const editorEl = editor?.view?.dom;
      if (!editorEl) return;

      // Remove stale buttons
      editorEl.querySelectorAll(`[${MARKER}]`).forEach((b) => b.remove());

      SELECTORS.forEach((sel) => {
        editorEl.querySelectorAll(sel).forEach((el) => {
          // Skip if inside a column child (images inside two-col media)
          if (
            sel === "div[data-image-frame]" &&
            el.closest("div[data-col-media]")
          )
            return;

          const wrapper = el as HTMLElement;
          // Ensure relative positioning so the button can be placed absolutely
          if (getComputedStyle(wrapper).position === "static") {
            wrapper.style.position = "relative";
          }

          const btn = document.createElement("button");
          btn.setAttribute(MARKER, "");
          btn.type = "button";
          btn.title = "Delete element";
          btn.contentEditable = "false";
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
          Object.assign(btn.style, {
            position: "absolute",
            // Inset (not poking outside the card) so it never gets clipped
            // by a wrapper with overflow:hidden — image and video frames
            // both clip their content to crop/round it.
            top: "8px",
            right: "8px",
            zIndex: "60",
            width: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "1.5px solid #fca5a5",
            background: "#fff",
            color: "#ef4444",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            opacity: "0",
            transition: "opacity 0.15s ease, transform 0.15s ease",
            transform: "scale(0.85)",
            pointerEvents: "auto",
          });

          // Show on parent hover
          wrapper.addEventListener("mouseenter", () => {
            btn.style.opacity = "1";
            btn.style.transform = "scale(1)";
          });
          wrapper.addEventListener("mouseleave", () => {
            btn.style.opacity = "0";
            btn.style.transform = "scale(0.85)";
          });

          btn.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Find the ProseMirror position of this DOM element and delete it
            const pos = editor?.view.posAtDOM(wrapper, 0);
            if (pos == null || !editor) return;

            const resolved = editor.state.doc.resolve(pos);
            // Walk up to find the nearest deletable node
            let depth = resolved.depth;
            while (depth >= 0) {
              const node = resolved.node(depth);
              const nodeTypeName = node.type.name;
              if (
                [
                  "twoColumnSection",
                  "pageSection",
                  "customButton",
                  "blockquote",
                  "codeBlock",
                  "horizontalRule",
                  "youtube",
                  "image",
                  "leadForm",
                  ...CONTENT_BLOCK_TYPES,
                ].includes(nodeTypeName)
              ) {
                const from = resolved.before(depth);
                const tr = editor.state.tr.delete(from, from + node.nodeSize);
                editor.view.dispatch(tr);
                toast.success("Element removed");
                return;
              }
              depth--;
            }

            // Fallback: try deleting from the wrapper's position
            try {
              const $pos = editor.state.doc.resolve(pos);
              if ($pos.parent.type.name !== "doc") {
                const from = $pos.before($pos.depth);
                const node = $pos.parent;
                const tr = editor.state.tr.delete(from, from + node.nodeSize);
                editor.view.dispatch(tr);
                toast.success("Element removed");
              }
            } catch {
              // ignore
            }
          });

          wrapper.appendChild(btn);
        });
      });
    }

    // Re-inject only when the document structure changes — not on every caret
    // move — to avoid needless DOM churn while clicking/selecting elements.
    injectButtons();
    const onTransaction = ({ transaction }: { transaction: { docChanged: boolean } }) => {
      if (transaction.docChanged) injectButtons();
    };
    editor.on("transaction", onTransaction);
    return () => {
      editor.off("transaction", onTransaction);
      // Cleanup buttons
      const editorEl = editor?.view?.dom;
      if (editorEl) {
        editorEl.querySelectorAll(`[${MARKER}]`).forEach((b) => b.remove());
      }
    };
  }, [editor]);

  // ---- Callbacks ----
  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      try {
        toast.loading("Uploading image...", { id: "upload" });
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
        toast.success(`Image uploaded${data.storage === 'r2' ? ' to R2' : ' locally'}!`, { id: "upload" });
      } catch (err: any) {
        toast.error(err.message || "Upload failed", { id: "upload" });
      }
      e.target.value = "";
    },
    [editor]
  );

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url, alt: "Image" }).run();
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    if (!editor) return;
    editor.commands.insertYoutubePlaceholder();
  }, [editor]);

  const handleSetLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const applyTextColor = useCallback(
    (color: string) => {
      if (!editor) return;
      setTextColor(color);
      editor.chain().focus().setColor(color).run();
    },
    [editor]
  );

  const applyHighlight = useCallback(
    (color: string) => {
      if (!editor) return;
      setHlColor(color);
      editor.chain().focus().toggleHighlight({ color }).run();
    },
    [editor]
  );

  const insertButton = useCallback(() => {
    if (!editor) return;
    const attrs = { ...DEFAULT_BUTTON_ATTRS, backgroundColor: themeColors?.primary ?? "#111827" };
    editor.commands.insertCustomButton(attrs);
  }, [editor, themeColors]);

  const updateButtonAttr = useCallback(
    (key: keyof ButtonAttrs, value: any) => {
      if (!editor) return;
      setBtnAttrs((prev) => ({ ...prev, [key]: value }));
      editor.commands.updateCustomButton({ [key]: value });
    },
    [editor]
  );

  // Re-applies a NodeSelection at `pos` if (and only if) a node of `typeName`
  // is still there and the selection isn't already correctly on it.
  const reassertNodeSelection = useCallback(
    (typeName: string, pos: number) => {
      if (!editor || editor.isDestroyed) return;
      const current = editor.state.selection as any;
      if (current.node && current.node.type.name === typeName && current.from === pos) return;
      const node = editor.state.doc.nodeAt(pos);
      if (!node || node.type.name !== typeName) return;
      editor.view.dispatch(
        editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos))
      );
    },
    [editor]
  );

  // Image / lead form / content blocks are atom nodes selected via
  // NodeSelection (no cursor ever sits "inside" them, unlike button/section).
  // TipTap's generic updateAttributes command rewrites the node's markup via
  // setNodeMarkup; since attrs differ, ProseMirror's default (non-custom)
  // node view treats it as a different node and swaps the DOM element rather
  // than patching it in place. That DOM swap can itself trigger a native
  // browser `selectionchange` (the old element the selection pointed at is
  // gone) — ProseMirror's DOM observer reacts to that asynchronously and can
  // stomp our just-set NodeSelection with a reset one *after* this function
  // already returns. So on top of restoring the selection synchronously in
  // the same transaction, re-check on the next two animation frames (after
  // any such async DOM-observer correction has had a chance to run) and put
  // it back again if something knocked it loose — so the element visibly
  // stays selected through every edit.
  const updateAtomNodeAttrs = useCallback(
    (typeName: string, attrs: Record<string, any>) => {
      if (!editor) return;
      const sel = editor.state.selection as any;
      if (sel.node && sel.node.type.name === typeName) {
        const pos = sel.from;
        const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
          ...sel.node.attrs,
          ...attrs,
        });
        tr.setSelection(NodeSelection.create(tr.doc, pos));
        editor.view.dispatch(tr);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => reassertNodeSelection(typeName, pos));
        });
      } else {
        editor.commands.updateAttributes(typeName, attrs);
      }
    },
    [editor, reassertNodeSelection]
  );

  const updateImageAttr = useCallback(
    (key: string, value: any) => {
      if (!editor) return;
      if (key === "width") setImgWidth(value);
      if (key === "align") setImgAlign(value as any);
      if (key === "height") setImgHeight(value);
      if (key === "aspectRatio") setImgAspectRatio(value);
      if (key === "borderRadius") setImgBorderRadius(Number(value));
      if (key === "shadow") setImgShadow(value);
      if (key === "opacity") setImgOpacity(Number(value));
      if (key === "objectFit") setImgObjectFit(value);
      if (key === "objectPosition") setImgObjectPosition(value);
      if (key === "marginTop") setImgMarginTop(Number(value));
      if (key === "marginBottom") setImgMarginBottom(Number(value));
      if (key === "hoverEffect") setImgHoverEffect(value);

      // A fixed aspect ratio only crops correctly if the image actually
      // fills that box: force object-fit to "cover" (never "contain", which
      // would letterbox with empty space, or "fill", which would distort)
      // and clear any previously-set fixed height so the ratio — not a
      // stale height — drives the box size.
      const extraAttrs: Record<string, any> = {};
      if (key === "aspectRatio" && value !== "auto") {
        if (imgObjectFit !== "cover") {
          setImgObjectFit("cover");
          extraAttrs.objectFit = "cover";
        }
        if (imgHeight !== "auto") {
          setImgHeight("auto");
          extraAttrs.height = "auto";
        }
      }

      // Object Fit / Crop Position only have anything to affect once the
      // image has a fixed box to crop within — with Aspect Ratio still
      // "auto" and Height still "auto" the image just renders at its
      // natural size, so toggling Cover/Contain/Fill or the crop-position
      // grid would silently do nothing. Default to a square frame the first
      // time either control is touched in that state, so the change is
      // immediately visible; the user can still pick a different ratio.
      if (
        (key === "objectFit" || key === "objectPosition") &&
        imgAspectRatio === "auto" &&
        imgHeight === "auto"
      ) {
        setImgAspectRatio("1/1");
        extraAttrs.aspectRatio = "1/1";
      }

      updateAtomNodeAttrs("image", { [key]: value, ...extraAttrs });
    },
    [editor, updateAtomNodeAttrs, imgObjectFit, imgHeight, imgAspectRatio]
  );



  const insertTwoCol = useCallback(
    (layout: "media-left" | "media-right") => {
      if (!editor) return;
      editor.commands.insertTwoColumnSection({ layout });
    },
    [editor]
  );

  const updateTwoColAttr = useCallback(
    (key: keyof TwoColumnAttrs, value: any) => {
      if (!editor) return;
      setTwoColAttrs((prev) => ({ ...prev, [key]: value }));
      editor.commands.updateTwoColumnSection({ [key]: value });
    },
    [editor]
  );

  const insertSection = useCallback(
    (bgColor?: string) => {
      if (!editor) return;
      editor.commands.insertPageSection({
        backgroundColor: bgColor || "transparent",
        textColor: bgColor && bgColor !== "transparent" ? "#ffffff" : "#111827",
      });
    },
    [editor]
  );

  const updateSectionAttr = useCallback(
    (key: keyof PageSectionAttrs, value: any) => {
      if (!editor) return;
      setSectionAttrs((prev) => ({ ...prev, [key]: value }));
      editor.commands.updatePageSection({ [key]: value });
    },
    [editor]
  );

  // ---- Flexbox / Grid layout containers ----
  const insertFlexbox = useCallback(() => {
    editor?.commands.insertFlexbox({ cells: 2 });
  }, [editor]);

  const insertGridBox = useCallback(() => {
    editor?.commands.insertGridBox({ columns: 3 });
  }, [editor]);

  // Flexbox/Grid containers and cells render through ProseMirror's default
  // (non-custom) node view too, so an attribute change swaps their DOM
  // element the same way images/videos do (see updateAtomNodeAttrs above) —
  // exposing them to the same async-selectionchange-resets-the-selection
  // failure mode. Unlike those atoms though, a container is usually being
  // edited while the caret sits INSIDE one of its cells (a TextSelection),
  // not via a NodeSelection on the container itself — only reassert a
  // NodeSelection when the container/cell really was what was NodeSelected
  // before the edit (e.g. via the right-click "Select block" menu), so a
  // plain TextSelection inside a cell is left to ProseMirror's own (already
  // correct) mapping instead of being hijacked into selecting the whole
  // container on every settings tweak. Returns false (pos missing/stale) so
  // callers can fall back to the position-agnostic "nearest" command.
  const updateContainerAttrs = useCallback(
    (
      typeName: "flexboxContainer" | "gridContainer" | "flexItem" | "gridItem",
      attrs: Record<string, any>,
      pos: number | null
    ) => {
      if (!editor || pos == null) return false;
      const node = editor.state.doc.nodeAt(pos);
      if (!node || node.type.name !== typeName) return false;
      const sel = editor.state.selection as any;
      const wasNodeSelected = sel.node && sel.node.type.name === typeName && sel.from === pos;
      const tr = editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs });
      if (wasNodeSelected) tr.setSelection(NodeSelection.create(tr.doc, pos));
      editor.view.dispatch(tr);
      if (wasNodeSelected) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => reassertNodeSelection(typeName, pos));
        });
      }
      return true;
    },
    [editor, reassertNodeSelection]
  );

  const updateFlexAttr = useCallback(
    (key: keyof FlexboxAttrs, value: any) => {
      if (!editor) return;
      setFlexAttrs((prev) => ({ ...prev, [key]: value }));
      if (!updateContainerAttrs("flexboxContainer", { [key]: value }, flexContainerPosRef.current)) {
        editor.commands.updateFlexbox({ [key]: value });
      }
    },
    [editor, updateContainerAttrs]
  );

  const updateFlexItemAttr = useCallback(
    (key: keyof FlexItemAttrs, value: any) => {
      if (!editor) return;
      setFlexItemAttrs((prev) => ({ ...prev, [key]: value }));
      if (!updateContainerAttrs("flexItem", { [key]: value }, flexItemPosRef.current)) {
        editor.commands.updateFlexItem({ [key]: value });
      }
    },
    [editor, updateContainerAttrs]
  );

  const updateGridAttr = useCallback(
    (key: keyof GridAttrs, value: any) => {
      if (!editor) return;
      setGridAttrs((prev) => ({ ...prev, [key]: value }));
      if (!updateContainerAttrs("gridContainer", { [key]: value }, gridContainerPosRef.current)) {
        editor.commands.updateGridBox({ [key]: value });
      }
    },
    [editor, updateContainerAttrs]
  );

  const updateGridItemAttr = useCallback(
    (key: keyof GridItemAttrs, value: any) => {
      if (!editor) return;
      setGridItemAttrs((prev) => ({ ...prev, [key]: value }));
      if (!updateContainerAttrs("gridItem", { [key]: value }, gridItemPosRef.current)) {
        editor.commands.updateGridItem({ [key]: value });
      }
    },
    [editor, updateContainerAttrs]
  );

  // The legacy page-level Rich Content slot is hidden whenever its doc is
  // empty (see isLegacyRichContentEmpty). In that state a palette click with
  // no dynamic block focused would otherwise silently edit the hidden legacy
  // doc — instead, seed a fresh individual block at the end of the page,
  // exactly like dropping the element into the last gap.
  const legacyRichHidden = useMemo(() => isLegacyRichContentEmpty(content), [content]);

  const paletteInsert = useCallback(
    (type: string, fallback: () => void) => {
      if (legacyRichHidden && !focusedBlockIdRef.current && templateData && setTemplateData) {
        insertRichBlockAt(resolveSectionOrder(templateData.sectionOrder, templateData.deletedSections).length, type);
        return;
      }
      fallback();
    },
    [legacyRichHidden, templateData, setTemplateData, insertRichBlockAt]
  );

  const addLayoutCell = useCallback(
    (containerType: "flexboxContainer" | "gridContainer") => {
      if (!editor) return;
      if (editor.commands.addLayoutCell(containerType)) {
        toast.success("Cell added");
      }
    },
    [editor]
  );

  // Explicitly select cell `index` of the current flex/grid container so its
  // per-cell properties can be edited — clicking small empty cells directly on
  // the zoomed canvas is fiddly, so the panel offers a chip per cell. Places
  // the caret inside the cell, which drives syncSelection → the "Selected
  // Cell" panel and the targeting refs update to that exact cell.
  const selectLayoutCell = useCallback(
    (containerType: "flexboxContainer" | "gridContainer", index: number) => {
      if (!editor) return;
      const containerPos =
        containerType === "flexboxContainer"
          ? flexContainerPosRef.current
          : gridContainerPosRef.current;
      if (containerPos == null) return;
      const container = editor.state.doc.nodeAt(containerPos);
      if (!container || index < 0 || index >= container.childCount) return;
      let cellPos = containerPos + 1;
      for (let j = 0; j < index; j++) cellPos += container.child(j).nodeSize;
      const sel = TextSelection.near(editor.state.doc.resolve(cellPos + 1));
      editor.view.dispatch(editor.state.tr.setSelection(sel).scrollIntoView());
      editor.view.focus();
    },
    [editor]
  );

  const removeLayoutCell = useCallback(
    (containerType: "flexboxContainer" | "gridContainer") => {
      if (!editor) return;
      if (editor.commands.removeLayoutCell(containerType)) {
        toast.success("Cell removed");
      } else {
        toast.error("A layout needs at least one cell — delete the whole layout instead");
      }
    },
    [editor]
  );

  // Delete the whole flexbox/grid container the cursor is in.
  const deleteLayoutContainer = useCallback(
    (containerType: "flexboxContainer" | "gridContainer") => {
      if (!editor) return;
      const sel = editor.state.selection as any;
      const { state } = editor;
      if (sel.node && sel.node.type.name === containerType) {
        editor.chain().focus().deleteSelection().run();
      } else {
        const { $from } = state.selection;
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name === containerType) {
            const pos = $from.before(depth);
            editor.view.dispatch(state.tr.delete(pos, pos + $from.node(depth).nodeSize));
            break;
          }
        }
      }
      closeElementProperties();
      toast.success(containerType === "flexboxContainer" ? "Flexbox removed" : "Grid removed");
    },
    [editor, closeElementProperties]
  );

  const handleBgImageUpload = useCallback(() => {
    bgImageInputRef.current?.click();
  }, []);

  const onBgImageSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      try {
        toast.loading("Uploading background...", { id: "bg-upload" });
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        const data = await res.json();
        updateSectionAttr("backgroundImage", data.url);
        updateSectionAttr("backgroundGradient", "");
        toast.success(`Background uploaded${data.storage === 'r2' ? ' (uploaded to R2)' : ' (uploaded locally)'}!`, { id: "bg-upload" });
      } catch (err: any) {
        toast.error(err.message || "Upload failed", { id: "bg-upload" });
      }
      e.target.value = "";
    },
    [updateSectionAttr]
  );

  const GRADIENT_PRESETS = [
    { label: "None", value: "" },
    { label: "Peacock Blue", value: "linear-gradient(135deg, #0d9488 0%, #2563eb 100%)" },
    { label: "Sunset Gold", value: "linear-gradient(135deg, #ea580c 0%, #eab308 100%)" },
    { label: "Purple Haze", value: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)" },
    { label: "Forest Mint", value: "linear-gradient(135deg, #059669 0%, #10b981 100%)" },
  ];

  const insertLeadForm = useCallback(() => {
    if (!editor) return;
    editor.commands.insertLeadForm({ buttonColor: themeColors?.primary ?? "#111827" });
  }, [editor, themeColors]);

  const updateFormAttr = useCallback(
    (key: keyof LeadFormAttrs, value: any) => {
      if (!editor) return;
      setFormAttrs((prev) => ({ ...prev, [key]: value }));
      updateAtomNodeAttrs("leadForm", { [key]: value });
    },
    [editor, updateAtomNodeAttrs]
  );

  const deleteLeadForm = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
    setShowFormPanel(false);
    toast.success("Form removed");
  }, [editor]);

  const updateVideoUrl = useCallback(
    (url: string) => {
      if (!editor) return;
      setVideoUrl(url);
      updateAtomNodeAttrs("youtube", { src: url });
    },
    [editor, updateAtomNodeAttrs]
  );

  const updateVideoAttr = useCallback(
    (key: "containerWidth" | "align" | "autoplay" | "muted", value: any) => {
      if (!editor) return;

      // Browsers block unmuted autoplay outright, so the two settings can't
      // be independent: Autoplay on forces Mute on (and keeps it locked on
      // — the panel disables the Mute switch in that state, but guard here
      // too in case this is ever called another way). Muting on its own,
      // without autoplay, works normally either way.
      if (key === "muted" && !value && videoAutoplay) return;

      if (key === "containerWidth") setVideoWidth(value);
      if (key === "align") setVideoAlign(value);
      if (key === "autoplay") setVideoAutoplay(value);
      if (key === "muted") setVideoMuted(value);

      const extraAttrs: Record<string, any> = {};
      if (key === "autoplay" && value && !videoMuted) {
        setVideoMuted(true);
        extraAttrs.muted = true;
      }

      updateAtomNodeAttrs("youtube", { [key]: value, ...extraAttrs });
    },
    [editor, updateAtomNodeAttrs, videoMuted, videoAutoplay]
  );

  const deleteVideo = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
    setShowVideoPanel(false);
    toast.success("Video removed");
  }, [editor]);

  // ---- Content block insert + update helpers ----
  const insertFeatureGrid = useCallback(() => {
    editor?.commands.insertFeatureGrid({ accentColor: themeColors?.primary ?? "#7c3aed" });
  }, [editor, themeColors]);
  const insertStatsRow = useCallback(() => {
    editor?.commands.insertStatsRow({ valueColor: themeColors?.primary ?? "#7c3aed" });
  }, [editor, themeColors]);
  const insertFaqAccordion = useCallback(() => {
    editor?.commands.insertFaqAccordion({ accentColor: themeColors?.primary ?? "#7c3aed" });
  }, [editor, themeColors]);
  const insertTestimonialCards = useCallback(() => {
    editor?.commands.insertTestimonialCards({ accentColor: themeColors?.primary ?? "#7c3aed" });
  }, [editor, themeColors]);
  const insertImageGallery = useCallback(() => {
    editor?.commands.insertImageGallery();
  }, [editor]);

  // -------------------------------------------------------------------------
  // Drag widgets from the Elements panel onto the canvas: the drop lands at
  // the exact position in the rich content (ProseMirror's dropcursor shows
  // the insertion line while dragging; we intercept the drop before
  // ProseMirror pastes the raw payload as text).
  // -------------------------------------------------------------------------
  const insertElementByType = useCallback(
    (type: string, pos: number) => {
      if (!editor) return;
      // A brand-new block still holds TipTap's default single empty
      // paragraph (see normalizeLandingContent). Inserting AT a position
      // leaves that placeholder behind as an invisible trailing blank
      // paragraph — replace the whole (empty) doc range instead so the
      // dropped widget becomes the block's only content, not a sibling of
      // dead space. Non-empty docs (dropping into existing content) are
      // unaffected — `target` stays a plain insertion point there.
      // NOT editor.isEmpty — that reports true for any doc with no *text*,
      // including one whose only content is a flexbox/grid with empty cells,
      // and the whole-doc replacement below would then swallow the container
      // (merging its cells into whatever was dropped). "Empty" here strictly
      // means the single blank paragraph a brand-new block is born with.
      const docNode = editor.state.doc;
      const wasEmpty =
        docNode.childCount === 1 &&
        docNode.firstChild!.type.name === "paragraph" &&
        docNode.firstChild!.content.size === 0;
      let target: number | { from: number; to: number } = pos;
      if (wasEmpty) {
        target = { from: 0, to: editor.state.doc.content.size };
      } else {
        // `pos` sits at a block boundary. If it borders an empty paragraph
        // (e.g. the placeholder a fresh flex/grid cell starts with), aim the
        // caret INSIDE that paragraph instead: a caret in an empty textblock
        // is always a valid TextSelection (a raw boundary inside an
        // isolating cell is not, and the insert would escape the cell), and
        // insertContent/insertContentAt auto-expand an empty textblock so
        // the placeholder is replaced by the dropped element, not kept as a
        // stray sibling.
        try {
          const $b = editor.state.doc.resolve(pos);
          const after = $b.nodeAfter;
          const before = $b.nodeBefore;
          if (after && after.type.name === "paragraph" && after.content.size === 0) {
            target = pos + 1;
          } else if (before && before.type.name === "paragraph" && before.content.size === 0) {
            target = pos - before.nodeSize + 1;
          }
        } catch {
          // keep the raw boundary
        }
      }
      const at = editor.chain().focus().setTextSelection(target);
      switch (type) {
        case "heading":
          at.insertContentAt(target, { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "New Heading" }] }).run();
          break;
        case "text":
          at.insertContentAt(target, { type: "paragraph", content: [{ type: "text", text: "New text block. Click to edit." }] }).run();
          break;
        case "quote":
          at.insertContentAt(target, { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "A memorable quote goes here." }] }] }).run();
          break;
        case "list":
          at.insertContentAt(target, { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First item" }] }] }] }).run();
          break;
        case "numbered":
          at.insertContentAt(target, { type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First item" }] }] }] }).run();
          break;
        case "divider":
          at.insertContentAt(target, { type: "horizontalRule" }).run();
          break;
        case "code":
          at.insertContentAt(target, { type: "codeBlock", content: [{ type: "text", text: "// code" }] }).run();
          break;
        // The rest insert at the current selection, which we just placed at
        // the drop position.
        case "image":
          at.run();
          handleImageUpload();
          break;
        case "button":
          at.run();
          insertButton();
          break;
        case "video":
          at.run();
          addYoutubeVideo();
          break;
        case "section":
          at.run();
          insertSection();
          break;
        case "form":
          at.run();
          insertLeadForm();
          break;
        // Legacy payloads from before 2-Col was replaced by Flexbox/Grid in
        // the palette — an in-flight drag or stale client can still emit them.
        case "twocol-left":
          at.run();
          insertTwoCol("media-left");
          break;
        case "twocol-right":
          at.run();
          insertTwoCol("media-right");
          break;
        case "flexbox":
          at.run();
          insertFlexbox();
          break;
        case "grid":
          at.run();
          insertGridBox();
          break;
        case "featureGrid":
          at.run();
          insertFeatureGrid();
          break;
        case "statsRow":
          at.run();
          insertStatsRow();
          break;
        case "faqAccordion":
          at.run();
          insertFaqAccordion();
          break;
        case "testimonialCards":
          at.run();
          insertTestimonialCards();
          break;
        case "imageGallery":
          at.run();
          insertImageGallery();
          break;
        default:
          return;
      }
      // Seeding a brand-new block: the placeholder paragraph the block was
      // born with (normalizeLandingContent) can survive the insert as an
      // empty trailing paragraph — residue, not user content, so strip it.
      // (The old TrailingNode extension that used to re-add it on every
      // dispatch is disabled in the StarterKit config above, so this
      // cleanup actually sticks now.) Only runs for wasEmpty — a non-empty
      // doc's own trailing paragraph is real user content.
      if (wasEmpty) {
        const doc = editor.state.doc;
        const last = doc.lastChild;
        if (doc.childCount > 1 && last && last.type.name === "paragraph" && last.content.size === 0) {
          const json = editor.getJSON();
          const cleaned = { type: "doc", content: (json.content || []).slice(0, -1) };
          editor.commands.setContent(cleaned);
          // setContent deliberately doesn't fire onUpdate (it's also used to
          // apply externally-sourced docs without re-triggering a save) —
          // so this cleanup's result has to be persisted explicitly, or the
          // trailing paragraph reappears the moment the block is saved,
          // reloaded, or its static preview is rendered from stale data.
          lastEmittedDocJson.current = JSON.stringify(cleaned);
          emitChange(cleaned, settings);
        }
      }
    },
    [editor, handleImageUpload, insertButton, addYoutubeVideo, insertSection, insertLeadForm, insertTwoCol, insertFlexbox, insertGridBox, insertFeatureGrid, insertStatsRow, insertFaqAccordion, insertTestimonialCards, insertImageGallery, emitChange, settings]
  );

  // Consumes a widget queued by insertRichBlockAt/focusRichBlock: once the
  // editor's content genuinely reflects the newly-focused (empty) block's
  // doc — applied synchronously by the content-sync effect above, which
  // always runs first since it's declared earlier in this component and
  // React fires effects in declaration order — insert the widget that was
  // dropped to create this block in the first place.
  useEffect(() => {
    if (!editor || !pendingSeedElementType) return;
    const type = pendingSeedElementType;
    setPendingSeedElementType(null);
    insertElementByType(type, 0);
  }, [editor, pendingSeedElementType, insertElementByType]);

  const handleCanvasDropCapture = useCallback(
    (e: React.DragEvent) => {
      if (!editor || !e.dataTransfer.types.includes(RICH_ELEMENT_DND_TYPE)) return;
      const targetEl = e.target as HTMLElement | null;
      // Only over the currently-focused block's own contenteditable root —
      // a static (unfocused) block's preview never carries the `.tiptap`
      // class, but this identity check guards against it explicitly rather
      // than relying on that by construction.
      if (targetEl?.closest?.(".tiptap") !== editor.view.dom) return;
      e.preventDefault();
      e.stopPropagation();
      const type = e.dataTransfer.getData(RICH_ELEMENT_DND_TYPE);
      const coords = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
      let boundary = coords ? coords.pos : editor.state.doc.content.size;
      // Snap to the nearest block boundary (drop above or below the block
      // under the pointer) so elements never split a paragraph midway.
      // Normally that's a TOP-LEVEL boundary, but a drop over a flex/grid
      // cell should land INSIDE that cell, so there the snap happens at the
      // cell's own child depth instead.
      try {
        const $p = editor.state.doc.resolve(boundary);
        let cellDepth = 0; // 0 = doc, i.e. snap between top-level blocks
        for (let depth = $p.depth; depth > 0; depth--) {
          const name = $p.node(depth).type.name;
          if (name === "flexItem" || name === "gridItem") {
            cellDepth = depth;
            break;
          }
        }
        if ($p.depth > cellDepth) {
          const blockPos = $p.before(cellDepth + 1);
          const blockNode = editor.state.doc.nodeAt(blockPos);
          const dom = editor.view.nodeDOM(blockPos) as HTMLElement | null;
          if (blockNode && dom?.getBoundingClientRect) {
            const rect = dom.getBoundingClientRect();
            boundary = e.clientY < rect.top + rect.height / 2 ? blockPos : blockPos + blockNode.nodeSize;
          }
        }
      } catch {
        // fall back to the raw position
      }
      insertElementByType(type, boundary);
    },
    [editor, insertElementByType]
  );

  // Update one attribute on the currently-selected content block. The editor's
  // onUpdate → syncSelection re-reads the node, so the panel stays in sync; we
  // also optimistically update local state for snappy typing.
  const updateBlockAttr = useCallback(
    (key: string, value: any) => {
      if (!editor || !activeBlock) return;
      updateAtomNodeAttrs(activeBlock.type, { [key]: value });
      setActiveBlock((prev) => (prev ? { ...prev, attrs: { ...prev.attrs, [key]: value } } : prev));
    },
    [editor, activeBlock, updateAtomNodeAttrs]
  );

  // Update the items[] array on the selected content block (add / remove / edit).
  const updateBlockItems = useCallback(
    (items: any[]) => updateBlockAttr("items", items),
    [updateBlockAttr]
  );

  const deleteActiveBlock = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
    setActiveBlock(null);
    toast.success("Block removed");
  }, [editor]);

  // ---- Delete the currently selected/focused node ----
  const deleteSelectedNode = useCallback(() => {
    if (!editor) return;
    const { state } = editor;
    const { selection } = state;

    // If it's a NodeSelection, just delete the node
    const sel = selection as any;
    if (sel.node) {
      editor.chain().focus().deleteSelection().run();
      // The element is gone — close its (now stale) properties panel.
      closeElementProperties();
      toast.success("Element removed");
      return;
    }

    // Walk up from cursor to find a deletable block
    const { $from } = selection;
    const deletableTypes = new Set([
      "twoColumnSection",
      "pageSection",
      "flexboxContainer",
      "gridContainer",
      "customButton",
      "blockquote",
      "codeBlock",
      "horizontalRule",
      "youtube",
    ]);

    let depth = $from.depth;
    while (depth > 0) {
      const node = $from.node(depth);
      if (deletableTypes.has(node.type.name)) {
        const pos = $from.before(depth);
        const tr = state.tr.delete(pos, pos + node.nodeSize);
        editor.view.dispatch(tr);
        closeElementProperties();
        toast.success("Element removed");
        return;
      }
      depth--;
    }

    // Fallback: delete the current block
    editor.chain().focus().deleteNode("paragraph").run();
  }, [editor, closeElementProperties]);

  // ---- Duplicate the currently selected block element ----
  const duplicateSelectedNode = useCallback(() => {
    if (!editor) return;
    const { state } = editor;
    const { selection } = state;
    const sel = selection as any;
    const duplicatableTypes = new Set([
      "twoColumnSection",
      "pageSection",
      "customButton",
      "image",
      "leadForm",
      "blockquote",
      "codeBlock",
      "youtube",
      ...CONTENT_BLOCK_TYPES,
    ]);

    // NodeSelection (image / button / section selected directly)
    if (sel.node && duplicatableTypes.has(sel.node.type.name)) {
      const node = sel.node;
      const insertPos = selection.to;
      const tr = state.tr.insert(insertPos, node.copy(node.content));
      editor.view.dispatch(tr);
      toast.success(`${node.type.name === "image" ? "Image" : "Element"} duplicated`);
      return;
    }

    // Cursor inside a block — walk up to the nearest duplicatable ancestor
    const { $from } = selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (duplicatableTypes.has(node.type.name)) {
        const after = $from.after(depth);
        const tr = state.tr.insert(after, node.copy(node.content));
        editor.view.dispatch(tr);
        toast.success("Element duplicated");
        return;
      }
    }
    toast.error("Select an element to duplicate");
  }, [editor]);

  // ---- Keyboard: Esc clears node selection, Del/Backspace removes it ----
  useEffect(() => {
    if (!editor) return;
    function onKeyDown(e: KeyboardEvent) {
      if (!editor || !editor.isFocused) return;
      const sel = editor.state.selection as any;
      const isNodeSelection = !!sel.node;
      if (e.key === "Escape") {
        // Collapse any node selection back to a caret and go back to the
        // Elements grid (mirrors clicking the Back button).
        const pos = editor.state.selection.to;
        editor.chain().setTextSelection(pos).run();
        closeElementProperties();
      } else if ((e.key === "Delete" || e.key === "Backspace") && isNodeSelection) {
        e.preventDefault();
        deleteSelectedNode();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor, deleteSelectedNode, closeElementProperties]);

  // ---- Delete image at current selection ----
  const deleteImage = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
    setShowImgPanel(false);
    toast.success("Image removed");
  }, [editor]);

  // ---- Replace image (re-upload) ----
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const replaceImage = useCallback(() => {
    replaceImageInputRef.current?.click();
  }, []);

  const onReplaceImageSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      try {
        toast.loading("Uploading image...", { id: "replace-upload" });
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        const data = await res.json();
        updateAtomNodeAttrs("image", { src: data.url });
        toast.success(`Image replaced${data.storage === 'r2' ? ' (uploaded to R2)' : ' (uploaded locally)'}!`, { id: "replace-upload" });
      } catch (err: any) {
        toast.error(err.message || "Upload failed", { id: "replace-upload" });
      }
      e.target.value = "";
    },
    [editor, updateAtomNodeAttrs]
  );

  // ---- Convert two-column to single column ----
  const convertToSingleCol = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().convertTwoColToSingle().run();
    setShowTwoColPanel(false);
    toast.success("Converted to single column");
  }, [editor]);

  // ---- Delete section ----
  const deleteSection = useCallback(() => {
    if (!editor) return;
    const { state } = editor;
    const { $from } = state.selection;
    let depth = $from.depth;
    while (depth > 0) {
      const node = $from.node(depth);
      if (node.type.name === "pageSection") {
        const pos = $from.before(depth);
        const tr = state.tr.delete(pos, pos + node.nodeSize);
        editor.view.dispatch(tr);
        setShowSectionPanel(false);
        toast.success("Section removed");
        return;
      }
      depth--;
    }
  }, [editor]);

  // ---- Delete two-column ----
  const deleteTwoCol = useCallback(() => {
    if (!editor) return;
    const { state } = editor;
    const { $from } = state.selection;
    let depth = $from.depth;
    while (depth > 0) {
      const node = $from.node(depth);
      if (node.type.name === "twoColumnSection") {
        const pos = $from.before(depth);
        const tr = state.tr.delete(pos, pos + node.nodeSize);
        editor.view.dispatch(tr);
        setShowTwoColPanel(false);
        toast.success("Two-column section removed");
        return;
      }
      depth--;
    }
  }, [editor]);

  // ---- Delete button ----
  const deleteButton = useCallback(() => {
    if (!editor) return;
    const { state } = editor;
    const { $from } = state.selection;
    if ($from.parent.type.name === "customButton") {
      const pos = $from.before($from.depth);
      const tr = state.tr.delete(pos, pos + $from.parent.nodeSize);
      editor.view.dispatch(tr);
      setShowBtnPanel(false);
      toast.success("Button removed");
    }
  }, [editor]);

  // -------------------------------------------------------------------------
  // Right-click context menu
  // -------------------------------------------------------------------------

  // Select the node that starts at `pos` as a ProseMirror NodeSelection. This
  // reuses the app's existing selection→panel wiring (syncSelection), so the
  // matching Properties panel opens exactly as it would on a normal click.
  const selectNodeAt = useCallback(
    (pos: number) => {
      if (!editor) return;
      try {
        const sel = NodeSelection.create(editor.state.doc, pos);
        editor.view.dispatch(editor.state.tr.setSelection(sel).scrollIntoView());
        editor.view.focus();
      } catch {
        /* node no longer selectable at this pos — ignore */
      }
    },
    [editor]
  );

  // Move the block that starts at `pos` up/down among its siblings.
  const moveNodeAt = useCallback(
    (pos: number, dir: -1 | 1) => {
      if (!editor) return;
      const { state } = editor;
      const node = state.doc.nodeAt(pos);
      if (!node) return;
      try {
        const $pos = state.doc.resolve(pos);
        const index = $pos.index();
        const parent = $pos.parent;
        if (dir === -1 && index === 0) {
          toast.error("Already at the top");
          return;
        }
        if (dir === 1 && index >= parent.childCount - 1) {
          toast.error("Already at the bottom");
          return;
        }
        let tr = state.tr;
        if (dir === -1) {
          const prevPos = $pos.posAtIndex(index - 1);
          tr = tr.delete(pos, pos + node.nodeSize);
          tr = tr.insert(prevPos, node);
          tr = tr.setSelection(NodeSelection.create(tr.doc, prevPos));
        } else {
          const next = parent.child(index + 1);
          const insertAt = pos + node.nodeSize + next.nodeSize;
          tr = tr.insert(insertAt, node);
          tr = tr.delete(pos, pos + node.nodeSize);
          tr = tr.setSelection(NodeSelection.create(tr.doc, pos + next.nodeSize));
        }
        editor.view.dispatch(tr.scrollIntoView());
        editor.view.focus();
        toast.success(dir === -1 ? "Moved up" : "Moved down");
      } catch {
        toast.error("Couldn't move this element");
      }
    },
    [editor]
  );

  const pasteFromClipboard = useCallback(async () => {
    if (!editor) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) editor.chain().focus().insertContent(text).run();
    } catch {
      toast.error("Clipboard access blocked by the browser");
    }
  }, [editor]);

  // Decide which menu (text vs block) to show for a right-click at the given
  // viewport coordinates, adjust the editor selection to match, and open it.
  const openContextMenu = useCallback(
    (clientX: number, clientY: number) => {
      if (!editor) return;
      const view = editor.view;
      const posInfo = view.posAtCoords({ left: clientX, top: clientY });
      if (!posInfo) return;

      const { doc } = editor.state;
      const clampedPos = Math.max(0, Math.min(posInfo.pos, doc.content.size));
      const $pos = doc.resolve(clampedPos);

      // 1) Atom/leaf element sitting directly under the click.
      let atom: { type: string; pos: number } | null = null;
      const candidates = [posInfo.inside, posInfo.pos, posInfo.pos - 1];
      for (const p of candidates) {
        if (p == null || p < 0 || p > doc.content.size) continue;
        const n = doc.nodeAt(p);
        if (n && CTX_ATOM_TYPES.has(n.type.name)) {
          atom = { type: n.type.name, pos: p };
          break;
        }
      }
      if (!atom && $pos.nodeAfter && CTX_ATOM_TYPES.has($pos.nodeAfter.type.name)) {
        atom = { type: $pos.nodeAfter.type.name, pos: clampedPos };
      }

      // 2) Layout-container ancestors (innermost first).
      const containers: { type: string; label: string; pos: number }[] = [];
      for (let d = $pos.depth; d >= 1; d--) {
        const n = $pos.node(d);
        if (CTX_CONTAINER_TYPES.has(n.type.name)) {
          containers.push({
            type: n.type.name,
            label: CTX_ELEMENT_LABELS[n.type.name] || n.type.name,
            pos: $pos.before(d),
          });
        }
      }

      const inText = $pos.parent.isTextblock;

      let mode: "text" | "block" = "text";
      let element: { type: string; label: string; pos: number } | undefined;

      if (atom) {
        mode = "block";
        element = { type: atom.type, label: CTX_ELEMENT_LABELS[atom.type] || atom.type, pos: atom.pos };
      } else if (!inText && containers.length) {
        mode = "block";
        element = containers[0];
      }

      if (mode === "block" && element) {
        selectNodeAt(element.pos);
      } else {
        // Text menu: place the caret where the user clicked unless they
        // right-clicked inside an existing (non-empty) text selection.
        const { from, to } = editor.state.selection;
        const insideSel = from !== to && clampedPos >= from && clampedPos <= to;
        if (!insideSel) {
          try {
            view.dispatch(
              editor.state.tr.setSelection(TextSelection.near(doc.resolve(clampedPos)))
            );
          } catch {
            /* ignore */
          }
        }
      }

      const sel = editor.state.selection;
      setCtxMenu({
        x: clientX,
        y: clientY,
        mode,
        element,
        containers,
        hasSelection: sel.from !== sel.to && !(sel as any).node,
      });
    },
    [editor, selectNodeAt]
  );

  // Attach the native contextmenu listener to the editable surface. Bound to
  // editor.view.dom (a stable node ProseMirror owns) so it survives the
  // EditorContent remounts that happen when focus moves between rich blocks.
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom as HTMLElement;
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      openContextMenu(e.clientX, e.clientY);
    };
    dom.addEventListener("contextmenu", handler);
    return () => dom.removeEventListener("contextmenu", handler);
  }, [editor, openContextMenu]);

  // Close the menu on Escape / resize. It deliberately does NOT close on
  // scroll — the menu is position:fixed, so it stays put while the canvas
  // scrolls beneath it. Click-outside (the backdrop) and Escape dismiss it.
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

  if (!editor) return null;

  const wordCount = editor.getText().split(/\s+/).filter((w) => w).length;
  const charCount = editor.getText().length;

  // Check if any element-specific panel is active
  const hasElementPanel = showBtnPanel || showImgPanel || showTwoColPanel || showSectionPanel || showFlexPanel || showGridPanel || showFormPanel || showVideoPanel || !!activeBlock;

  // How many cells the currently-targeted flex/grid container has, read live
  // from the doc so the panel can render one "pick this cell" chip per cell —
  // even when the whole container (not a specific cell) is selected.
  const cellCountAt = (pos: number | null, containerType: string): number => {
    if (pos == null) return 0;
    const n = editor.state.doc.nodeAt(pos);
    return n && n.type.name === containerType ? n.childCount : 0;
  };
  const flexCellCount = cellCountAt(flexContainerPosRef.current, "flexboxContainer");
  const gridCellCount = cellCountAt(gridContainerPosRef.current, "gridContainer");

  // ---- Context-menu action helpers (editor is non-null here) ----
  const closeCtx = () => setCtxMenu(null);
  const ctxRun = (fn: () => void) => {
    fn();
    closeCtx();
  };
  const openElementProperties = () => {
    setPropertiesOpen(true);
    setActiveTab("widgets");
    requestAnimationFrame(() => {
      document
        .querySelector("[data-element-properties]")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const ctxClipboard = (cmd: "copy" | "cut") => {
    try {
      document.execCommand(cmd);
    } catch {
      toast.error("Clipboard action unavailable");
    }
  };

  return (
    <div className="flex h-full w-full min-w-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelected}
        className="hidden"
      />
      <input
        ref={replaceImageInputRef}
        type="file"
        accept="image/*"
        onChange={onReplaceImageSelected}
        className="hidden"
      />
      <input
        ref={bgImageInputRef}
        type="file"
        accept="image/*"
        onChange={onBgImageSelected}
        className="hidden"
      />

      {/* ===== TOOLS PANEL (Elementor-style) — fixed to the left side ===== */}
      <div className={`order-1 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden ${
        templateData ? "w-[320px] min-w-[320px]" : "w-[300px] min-w-[300px]"
      }`}>
        {/* Panel Header with Tabs */}
        <div className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex">
            {templateData && (
              <button
                type="button"
                onClick={() => setActiveTab("template")}
                className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors relative ${
                  activeTab === "template"
                    ? "text-violet-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <LayoutTemplate className="h-3.5 w-3.5 inline mr-1.5" />
                Template
                {activeTab === "template" && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-violet-600 rounded-full" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("widgets")}
              className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors relative ${
                activeTab === "widgets"
                  ? "text-violet-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 inline mr-1.5" />
              Elements
              {activeTab === "widgets" && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-violet-600 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("style")}
              className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors relative ${
                activeTab === "style"
                  ? "text-violet-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Paintbrush className="h-3.5 w-3.5 inline mr-1.5" />
              Style
              {activeTab === "style" && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-violet-600 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Panel Body - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {activeTab === "template" && templateData ? (
            <div className="p-3">
              <TemplateEditor
                data={templateData}
                onChange={setTemplateData}
                landingPageId={landingPageId}
                activeSection={selectedTplSection}
                activeNonce={tplFocusNonce}
                onSelectSection={selectTplSection}
                hideLegacyRichContent={legacyRichHidden}
                onAddRichBlock={() =>
                  insertRichBlockAt(resolveSectionOrder(templateData.sectionOrder, templateData.deletedSections).length)
                }
              />
            </div>
          ) : activeTab === "widgets" ? (
            <>
              {propertiesOpen && hasElementPanel ? null : (
              <>
              {/* ===== INSERT WIDGETS GRID ===== */}
              <PanelSection title="Insert Elements" icon={<LayoutGrid className="h-4 w-4" />} defaultOpen>
                <div
                  className="grid grid-cols-3 gap-2"
                  onClickCapture={() => {
                    suppressPanelRef.current = Date.now() + 500;
                    // If an element is currently node-selected, inserting a new
                    // widget would REPLACE it. Hop the cursor to just after the
                    // selected node so inserts always add, never swallow.
                    const sel = editor?.state.selection as any;
                    if (sel?.node) editor?.commands.setTextSelection(sel.to);
                  }}
                >
                  <WidgetButton
                    icon={<Heading1 className="h-5 w-5" />}
                    label="Heading"
                    dragType="heading"
                    color="blue"
                    onClick={() => paletteInsert("heading", () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
                  />
                  <WidgetButton
                    icon={<Type className="h-5 w-5" />}
                    label="Text"
                    dragType="text"
                    color="gray"
                    onClick={() => paletteInsert("text", () => editor.chain().focus().setParagraph().run())}
                  />
                  <WidgetButton
                    icon={<Upload className="h-5 w-5" />}
                    label="Image"
                    dragType="image"
                    color="green"
                    onClick={() => paletteInsert("image", handleImageUpload)}
                  />
                  <WidgetButton
                    icon={<MousePointerClick className="h-5 w-5" />}
                    label="Button"
                    dragType="button"
                    color="violet"
                    onClick={() => paletteInsert("button", insertButton)}
                  />
                  <WidgetButton
                    icon={<YoutubeIcon className="h-5 w-5" />}
                    label="Video"
                    dragType="video"
                    color="rose"
                    onClick={() => paletteInsert("video", addYoutubeVideo)}
                  />
                  <WidgetButton
                    icon={<Minus className="h-5 w-5" />}
                    label="Divider"
                    dragType="divider"
                    color="gray"
                    onClick={() => paletteInsert("divider", () => editor.chain().focus().setHorizontalRule().run())}
                  />
                  <WidgetButton
                    icon={<Layers className="h-5 w-5" />}
                    label="Section"
                    dragType="section"
                    color="amber"
                    onClick={() => paletteInsert("section", () => insertSection())}
                  />
                  <WidgetButton
                    icon={<FormInput className="h-5 w-5" />}
                    label="Form"
                    dragType="form"
                    color="green"
                    onClick={() => paletteInsert("form", insertLeadForm)}
                  />
                  <WidgetButton
                    icon={<StretchHorizontal className="h-5 w-5" />}
                    label="Flexbox"
                    dragType="flexbox"
                    color="blue"
                    onClick={() => paletteInsert("flexbox", insertFlexbox)}
                  />
                  <WidgetButton
                    icon={<Grid3x3 className="h-5 w-5" />}
                    label="Grid"
                    dragType="grid"
                    color="blue"
                    onClick={() => paletteInsert("grid", insertGridBox)}
                  />
                  <WidgetButton
                    icon={<Quote className="h-5 w-5" />}
                    label="Quote"
                    dragType="quote"
                    color="amber"
                    onClick={() => paletteInsert("quote", () => editor.chain().focus().toggleBlockquote().run())}
                  />
                  <WidgetButton
                    icon={<List className="h-5 w-5" />}
                    label="List"
                    dragType="list"
                    color="gray"
                    onClick={() => paletteInsert("list", () => editor.chain().focus().toggleBulletList().run())}
                  />
                  <WidgetButton
                    icon={<ListOrdered className="h-5 w-5" />}
                    label="Numbered"
                    dragType="numbered"
                    color="gray"
                    onClick={() => paletteInsert("numbered", () => editor.chain().focus().toggleOrderedList().run())}
                  />
                  <WidgetButton
                    icon={<Code2 className="h-5 w-5" />}
                    label="Code"
                    dragType="code"
                    color="gray"
                    onClick={() => paletteInsert("code", () => editor.chain().focus().toggleCodeBlock().run())}
                  />
                  <WidgetButton
                    icon={<WrapText className="h-5 w-5" />}
                    label="Line Break"
                    color="gray"
                    onClick={() => editor.chain().focus().setHardBreak().run()}
                  />
                </div>
              </PanelSection>

              {/* ===== SECTIONS & BLOCKS ===== */}
              <PanelSection title="Sections & Blocks" icon={<Layers className="h-4 w-4" />} defaultOpen>
                <div
                  className="grid grid-cols-3 gap-2"
                  onClickCapture={() => {
                    suppressPanelRef.current = Date.now() + 500;
                    // If an element is currently node-selected, inserting a new
                    // widget would REPLACE it. Hop the cursor to just after the
                    // selected node so inserts always add, never swallow.
                    const sel = editor?.state.selection as any;
                    if (sel?.node) editor?.commands.setTextSelection(sel.to);
                  }}
                >
                  <WidgetButton
                    icon={<Sparkles className="h-5 w-5" />}
                    label="Features"
                    dragType="featureGrid"
                    color="violet"
                    onClick={() => paletteInsert("featureGrid", insertFeatureGrid)}
                  />
                  <WidgetButton
                    icon={<BarChart3 className="h-5 w-5" />}
                    label="Stats"
                    dragType="statsRow"
                    color="blue"
                    onClick={() => paletteInsert("statsRow", insertStatsRow)}
                  />
                  <WidgetButton
                    icon={<HelpCircle className="h-5 w-5" />}
                    label="FAQ"
                    dragType="faqAccordion"
                    color="amber"
                    onClick={() => paletteInsert("faqAccordion", insertFaqAccordion)}
                  />
                  <WidgetButton
                    icon={<MessageSquare className="h-5 w-5" />}
                    label="Reviews"
                    dragType="testimonialCards"
                    color="green"
                    onClick={() => paletteInsert("testimonialCards", insertTestimonialCards)}
                  />
                  <WidgetButton
                    icon={<Images className="h-5 w-5" />}
                    label="Gallery"
                    dragType="imageGallery"
                    color="gray"
                    onClick={() => paletteInsert("imageGallery", insertImageGallery)}
                  />
                </div>
              </PanelSection>

              {/* ===== TEXT FORMATTING ===== */}
              <PanelSection title="Text Formatting" icon={<Bold className="h-4 w-4" />}>
                <div className="space-y-3">
                  {/* Font Family */}
                  <div>
                    <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Font</Label>
                    <select
                      value={editor.getAttributes("textStyle").fontFamily || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!v) editor.chain().focus().unsetFontFamily().run();
                        else editor.chain().focus().setFontFamily(v).run();
                      }}
                      className="w-full h-9 px-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.label} value={f.stack} style={{ fontFamily: f.stack || undefined }}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size, Line Height, Letter Spacing */}
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-[10px] text-gray-400">Size (e.g. 16px, 1.25rem)</Label>
                        <Input
                          value={editor.getAttributes("textStyle").fontSize || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cmds = editor.commands as any;
                            if (!val) cmds.unsetFontSize();
                            else cmds.setFontSize(val);
                          }}
                          className="h-8 text-xs bg-gray-50 border-gray-200"
                          placeholder="e.g. 16px"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-[10px] text-gray-400">Line Height</Label>
                        <Input
                          value={editor.getAttributes("textStyle").lineHeight || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cmds = editor.commands as any;
                            if (!val) cmds.unsetLineHeight();
                            else cmds.setLineHeight(val);
                          }}
                          className="h-8 text-xs bg-gray-50 border-gray-200"
                          placeholder="e.g. 1.5"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-gray-400">Letter Spacing</Label>
                        <Input
                          value={editor.getAttributes("textStyle").letterSpacing || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cmds = editor.commands as any;
                            if (!val) cmds.unsetLetterSpacing();
                            else cmds.setLetterSpacing(val);
                          }}
                          className="h-8 text-xs bg-gray-50 border-gray-200"
                          placeholder="e.g. 0.05em"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inline Formatting */}
                  <div>
                    <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Inline Style</Label>
                    <div className="flex flex-wrap gap-1">
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive("bold")}
                        title="Bold"
                      >
                        <Bold className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive("italic")}
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        active={editor.isActive("underline")}
                        title="Underline"
                      >
                        <UnderlineIcon className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        active={editor.isActive("strike")}
                        title="Strikethrough"
                      >
                        <Strikethrough className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        active={editor.isActive("code")}
                        title="Inline Code"
                      >
                        <Code className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                        title="Clear Formatting"
                      >
                        <RemoveFormatting className="h-4 w-4" />
                      </ToolbarButton>
                    </div>
                  </div>

                  {/* Headings */}
                  <div>
                    <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Block Type</Label>
                    <div className="flex flex-wrap gap-1">
                      <ToolbarButton
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        active={editor.isActive("paragraph")}
                        title="Paragraph"
                      >
                        <Pilcrow className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={editor.isActive("heading", { level: 1 })}
                        title="Heading 1"
                      >
                        <Heading1 className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive("heading", { level: 2 })}
                        title="Heading 2"
                      >
                        <Heading2 className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={editor.isActive("heading", { level: 3 })}
                        title="Heading 3"
                      >
                        <Heading3 className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                        active={editor.isActive("heading", { level: 4 })}
                        title="Heading 4"
                      >
                        <Heading4 className="h-4 w-4" />
                      </ToolbarButton>
                    </div>
                  </div>

                  {/* Alignment */}
                  <div>
                    <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Alignment</Label>
                    <div className="flex flex-wrap gap-1">
                      <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        active={editor.isActive({ textAlign: "left" })}
                        title="Align Left"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        active={editor.isActive({ textAlign: "center" })}
                        title="Align Center"
                      >
                        <AlignCenter className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        active={editor.isActive({ textAlign: "right" })}
                        title="Align Right"
                      >
                        <AlignRight className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                        active={editor.isActive({ textAlign: "justify" })}
                        title="Justify"
                      >
                        <AlignJustify className="h-4 w-4" />
                      </ToolbarButton>
                    </div>
                  </div>

                  {/* Lists */}
                  <div>
                    <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Lists & Blocks</Label>
                    <div className="flex flex-wrap gap-1">
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive("bulletList")}
                        title="Bullet List"
                      >
                        <List className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive("orderedList")}
                        title="Ordered List"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={editor.isActive("blockquote")}
                        title="Blockquote"
                      >
                        <Quote className="h-4 w-4" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        active={editor.isActive("codeBlock")}
                        title="Code Block"
                      >
                        <Code2 className="h-4 w-4" />
                      </ToolbarButton>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Colors</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5" title="Text Color">
                        <Palette className="h-3.5 w-3.5 text-gray-400" />
                        <div className="relative">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => applyTextColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div
                            className="h-7 w-7 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300"
                            style={{ backgroundColor: textColor }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">Text</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Highlight Color">
                        <Highlighter className="h-3.5 w-3.5 text-gray-400" />
                        <div className="relative">
                          <input
                            type="color"
                            value={hlColor}
                            onChange={(e) => applyHighlight(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div
                            className="h-7 w-7 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300"
                            style={{ backgroundColor: hlColor }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">Highlight</span>
                      </div>
                    </div>
                    {/* Theme color swatches */}
                    {themeColors && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-gray-400">Theme:</span>
                        {Object.entries(themeColors).map(([key, color]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => editor.chain().focus().setColor(color).run()}
                            className="h-5 w-5 rounded-full border-2 border-gray-200 hover:scale-125 hover:border-gray-400 transition-all"
                            style={{ backgroundColor: color }}
                            title={`Apply ${key} color`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </PanelSection>

              {/* ===== LINKS & MEDIA ===== */}
              <PanelSection title="Links & Media" icon={<LinkIcon className="h-4 w-4" />}>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleSetLink}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                      editor.isActive("link")
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>{editor.isActive("link") ? "Edit Link" : "Add Link"}</span>
                  </button>
                  {editor.isActive("link") && (
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().unsetLink().run()}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-red-50 border-red-200 text-red-600 text-sm hover:bg-red-100 transition-all"
                    >
                      <Unlink className="h-4 w-4" />
                      <span>Remove Link</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addImageByUrl}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-gray-50 border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition-all"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Image from URL</span>
                  </button>
                </div>
              </PanelSection>
              </>
              )}

              {propertiesOpen && hasElementPanel && (
              <>
              {/* ===== BACK TO ELEMENTS ===== */}
              <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-2.5">
                <button
                  type="button"
                  onClick={closeElementProperties}
                  className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-violet-600 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Elements
                </button>
                {selectedLabel && (
                  <>
                    <span className="text-gray-300">/</span>
                    <span className="text-[11px] font-semibold text-violet-600">{selectedLabel}</span>
                  </>
                )}
              </div>

              {/* ===== ELEMENT-SPECIFIC PANELS ===== */}
              {hasElementPanel && <div data-element-properties />}
              {showBtnPanel && (
                <PanelSection title="Button Properties" icon={<MousePointerClick className="h-4 w-4" />} defaultOpen badge="Active">
                  <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={deleteButton}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Link URL</Label>
                      <Input
                        value={btnAttrs.href}
                        onChange={(e) => updateButtonAttr("href", e.target.value)}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        placeholder="https://..."
                      />
                    </div>
                    <ColorRow label="Background" value={btnAttrs.backgroundColor} onChange={(v) => updateButtonAttr("backgroundColor", v)} />
                    <ColorRow label="Text Color" value={btnAttrs.textColor} onChange={(v) => updateButtonAttr("textColor", v)} />
                    <ColorRow label="Border Color" value={btnAttrs.borderColor} onChange={(v) => updateButtonAttr("borderColor", v)} />
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Border Radius</Label>
                      <Input
                        type="number"
                        value={btnAttrs.borderRadius}
                        onChange={(e) => updateButtonAttr("borderRadius", Number(e.target.value))}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        min={0}
                        max={999}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Padding</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">X</span>
                          <Input
                            type="number"
                            value={btnAttrs.paddingX}
                            onChange={(e) => updateButtonAttr("paddingX", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">Y</span>
                          <Input
                            type="number"
                            value={btnAttrs.paddingY}
                            onChange={(e) => updateButtonAttr("paddingY", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Alignment</Label>
                      <SegmentedControl
                        options={[
                          { label: "Left", value: "left" },
                          { label: "Center", value: "center" },
                          { label: "Right", value: "right" },
                        ]}
                        value={btnAttrs.align}
                        onChange={(v) => updateButtonAttr("align", v)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-gray-600">Shadow</Label>
                        <Switch checked={btnAttrs.shadow} onCheckedChange={(v) => updateButtonAttr("shadow", v)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-gray-600">Full Width</Label>
                        <Switch checked={btnAttrs.width === "full"} onCheckedChange={(v) => updateButtonAttr("width", v ? "full" : "auto")} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-gray-600">Outline Style</Label>
                        <Switch checked={btnAttrs.variant === "outline"} onCheckedChange={(v) => updateButtonAttr("variant", v ? "outline" : "solid")} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">Typography</Label>
                      <div className="space-y-2 bg-gray-50 p-2 rounded-lg border border-gray-150">
                        <div>
                          <span className="text-[10px] text-gray-400">Size (px)</span>
                          <Input
                            type="number"
                            value={btnAttrs.fontSize || 16}
                            onChange={(e) => updateButtonAttr("fontSize", Number(e.target.value))}
                            className="h-8 text-xs bg-white border-gray-200"
                            min={8}
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400">Weight</span>
                          <SegmentedControl
                            options={[
                              { label: "Normal", value: "400" },
                              { label: "Semi", value: "600" },
                              { label: "Bold", value: "700" },
                              { label: "Extra", value: "800" },
                            ]}
                            value={String(btnAttrs.fontWeight || 600)}
                            onChange={(v) => updateButtonAttr("fontWeight", Number(v))}
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400">Letter Spacing (em)</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={btnAttrs.letterSpacing || 0.01}
                            onChange={(e) => updateButtonAttr("letterSpacing", Number(e.target.value))}
                            className="h-8 text-xs bg-white border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">Hover & Transitions</Label>
                      <div className="space-y-2 bg-gray-50 p-2 rounded-lg border border-gray-150">
                        <ColorRow label="Hover BG" value={btnAttrs.hoverBg || btnAttrs.backgroundColor} onChange={(v) => updateButtonAttr("hoverBg", v)} />
                        <ColorRow label="Hover Text" value={btnAttrs.hoverTextColor || btnAttrs.textColor} onChange={(v) => updateButtonAttr("hoverTextColor", v)} />
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-gray-600">Scale (1.05x)</span>
                          <Switch checked={btnAttrs.hoverScale} onCheckedChange={(v) => updateButtonAttr("hoverScale", v)} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-600">Hover Shadow</span>
                          <Switch checked={btnAttrs.hoverShadow} onCheckedChange={(v) => updateButtonAttr("hoverShadow", v)} />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400">Transition ({btnAttrs.transitionDuration || 200}ms)</span>
                          <input
                            type="range"
                            min="100"
                            max="1000"
                            step="50"
                            value={btnAttrs.transitionDuration || 200}
                            onChange={(e) => updateButtonAttr("transitionDuration", Number(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">Entry Animation</Label>
                      <div className="space-y-2 bg-gray-50 p-2 rounded-lg border border-gray-150">
                        <div>
                          <span className="text-[10px] text-gray-400">Effect</span>
                          <SegmentedControl
                            options={[
                              { label: "None", value: "none" },
                              { label: "Fade", value: "fade-in" },
                              { label: "Slide", value: "slide-up" },
                              { label: "Zoom", value: "zoom-in" },
                              { label: "Bounce", value: "bounce" },
                            ]}
                            value={btnAttrs.animationEffect || "none"}
                            onChange={(v) => updateButtonAttr("animationEffect", v)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Duration (ms)</span>
                            <Input
                              type="number"
                              value={btnAttrs.animationDuration || 800}
                              onChange={(e) => updateButtonAttr("animationDuration", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={100}
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Delay (ms)</span>
                            <Input
                              type="number"
                              value={btnAttrs.animationDelay || 0}
                              onChange={(e) => updateButtonAttr("animationDelay", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={0}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </PanelSection>
              )}

              {showImgPanel && (
                <PanelSection title="Image Properties" icon={<ImageIcon className="h-4 w-4" />} defaultOpen badge="Active">
                  <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={replaceImage}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-[11px] font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Replace className="h-3.5 w-3.5" /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={deleteImage}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Width</Label>
                      <div className="flex gap-1">
                        {["25%", "50%", "75%", "100%"].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => updateImageAttr("width", w)}
                            className={`flex-1 h-8 text-[11px] font-medium rounded-lg border transition-all ${
                              imgWidth === w
                                ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Custom Width</Label>
                      <Input
                        value={imgWidth}
                        onChange={(e) => updateImageAttr("width", e.target.value)}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        placeholder="e.g. 300px or 50%"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Alignment</Label>
                      <SegmentedControl
                        options={[
                          { label: "Left", value: "left" },
                          { label: "Center", value: "center" },
                          { label: "Right", value: "right" },
                        ]}
                        value={imgAlign}
                        onChange={(v) => updateImageAttr("align", v)}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Height</Label>
                      <Input
                        value={imgHeight}
                        onChange={(e) => updateImageAttr("height", e.target.value)}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        placeholder="e.g. auto or 300px"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Aspect Ratio</Label>
                      <SegmentedControl
                        options={[
                          { label: "Auto", value: "auto" },
                          { label: "16:9", value: "16/9" },
                          { label: "4:3", value: "4/3" },
                          { label: "1:1", value: "1/1" },
                        ]}
                        value={imgAspectRatio}
                        onChange={(v) => updateImageAttr("aspectRatio", v)}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Border Radius ({imgBorderRadius}px)</Label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={imgBorderRadius}
                        onChange={(e) => updateImageAttr("borderRadius", Number(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Shadow</Label>
                      <SegmentedControl
                        options={[
                          { label: "None", value: "none" },
                          { label: "Sm", value: "sm" },
                          { label: "Md", value: "md" },
                          { label: "Lg", value: "lg" },
                          { label: "Xl", value: "xl" },
                        ]}
                        value={imgShadow}
                        onChange={(v) => updateImageAttr("shadow", v)}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Opacity ({imgOpacity}%)</Label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={imgOpacity}
                        onChange={(e) => updateImageAttr("opacity", Number(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Object Fit</Label>
                      <SegmentedControl
                        options={[
                          { label: "Cover", value: "cover" },
                          { label: "Contain", value: "contain" },
                          { label: "Fill", value: "fill" },
                        ]}
                        value={imgObjectFit}
                        onChange={(v) => updateImageAttr("objectFit", v)}
                      />
                    </div>
                    {imgObjectFit !== "fill" && (
                      <div>
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">
                          Crop Position
                        </Label>
                        <div className="grid grid-cols-3 gap-1 w-[92px]">
                          {[
                            "left top", "top", "right top",
                            "left", "center", "right",
                            "left bottom", "bottom", "right bottom",
                          ].map((pos) => (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => updateImageAttr("objectPosition", pos)}
                              title={pos}
                              className={`h-7 w-7 rounded-md border flex items-center justify-center transition-all ${
                                imgObjectPosition === pos
                                  ? "bg-violet-600 border-violet-600"
                                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  imgObjectPosition === pos ? "bg-white" : "bg-gray-400"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Which part of the image stays visible when cropped.</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Margins (px)</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">Top</span>
                          <Input
                            type="number"
                            value={imgMarginTop}
                            onChange={(e) => updateImageAttr("marginTop", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">Bottom</span>
                          <Input
                            type="number"
                            value={imgMarginBottom}
                            onChange={(e) => updateImageAttr("marginBottom", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Hover Effect</Label>
                      <SegmentedControl
                        options={[
                          { label: "None", value: "none" },
                          { label: "Zoom", value: "zoom" },
                          { label: "Fade", value: "fade" },
                          { label: "Tilt", value: "tilt" },
                        ]}
                        value={imgHoverEffect}
                        onChange={(v) => updateImageAttr("hoverEffect", v)}
                      />
                    </div>
                  </div>
                </PanelSection>
              )}

              {showSectionPanel && (
                <PanelSection title="Section Properties" icon={<Layers className="h-4 w-4" />} defaultOpen badge="Active">
                  <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={deleteSection}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Section
                      </button>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Label</Label>
                      <Input
                        value={sectionAttrs.label}
                        onChange={(e) => updateSectionAttr("label", e.target.value)}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        placeholder="e.g. Hero, Features"
                      />
                    </div>
                    <ColorRow label="Background" value={sectionAttrs.backgroundColor} onChange={(v) => updateSectionAttr("backgroundColor", v)} />
                    <ColorRow label="Text Color" value={sectionAttrs.textColor} onChange={(v) => updateSectionAttr("textColor", v)} />
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider block">Background Image</Label>
                      <div className="flex gap-1.5 mt-1">
                        <Input
                          value={sectionAttrs.backgroundImage || ""}
                          onChange={(e) => {
                            updateSectionAttr("backgroundImage", e.target.value);
                            updateSectionAttr("backgroundGradient", "");
                          }}
                          className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
                          placeholder="Image URL or upload"
                        />
                        <Button
                          type="button"
                          onClick={handleBgImageUpload}
                          variant="outline"
                          className="h-8 px-2.5 text-xs border-gray-200"
                        >
                          Upload
                        </Button>
                      </div>
                      {sectionAttrs.backgroundImage && (
                        <button
                          type="button"
                          onClick={() => updateSectionAttr("backgroundImage", "")}
                          className="text-[10px] text-red-500 mt-1 hover:underline block text-left"
                        >
                          Clear image
                        </button>
                      )}
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider block">Background Gradient</Label>
                      <select
                        value={sectionAttrs.backgroundGradient || ""}
                        onChange={(e) => {
                          updateSectionAttr("backgroundGradient", e.target.value);
                          updateSectionAttr("backgroundImage", "");
                        }}
                        className="w-full h-8 px-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                      >
                        {GRADIENT_PRESETS.map((g) => (
                          <option key={g.label} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={sectionAttrs.backgroundGradient || ""}
                        onChange={(e) => {
                          updateSectionAttr("backgroundGradient", e.target.value);
                          updateSectionAttr("backgroundImage", "");
                        }}
                        className="h-8 text-xs bg-gray-50 border-gray-200 mt-1"
                        placeholder="Custom CSS Gradient (linear-gradient...)"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Min Height (px)</Label>
                      <Input
                        type="number"
                        value={sectionAttrs.minHeight || 0}
                        onChange={(e) => updateSectionAttr("minHeight", Number(e.target.value))}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        min={0}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Border Radius (px)</Label>
                      <Input
                        type="number"
                        value={sectionAttrs.borderRadius || 0}
                        onChange={(e) => updateSectionAttr("borderRadius", Number(e.target.value))}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        min={0}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Padding</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">X</span>
                          <Input
                            type="number"
                            value={sectionAttrs.paddingX}
                            onChange={(e) => updateSectionAttr("paddingX", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">Y</span>
                          <Input
                            type="number"
                            value={sectionAttrs.paddingY}
                            onChange={(e) => updateSectionAttr("paddingY", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-gray-600">Full Width</Label>
                        <Switch checked={sectionAttrs.fullWidth} onCheckedChange={(v) => updateSectionAttr("fullWidth", v)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-gray-600">Border Bottom</Label>
                        <Switch checked={sectionAttrs.borderBottom} onCheckedChange={(v) => updateSectionAttr("borderBottom", v)} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">Entry Animation</Label>
                      <div className="space-y-2 bg-gray-50 p-2 rounded-lg border border-gray-150">
                        <div>
                          <span className="text-[10px] text-gray-400">Effect</span>
                          <select
                            value={sectionAttrs.animationEffect || "none"}
                            onChange={(e) => updateSectionAttr("animationEffect", e.target.value)}
                            className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                          >
                            <option value="none">None</option>
                            <option value="fade-in">Fade In</option>
                            <option value="slide-up">Slide Up</option>
                            <option value="slide-left">Slide Left</option>
                            <option value="zoom-in">Zoom In</option>
                            <option value="bounce">Bounce</option>
                          </select>
                        </div>
                        {sectionAttrs.animationEffect && sectionAttrs.animationEffect !== "none" && (
                          <>
                            <div>
                              <span className="text-[10px] text-gray-400">Duration ({sectionAttrs.animationDuration || 800}ms)</span>
                              <input
                                type="range"
                                min="200"
                                max="3000"
                                step="100"
                                value={sectionAttrs.animationDuration || 800}
                                onChange={(e) => updateSectionAttr("animationDuration", Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400">Delay ({sectionAttrs.animationDelay || 0}ms)</span>
                              <input
                                type="range"
                                min="0"
                                max="2000"
                                step="100"
                                value={sectionAttrs.animationDelay || 0}
                                onChange={(e) => updateSectionAttr("animationDelay", Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {themeColors && (
                      <div>
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Quick Theme</Label>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              updateSectionAttr("backgroundColor", "transparent");
                              updateSectionAttr("textColor", "#111827");
                            }}
                            className="h-7 w-7 rounded-lg border-2 border-gray-300 bg-white hover:scale-110 transition-transform"
                            title="White / Transparent"
                          />
                          {Object.entries(themeColors).map(([key, color]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                updateSectionAttr("backgroundColor", color);
                                updateSectionAttr("textColor", "#ffffff");
                              }}
                              className="h-7 w-7 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={`${key} background`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </PanelSection>
              )}

              {showFlexPanel && (
                <PanelSection title="Flexbox Properties" icon={<StretchHorizontal className="h-4 w-4" />} defaultOpen badge="Active">
                  <div className="space-y-3">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => deleteLayoutContainer("flexboxContainer")}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Flexbox
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => addLayoutCell("flexboxContainer")}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-medium hover:bg-violet-100 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Cell
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLayoutCell("flexboxContainer")}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-[11px] font-medium hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" /> Remove Cell
                      </button>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Direction</Label>
                      <select
                        value={flexAttrs.direction}
                        onChange={(e) => updateFlexAttr("direction", e.target.value)}
                        className="w-full h-8 px-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                      >
                        <option value="row">Row (horizontal)</option>
                        <option value="row-reverse">Row Reverse</option>
                        <option value="column">Column (vertical)</option>
                        <option value="column-reverse">Column Reverse</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Justify Content</Label>
                      <select
                        value={flexAttrs.justifyContent}
                        onChange={(e) => updateFlexAttr("justifyContent", e.target.value)}
                        className="w-full h-8 px-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Space Between</option>
                        <option value="space-around">Space Around</option>
                        <option value="space-evenly">Space Evenly</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Align Items</Label>
                      <select
                        value={flexAttrs.alignItems}
                        onChange={(e) => updateFlexAttr("alignItems", e.target.value)}
                        className="w-full h-8 px-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                      >
                        <option value="stretch">Stretch</option>
                        <option value="flex-start">Top</option>
                        <option value="center">Center</option>
                        <option value="flex-end">Bottom</option>
                        <option value="baseline">Baseline</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Gap (px)</Label>
                        <Input
                          type="number"
                          value={flexAttrs.gap}
                          onChange={(e) => updateFlexAttr("gap", Number(e.target.value))}
                          className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                          min={0}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Min Height</Label>
                        <Input
                          type="number"
                          value={flexAttrs.minHeight}
                          onChange={(e) => updateFlexAttr("minHeight", Number(e.target.value))}
                          className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                          min={0}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Padding</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">X</span>
                          <Input
                            type="number"
                            value={flexAttrs.paddingX}
                            onChange={(e) => updateFlexAttr("paddingX", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">Y</span>
                          <Input
                            type="number"
                            value={flexAttrs.paddingY}
                            onChange={(e) => updateFlexAttr("paddingY", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                    <ColorRow label="Background" value={flexAttrs.backgroundColor} onChange={(v) => updateFlexAttr("backgroundColor", v)} />
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Border Radius (px)</Label>
                      <Input
                        type="number"
                        value={flexAttrs.borderRadius}
                        onChange={(e) => updateFlexAttr("borderRadius", Number(e.target.value))}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        min={0}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-gray-600">Wrap Items</Label>
                        <Switch checked={flexAttrs.wrap} onCheckedChange={(v) => updateFlexAttr("wrap", v)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-gray-600">Full Width</Label>
                        <Switch checked={flexAttrs.fullWidth} onCheckedChange={(v) => updateFlexAttr("fullWidth", v)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-gray-600">Stack on Mobile</Label>
                        <Switch checked={flexAttrs.stackOnMobile} onCheckedChange={(v) => updateFlexAttr("stackOnMobile", v)} />
                      </div>
                    </div>
                    {flexCellCount > 0 && (
                      <div>
                        <Label className="text-[11px] text-gray-600">Edit a cell</Label>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {Array.from({ length: flexCellCount }, (_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => selectLayoutCell("flexboxContainer", i)}
                              className={`h-7 min-w-[28px] px-2 rounded-md text-[11px] font-semibold border transition-colors ${
                                flexCellInfo?.index === i
                                  ? "bg-violet-600 text-white border-violet-600"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {flexCellInfo && (
                      <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-2.5 space-y-3">
                        <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">
                          Selected Cell ({flexCellInfo.index + 1} of {flexCellInfo.count})
                        </p>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Grow</span>
                            <Input
                              type="number"
                              value={flexItemAttrs.grow}
                              onChange={(e) => updateFlexItemAttr("grow", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={0}
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Shrink</span>
                            <Input
                              type="number"
                              value={flexItemAttrs.shrink}
                              onChange={(e) => updateFlexItemAttr("shrink", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={0}
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400">Basis / Width (0% = share equally, or e.g. auto, 240px, 33%)</span>
                          <Input
                            value={flexItemAttrs.basis}
                            onChange={(e) => updateFlexItemAttr("basis", e.target.value)}
                            className="h-8 text-xs mt-1 bg-white border-gray-200"
                            placeholder="0%"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400">Align Self</span>
                          <select
                            value={flexItemAttrs.alignSelf}
                            onChange={(e) => updateFlexItemAttr("alignSelf", e.target.value)}
                            className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                          >
                            <option value="auto">Auto (inherit)</option>
                            <option value="flex-start">Top</option>
                            <option value="center">Center</option>
                            <option value="flex-end">Bottom</option>
                            <option value="stretch">Stretch</option>
                            <option value="baseline">Baseline</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Min Width</span>
                            <Input
                              type="number"
                              value={flexItemAttrs.minWidth}
                              onChange={(e) => updateFlexItemAttr("minWidth", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={0}
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Padding</span>
                            <Input
                              type="number"
                              value={flexItemAttrs.padding}
                              onChange={(e) => updateFlexItemAttr("padding", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={0}
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Radius</span>
                            <Input
                              type="number"
                              value={flexItemAttrs.borderRadius}
                              onChange={(e) => updateFlexItemAttr("borderRadius", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={0}
                            />
                          </div>
                        </div>
                        <ColorRow label="Cell Background" value={flexItemAttrs.backgroundColor} onChange={(v) => updateFlexItemAttr("backgroundColor", v)} />
                      </div>
                    )}
                  </div>
                </PanelSection>
              )}

              {showGridPanel && (
                <PanelSection title="Grid Properties" icon={<Grid3x3 className="h-4 w-4" />} defaultOpen badge="Active">
                  <div className="space-y-3">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => deleteLayoutContainer("gridContainer")}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Grid
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => addLayoutCell("gridContainer")}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-medium hover:bg-violet-100 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Cell
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLayoutCell("gridContainer")}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-[11px] font-medium hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" /> Remove Cell
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Columns</Label>
                        <Input
                          type="number"
                          value={gridAttrs.columns}
                          onChange={(e) => updateGridAttr("columns", Math.max(1, Number(e.target.value)))}
                          className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                          min={1}
                          max={12}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Row Min H.</Label>
                        <Input
                          type="number"
                          value={gridAttrs.rowMinHeight}
                          onChange={(e) => updateGridAttr("rowMinHeight", Number(e.target.value))}
                          className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                          min={0}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Custom Columns (CSS)</Label>
                      <Input
                        value={gridAttrs.customTemplate}
                        onChange={(e) => updateGridAttr("customTemplate", e.target.value)}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        placeholder="e.g. 2fr 1fr — overrides Columns"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Gap</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">Horizontal</span>
                          <Input
                            type="number"
                            value={gridAttrs.gapX}
                            onChange={(e) => updateGridAttr("gapX", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">Vertical</span>
                          <Input
                            type="number"
                            value={gridAttrs.gapY}
                            onChange={(e) => updateGridAttr("gapY", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Justify Items</Label>
                        <select
                          value={gridAttrs.justifyItems}
                          onChange={(e) => updateGridAttr("justifyItems", e.target.value)}
                          className="w-full h-8 px-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                        >
                          <option value="stretch">Stretch</option>
                          <option value="start">Start</option>
                          <option value="center">Center</option>
                          <option value="end">End</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Align Items</Label>
                        <select
                          value={gridAttrs.alignItems}
                          onChange={(e) => updateGridAttr("alignItems", e.target.value)}
                          className="w-full h-8 px-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                        >
                          <option value="stretch">Stretch</option>
                          <option value="start">Top</option>
                          <option value="center">Center</option>
                          <option value="end">Bottom</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Padding</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">X</span>
                          <Input
                            type="number"
                            value={gridAttrs.paddingX}
                            onChange={(e) => updateGridAttr("paddingX", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">Y</span>
                          <Input
                            type="number"
                            value={gridAttrs.paddingY}
                            onChange={(e) => updateGridAttr("paddingY", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Min Height</Label>
                        <Input
                          type="number"
                          value={gridAttrs.minHeight}
                          onChange={(e) => updateGridAttr("minHeight", Number(e.target.value))}
                          className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                          min={0}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Radius</Label>
                        <Input
                          type="number"
                          value={gridAttrs.borderRadius}
                          onChange={(e) => updateGridAttr("borderRadius", Number(e.target.value))}
                          className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                          min={0}
                        />
                      </div>
                    </div>
                    <ColorRow label="Background" value={gridAttrs.backgroundColor} onChange={(v) => updateGridAttr("backgroundColor", v)} />
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-gray-600">Stack on Mobile</Label>
                      <Switch checked={gridAttrs.stackOnMobile} onCheckedChange={(v) => updateGridAttr("stackOnMobile", v)} />
                    </div>
                    {gridCellCount > 0 && (
                      <div>
                        <Label className="text-[11px] text-gray-600">Edit a cell</Label>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {Array.from({ length: gridCellCount }, (_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => selectLayoutCell("gridContainer", i)}
                              className={`h-7 min-w-[28px] px-2 rounded-md text-[11px] font-semibold border transition-colors ${
                                gridCellInfo?.index === i
                                  ? "bg-violet-600 text-white border-violet-600"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {gridCellInfo && (
                      <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-2.5 space-y-3">
                        <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">
                          Selected Cell ({gridCellInfo.index + 1} of {gridCellInfo.count})
                        </p>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Col Span</span>
                            <Input
                              type="number"
                              value={gridItemAttrs.colSpan}
                              onChange={(e) => updateGridItemAttr("colSpan", Math.max(1, Number(e.target.value)))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={1}
                              max={12}
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Row Span</span>
                            <Input
                              type="number"
                              value={gridItemAttrs.rowSpan}
                              onChange={(e) => updateGridItemAttr("rowSpan", Math.max(1, Number(e.target.value)))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={1}
                              max={12}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Justify Self</span>
                            <select
                              value={gridItemAttrs.justifySelf}
                              onChange={(e) => updateGridItemAttr("justifySelf", e.target.value)}
                              className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                            >
                              <option value="auto">Auto</option>
                              <option value="start">Start</option>
                              <option value="center">Center</option>
                              <option value="end">End</option>
                              <option value="stretch">Stretch</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Align Self</span>
                            <select
                              value={gridItemAttrs.alignSelf}
                              onChange={(e) => updateGridItemAttr("alignSelf", e.target.value)}
                              className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 mt-1"
                            >
                              <option value="auto">Auto</option>
                              <option value="start">Top</option>
                              <option value="center">Center</option>
                              <option value="end">Bottom</option>
                              <option value="stretch">Stretch</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Min Height</span>
                            <Input
                              type="number"
                              value={gridItemAttrs.minHeight}
                              onChange={(e) => updateGridItemAttr("minHeight", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={0}
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Padding</span>
                            <Input
                              type="number"
                              value={gridItemAttrs.padding}
                              onChange={(e) => updateGridItemAttr("padding", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={0}
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400">Radius</span>
                            <Input
                              type="number"
                              value={gridItemAttrs.borderRadius}
                              onChange={(e) => updateGridItemAttr("borderRadius", Number(e.target.value))}
                              className="h-8 text-xs bg-white border-gray-200"
                              min={0}
                            />
                          </div>
                        </div>
                        <ColorRow label="Cell Background" value={gridItemAttrs.backgroundColor} onChange={(v) => updateGridItemAttr("backgroundColor", v)} />
                      </div>
                    )}
                  </div>
                </PanelSection>
              )}

              {showFormPanel && (
                <PanelSection title="Form Properties" icon={<FormInput className="h-4 w-4" />} defaultOpen badge="Active">
                  <div className="space-y-3">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={deleteLeadForm}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Form
                      </button>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Title</Label>
                      <Input value={formAttrs.title} onChange={(e) => updateFormAttr("title", e.target.value)} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Description</Label>
                      <Input value={formAttrs.description} onChange={(e) => updateFormAttr("description", e.target.value)} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Button Text</Label>
                      <Input value={formAttrs.buttonText} onChange={(e) => updateFormAttr("buttonText", e.target.value)} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
                    </div>
                    <ColorRow label="Button Color" value={formAttrs.buttonColor} onChange={(v) => updateFormAttr("buttonColor", v)} />
                    <ColorRow label="Button Text" value={formAttrs.buttonTextColor} onChange={(v) => updateFormAttr("buttonTextColor", v)} />
                    <ColorRow label="Background" value={formAttrs.backgroundColor} onChange={(v) => updateFormAttr("backgroundColor", v)} />
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Alignment</Label>
                      <SegmentedControl
                        options={[
                          { label: "Left", value: "left" },
                          { label: "Center", value: "center" },
                          { label: "Right", value: "right" },
                        ]}
                        value={formAttrs.align}
                        onChange={(v) => updateFormAttr("align", v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-gray-600">Ask for Location</Label>
                      <Switch checked={formAttrs.showLocation} onCheckedChange={(v) => updateFormAttr("showLocation", v)} />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Success Message</Label>
                      <Input value={formAttrs.successMessage} onChange={(e) => updateFormAttr("successMessage", e.target.value)} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
                    </div>
                    <p className="text-[10px] text-gray-400">Collects Name, Email &amp; Mobile (required). Submissions appear under the page&apos;s Invitations.</p>
                  </div>
                </PanelSection>
              )}

              {showVideoPanel && (
                <PanelSection title="Video Properties" icon={<YoutubeIcon className="h-4 w-4" />} defaultOpen badge="Active">
                  <div className="space-y-3">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={deleteVideo}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">YouTube URL</Label>
                      <Input
                        value={videoUrl}
                        onChange={(e) => updateVideoUrl(e.target.value)}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Paste a YouTube link — the video updates as soon as it&apos;s valid.</p>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Width</Label>
                      <div className="flex gap-1">
                        {["25%", "50%", "75%", "100%"].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => updateVideoAttr("containerWidth", w)}
                            className={`flex-1 h-8 text-[11px] font-medium rounded-lg border transition-all ${
                              videoWidth === w
                                ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Custom Width</Label>
                      <Input
                        value={videoWidth}
                        onChange={(e) => updateVideoAttr("containerWidth", e.target.value)}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        placeholder="e.g. 480px or 50%"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Alignment</Label>
                      <SegmentedControl
                        options={[
                          { label: "Left", value: "left" },
                          { label: "Center", value: "center" },
                          { label: "Right", value: "right" },
                        ]}
                        value={videoAlign}
                        onChange={(v) => updateVideoAttr("align", v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-gray-600">Autoplay</Label>
                      <Switch checked={videoAutoplay} onCheckedChange={(v) => updateVideoAttr("autoplay", v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className={`text-[11px] ${videoAutoplay ? "text-gray-400" : "text-gray-600"}`}>Mute</Label>
                      <Switch
                        checked={videoAutoplay || videoMuted}
                        disabled={videoAutoplay}
                        onCheckedChange={(v) => updateVideoAttr("muted", v)}
                      />
                    </div>
                    {videoAutoplay && (
                      <p className="text-[10px] text-gray-400">Autoplay requires the video to be muted — browsers block unmuted autoplay, so Mute is locked on while Autoplay is on.</p>
                    )}
                  </div>
                </PanelSection>
              )}

              {activeBlock && (
                <PanelSection
                  title={`${BLOCK_PANEL_LABELS[activeBlock.type] ?? "Block"} Properties`}
                  icon={<Layers className="h-4 w-4" />}
                  defaultOpen
                  badge="Active"
                >
                  <ContentBlockPanel
                    block={activeBlock}
                    onAttr={updateBlockAttr}
                    onItems={updateBlockItems}
                    onDelete={deleteActiveBlock}
                  />
                </PanelSection>
              )}

              {showTwoColPanel && (
                <PanelSection title="Two-Column Layout" icon={<Columns className="h-4 w-4" />} defaultOpen badge="Active">
                  <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={convertToSingleCol}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-[11px] font-medium hover:bg-amber-100 transition-colors"
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" /> To 1-Column
                      </button>
                      <button
                        type="button"
                        onClick={deleteTwoCol}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Layout</Label>
                      <SegmentedControl
                        options={[
                          { label: "Media Left", value: "media-left" },
                          { label: "Media Right", value: "media-right" },
                        ]}
                        value={twoColAttrs.layout}
                        onChange={(v) => updateTwoColAttr("layout", v)}
                      />
                    </div>
                    <ColorRow label="Background" value={twoColAttrs.backgroundColor} onChange={(v) => updateTwoColAttr("backgroundColor", v)} />
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Gap (px)</Label>
                      <Input
                        type="number"
                        value={twoColAttrs.gap}
                        onChange={(e) => updateTwoColAttr("gap", Number(e.target.value))}
                        className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block">Vertical Align</Label>
                      <SegmentedControl
                        options={[
                          { label: "Top", value: "top" },
                          { label: "Center", value: "center" },
                          { label: "Bottom", value: "bottom" },
                        ]}
                        value={twoColAttrs.verticalAlign}
                        onChange={(v) => updateTwoColAttr("verticalAlign", v)}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Padding</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">X</span>
                          <Input
                            type="number"
                            value={twoColAttrs.paddingX}
                            onChange={(e) => updateTwoColAttr("paddingX", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-400">Y</span>
                          <Input
                            type="number"
                            value={twoColAttrs.paddingY}
                            onChange={(e) => updateTwoColAttr("paddingY", Number(e.target.value))}
                            className="h-8 text-xs bg-gray-50 border-gray-200"
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </PanelSection>
              )}
              </>
              )}
            </>
          ) : (
            /* ===== STYLE TAB ===== */
            <>
              <PanelSection title="Page Layout" icon={<Maximize2 className="h-4 w-4" />} defaultOpen>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Max Width (px)</Label>
                    <Input
                      type="number"
                      value={settings.maxWidth}
                      onChange={(e) => updateSettings({ maxWidth: Number(e.target.value) || 960 })}
                      className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                      min={320}
                      max={1920}
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-gray-500 uppercase tracking-wider">Padding</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="flex-1">
                        <span className="text-[10px] text-gray-400">Horizontal</span>
                        <Input
                          type="number"
                          value={settings.paddingX}
                          onChange={(e) => updateSettings({ paddingX: Number(e.target.value) || 0 })}
                          className="h-8 text-xs bg-gray-50 border-gray-200"
                          min={0}
                          max={200}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] text-gray-400">Vertical</span>
                        <Input
                          type="number"
                          value={settings.paddingY}
                          onChange={(e) => updateSettings({ paddingY: Number(e.target.value) || 0 })}
                          className="h-8 text-xs bg-gray-50 border-gray-200"
                          min={0}
                          max={200}
                        />
                      </div>
                    </div>
                  </div>
                  <ColorRow
                    label="Background Color"
                    value={settings.backgroundColor}
                    onChange={(v) => updateSettings({ backgroundColor: v })}
                  />
                </div>
              </PanelSection>

              <PanelSection title="Theme Colors" icon={<Palette className="h-4 w-4" />} defaultOpen>
                {themeColors ? (
                  <div className="space-y-2">
                    {Object.entries(themeColors).map(([key, color]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-lg border-2 border-gray-200 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-medium text-gray-600 capitalize">{key}</span>
                          <span className="text-[10px] text-gray-400 ml-2 font-mono">{color}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().setColor(color).run()}
                          className="text-[10px] text-violet-600 hover:text-violet-700 font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-400 pt-1">
                      Theme colors are set in page settings. Click Apply to use a color on selected text.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No theme colors configured.</p>
                )}
              </PanelSection>
            </>
          )}
        </div>

        {/* Panel Footer - Word Count */}
        <div className="border-t border-gray-200 bg-gray-50/80 px-4 py-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>{charCount} chars</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* ===== MAIN CANVAS (Editor Content) — left of the tools panel ===== */}
      <div
        className="order-2 flex-1 min-w-0 bg-gray-100 overflow-y-auto overflow-x-hidden relative"
        onDropCapture={handleCanvasDropCapture}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes(RICH_ELEMENT_DND_TYPE)) {
            autoScrollCanvasDuringDrag(e);
          }
        }}
      >
        {/* Undo / Redo — always visible regardless of selection. The
            keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl/Cmd+Y)
            already work via StarterKit's bundled history extension; these
            buttons just give the same actions a discoverable, mouse-usable
            home and a visible enabled/disabled state. */}
        <div className="sticky top-3 z-30 flex justify-start pl-3 pointer-events-none">
          <div className="pointer-events-auto inline-flex items-center gap-0.5 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg px-1 py-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl/Cmd+Z)"
              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl/Cmd+Y)"
              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Floating Action Bar */}
        {(showBtnPanel || showImgPanel || showTwoColPanel || showSectionPanel || showFlexPanel || showGridPanel || showFormPanel || showVideoPanel) && (
          <div className="sticky top-3 z-30 flex justify-center pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg px-2 py-1.5">
              {selectedLabel && (
                <>
                  <span className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-lg bg-violet-50 text-violet-700 text-[11px] font-semibold">
                    <Layers className="h-3.5 w-3.5" /> {selectedLabel}
                  </span>
                  <div className="w-px h-4 bg-gray-200" />
                </>
              )}
              {showImgPanel && (
                <>
                  <button
                    type="button"
                    onClick={replaceImage}
                    title="Replace Image"
                    className="h-7 px-2.5 flex items-center gap-1.5 rounded-lg text-[11px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Replace className="h-3.5 w-3.5" /> Replace
                  </button>
                  <div className="w-px h-4 bg-gray-200" />
                </>
              )}
              {showTwoColPanel && (
                <>
                  <button
                    type="button"
                    onClick={convertToSingleCol}
                    title="Convert to Single Column"
                    className="h-7 px-2.5 flex items-center gap-1.5 rounded-lg text-[11px] font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" /> 1-Column
                  </button>
                  <div className="w-px h-4 bg-gray-200" />
                </>
              )}
              <button
                type="button"
                onClick={duplicateSelectedNode}
                title="Duplicate Element"
                className="h-7 px-2.5 flex items-center gap-1.5 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </button>
              <div className="w-px h-4 bg-gray-200" />
              <button
                type="button"
                onClick={deleteSelectedNode}
                title="Delete Element (Del)"
                className="h-7 px-2.5 flex items-center gap-1.5 rounded-lg text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Inline text formatting bubble — appears when text is selected */}
        {editor && (
          <BubbleMenu
            editor={editor}
            // Default appendTo is the editor's DOM parent, which puts this
            // menu in the same local stacking context as the template
            // editor's z-30 section-insert-point strips. Escape to a
            // body-level portal — but that alone isn't enough: the strip's
            // z-30 has no intervening positioned ancestor, so it wins the
            // root stacking context over this menu's implicit z-index:auto
            // regardless of DOM order. The floating container (menuEl) is
            // only reachable via ref, since BubbleMenu spreads its other
            // props onto an inner child instead — so force its z-index here.
            appendTo={() => document.body}
            ref={(el) => {
              if (el) el.style.zIndex = "9999";
            }}
            shouldShow={({ editor: ed, from, to }) => {
              // Only for non-empty *text* selections (not node selections like
              // images/buttons, which have their own floating bar).
              if (from === to) return false;
              if ((ed.state.selection as any).node) return false;
              return ed.isEditable;
            }}
          >
            <div className="inline-flex items-center gap-0.5 bg-gray-900 text-white rounded-lg shadow-xl px-1 py-1">
              <BubbleButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
                <Bold className="h-3.5 w-3.5" />
              </BubbleButton>
              <BubbleButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
                <Italic className="h-3.5 w-3.5" />
              </BubbleButton>
              <BubbleButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
                <UnderlineIcon className="h-3.5 w-3.5" />
              </BubbleButton>
              <BubbleButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
                <Strikethrough className="h-3.5 w-3.5" />
              </BubbleButton>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <BubbleButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
                <Heading2 className="h-3.5 w-3.5" />
              </BubbleButton>
              <BubbleButton onClick={handleSetLink} active={editor.isActive("link")} title="Add Link">
                <LinkIcon className="h-3.5 w-3.5" />
              </BubbleButton>
              <BubbleButton onClick={() => editor.chain().focus().toggleHighlight({ color: hlColor }).run()} active={editor.isActive("highlight")} title="Highlight">
                <Highlighter className="h-3.5 w-3.5" />
              </BubbleButton>
            </div>
          </BubbleMenu>
        )}

        <div className={templateData ? "min-h-full p-4 flex justify-center items-start" : "min-h-full p-6"}>
          {templateData ? (
            <div 
              className="w-full max-w-[1280px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mx-auto"
              style={{ zoom: 0.68 }}
            >
              <LandingTemplate
                data={templateData}
                pageContent={content}
                landingPageId={landingPageId}
                pageSlug={pageSlug}
                editorInstance={editor}
                editorBridge={tplBridge}
              />
            </div>
          ) : (
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-auto transition-all duration-200"
              style={{
                maxWidth: `${settings.maxWidth}px`,
              }}
            >
              <div
                style={{
                  backgroundColor: settings.backgroundColor,
                  padding: `${settings.paddingY}px ${settings.paddingX}px`,
                  transition: "all 0.2s ease",
                }}
              >
                <EditorContent editor={editor} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Right-click Context Menu ===== */}
      {ctxMenu && (
        <>
          {/* Backdrop — a click or a fresh right-click anywhere dismisses it. */}
          <div
            className="fixed inset-0 z-[9998]"
            onMouseDown={closeCtx}
            onContextMenu={(e) => {
              e.preventDefault();
              closeCtx();
            }}
          />
          <div
            role="menu"
            className="fixed z-[9999] w-60 max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-2xl"
            style={{
              left: Math.min(ctxMenu.x, (typeof window !== "undefined" ? window.innerWidth : 1280) - 252),
              top: Math.max(8, Math.min(ctxMenu.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 300)),
            }}
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {ctxMenu.mode === "text" ? (
              /* ------------------------- TEXT MENU ------------------------- */
              <>
                <CtxItem icon={<Scissors />} label="Cut" shortcut="⌘X" onClick={() => ctxRun(() => ctxClipboard("cut"))} />
                <CtxItem icon={<ClipboardCopy />} label="Copy" shortcut="⌘C" onClick={() => ctxRun(() => ctxClipboard("copy"))} />
                <CtxItem icon={<ClipboardPaste />} label="Paste" shortcut="⌘V" onClick={() => ctxRun(() => { void pasteFromClipboard(); })} />

                <CtxSep />
                <CtxHeader label="Format" />
                <CtxItem icon={<Bold />} label="Bold" shortcut="⌘B" active={editor.isActive("bold")} onClick={() => ctxRun(() => editor.chain().focus().toggleBold().run())} />
                <CtxItem icon={<Italic />} label="Italic" shortcut="⌘I" active={editor.isActive("italic")} onClick={() => ctxRun(() => editor.chain().focus().toggleItalic().run())} />
                <CtxItem icon={<UnderlineIcon />} label="Underline" shortcut="⌘U" active={editor.isActive("underline")} onClick={() => ctxRun(() => editor.chain().focus().toggleUnderline().run())} />
                <CtxItem icon={<Strikethrough />} label="Strikethrough" active={editor.isActive("strike")} onClick={() => ctxRun(() => editor.chain().focus().toggleStrike().run())} />
                <CtxItem icon={<Code />} label="Inline code" active={editor.isActive("code")} onClick={() => ctxRun(() => editor.chain().focus().toggleCode().run())} />

                <CtxSep />
                <CtxHeader label="Turn into" />
                <CtxItem icon={<Pilcrow />} label="Paragraph" active={editor.isActive("paragraph")} onClick={() => ctxRun(() => editor.chain().focus().setParagraph().run())} />
                <CtxItem icon={<Heading1 />} label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => ctxRun(() => editor.chain().focus().toggleHeading({ level: 1 }).run())} />
                <CtxItem icon={<Heading2 />} label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => ctxRun(() => editor.chain().focus().toggleHeading({ level: 2 }).run())} />
                <CtxItem icon={<Heading3 />} label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => ctxRun(() => editor.chain().focus().toggleHeading({ level: 3 }).run())} />
                <CtxItem icon={<Heading4 />} label="Heading 4" active={editor.isActive("heading", { level: 4 })} onClick={() => ctxRun(() => editor.chain().focus().toggleHeading({ level: 4 }).run())} />

                <CtxSep />
                <CtxHeader label="Text size" />
                <div className="flex flex-wrap gap-1 px-3 py-1.5">
                  {CTX_FONT_SIZES.map((s) => {
                    const active = editor.getAttributes("textStyle").fontSize === `${s}px`;
                    return (
                      <button
                        key={s}
                        type="button"
                        title={`${s}px`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => ctxRun(() => editor.chain().focus().setFontSize(`${s}px`).run())}
                        className={`h-6 min-w-[26px] px-1.5 rounded-md text-[11px] font-medium border transition-colors ${
                          active
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    title="Reset to default size"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => ctxRun(() => editor.chain().focus().unsetFontSize().run())}
                    className="h-6 px-2 rounded-md text-[11px] font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Default
                  </button>
                </div>

                <CtxSep />
                <CtxHeader label="Align" />
                <CtxItem icon={<AlignLeft />} label="Left" active={editor.isActive({ textAlign: "left" })} onClick={() => ctxRun(() => editor.chain().focus().setTextAlign("left").run())} />
                <CtxItem icon={<AlignCenter />} label="Center" active={editor.isActive({ textAlign: "center" })} onClick={() => ctxRun(() => editor.chain().focus().setTextAlign("center").run())} />
                <CtxItem icon={<AlignRight />} label="Right" active={editor.isActive({ textAlign: "right" })} onClick={() => ctxRun(() => editor.chain().focus().setTextAlign("right").run())} />
                <CtxItem icon={<AlignJustify />} label="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => ctxRun(() => editor.chain().focus().setTextAlign("justify").run())} />

                <CtxSep />
                <CtxHeader label="Lists & blocks" />
                <CtxItem icon={<List />} label="Bullet list" active={editor.isActive("bulletList")} onClick={() => ctxRun(() => editor.chain().focus().toggleBulletList().run())} />
                <CtxItem icon={<ListOrdered />} label="Numbered list" active={editor.isActive("orderedList")} onClick={() => ctxRun(() => editor.chain().focus().toggleOrderedList().run())} />
                <CtxItem icon={<Quote />} label="Blockquote" active={editor.isActive("blockquote")} onClick={() => ctxRun(() => editor.chain().focus().toggleBlockquote().run())} />
                <CtxItem icon={<Code2 />} label="Code block" active={editor.isActive("codeBlock")} onClick={() => ctxRun(() => editor.chain().focus().toggleCodeBlock().run())} />

                <CtxSep />
                <CtxHeader label="Link" />
                <CtxItem icon={<LinkIcon />} label={editor.isActive("link") ? "Edit link" : "Add link"} active={editor.isActive("link")} onClick={() => ctxRun(handleSetLink)} />
                <CtxItem icon={<Unlink />} label="Remove link" disabled={!editor.isActive("link")} onClick={() => ctxRun(() => editor.chain().focus().unsetLink().run())} />

                <CtxSep />
                <CtxHeader label="Text color" />
                <div className="flex flex-wrap gap-1.5 px-3 py-1.5">
                  {CTX_TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => ctxRun(() => applyTextColor(c))}
                      className="h-5 w-5 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <CtxItem icon={<RemoveFormatting />} label="Reset text color" onClick={() => ctxRun(() => editor.chain().focus().unsetColor().run())} />

                <CtxSep />
                <CtxHeader label="Highlight" />
                <div className="flex flex-wrap gap-1.5 px-3 py-1.5">
                  {CTX_HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => ctxRun(() => applyHighlight(c))}
                      className="h-5 w-5 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <CtxItem icon={<Highlighter />} label="Remove highlight" disabled={!editor.isActive("highlight")} onClick={() => ctxRun(() => editor.chain().focus().unsetHighlight().run())} />

                <CtxSep />
                <CtxHeader label="Insert" />
                <CtxItem icon={<Minus />} label="Divider" onClick={() => ctxRun(() => editor.chain().focus().setHorizontalRule().run())} />
                <CtxItem icon={<CornerDownLeft />} label="Line break" onClick={() => ctxRun(() => editor.chain().focus().setHardBreak().run())} />

                <CtxSep />
                <CtxItem icon={<RemoveFormatting />} label="Clear formatting" onClick={() => ctxRun(() => editor.chain().focus().unsetAllMarks().clearNodes().run())} />

                {ctxMenu.containers && ctxMenu.containers.length > 0 && (
                  <>
                    <CtxSep />
                    <CtxHeader label="Select block" />
                    {ctxMenu.containers.map((c, i) => (
                      <CtxItem
                        key={`${c.type}-${c.pos}-${i}`}
                        icon={<MousePointer2 />}
                        label={`Select ${c.label}`}
                        onClick={() =>
                          ctxRun(() => {
                            selectNodeAt(c.pos);
                            openElementProperties();
                          })
                        }
                      />
                    ))}
                    <CtxItem icon={<Copy />} label="Duplicate block" onClick={() => ctxRun(duplicateSelectedNode)} />
                    <CtxItem icon={<Trash2 />} label="Delete block" danger onClick={() => ctxRun(deleteSelectedNode)} />
                  </>
                )}
              </>
            ) : (
              /* ------------------------- BLOCK MENU ------------------------ */
              <>
                <div className="px-3 py-2 flex items-center gap-2 text-xs font-semibold text-violet-700">
                  <Layers className="h-3.5 w-3.5" />
                  {ctxMenu.element?.label ?? "Element"}
                </div>
                <CtxSep />
                <CtxItem icon={<SlidersHorizontal />} label="Edit properties" onClick={() => ctxRun(openElementProperties)} />

                {ctxMenu.element?.type === "image" && (
                  <CtxItem icon={<Replace />} label="Replace image" onClick={() => ctxRun(replaceImage)} />
                )}
                {ctxMenu.element?.type === "twoColumnSection" && (
                  <CtxItem icon={<ArrowDownToLine />} label="Convert to 1-column" onClick={() => ctxRun(convertToSingleCol)} />
                )}

                <CtxSep />
                <CtxItem icon={<MoveUp />} label="Move up" onClick={() => ctxRun(() => ctxMenu.element && moveNodeAt(ctxMenu.element.pos, -1))} />
                <CtxItem icon={<MoveDown />} label="Move down" onClick={() => ctxRun(() => ctxMenu.element && moveNodeAt(ctxMenu.element.pos, 1))} />
                <CtxItem icon={<Copy />} label="Duplicate" onClick={() => ctxRun(duplicateSelectedNode)} />

                <CtxSep />
                <CtxItem icon={<ClipboardCopy />} label="Copy" shortcut="⌘C" onClick={() => ctxRun(() => ctxClipboard("copy"))} />
                <CtxItem icon={<Scissors />} label="Cut" shortcut="⌘X" onClick={() => ctxRun(() => ctxClipboard("cut"))} />

                {ctxMenu.containers && ctxMenu.containers.filter((c) => c.pos !== ctxMenu.element?.pos).length > 0 && (
                  <>
                    <CtxSep />
                    <CtxHeader label="Select parent" />
                    {ctxMenu.containers
                      .filter((c) => c.pos !== ctxMenu.element?.pos)
                      .map((c, i) => (
                        <CtxItem
                          key={`${c.type}-${c.pos}-${i}`}
                          icon={<MousePointer2 />}
                          label={`Select ${c.label}`}
                          onClick={() =>
                            ctxRun(() => {
                              selectNodeAt(c.pos);
                              openElementProperties();
                            })
                          }
                        />
                      ))}
                  </>
                )}

                <CtxSep />
                <CtxItem icon={<Trash2 />} label="Delete" shortcut="Del" danger onClick={() => ctxRun(deleteSelectedNode)} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Context-menu helpers
// ---------------------------------------------------------------------------

function CtxSep() {
  return <div className="my-1 h-px bg-gray-100" />;
}

function CtxHeader({ label }: { label: string }) {
  return (
    <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
      {label}
    </div>
  );
}

function CtxItem({
  icon,
  label,
  onClick,
  active,
  danger,
  disabled,
  shortcut,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  shortcut?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      // Preserve the editor selection: mousedown would otherwise blur the
      // editor and collapse the selection before the click command runs.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-left transition-colors ${
        disabled
          ? "opacity-40 cursor-not-allowed text-gray-400"
          : danger
          ? "text-red-600 hover:bg-red-50"
          : active
          ? "text-violet-700 bg-violet-50 hover:bg-violet-100"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="flex h-4 w-4 items-center justify-center flex-shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {shortcut && <span className="text-[10px] text-gray-400 font-mono">{shortcut}</span>}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Toolbar helpers
// ---------------------------------------------------------------------------

function BubbleButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // Without this, mousedown blurs the editor → the text selection
      // collapses → the bubble menu unmounts before the click ever lands.
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
        active ? "bg-white text-gray-900" : "text-white/80 hover:bg-white/15 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      title={title}
      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${
        active
          ? "bg-violet-100 text-violet-700 shadow-sm"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

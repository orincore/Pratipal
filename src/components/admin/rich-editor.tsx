"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
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
import { FeatureGrid, DEFAULT_FEATURE_ITEM } from "@/lib/tiptap/extensions/feature-grid";
import { StatsRow, DEFAULT_STAT_ITEM } from "@/lib/tiptap/extensions/stats-row";
import { FaqAccordion, DEFAULT_FAQ_ITEM } from "@/lib/tiptap/extensions/faq-accordion";
import { TestimonialCards, DEFAULT_TESTIMONIAL_ITEM } from "@/lib/tiptap/extensions/testimonial-cards";
import { MarqueeStrip } from "@/lib/tiptap/extensions/marquee-strip";
import { ImageGallery, DEFAULT_GALLERY_ITEM } from "@/lib/tiptap/extensions/image-gallery";
import {
  DEFAULT_CONTENT_SETTINGS,
  type LandingContent,
  type LandingContentSettings,
} from "@/lib/tiptap/content";
import { LandingTemplate } from "@/components/storefront/landing-template";
import { TemplateEditor } from "./template-editor";
import type { LandingTemplateData } from "@/lib/template-types";
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
  Copy,
  LayoutTemplate,
  RemoveFormatting,
  WrapText,
  FormInput,
  Sparkles,
  BarChart3,
  HelpCircle,
  MessageSquare,
  Megaphone,
  Images,
  Plus,
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
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
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
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-sm active:scale-[0.98] ${colorClasses[color] || colorClasses.gray}`}
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

  // Lead form panel
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [formAttrs, setFormAttrs] = useState<LeadFormAttrs>({ ...DEFAULT_LEAD_FORM_ATTRS });

  // Content blocks (feature grid, stats, FAQ, testimonials, marquee, gallery).
  // These share one consolidated "active block" panel keyed off the selected
  // node's type — far less boilerplate than per-block state.
  const [activeBlock, setActiveBlock] = useState<{ type: string; attrs: any } | null>(null);

  // Left panel active tab (or Template tab for unified layouts)
  const [activeTab, setActiveTab] = useState<"widgets" | "style" | "template">(
    templateData ? "template" : "widgets"
  );

  // Propagate settings changes upward
  const emitChange = useCallback(
    (doc: any, s: LandingContentSettings) => {
      onChange({ doc, settings: s });
    },
    [onChange]
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
    setShowBtnPanel(isButton);

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
      setImgMarginTop(nodeSel!.attrs.marginTop !== undefined ? Number(nodeSel!.attrs.marginTop) : 24);
      setImgMarginBottom(nodeSel!.attrs.marginBottom !== undefined ? Number(nodeSel!.attrs.marginBottom) : 24);
      setImgHoverEffect(nodeSel!.attrs.hoverEffect || "none");
    }
    setShowImgPanel(isImage);

    // --- Lead form (atom node → NodeSelection on click) ---
    const isLeadForm = nodeSel?.type?.name === "leadForm";
    if (isLeadForm) {
      setFormAttrs({ ...DEFAULT_LEAD_FORM_ATTRS, ...(nodeSel!.attrs as Partial<LeadFormAttrs>) });
    }
    setShowFormPanel(isLeadForm);

    // --- Content blocks (atom nodes → NodeSelection on click) ---
    const isContentBlock = !!nodeSel && CONTENT_BLOCK_TYPES.includes(nodeSel.type.name);
    if (isContentBlock) {
      setActiveBlock({ type: nodeSel!.type.name, attrs: { ...nodeSel!.attrs } });
    } else {
      setActiveBlock(null);
    }

    // --- Section / two-column: walk ancestors, or the node itself ---
    let foundTwoCol = false;
    let foundSection = false;

    if (nodeSel?.type?.name === "twoColumnSection") {
      setTwoColAttrs({ ...DEFAULT_TWO_COL_ATTRS, ...(nodeSel.attrs as Partial<TwoColumnAttrs>) });
      foundTwoCol = true;
    }
    if (nodeSel?.type?.name === "pageSection") {
      setSectionAttrs({ ...DEFAULT_SECTION_ATTRS, ...(nodeSel.attrs as Partial<PageSectionAttrs>) });
      foundSection = true;
    }

    for (let depth = $from.depth; depth > 0; depth--) {
      const ancestor = $from.node(depth);
      if (ancestor.type.name === "twoColumnSection" && !foundTwoCol) {
        setTwoColAttrs({ ...DEFAULT_TWO_COL_ATTRS, ...(ancestor.attrs as Partial<TwoColumnAttrs>) });
        foundTwoCol = true;
      }
      if (ancestor.type.name === "pageSection" && !foundSection) {
        setSectionAttrs({ ...DEFAULT_SECTION_ATTRS, ...(ancestor.attrs as Partial<PageSectionAttrs>) });
        foundSection = true;
      }
    }
    setShowTwoColPanel(foundTwoCol);
    setShowSectionPanel(foundSection);

    // --- Determine selected kind, label, and auto-reveal the Style panel ---
    const kind = isButton
      ? "button"
      : isImage
      ? "image"
      : isLeadForm
      ? "leadform"
      : isContentBlock
      ? nodeSel!.type.name
      : foundTwoCol
      ? "twocol"
      : foundSection
      ? "section"
      : null;

    const labels: Record<string, string> = {
      button: "Button",
      image: "Image",
      leadform: "Form",
      twocol: "Two-Column",
      section: "Section",
      featureGrid: "Feature Grid",
      statsRow: "Stats",
      faqAccordion: "FAQ",
      testimonialCards: "Testimonials",
      marqueeStrip: "Marquee",
      imageGallery: "Gallery",
    };
    setSelectedLabel(kind ? labels[kind] : null);

    // The element-specific property panels live in the "Elements" (widgets)
    // tab. Switch to it on a *new* selection so the properties are visible,
    // then scroll them into view.
    if (kind && kind !== lastElementKindRef.current) {
      setActiveTab("widgets");
      requestAnimationFrame(() => {
        document
          .querySelector("[data-element-properties]")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    lastElementKindRef.current = kind;
  }, []);

  // ---- TipTap editor ----
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      ResizableImage.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      Youtube.configure({
        HTMLAttributes: { class: "w-full aspect-video rounded-lg" },
        width: 640,
        height: 360,
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
        // globals.css to apply.
        class:
          "tiptap prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[600px] px-6 py-4",
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

  // Sync external content changes
  useEffect(() => {
    if (!editor || !content?.doc) return;
    const currentJson = JSON.stringify(editor.getJSON());
    const nextJson = JSON.stringify(content.doc);
    if (currentJson !== nextJson) {
      suppressNextUpdate.current = true;
      editor.commands.setContent(content.doc);
    }
  }, [editor, content?.doc]);

  // ---- Inject delete buttons on every block element in the canvas ----
  useEffect(() => {
    if (!editor) return;

    const SELECTORS = [
      "section[data-page-section]",
      "div[data-two-col]",
      "div[data-button]",
      "div[data-lead-form]",
      "img",
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
            sel === "img" &&
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
            top: "-10px",
            right: "-10px",
            zIndex: "50",
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
    const url = window.prompt("Enter YouTube video URL:");
    if (url) editor.commands.setYoutubeVideo({ src: url });
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
      if (key === "marginTop") setImgMarginTop(Number(value));
      if (key === "marginBottom") setImgMarginBottom(Number(value));
      if (key === "hoverEffect") setImgHoverEffect(value);
      editor.commands.updateAttributes("image", { [key]: value });
    },
    [editor]
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
      editor.commands.updateLeadForm({ [key]: value });
    },
    [editor]
  );

  const deleteLeadForm = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
    setShowFormPanel(false);
    toast.success("Form removed");
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
  const insertMarqueeStrip = useCallback(() => {
    editor?.commands.insertMarqueeStrip({ backgroundColor: themeColors?.primary ?? "#7c3aed" });
  }, [editor, themeColors]);
  const insertImageGallery = useCallback(() => {
    editor?.commands.insertImageGallery();
  }, [editor]);

  // Update one attribute on the currently-selected content block. The editor's
  // onUpdate → syncSelection re-reads the node, so the panel stays in sync; we
  // also optimistically update local state for snappy typing.
  const updateBlockAttr = useCallback(
    (key: string, value: any) => {
      if (!editor || !activeBlock) return;
      editor.commands.updateAttributes(activeBlock.type, { [key]: value });
      setActiveBlock((prev) => (prev ? { ...prev, attrs: { ...prev.attrs, [key]: value } } : prev));
    },
    [editor, activeBlock]
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
      toast.success("Element removed");
      return;
    }

    // Walk up from cursor to find a deletable block
    const { $from } = selection;
    const deletableTypes = new Set([
      "twoColumnSection",
      "pageSection",
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
        toast.success("Element removed");
        return;
      }
      depth--;
    }

    // Fallback: delete the current block
    editor.chain().focus().deleteNode("paragraph").run();
  }, [editor]);

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
        // Collapse any node selection back to a caret and blur element panels
        const pos = editor.state.selection.to;
        editor.chain().setTextSelection(pos).run();
      } else if ((e.key === "Delete" || e.key === "Backspace") && isNodeSelection) {
        e.preventDefault();
        deleteSelectedNode();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor, deleteSelectedNode]);

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
        editor.commands.updateAttributes("image", { src: data.url });
        toast.success(`Image replaced${data.storage === 'r2' ? ' (uploaded to R2)' : ' (uploaded locally)'}!`, { id: "replace-upload" });
      } catch (err: any) {
        toast.error(err.message || "Upload failed", { id: "replace-upload" });
      }
      e.target.value = "";
    },
    [editor]
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

  if (!editor) return null;

  const wordCount = editor.getText().split(/\s+/).filter((w) => w).length;
  const charCount = editor.getText().length;

  // Check if any element-specific panel is active
  const hasElementPanel = showBtnPanel || showImgPanel || showTwoColPanel || showSectionPanel || showFormPanel || !!activeBlock;

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

      {/* ===== TOOLS PANEL (Elementor-style) — fixed to the right side ===== */}
      <div className={`order-2 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden ${
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
              <TemplateEditor data={templateData} onChange={setTemplateData} landingPageId={landingPageId} />
            </div>
          ) : activeTab === "widgets" ? (
            <>
              {/* ===== INSERT WIDGETS GRID ===== */}
              <PanelSection title="Insert Elements" icon={<LayoutGrid className="h-4 w-4" />} defaultOpen>
                <div className="grid grid-cols-3 gap-2">
                  <WidgetButton
                    icon={<Heading1 className="h-5 w-5" />}
                    label="Heading"
                    color="blue"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  />
                  <WidgetButton
                    icon={<Type className="h-5 w-5" />}
                    label="Text"
                    color="gray"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                  />
                  <WidgetButton
                    icon={<Upload className="h-5 w-5" />}
                    label="Image"
                    color="green"
                    onClick={handleImageUpload}
                  />
                  <WidgetButton
                    icon={<MousePointerClick className="h-5 w-5" />}
                    label="Button"
                    color="violet"
                    onClick={insertButton}
                  />
                  <WidgetButton
                    icon={<YoutubeIcon className="h-5 w-5" />}
                    label="Video"
                    color="rose"
                    onClick={addYoutubeVideo}
                  />
                  <WidgetButton
                    icon={<Minus className="h-5 w-5" />}
                    label="Divider"
                    color="gray"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  />
                  <WidgetButton
                    icon={<Layers className="h-5 w-5" />}
                    label="Section"
                    color="amber"
                    onClick={() => insertSection()}
                  />
                  <WidgetButton
                    icon={<FormInput className="h-5 w-5" />}
                    label="Form"
                    color="green"
                    onClick={insertLeadForm}
                  />
                  <WidgetButton
                    icon={<PanelLeftDashed className="h-5 w-5" />}
                    label="2-Col Left"
                    color="blue"
                    onClick={() => insertTwoCol("media-left")}
                  />
                  <WidgetButton
                    icon={<PanelRightDashed className="h-5 w-5" />}
                    label="2-Col Right"
                    color="blue"
                    onClick={() => insertTwoCol("media-right")}
                  />
                  <WidgetButton
                    icon={<Quote className="h-5 w-5" />}
                    label="Quote"
                    color="amber"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  />
                  <WidgetButton
                    icon={<List className="h-5 w-5" />}
                    label="List"
                    color="gray"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                  />
                  <WidgetButton
                    icon={<ListOrdered className="h-5 w-5" />}
                    label="Numbered"
                    color="gray"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  />
                  <WidgetButton
                    icon={<Code2 className="h-5 w-5" />}
                    label="Code"
                    color="gray"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
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
                <div className="grid grid-cols-3 gap-2">
                  <WidgetButton
                    icon={<Sparkles className="h-5 w-5" />}
                    label="Features"
                    color="violet"
                    onClick={insertFeatureGrid}
                  />
                  <WidgetButton
                    icon={<BarChart3 className="h-5 w-5" />}
                    label="Stats"
                    color="blue"
                    onClick={insertStatsRow}
                  />
                  <WidgetButton
                    icon={<HelpCircle className="h-5 w-5" />}
                    label="FAQ"
                    color="amber"
                    onClick={insertFaqAccordion}
                  />
                  <WidgetButton
                    icon={<MessageSquare className="h-5 w-5" />}
                    label="Reviews"
                    color="green"
                    onClick={insertTestimonialCards}
                  />
                  <WidgetButton
                    icon={<Megaphone className="h-5 w-5" />}
                    label="Marquee"
                    color="rose"
                    onClick={insertMarqueeStrip}
                  />
                  <WidgetButton
                    icon={<Images className="h-5 w-5" />}
                    label="Gallery"
                    color="gray"
                    onClick={insertImageGallery}
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
      <div className="order-1 flex-1 min-w-0 bg-gray-100 overflow-y-auto overflow-x-hidden relative">
        {/* Floating Action Bar */}
        {(showBtnPanel || showImgPanel || showTwoColPanel || showSectionPanel || showFormPanel) && (
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
    </div>
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

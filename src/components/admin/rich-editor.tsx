"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
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
  DEFAULT_CONTENT_SETTINGS,
  type LandingContent,
  type LandingContentSettings,
} from "@/lib/tiptap/content";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
// Main component
// ---------------------------------------------------------------------------

export function RichEditor({ content, onChange, themeColors }: RichEditorProps) {
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

  // Two-column section panel
  const [showTwoColPanel, setShowTwoColPanel] = useState(false);
  const [twoColAttrs, setTwoColAttrs] = useState<TwoColumnAttrs>({ ...DEFAULT_TWO_COL_ATTRS });

  // Page section panel
  const [showSectionPanel, setShowSectionPanel] = useState(false);
  const [sectionAttrs, setSectionAttrs] = useState<PageSectionAttrs>({ ...DEFAULT_SECTION_ATTRS });

  // Left panel active tab
  const [activeTab, setActiveTab] = useState<"widgets" | "style">("widgets");

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

  // ---- TipTap editor ----
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      ResizableImage.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
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
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Start writing your landing page content...",
      }),
      CustomButton,
      TwoColumnSection,
      ColumnMedia,
      ColumnContent,
      PageSection,
    ],
    content: content?.doc || "",
    onUpdate: ({ editor: ed }) => {
      if (suppressNextUpdate.current) {
        suppressNextUpdate.current = false;
        return;
      }
      emitChange(ed.getJSON(), settings);

      // Detect if cursor is on a customButton node
      const { $from } = ed.state.selection;
      const node = $from.parent;
      if (node.type.name === "customButton") {
        setBtnAttrs({ ...DEFAULT_BUTTON_ATTRS, ...(node.attrs as Partial<ButtonAttrs>) });
        setShowBtnPanel(true);
      } else {
        setShowBtnPanel(false);
      }

      // Detect if cursor is on an image node
      const sel = ed.state.selection;
      const selectedNode = (sel as any).node;
      if (selectedNode?.type?.name === "image") {
        setImgWidth(selectedNode.attrs.width || "100%");
        setImgAlign(selectedNode.attrs.align || "center");
        setShowImgPanel(true);
      } else {
        setShowImgPanel(false);
      }

      // Detect if cursor is inside a twoColumnSection or pageSection
      let depth = $from.depth;
      let foundTwoCol = false;
      let foundSection = false;
      while (depth > 0) {
        const ancestor = $from.node(depth);
        if (ancestor.type.name === "twoColumnSection" && !foundTwoCol) {
          setTwoColAttrs({ ...DEFAULT_TWO_COL_ATTRS, ...(ancestor.attrs as Partial<TwoColumnAttrs>) });
          setShowTwoColPanel(true);
          foundTwoCol = true;
        }
        if (ancestor.type.name === "pageSection" && !foundSection) {
          setSectionAttrs({ ...DEFAULT_SECTION_ATTRS, ...(ancestor.attrs as Partial<PageSectionAttrs>) });
          setShowSectionPanel(true);
          foundSection = true;
        }
        depth--;
      }
      if (!foundTwoCol) setShowTwoColPanel(false);
      if (!foundSection) setShowSectionPanel(false);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[600px] px-6 py-4",
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

    // Run on every transaction (content change)
    injectButtons();
    editor.on("transaction", injectButtons);
    return () => {
      editor.off("transaction", injectButtons);
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
        toast.success("Image uploaded!", { id: "upload" });
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
    (key: string, value: string) => {
      if (!editor) return;
      if (key === "width") setImgWidth(value);
      if (key === "align") setImgAlign(value as any);
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
        toast.success("Image replaced!", { id: "replace-upload" });
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
  const hasElementPanel = showBtnPanel || showImgPanel || showTwoColPanel || showSectionPanel;

  return (
    <div className="flex h-full">
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

      {/* ===== LEFT PANEL (Elementor-style) ===== */}
      <div className="w-[300px] min-w-[300px] bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
        {/* Panel Header with Tabs */}
        <div className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab("widgets")}
              className={`flex-1 py-3 text-[12px] font-semibold uppercase tracking-wider transition-colors relative ${
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
              className={`flex-1 py-3 text-[12px] font-semibold uppercase tracking-wider transition-colors relative ${
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
          {activeTab === "widgets" ? (
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
                    icon={<Code2 className="h-5 w-5" />}
                    label="Code"
                    color="gray"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  />
                </div>
              </PanelSection>

              {/* ===== TEXT FORMATTING ===== */}
              <PanelSection title="Text Formatting" icon={<Bold className="h-4 w-4" />}>
                <div className="space-y-3">
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

              {/* ===== HISTORY ===== */}
              <PanelSection title="History" icon={<Undo className="h-4 w-4" />}>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="flex-1 h-9"
                  >
                    <Undo className="h-3.5 w-3.5 mr-1.5" /> Undo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="flex-1 h-9"
                  >
                    <Redo className="h-3.5 w-3.5 mr-1.5" /> Redo
                  </Button>
                </div>
              </PanelSection>

              {/* ===== ELEMENT-SPECIFIC PANELS ===== */}
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

      {/* ===== MAIN CANVAS (Editor Content) ===== */}
      <div className="flex-1 bg-gray-100 overflow-y-auto relative">
        {/* Floating Action Bar */}
        {(showBtnPanel || showImgPanel || showTwoColPanel || showSectionPanel) && (
          <div className="sticky top-3 z-30 flex justify-center pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg px-2 py-1.5">
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
                onClick={deleteSelectedNode}
                title="Delete Element"
                className="h-7 px-2.5 flex items-center gap-1.5 rounded-lg text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        )}

        <div className="min-h-full p-6">
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
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar helpers
// ---------------------------------------------------------------------------

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

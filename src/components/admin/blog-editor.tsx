"use client";

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { FONT_OPTIONS } from "@/lib/fonts";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useRef, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Minus,
  Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
  Heading1, Heading2, Heading3, Heading4, Highlighter, Undo, Redo, Loader2,
  Pilcrow, ChevronDown, Crop, AlignHorizontalJustifyCenter,
  Unlink, RemoveFormatting, WrapText, Type, ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Resizable Image Node ────────────────────────────────────────────────────

function ResizableImageView({ node, updateAttributes, selected }: any) {
  const [resizing, setResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [localAlign, setLocalAlign] = useState<"left" | "center" | "right">(node.attrs.align || "left");
  const [localWidth, setLocalWidth] = useState(node.attrs.width || "100%");
  const startX = useRef(0);
  const startW = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sync local state with node attrs
  useEffect(() => {
    setLocalAlign(node.attrs.align || "left");
    setLocalWidth(node.attrs.width || "100%");
  }, [node.attrs.align, node.attrs.width]);

  function onMouseDownResize(e: React.MouseEvent) {
    e.preventDefault();
    startX.current = e.clientX;
    startW.current = imgRef.current?.offsetWidth || 400;
    setResizing(true);
    function onMove(ev: MouseEvent) {
      const newW = Math.max(80, startW.current + (ev.clientX - startX.current));
      setLocalWidth(newW);
      updateAttributes({ width: newW });
    }
    function onUp() {
      setResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const handleAlignClick = (newAlign: "left" | "center" | "right") => {
    setLocalAlign(newAlign);
    updateAttributes({ align: newAlign });
  };

  const handleWidthClick = (newWidth: string) => {
    setLocalWidth(newWidth);
    updateAttributes({ width: newWidth });
  };

  // margin-based alignment: image container is a block with explicit width,
  // shifted left/center/right via margin auto
  const marginMap = {
    left:   { marginLeft: "0",    marginRight: "auto" },
    center: { marginLeft: "auto", marginRight: "auto" },
    right:  { marginLeft: "auto", marginRight: "0"    },
  } as const;

  return (
    <NodeViewWrapper data-node-view-wrapper>
      <div
        style={{ width: "100%", margin: "12px 0", lineHeight: 0 }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !resizing && setShowControls(false)}
      >
        <div
          className="relative"
          style={{
            display: "block",
            width: typeof localWidth === "number" ? `${localWidth}px` : localWidth,
            ...marginMap[localAlign],
          }}
        >
          <img
            ref={imgRef}
            src={node.attrs.src}
            alt={node.attrs.alt || ""}
            style={{ width: "100%", display: "block" }}
            className={cn("rounded-lg", selected && "ring-2 ring-emerald-500")}
            draggable={false}
          />

          {(showControls || selected) && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/75 rounded-lg px-2 py-1 z-20 whitespace-nowrap shadow-lg">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  title={`Align ${a}`}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    handleAlignClick(a);
                  }}
                  className={cn(
                    "text-white p-1 rounded hover:bg-white/25 transition-colors", 
                    localAlign === a && "bg-white/40 ring-1 ring-white/50"
                  )}
                >
                  {a === "left"
                    ? <AlignLeft className="h-3.5 w-3.5" />
                    : a === "center"
                    ? <AlignHorizontalJustifyCenter className="h-3.5 w-3.5" />
                    : <AlignRight className="h-3.5 w-3.5" />}
                </button>
              ))}
              <div className="w-px h-4 bg-white/30 mx-0.5" />
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  title={`${pct}% width`}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    handleWidthClick(`${pct}%`);
                  }}
                  className={cn(
                    "text-white px-1.5 py-0.5 rounded hover:bg-white/25 text-[10px] font-mono transition-colors", 
                    localWidth === `${pct}%` && "bg-white/40 ring-1 ring-white/50"
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>
          )}

          {(showControls || selected) && (
            <div
              onMouseDown={onMouseDownResize}
              className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded cursor-se-resize flex items-center justify-center shadow"
              title="Drag to resize"
            >
              <svg viewBox="0 0 8 8" className="w-3 h-3" fill="none">
                <path d="M1 7L7 1M4 7L7 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const ResizableImage = TiptapNode.create({
  name: "resizableImage",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      width: { default: "100%" },
      align: { default: "left" },
    };
  },
  parseHTML() {
    return [{ tag: "img[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes.align || "left";
    const justifyMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };
    return [
      "div",
      { style: `display:flex;justify-content:${justifyMap[align] ?? "flex-start"};margin:12px 0` },
      ["img", mergeAttributes({ style: `width:${HTMLAttributes.width || "100%"}` }, { src: HTMLAttributes.src, alt: HTMLAttributes.alt || "" })],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ─── Color swatches ──────────────────────────────────────────────────────────

const TEXT_COLORS = [
  "#000000", "#374151", "#6B7280", "#EF4444", "#F97316",
  "#EAB308", "#22C55E", "#14B8A6", "#3B82F6", "#8B5CF6",
  "#EC4899", "#ffffff",
];

const HIGHLIGHT_COLORS = [
  "#FEF08A", "#BBF7D0", "#BAE6FD", "#DDD6FE", "#FBCFE8",
  "#FED7AA", "#E5E7EB", "#FCA5A5",
];

function ColorDropdown({ type, editor }: { type: "text" | "highlight"; editor: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const colors = type === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS;
  const current = type === "text"
    ? editor.getAttributes("textStyle").color || "#000000"
    : editor.getAttributes("highlight").color || "transparent";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={type === "text" ? "Text color" : "Highlight color"}
        onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
        className="h-8 px-1.5 flex items-center gap-0.5 rounded text-gray-600 hover:bg-gray-100 transition-colors"
      >
        {type === "text" ? (
          <span className="flex flex-col items-center">
            <span className="text-xs font-bold leading-none" style={{ color: current }}>A</span>
            <span className="w-4 h-1 rounded-sm mt-0.5" style={{ backgroundColor: current === "#ffffff" ? "#000" : current }} />
          </span>
        ) : (
          <span className="flex flex-col items-center">
            <Highlighter className="h-3.5 w-3.5" />
            <span className="w-4 h-1 rounded-sm mt-0.5" style={{ backgroundColor: current === "transparent" ? "#FEF08A" : current }} />
          </span>
        )}
        <ChevronDown className="h-2.5 w-2.5 opacity-60" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-2 w-44">
          <div className="grid grid-cols-6 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (type === "text") {
                    editor.chain().focus().setColor(color).run();
                  } else {
                    editor.chain().focus().toggleHighlight({ color }).run();
                  }
                  setOpen(false);
                }}
                className="h-6 w-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          {type === "text" && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setOpen(false); }}
              className="mt-2 w-full text-xs text-gray-500 hover:text-gray-800 text-center"
            >
              Reset color
            </button>
          )}
          {type === "highlight" && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setOpen(false); }}
              className="mt-2 w-full text-xs text-gray-500 hover:text-gray-800 text-center"
            >
              Remove highlight
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Toolbar helpers ─────────────────────────────────────────────────────────

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function ToolbarButton({ onClick, active, title, children, disabled }: {
  onClick: () => void; active?: boolean; title: string;
  children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        active ? "bg-emerald-100 text-emerald-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />;
}

// Labeled tool button (WordPress-style) — used in the right-hand 2-per-row grid.
function ToolTile({ onClick, active, title, icon, label, disabled }: {
  onClick: () => void; active?: boolean; title: string;
  icon: React.ReactNode; label: string; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "flex items-center gap-2 h-9 px-2.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        active
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function ToolGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 px-0.5">{label}</p>
      <div className="grid grid-cols-2 gap-1.5">{children}</div>
    </div>
  );
}

// ─── Main Editor ─────────────────────────────────────────────────────────────

export function BlogEditor({ content, onChange }: BlogEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [textColor, setTextColor] = useState("#111827");
  const [hlColor, setHlColor] = useState("#FEF08A");

  const uploadToR2 = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) { toast.error("Only image files are supported"); return null; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return null; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "uploads");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.url as string;
    } catch {
      toast.error("Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-emerald-600 underline" } }),
      ResizableImage,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ HTMLAttributes: { class: "w-full aspect-video rounded-lg my-4" } }),
      Placeholder.configure({ placeholder: "Start writing your blog post..." }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        dir: "ltr",
        class: "blog-editor-content prose prose-sm sm:prose max-w-none min-h-[400px] px-5 py-4 focus:outline-none text-left",
      },
      // Links must never navigate/open inside the editor — clicking one should
      // only place the cursor so editing flow isn't disturbed.
      handleClick(_view, _pos, event) {
        const anchor = (event.target as HTMLElement)?.closest?.("a");
        if (anchor) event.preventDefault();
        return false;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;
            uploadToR2(file).then((url) => {
              if (url) view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.resizableImage.create({ src: url })
                )
              );
            });
            return true;
          }
        }
        return false;
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const file = files[0];
        if (!file.type.startsWith("image/")) return false;
        event.preventDefault();
        uploadToR2(file).then((url) => {
          if (url) {
            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const pos = coords?.pos ?? view.state.selection.anchor;
            view.dispatch(view.state.tr.insert(pos, view.state.schema.nodes.resizableImage.create({ src: url })));
          }
        });
        return true;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) editor.commands.setContent(content);
  }, [content]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    e.target.value = "";
    const url = await uploadToR2(file);
    if (url) editor.chain().focus().insertContent({ type: "resizableImage", attrs: { src: url } }).run();
  }, [editor, uploadToR2]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter YouTube URL");
    if (url) editor.commands.setYoutubeVideo({ src: url });
  }, [editor]);

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().insertContent({ type: "resizableImage", attrs: { src: url } }).run();
  }, [editor]);

  const clearFormatting = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  }, [editor]);

  const applyTextColor = useCallback((color: string) => {
    if (!editor) return;
    setTextColor(color);
    editor.chain().focus().setColor(color).run();
  }, [editor]);

  const applyHighlight = useCallback((color: string) => {
    if (!editor) return;
    setHlColor(color);
    editor.chain().focus().setHighlight({ color }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-xl bg-white flex items-start">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Tools — fixed to the right side (WordPress-style, 2 per row) */}
      <div dir="ltr" className="order-2 w-[248px] flex-shrink-0 self-stretch border-l border-gray-200 bg-gray-50 rounded-r-xl">
        <div className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto p-3 space-y-4">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 px-0.5">Font</p>
            <select
              value={editor.getAttributes("textStyle").fontFamily || ""}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) editor.chain().focus().unsetFontFamily().run();
                else editor.chain().focus().setFontFamily(v).run();
              }}
              className="w-full h-9 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.label} value={f.stack} style={{ fontFamily: f.stack || undefined }}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <ToolGroup label="Blocks">
            <ToolTile title="Paragraph" label="Paragraph" icon={<Pilcrow className="h-4 w-4" />} active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} />
            <ToolTile title="Quote" label="Quote" icon={<Quote className="h-4 w-4" />} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
            <ToolTile title="Heading 1" label="Heading 1" icon={<Heading1 className="h-4 w-4" />} active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
            <ToolTile title="Heading 2" label="Heading 2" icon={<Heading2 className="h-4 w-4" />} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
            <ToolTile title="Heading 3" label="Heading 3" icon={<Heading3 className="h-4 w-4" />} active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
            <ToolTile title="Heading 4" label="Heading 4" icon={<Heading4 className="h-4 w-4" />} active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} />
          </ToolGroup>

          <ToolGroup label="Format">
            <ToolTile title="Bold" label="Bold" icon={<Bold className="h-4 w-4" />} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
            <ToolTile title="Italic" label="Italic" icon={<Italic className="h-4 w-4" />} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
            <ToolTile title="Underline" label="Underline" icon={<UnderlineIcon className="h-4 w-4" />} active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
            <ToolTile title="Strikethrough" label="Strike" icon={<Strikethrough className="h-4 w-4" />} active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
            <ToolTile title="Inline Code" label="Code" icon={<Code className="h-4 w-4" />} active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
            <ToolTile title="Clear Formatting" label="Clear" icon={<RemoveFormatting className="h-4 w-4" />} onClick={clearFormatting} />
          </ToolGroup>

          <ToolGroup label="Align">
            <ToolTile title="Align Left" label="Left" icon={<AlignLeft className="h-4 w-4" />} active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
            <ToolTile title="Align Center" label="Center" icon={<AlignCenter className="h-4 w-4" />} active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
            <ToolTile title="Align Right" label="Right" icon={<AlignRight className="h-4 w-4" />} active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
            <ToolTile title="Justify" label="Justify" icon={<AlignJustify className="h-4 w-4" />} active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} />
          </ToolGroup>

          <ToolGroup label="Lists & Blocks">
            <ToolTile title="Bullet List" label="Bullet" icon={<List className="h-4 w-4" />} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
            <ToolTile title="Numbered List" label="Numbered" icon={<ListOrdered className="h-4 w-4" />} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
            <ToolTile title="Code Block" label="Code Block" icon={<Code className="h-4 w-4" />} active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
            <ToolTile title="Divider" label="Divider" icon={<Minus className="h-4 w-4" />} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
          </ToolGroup>

          <ToolGroup label="Color">
            <label className="flex items-center gap-2 h-9 px-2.5 rounded-lg text-xs font-medium border bg-white text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer">
              <Type className="h-4 w-4 flex-shrink-0" />
              <span className="truncate flex-1">Text</span>
              <span className="relative h-5 w-5 flex-shrink-0">
                <input type="color" value={textColor} onChange={(e) => applyTextColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="block h-5 w-5 rounded border border-gray-300" style={{ backgroundColor: textColor }} />
              </span>
            </label>
            <label className="flex items-center gap-2 h-9 px-2.5 rounded-lg text-xs font-medium border bg-white text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer">
              <Highlighter className="h-4 w-4 flex-shrink-0" />
              <span className="truncate flex-1">Mark</span>
              <span className="relative h-5 w-5 flex-shrink-0">
                <input type="color" value={hlColor} onChange={(e) => applyHighlight(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="block h-5 w-5 rounded border border-gray-300" style={{ backgroundColor: hlColor }} />
              </span>
            </label>
          </ToolGroup>

          <ToolGroup label="Insert">
            <ToolTile title="Add / Edit Link" label="Link" icon={<LinkIcon className="h-4 w-4" />} active={editor.isActive("link")} onClick={addLink} />
            <ToolTile title="Remove Link" label="Unlink" icon={<Unlink className="h-4 w-4" />} disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()} />
            <ToolTile title="Upload Image" label="Image" icon={uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />} disabled={uploading} onClick={() => fileInputRef.current?.click()} />
            <ToolTile title="Image from URL" label="Image URL" icon={<ImagePlus className="h-4 w-4" />} onClick={addImageByUrl} />
            <ToolTile title="Add YouTube Video" label="Video" icon={<YoutubeIcon className="h-4 w-4" />} onClick={addYoutube} />
            <ToolTile title="Line Break" label="Line Break" icon={<WrapText className="h-4 w-4" />} onClick={() => editor.chain().focus().setHardBreak().run()} />
          </ToolGroup>

        </div>
      </div>

      {/* Content — left of the tools panel */}
      <div className="order-1 flex-1 min-w-0 rounded-l-xl overflow-hidden">
        {uploading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-700">
            <Loader2 className="h-3 w-3 animate-spin" /> Uploading image to R2...
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

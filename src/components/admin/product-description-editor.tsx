"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize } from "@/lib/tiptap/extensions/font-size";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Palette,
  Undo,
  Redo,
} from "lucide-react";

interface ProductDescriptionEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const COLOR_PALETTE = [
  "#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff",
  "#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#6366f1",
  "#8b5cf6", "#ec4899", "#111827", "#047857", "#0369a1", "#5b21b6"
];

export function ProductDescriptionEditor({
  content,
  onChange,
  placeholder = "Write detailed description here...",
}: ProductDescriptionEditorProps) {
  const [colorOpen, setColorOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-neutral max-w-none text-slate-800 focus:outline-none min-h-[250px] p-4 text-sm sm:text-base",
      },
    },
    immediatelyRender: false,
  });

  // Sync content from outside (e.g. when product finishes loading)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col focus-within:ring-2 focus-within:ring-emerald-400/40 focus-within:border-emerald-400 transition-all duration-200">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200/80">
        {/* History */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive("heading", { level: 1 }) ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive("heading", { level: 3 }) ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Basic Styling */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive("bold") ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive("italic") ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive("underline") ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Font Sizes Select Dropdown */}
        <select
          value={editor.getAttributes("textStyle").fontSize || "16px"}
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="h-8 px-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
        >
          <option value="12px">Small</option>
          <option value="16px">Normal</option>
          <option value="20px">Medium</option>
          <option value="24px">Large</option>
          <option value="32px">X-Large</option>
        </select>

        {/* Text Color Inline Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setColorOpen(!colorOpen)}
            title="Text Color"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <Palette className="h-4 w-4" />
          </button>
          {colorOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setColorOpen(false)} />
              <div className="absolute top-9 left-0 z-50 bg-white p-2 rounded-xl border border-slate-200 shadow-xl w-48 grid grid-cols-6 gap-1">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setColorOpen(false);
                    }}
                    className="w-6 h-6 rounded-md border border-slate-200 transition-transform hover:scale-110 flex-shrink-0"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive("bulletList") ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive("orderedList") ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive("blockquote") ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align Left"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive({ textAlign: "left" }) ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align Center"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive({ textAlign: "center" }) ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align Right"
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
            editor.isActive({ textAlign: "right" }) ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 bg-white overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

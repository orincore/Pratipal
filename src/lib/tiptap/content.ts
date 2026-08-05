import type { JSONContent } from "@tiptap/core";

export interface LandingContentSettings {
  maxWidth: number;
  paddingX: number;
  paddingY: number;
  backgroundColor: string;
}

export interface LandingContent {
  doc: JSONContent;
  settings: LandingContentSettings;
}

export const DEFAULT_CONTENT_SETTINGS: LandingContentSettings = {
  maxWidth: 1280,
  paddingX: 16,
  paddingY: 32,
  backgroundColor: "#FFFFFF",
};

export function normalizeLandingContent(
  value: any,
  overrides?: Partial<LandingContentSettings>
): LandingContent {
  if (value && typeof value === "object" && "doc" in value && value.doc) {
    return {
      doc: value.doc,
      settings: {
        ...DEFAULT_CONTENT_SETTINGS,
        ...value.settings,
        ...overrides,
      },
    };
  }

  if (value && typeof value === "object" && value.type === "doc") {
    return {
      doc: value,
      settings: {
        ...DEFAULT_CONTENT_SETTINGS,
        ...overrides,
      },
    };
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.type === "doc") {
        return {
          doc: parsed,
          settings: {
            ...DEFAULT_CONTENT_SETTINGS,
            ...overrides,
          },
        };
      }
    } catch (e) {
      // ignore parse error and fall through
    }
  }

  return {
    doc: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
    },
    settings: {
      ...DEFAULT_CONTENT_SETTINGS,
      ...overrides,
    },
  };
}

// A paragraph/heading is visually blank when every text child is whitespace
// or a lone non-breaking space — the placeholder dynamic-page-renderer
// substitutes for genuinely empty text nodes so TipTap's schema (which
// rejects zero-length text nodes) doesn't throw. Left as-is, that placeholder
// renders as `<p>&nbsp;</p>`, which CSS `:empty` can't match (a non-breaking
// space is a real text node), so it stays visible and shows up as dead white
// space wherever it lands — most often trailing at the end of the page.
export function isBlankTextNode(node: JSONContent): boolean {
  if (node.type !== "paragraph" && node.type !== "heading") return false;
  const content = node.content;
  if (!Array.isArray(content) || content.length === 0) return true;
  // trim() strips U+00A0 (non-breaking space) along with normal
  // whitespace per the ECMAScript WhiteSpace production, so this also
  // catches the dynamic-page-renderer placeholder without special-casing it.
  return content.every(
    (child) => child.type === "text" && (child.text || "").trim().length === 0
  );
}

// Strips trailing blank paragraphs/headings from a doc's top-level content.
// TipTap leaves one of these behind whenever an editor presses Enter at the
// end of the page, and rendered as-is it appears as an empty-looking block
// below the real content.
export function trimTrailingBlankNodes(doc: JSONContent): JSONContent {
  if (!doc || !Array.isArray(doc.content)) return doc;
  const content = [...doc.content];
  while (content.length > 0 && isBlankTextNode(content[content.length - 1])) {
    content.pop();
  }
  return { ...doc, content };
}

// Shared helpers for the rich-editor "content blocks" (feature grid, stats,
// FAQ accordion, testimonials, marquee, gallery).
//
// Each block is an atom Node whose entire visual output is produced by a pure
// `renderHTML` so that it renders IDENTICALLY in two places:
//   1. the TipTap editor canvas (ProseMirror derives the DOM from renderHTML)
//   2. the published page (DynamicPageRenderer → generateHTML → static HTML)
// Editing happens through a contextual side panel that calls updateAttributes.

/**
 * Builds a TipTap `addAttributes()` spec that round-trips every key through a
 * `data-*` attribute on the node's root element. Objects/arrays are stored as
 * JSON so copy/paste between documents (which serialises to HTML and back)
 * preserves them; primitives are coerced back to their original type.
 */
export function dataAttrSpec<T extends Record<string, any>>(defaults: T) {
  const spec: Record<string, any> = {};
  (Object.keys(defaults) as (keyof T)[]).forEach((key) => {
    const def = defaults[key];
    const dataKey = `data-${String(key).replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`;
    const isComplex = typeof def === "object" && def !== null;
    spec[key as string] = {
      default: def,
      parseHTML: (el: HTMLElement) => {
        const raw = el.getAttribute(dataKey);
        if (raw == null) return def;
        if (isComplex) {
          try {
            const parsed = JSON.parse(raw);
            return parsed ?? def;
          } catch {
            return def;
          }
        }
        if (typeof def === "boolean") return raw === "true";
        if (typeof def === "number") {
          const n = Number(raw);
          return Number.isFinite(n) ? n : def;
        }
        return raw;
      },
      renderHTML: (attrs: Record<string, any>) => {
        const v = attrs[key as string];
        if (v == null) return {};
        return { [dataKey]: isComplex ? JSON.stringify(v) : String(v) };
      },
    };
  });
  return spec;
}

/** Escapes user text before it is placed into a raw HTML attribute value. */
export function escapeAttr(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Clamp a grid column count to the responsive class set defined in globals.css. */
export function gridClass(columns: number): string {
  const n = Math.min(4, Math.max(1, Math.round(columns || 3)));
  return `rb-grid rb-grid-${n}`;
}

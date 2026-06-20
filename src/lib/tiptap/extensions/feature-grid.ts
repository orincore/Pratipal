import { Node, mergeAttributes } from "@tiptap/core";
import { dataAttrSpec, gridClass } from "./blocks-shared";

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureGridAttrs {
  heading: string;
  subheading: string;
  columns: number;
  align: "left" | "center";
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  accentColor: string;
  items: FeatureItem[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    featureGrid: {
      insertFeatureGrid: (attrs?: Partial<FeatureGridAttrs>) => ReturnType;
    };
  }
}

export const DEFAULT_FEATURE_ITEM: FeatureItem = {
  icon: "✨",
  title: "Feature title",
  description: "A short description of this feature or benefit.",
};

export const DEFAULT_FEATURE_GRID_ATTRS: FeatureGridAttrs = {
  heading: "Why choose us",
  subheading: "Everything you need, nothing you don't.",
  columns: 3,
  align: "center",
  backgroundColor: "transparent",
  cardBackground: "#ffffff",
  textColor: "#111827",
  accentColor: "#7c3aed",
  items: [
    { icon: "⚡", title: "Fast & reliable", description: "Built for speed so your audience never waits." },
    { icon: "🛡️", title: "Secure by default", description: "Your data and your customers stay protected." },
    { icon: "💜", title: "Made with care", description: "Thoughtful details that make people feel at home." },
  ],
};

export const FeatureGrid = Node.create({
  name: "featureGrid",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return dataAttrSpec(DEFAULT_FEATURE_GRID_ATTRS);
  },

  parseHTML() {
    return [{ tag: "section[data-feature-grid]" }];
  },

  addCommands() {
    return {
      insertFeatureGrid:
        (attrs?: Partial<FeatureGridAttrs>) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { ...DEFAULT_FEATURE_GRID_ATTRS, ...attrs } })
            .run(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const a = { ...DEFAULT_FEATURE_GRID_ATTRS, ...(node.attrs as Partial<FeatureGridAttrs>) };
    const items = Array.isArray(a.items) ? a.items : [];
    const textAlign = a.align === "left" ? "left" : "center";

    const cards: any[] = items.map((item) => {
      const inner: any[] = [];
      if (item.icon) {
        inner.push([
          "div",
          {
            style: `display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:14px;background:${a.accentColor}1a;font-size:26px;line-height:1;margin-bottom:14px`,
          },
          item.icon,
        ]);
      }
      inner.push(["h3", { style: `font-size:1.125rem;font-weight:700;margin:0 0 6px;color:${a.textColor}` }, item.title || ""]);
      inner.push(["p", { style: "font-size:0.9rem;line-height:1.6;margin:0;color:#6b7280" }, item.description || ""]);
      return [
        "div",
        {
          style: `background:${a.cardBackground};border:1px solid rgba(0,0,0,0.06);border-radius:16px;padding:24px;box-shadow:0 6px 20px rgba(0,0,0,0.04);text-align:${textAlign}`,
        },
        ...inner,
      ];
    });

    const head: any[] = [];
    if (a.heading) {
      head.push(["h2", { style: `font-size:2rem;font-weight:700;margin:0 0 8px;color:${a.textColor};text-align:${textAlign}` }, a.heading]);
    }
    if (a.subheading) {
      head.push(["p", { style: `font-size:1rem;color:#6b7280;margin:0 auto;max-width:640px;text-align:${textAlign}` }, a.subheading]);
    }

    const sectionStyle = [
      a.backgroundColor && a.backgroundColor !== "transparent" ? `background:${a.backgroundColor}` : "",
      "padding:48px 0",
      "width:100%",
    ]
      .filter(Boolean)
      .join(";");

    return [
      "section",
      mergeAttributes(HTMLAttributes, { "data-feature-grid": "", style: sectionStyle }),
      [
        "div",
        { class: "rb-container" },
        ...head,
        ["div", { class: gridClass(a.columns), style: "margin-top:28px" }, ...cards],
      ],
    ];
  },
});

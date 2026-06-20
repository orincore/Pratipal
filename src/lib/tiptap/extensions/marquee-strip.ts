import { Node, mergeAttributes } from "@tiptap/core";
import { dataAttrSpec } from "./blocks-shared";

export interface MarqueeStripAttrs {
  items: string[];
  backgroundColor: string;
  textColor: string;
  speed: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    marqueeStrip: {
      insertMarqueeStrip: (attrs?: Partial<MarqueeStripAttrs>) => ReturnType;
    };
  }
}

export const DEFAULT_MARQUEE_STRIP_ATTRS: MarqueeStripAttrs = {
  items: ["Limited spots", "100% satisfaction", "Trusted by thousands", "Money-back guarantee"],
  backgroundColor: "#7c3aed",
  textColor: "#ffffff",
  speed: 25,
};

export const MarqueeStrip = Node.create({
  name: "marqueeStrip",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return dataAttrSpec(DEFAULT_MARQUEE_STRIP_ATTRS);
  },

  parseHTML() {
    return [{ tag: "div[data-marquee-strip]" }];
  },

  addCommands() {
    return {
      insertMarqueeStrip:
        (attrs?: Partial<MarqueeStripAttrs>) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { ...DEFAULT_MARQUEE_STRIP_ATTRS, ...attrs } })
            .run(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const a = { ...DEFAULT_MARQUEE_STRIP_ATTRS, ...(node.attrs as Partial<MarqueeStripAttrs>) };
    const items = (Array.isArray(a.items) ? a.items : []).filter((s) => String(s).trim().length > 0);
    const duration = Math.max(4, Number(a.speed) || 25);

    // Triple the items so the -33.333% translate loops seamlessly.
    const sequence = [...items, ...items, ...items];
    const spans: any[] = [];
    sequence.forEach((text) => {
      spans.push(["span", { style: "padding:0 28px;font-weight:600;font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap" }, text]);
      spans.push(["span", { style: "opacity:0.45", "aria-hidden": "true" }, "✦"]);
    });

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-marquee-strip": "",
        class: "rb-marquee",
        style: `background:${a.backgroundColor};color:${a.textColor};width:100%`,
      }),
      [
        "div",
        { class: "rb-marquee-track", style: `animation-duration:${duration}s` },
        ...spans,
      ],
    ];
  },
});

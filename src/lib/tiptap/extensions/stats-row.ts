import { Node, mergeAttributes } from "@tiptap/core";
import { dataAttrSpec } from "./blocks-shared";

export interface StatItem {
  value: string;
  label: string;
}

export interface StatsRowAttrs {
  backgroundColor: string;
  valueColor: string;
  labelColor: string;
  items: StatItem[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    statsRow: {
      insertStatsRow: (attrs?: Partial<StatsRowAttrs>) => ReturnType;
    };
  }
}

export const DEFAULT_STAT_ITEM: StatItem = { value: "100+", label: "Happy customers" };

export const DEFAULT_STATS_ROW_ATTRS: StatsRowAttrs = {
  backgroundColor: "transparent",
  valueColor: "#7c3aed",
  labelColor: "#6b7280",
  items: [
    { value: "10k+", label: "Members" },
    { value: "4.9★", label: "Average rating" },
    { value: "98%", label: "Satisfaction" },
    { value: "24/7", label: "Support" },
  ],
};

export const StatsRow = Node.create({
  name: "statsRow",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return dataAttrSpec(DEFAULT_STATS_ROW_ATTRS);
  },

  parseHTML() {
    return [{ tag: "section[data-stats-row]" }];
  },

  addCommands() {
    return {
      insertStatsRow:
        (attrs?: Partial<StatsRowAttrs>) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { ...DEFAULT_STATS_ROW_ATTRS, ...attrs } })
            .run(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const a = { ...DEFAULT_STATS_ROW_ATTRS, ...(node.attrs as Partial<StatsRowAttrs>) };
    const items = Array.isArray(a.items) ? a.items : [];

    const cells: any[] = items.map((item) => [
      "div",
      { style: "text-align:center;padding:8px 16px" },
      ["div", { style: `font-size:2.5rem;font-weight:800;line-height:1.05;color:${a.valueColor}` }, item.value || ""],
      ["div", { style: `font-size:0.8rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;margin-top:6px;color:${a.labelColor}` }, item.label || ""],
    ]);

    const sectionStyle = [
      a.backgroundColor && a.backgroundColor !== "transparent" ? `background:${a.backgroundColor}` : "",
      "padding:40px 0",
      "width:100%",
    ]
      .filter(Boolean)
      .join(";");

    return [
      "section",
      mergeAttributes(HTMLAttributes, { "data-stats-row": "", style: sectionStyle }),
      ["div", { class: "rb-container rb-stats" }, ...cells],
    ];
  },
});

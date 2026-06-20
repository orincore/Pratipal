import { Node, mergeAttributes } from "@tiptap/core";
import { dataAttrSpec, gridClass } from "./blocks-shared";

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export interface TestimonialCardsAttrs {
  heading: string;
  columns: number;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  accentColor: string;
  items: TestimonialItem[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    testimonialCards: {
      insertTestimonialCards: (attrs?: Partial<TestimonialCardsAttrs>) => ReturnType;
    };
  }
}

export const DEFAULT_TESTIMONIAL_ITEM: TestimonialItem = {
  quote: "This completely changed the way I work. Highly recommended!",
  name: "Jane Doe",
  role: "Customer",
  avatar: "",
};

export const DEFAULT_TESTIMONIAL_CARDS_ATTRS: TestimonialCardsAttrs = {
  heading: "What people are saying",
  columns: 3,
  backgroundColor: "transparent",
  cardBackground: "#ffffff",
  textColor: "#111827",
  accentColor: "#7c3aed",
  items: [
    { quote: "Absolutely worth every penny. The results spoke for themselves within a week.", name: "Aisha Khan", role: "Entrepreneur", avatar: "" },
    { quote: "I finally feel confident. The guidance was clear, warm and genuinely helpful.", name: "Marcus Lee", role: "Designer", avatar: "" },
    { quote: "Best decision I made this year. I recommend it to everyone who asks.", name: "Priya Sharma", role: "Coach", avatar: "" },
  ],
};

export const TestimonialCards = Node.create({
  name: "testimonialCards",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return dataAttrSpec(DEFAULT_TESTIMONIAL_CARDS_ATTRS);
  },

  parseHTML() {
    return [{ tag: "section[data-testimonial-cards]" }];
  },

  addCommands() {
    return {
      insertTestimonialCards:
        (attrs?: Partial<TestimonialCardsAttrs>) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { ...DEFAULT_TESTIMONIAL_CARDS_ATTRS, ...attrs } })
            .run(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const a = { ...DEFAULT_TESTIMONIAL_CARDS_ATTRS, ...(node.attrs as Partial<TestimonialCardsAttrs>) };
    const items = Array.isArray(a.items) ? a.items : [];

    const cards: any[] = items.map((item) => {
      const initial = (item.name || "?").trim().charAt(0).toUpperCase() || "?";
      const avatar: any = item.avatar
        ? ["img", { src: item.avatar, alt: item.name || "", style: "width:44px;height:44px;border-radius:9999px;object-fit:cover;flex:none" }]
        : [
            "div",
            { style: `width:44px;height:44px;border-radius:9999px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:${a.accentColor};color:#fff;font-weight:700` },
            initial,
          ];

      const author: any[] = [];
      if (item.name) author.push(["div", { style: `font-weight:700;font-size:0.9rem;color:${a.textColor};line-height:1.2` }, item.name]);
      if (item.role) author.push(["div", { style: "font-size:0.8rem;color:#9ca3af;margin-top:2px" }, item.role]);

      return [
        "div",
        { style: `background:${a.cardBackground};border:1px solid rgba(0,0,0,0.06);border-radius:16px;padding:24px;box-shadow:0 6px 20px rgba(0,0,0,0.04);display:flex;flex-direction:column;gap:16px;text-align:left` },
        ["div", { style: `font-size:2rem;line-height:1;color:${a.accentColor};font-family:Georgia,serif` }, "“"],
        ["p", { style: `font-size:0.95rem;line-height:1.65;margin:0;flex:1;color:${a.textColor}` }, item.quote || ""],
        ["div", { style: "display:flex;align-items:center;gap:12px" }, avatar, ["div", {}, ...author]],
      ];
    });

    const head: any[] = [];
    if (a.heading) {
      head.push(["h2", { style: `font-size:2rem;font-weight:700;margin:0 0 28px;text-align:center;color:${a.textColor}` }, a.heading]);
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
      mergeAttributes(HTMLAttributes, { "data-testimonial-cards": "", style: sectionStyle }),
      ["div", { class: "rb-container" }, ...head, ["div", { class: gridClass(a.columns) }, ...cards]],
    ];
  },
});

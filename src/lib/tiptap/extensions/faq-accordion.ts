import { Node, mergeAttributes } from "@tiptap/core";
import { dataAttrSpec } from "./blocks-shared";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionAttrs {
  heading: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  accentColor: string;
  items: FaqItem[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    faqAccordion: {
      insertFaqAccordion: (attrs?: Partial<FaqAccordionAttrs>) => ReturnType;
    };
  }
}

export const DEFAULT_FAQ_ITEM: FaqItem = {
  question: "New question?",
  answer: "Add the answer to this question here.",
};

export const DEFAULT_FAQ_ACCORDION_ATTRS: FaqAccordionAttrs = {
  heading: "Frequently asked questions",
  backgroundColor: "transparent",
  cardBackground: "#ffffff",
  textColor: "#111827",
  accentColor: "#7c3aed",
  items: [
    { question: "How does it work?", answer: "Explain your product or offer in a sentence or two here." },
    { question: "Is there a refund policy?", answer: "Let people know your guarantee so they can buy with confidence." },
    { question: "How do I get support?", answer: "Tell customers the best way to reach you after they sign up." },
  ],
};

export const FaqAccordion = Node.create({
  name: "faqAccordion",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return dataAttrSpec(DEFAULT_FAQ_ACCORDION_ATTRS);
  },

  parseHTML() {
    return [{ tag: "section[data-faq-accordion]" }];
  },

  addCommands() {
    return {
      insertFaqAccordion:
        (attrs?: Partial<FaqAccordionAttrs>) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { ...DEFAULT_FAQ_ACCORDION_ATTRS, ...attrs } })
            .run(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const a = { ...DEFAULT_FAQ_ACCORDION_ATTRS, ...(node.attrs as Partial<FaqAccordionAttrs>) };
    const items = Array.isArray(a.items) ? a.items : [];

    const rows: any[] = items.map((item) => [
      "details",
      {
        class: "rb-faq-item",
        style: `background:${a.cardBackground};border:1px solid rgba(0,0,0,0.08);border-radius:14px;margin-bottom:12px;overflow:hidden`,
      },
      [
        "summary",
        {
          class: "rb-faq-q",
          style: `display:flex;align-items:center;justify-content:space-between;gap:16px;cursor:pointer;padding:18px 20px;font-weight:600;font-size:0.975rem;color:${a.textColor}`,
        },
        ["span", {}, item.question || ""],
        [
          "span",
          {
            class: "rb-faq-icon",
            style: `flex:none;width:24px;height:24px;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;background:${a.accentColor}1a;color:${a.accentColor};font-weight:700;line-height:1`,
          },
          "+",
        ],
      ],
      ["div", { style: "padding:0 20px 18px;font-size:0.9rem;line-height:1.65;color:#6b7280" }, item.answer || ""],
    ]);

    const head: any[] = [];
    if (a.heading) {
      head.push(["h2", { style: `font-size:2rem;font-weight:700;margin:0 0 24px;text-align:center;color:${a.textColor}` }, a.heading]);
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
      mergeAttributes(HTMLAttributes, { "data-faq-accordion": "", style: sectionStyle }),
      ["div", { class: "rb-faq", style: "max-width:760px;margin:0 auto;padding:0 20px" }, ...head, ...rows],
    ];
  },
});

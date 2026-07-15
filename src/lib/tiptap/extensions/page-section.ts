import { Node, mergeAttributes } from "@tiptap/core";

export interface PageSectionAttrs {
  backgroundColor: string;
  textColor: string;
  paddingX: number;
  paddingY: number;
  fullWidth: boolean;
  borderBottom: boolean;
  label: string;
  backgroundImage: string;
  backgroundGradient: string;
  minHeight: number;
  borderRadius: number;
  animationEffect: string;
  animationDuration: number;
  animationDelay: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageSection: {
      insertPageSection: (attrs?: Partial<PageSectionAttrs>) => ReturnType;
      updatePageSection: (attrs: Partial<PageSectionAttrs>) => ReturnType;
    };
  }
}

export const DEFAULT_SECTION_ATTRS: PageSectionAttrs = {
  backgroundColor: "transparent",
  textColor: "#111827",
  paddingX: 32,
  paddingY: 48,
  fullWidth: true,
  borderBottom: false,
  label: "Section",
  backgroundImage: "",
  backgroundGradient: "",
  minHeight: 0,
  borderRadius: 0,
  animationEffect: "none",
  animationDuration: 800,
  animationDelay: 0,
};

export const PageSection = Node.create({
  name: "pageSection",
  group: "block",
  content: "block+",
  defining: true,
  draggable: true,
  selectable: true,
  isolating: true,

  addAttributes() {
    return {
      backgroundColor: { default: DEFAULT_SECTION_ATTRS.backgroundColor },
      textColor: { default: DEFAULT_SECTION_ATTRS.textColor },
      paddingX: { default: DEFAULT_SECTION_ATTRS.paddingX },
      paddingY: { default: DEFAULT_SECTION_ATTRS.paddingY },
      fullWidth: { default: DEFAULT_SECTION_ATTRS.fullWidth },
      borderBottom: { default: DEFAULT_SECTION_ATTRS.borderBottom },
      label: { default: DEFAULT_SECTION_ATTRS.label },
      backgroundImage: { default: DEFAULT_SECTION_ATTRS.backgroundImage },
      backgroundGradient: { default: DEFAULT_SECTION_ATTRS.backgroundGradient },
      minHeight: { default: DEFAULT_SECTION_ATTRS.minHeight },
      borderRadius: { default: DEFAULT_SECTION_ATTRS.borderRadius },
      animationEffect: { default: DEFAULT_SECTION_ATTRS.animationEffect },
      animationDuration: { default: DEFAULT_SECTION_ATTRS.animationDuration },
      animationDelay: { default: DEFAULT_SECTION_ATTRS.animationDelay },
    };
  },

  parseHTML() {
    return [{ tag: "section[data-page-section]" }];
  },

  addCommands() {
    return {
      insertPageSection:
        (attrs?: Partial<PageSectionAttrs>) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: { ...DEFAULT_SECTION_ATTRS, ...attrs },
              content: [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "New Section" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Start adding content to this section...",
                    },
                  ],
                },
              ],
            })
            .run(),
      updatePageSection:
        (attrs: Partial<PageSectionAttrs>) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },

  renderHTML({ node }) {
    const a = {
      ...DEFAULT_SECTION_ATTRS,
      ...(node.attrs as Partial<PageSectionAttrs>),
    };

    const styleParts = [
      `color:${a.textColor}`,
      `padding:${a.paddingY}px ${a.paddingX}px`,
      a.fullWidth ? "width:100%" : "",
      a.borderBottom ? "border-bottom:1px solid rgba(0,0,0,0.1)" : "",
    ];

    if (a.backgroundGradient) {
      styleParts.push(`background:${a.backgroundGradient}`);
    } else if (a.backgroundImage) {
      styleParts.push(`background-image:url('${a.backgroundImage}')`, "background-size:cover", "background-position:center", "background-repeat:no-repeat");
    } else if (a.backgroundColor !== "transparent") {
      styleParts.push(`background-color:${a.backgroundColor}`);
    }

    if (a.minHeight > 0) {
      styleParts.push(`min-height:${a.minHeight}px`, "display:flex", "flex-direction:column", "justify-content:center");
    }
    if (a.borderRadius > 0) {
      styleParts.push(`border-radius:${a.borderRadius}px`);
    }

    let style = styleParts.filter(Boolean).join(";");

    const htmlAttrs: Record<string, any> = {
      "data-page-section": "",
      "data-label": a.label,
    };

    if (a.animationEffect && a.animationEffect !== "none") {
      htmlAttrs["data-animation"] = a.animationEffect;
      style = style + `;animation-duration:${a.animationDuration}ms;animation-delay:${a.animationDelay}ms`;
      htmlAttrs["class"] = `ve-animate ve-animate-${a.animationEffect}`;
    }

    htmlAttrs["style"] = style;

    return [
      "section",
      mergeAttributes(htmlAttrs),
      0,
    ];
  },
});

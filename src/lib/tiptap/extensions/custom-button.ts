import { Node, mergeAttributes } from "@tiptap/core";

export type ButtonAlignment = "left" | "center" | "right";
export type ButtonVariant = "solid" | "outline";
export type ButtonWidth = "auto" | "full";

export interface ButtonAttrs {
  href: string;
  align: ButtonAlignment;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  shadow: boolean;
  variant: ButtonVariant;
  width: ButtonWidth;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  hoverBg: string;
  hoverTextColor: string;
  hoverScale: boolean;
  hoverShadow: boolean;
  transitionDuration: number;
  animationEffect: string;
  animationDuration: number;
  animationDelay: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customButton: {
      insertCustomButton: (attrs?: Partial<ButtonAttrs>) => ReturnType;
      updateCustomButton: (attrs: Partial<ButtonAttrs>) => ReturnType;
    };
  }
}

export const DEFAULT_BUTTON_ATTRS: ButtonAttrs = {
  href: "",
  align: "center",
  backgroundColor: "#111827",
  textColor: "#ffffff",
  borderColor: "#111827",
  borderRadius: 999,
  paddingX: 28,
  paddingY: 14,
  shadow: true,
  variant: "solid",
  width: "auto",
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.01,
  hoverBg: "",
  hoverTextColor: "",
  hoverScale: false,
  hoverShadow: false,
  transitionDuration: 200,
  animationEffect: "none",
  animationDuration: 800,
  animationDelay: 0,
};

export const CustomButton = Node.create({
  name: "customButton",
  group: "block",
  content: "inline*",
  defining: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      ...Object.entries(DEFAULT_BUTTON_ATTRS).reduce(
        (attrs, [key, value]) => ({
          ...attrs,
          [key]: { default: value },
        }),
        {}
      ),
    };
  },

  parseHTML() {
    return [{ tag: "div[data-button]" }];
  },

  addCommands() {
    return {
      insertCustomButton:
        (attrs?: Partial<ButtonAttrs>) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: { ...DEFAULT_BUTTON_ATTRS, ...attrs },
              content: [
                {
                  type: "text",
                  text: "Call to action",
                },
              ],
            })
            .run(),
      updateCustomButton:
        (attrs: Partial<ButtonAttrs>) =>
        ({ commands }) => commands.updateAttributes(this.name, attrs),
    };
  },

  renderHTML({ node }) {
    const attrs = { ...DEFAULT_BUTTON_ATTRS, ...(node.attrs as Partial<ButtonAttrs>) };
    const wrapperStyle = [`text-align:${attrs.align}`, "margin:1.5rem 0"].join(";");
    const isOutline = attrs.variant === "outline";

    const shadowVal = attrs.shadow ? "0 15px 35px rgba(0,0,0,0.12)" : "none";
    const hoverShadowVal = attrs.hoverShadow ? "0 20px 40px rgba(0,0,0,0.18)" : shadowVal;
    const hoverScaleVal = attrs.hoverScale ? "scale(1.05)" : "scale(1)";

    const buttonStyles = [
      "display:inline-flex",
      "align-items:center",
      "justify-content:center",
      `padding:${attrs.paddingY}px ${attrs.paddingX}px`,
      `border-radius:${attrs.borderRadius}px`,
      `border:2px solid ${attrs.borderColor}`,
      attrs.width === "full" ? "width:100%" : "width:auto",
      attrs.width === "full" ? "display:flex" : "display:inline-flex",
      `box-shadow:${shadowVal}`,
      `background-color:${isOutline ? "transparent" : attrs.backgroundColor}`,
      `color:${attrs.textColor}`,
      `font-size:${attrs.fontSize}px`,
      `font-weight:${attrs.fontWeight}`,
      `letter-spacing:${attrs.letterSpacing}em`,
      `transition:all ${attrs.transitionDuration}ms ease`,
      "text-decoration:none",
      "cursor:pointer",
      `--btn-hover-bg:${attrs.hoverBg || (isOutline ? "transparent" : attrs.backgroundColor)}`,
      `--btn-hover-color:${attrs.hoverTextColor || attrs.textColor}`,
      `--btn-hover-scale:${hoverScaleVal}`,
      `--btn-hover-shadow:${hoverShadowVal}`,
      `--btn-transition-duration:${attrs.transitionDuration}ms`,
    ].filter(Boolean);

    const elementAttrs = {
      href: attrs.href || undefined,
      target: attrs.href ? "_blank" : undefined,
      rel: attrs.href ? "noopener noreferrer" : undefined,
      style: buttonStyles.join(";"),
      "data-variant": attrs.variant,
      "data-width": attrs.width,
    };

    const wrapperAttrs: Record<string, any> = {
      "data-button": "",
    };

    let style = wrapperStyle;
    if (attrs.animationEffect && attrs.animationEffect !== "none") {
      wrapperAttrs["data-animation"] = attrs.animationEffect;
      style = style + `;animation-duration:${attrs.animationDuration}ms;animation-delay:${attrs.animationDelay}ms`;
      wrapperAttrs["class"] = `ve-animate ve-animate-${attrs.animationEffect}`;
    }

    wrapperAttrs["style"] = style;

    return [
      "div",
      mergeAttributes(wrapperAttrs),
      [
        "a",
        mergeAttributes(elementAttrs),
        0,
      ],
    ];
  },
});

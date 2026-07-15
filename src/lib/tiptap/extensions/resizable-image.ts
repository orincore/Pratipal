import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

export type ImageAlignment = "left" | "center" | "right";

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-width") || element.getAttribute("width") || "100%",
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            "data-width": attributes.width,
          };
        },
      },
      align: {
        default: "center" as ImageAlignment,
        parseHTML: (element) =>
          (element.getAttribute("data-align") as ImageAlignment) || "center",
        renderHTML: (attributes) => {
          if (!attributes.align) return {};
          return {
            "data-align": attributes.align,
          };
        },
      },
      height: {
        default: "auto",
        parseHTML: (element) => element.getAttribute("data-height") || element.getAttribute("height") || "auto",
        renderHTML: (attributes) => ({
          "data-height": attributes.height,
        }),
      },
      aspectRatio: {
        default: "auto",
        parseHTML: (element) => element.getAttribute("data-aspect-ratio") || "auto",
        renderHTML: (attributes) => ({
          "data-aspect-ratio": attributes.aspectRatio,
        }),
      },
      borderRadius: {
        default: 12,
        parseHTML: (element) => {
          const val = element.getAttribute("data-border-radius");
          return val !== null ? Number(val) : 12;
        },
        renderHTML: (attributes) => ({
          "data-border-radius": attributes.borderRadius,
        }),
      },
      shadow: {
        default: "none",
        parseHTML: (element) => element.getAttribute("data-shadow") || "none",
        renderHTML: (attributes) => ({
          "data-shadow": attributes.shadow,
        }),
      },
      opacity: {
        default: 100,
        parseHTML: (element) => {
          const val = element.getAttribute("data-opacity");
          return val !== null ? Number(val) : 100;
        },
        renderHTML: (attributes) => ({
          "data-opacity": attributes.opacity,
        }),
      },
      objectFit: {
        default: "cover",
        parseHTML: (element) => element.getAttribute("data-object-fit") || "cover",
        renderHTML: (attributes) => ({
          "data-object-fit": attributes.objectFit,
        }),
      },
      marginTop: {
        default: 24,
        parseHTML: (element) => {
          const val = element.getAttribute("data-margin-top");
          return val !== null ? Number(val) : 24;
        },
        renderHTML: (attributes) => ({
          "data-margin-top": attributes.marginTop,
        }),
      },
      marginBottom: {
        default: 24,
        parseHTML: (element) => {
          const val = element.getAttribute("data-margin-bottom");
          return val !== null ? Number(val) : 24;
        },
        renderHTML: (attributes) => ({
          "data-margin-bottom": attributes.marginBottom,
        }),
      },
      hoverEffect: {
        default: "none",
        parseHTML: (element) => element.getAttribute("data-hover-effect") || "none",
        renderHTML: (attributes) => ({
          "data-hover-effect": attributes.hoverEffect,
        }),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node ? node.attrs : HTMLAttributes;
    const {
      align = "center",
      width = "100%",
      height = "auto",
      aspectRatio = "auto",
      borderRadius = 12,
      shadow = "none",
      opacity = 100,
      objectFit = "cover",
      marginTop = 24,
      marginBottom = 24,
      hoverEffect = "none",
    } = attrs as {
      align?: ImageAlignment;
      width?: string;
      height?: string;
      aspectRatio?: string;
      borderRadius?: number;
      shadow?: string;
      opacity?: number;
      objectFit?: string;
      marginTop?: number;
      marginBottom?: number;
      hoverEffect?: string;
    };

    const shadowStyles: Record<string, string> = {
      none: "none",
      sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
      md: "0 8px 16px rgba(0, 0, 0, 0.12)",
      lg: "0 16px 32px rgba(0, 0, 0, 0.16)",
      xl: "0 24px 48px rgba(0, 0, 0, 0.2)",
    };

    const styleParts = [
      `width:${width}`,
      `height:${height}`,
      aspectRatio !== "auto" ? `aspect-ratio:${aspectRatio}` : "",
      "display:block",
      `border-radius:${borderRadius}px`,
      `box-shadow:${shadowStyles[shadow] || "none"}`,
      `opacity:${opacity / 100}`,
      `object-fit:${objectFit}`,
      `margin-top:${marginTop}px`,
      `margin-bottom:${marginBottom}px`,
    ];

    if (align === "left") {
      styleParts.push("margin-right:auto", "margin-left:0");
    } else if (align === "right") {
      styleParts.push("margin-left:auto", "margin-right:0");
    } else {
      styleParts.push("margin-left:auto", "margin-right:auto");
    }

    const classes = [
      HTMLAttributes.class,
      hoverEffect !== "none" ? `ve-hover-${hoverEffect}` : "",
      "transition-all duration-300",
    ].filter(Boolean).join(" ");

    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: styleParts.join(";"),
        class: classes,
      }),
    ];
  },
});

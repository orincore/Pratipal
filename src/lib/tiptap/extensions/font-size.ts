import { Extension } from "@tiptap/core";
import "@tiptap/extension-text-style";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    setFontSize: (size: string) => ReturnType;
    unsetFontSize: () => ReturnType;
    setLineHeight: (height: string) => ReturnType;
    unsetLineHeight: () => ReturnType;
    setLetterSpacing: (spacing: string) => ReturnType;
    unsetLetterSpacing: () => ReturnType;
  }
}

export const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
          letterSpacing: {
            default: null,
            parseHTML: (element) => element.style.letterSpacing?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.letterSpacing) {
                return {};
              }
              return {
                style: `letter-spacing: ${attributes.letterSpacing}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
        },
      setLineHeight:
        (lineHeight: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { lineHeight }).run();
        },
      unsetLineHeight:
        () =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { lineHeight: null }).removeEmptyTextStyle().run();
        },
      setLetterSpacing:
        (letterSpacing: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { letterSpacing }).run();
        },
      unsetLetterSpacing:
        () =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { letterSpacing: null }).removeEmptyTextStyle().run();
        },
    };
  },
});

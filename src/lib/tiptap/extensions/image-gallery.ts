import { Node, mergeAttributes } from "@tiptap/core";
import { dataAttrSpec, gridClass } from "./blocks-shared";

export interface GalleryItem {
  url: string;
  caption: string;
}

export interface ImageGalleryAttrs {
  heading: string;
  columns: number;
  rounded: number;
  backgroundColor: string;
  textColor: string;
  items: GalleryItem[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageGallery: {
      insertImageGallery: (attrs?: Partial<ImageGalleryAttrs>) => ReturnType;
    };
  }
}

export const DEFAULT_GALLERY_ITEM: GalleryItem = { url: "", caption: "" };

export const DEFAULT_IMAGE_GALLERY_ATTRS: ImageGalleryAttrs = {
  heading: "",
  columns: 3,
  rounded: 16,
  backgroundColor: "transparent",
  textColor: "#111827",
  items: [
    { url: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80", caption: "" },
    { url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80", caption: "" },
    { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80", caption: "" },
  ],
};

export const ImageGallery = Node.create({
  name: "imageGallery",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return dataAttrSpec(DEFAULT_IMAGE_GALLERY_ATTRS);
  },

  parseHTML() {
    return [{ tag: "section[data-image-gallery]" }];
  },

  addCommands() {
    return {
      insertImageGallery:
        (attrs?: Partial<ImageGalleryAttrs>) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { ...DEFAULT_IMAGE_GALLERY_ATTRS, ...attrs } })
            .run(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const a = { ...DEFAULT_IMAGE_GALLERY_ATTRS, ...(node.attrs as Partial<ImageGalleryAttrs>) };
    const items = Array.isArray(a.items) ? a.items : [];
    const radius = Math.max(0, Number(a.rounded) || 0);

    const cells: any[] = items.map((item) => {
      const media: any = item.url
        ? ["img", { src: item.url, alt: item.caption || "", loading: "lazy", style: `width:100%;height:100%;object-fit:cover;display:block;border-radius:${radius}px` }]
        : ["div", { style: `width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#9ca3af;font-size:0.8rem;border-radius:${radius}px` }, "No image"];

      const figureChildren: any[] = [
        ["div", { style: `aspect-ratio:1/1;overflow:hidden;border-radius:${radius}px;background:#f3f4f6` }, media],
      ];
      if (item.caption) {
        figureChildren.push(["figcaption", { style: `font-size:0.8rem;color:#6b7280;margin-top:8px;text-align:center` }, item.caption]);
      }
      return ["figure", { style: "margin:0" }, ...figureChildren];
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
      mergeAttributes(HTMLAttributes, { "data-image-gallery": "", style: sectionStyle }),
      ["div", { class: "rb-container" }, ...head, ["div", { class: gridClass(a.columns) }, ...cells]],
    ];
  },
});

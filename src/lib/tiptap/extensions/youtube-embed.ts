import Youtube, { type YoutubeOptions } from "@tiptap/extension-youtube";
import { mergeAttributes } from "@tiptap/core";

type YoutubeEmbedOptions = YoutubeOptions & {
  // false inside the admin editor (see rich-editor.tsx) so the iframe can't
  // be clicked/played while editing — clicks fall through to the wrapper
  // instead, which is what lets the video be *selected* rather than played.
  // Left at the default `true` on the public storefront (DynamicPageRenderer
  // never sets it) so visitors can actually watch the video there.
  interactive: boolean;
};

export type VideoAlignment = "left" | "center" | "right";

// Pulls a video/playlist id out of any common YouTube URL shape. The stock
// @tiptap/extension-youtube does this internally but keeps it private, and
// its version doesn't thread per-node autoplay/mute through anyway, so this
// extension builds the embed URL itself.
function extractYoutubeId(raw: string): { id?: string; list?: string } {
  const url = raw.trim();
  if (!url) return {};
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    const host = u.hostname.replace(/^(www|m|music)\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? { id } : {};
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return { id: parts[1] };
      if (parts[0] === "shorts" && parts[1]) return { id: parts[1] };
      const v = u.searchParams.get("v") || undefined;
      const list = u.searchParams.get("list") || undefined;
      if (v) return { id: v, list };
      if (list) return { list };
    }
  } catch {
    // not a parseable URL at all
  }
  return {};
}

export function isValidYoutubeUrl(url?: string | null): boolean {
  if (!url) return false;
  const { id, list } = extractYoutubeId(url);
  return !!(id || list);
}

function buildEmbedSrc(
  url: string,
  opts: { autoplay?: boolean; muted?: boolean; start?: number }
): string | null {
  const { id, list } = extractYoutubeId(url);
  if (!id && !list) return null;

  const base = id ? `https://www.youtube.com/embed/${id}` : `https://www.youtube.com/embed/videoseries`;
  const params: string[] = [];
  if (list) params.push(`list=${encodeURIComponent(list)}`);
  if (opts.autoplay) params.push("autoplay=1");
  // Browser autoplay policies require the player to be muted for autoplay
  // to actually take effect, so autoplay always implies muted at the URL
  // level regardless of the Mute toggle's own state.
  if (opts.muted || opts.autoplay) params.push("mute=1");
  if (opts.start) params.push(`start=${opts.start}`);
  params.push("rel=0");

  return `${base}?${params.join("&")}`;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    // A distinct group key (rather than re-opening the base extension's own
    // `youtube` group, which TS requires to match exactly everywhere it's
    // declared) — TipTap flattens all groups into one `editor.commands`
    // namespace regardless, so this still surfaces as
    // `editor.commands.insertYoutubePlaceholder()`.
    youtubeEmbed: {
      /**
       * Inserts an empty video placeholder immediately — no browser prompt.
       * The user fills in the URL afterwards via the Video Properties panel
       * (or by clicking the placeholder itself), the same way every other
       * element in this editor (button, image, form, ...) is configured
       * after insertion rather than up front.
       */
      insertYoutubePlaceholder: () => ReturnType;
    };
  }
}

// Wraps the stock Youtube node so it can: exist with no (or an invalid) URL
// yet, rendering a friendly "Add a YouTube video" placeholder instead of a
// broken iframe; be sized independently of the canvas width (the base
// extension's iframe is hard-forced to w-full); and carry per-video
// autoplay/mute, which the base extension only exposes as an editor-wide
// option, not a per-node attribute.
export const YoutubeEmbed = Youtube.extend<YoutubeEmbedOptions>({
  addOptions() {
    return {
      // Non-null: this always runs while extending an existing node, but
      // the optional-call form (`?.()`) would make TS infer every spread
      // property as possibly-undefined, which then fails to satisfy
      // YoutubeOptions' required (non-optional) fields below.
      ...this.parent!(),
      interactive: true,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      containerWidth: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-container-width") || "100%",
        renderHTML: (attributes) => ({ "data-container-width": attributes.containerWidth }),
      },
      align: {
        default: "center" as VideoAlignment,
        parseHTML: (element) => (element.getAttribute("data-align") as VideoAlignment) || "center",
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
      },
      autoplay: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-autoplay") === "true",
        renderHTML: (attributes) => ({ "data-autoplay": String(!!attributes.autoplay) }),
      },
      muted: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-muted") === "true",
        renderHTML: (attributes) => ({ "data-muted": String(!!attributes.muted) }),
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      insertYoutubePlaceholder:
        () =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { src: "" } })
            .run(),
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node ? node.attrs : HTMLAttributes;
    const src = attrs.src as string | null | undefined;
    const containerWidth = (attrs.containerWidth as string) || "100%";
    const align = (attrs.align as VideoAlignment) || "center";
    const autoplay = !!attrs.autoplay;
    const muted = !!attrs.muted;
    const start = (attrs.start as number) || 0;

    const wrapperStyleParts = ["display:block", `width:${containerWidth}`];
    if (align === "left") wrapperStyleParts.push("margin-right:auto", "margin-left:0");
    else if (align === "right") wrapperStyleParts.push("margin-left:auto", "margin-right:0");
    else wrapperStyleParts.push("margin-left:auto", "margin-right:auto");
    const wrapperStyle = wrapperStyleParts.join(";");

    const embedSrc = src ? buildEmbedSrc(src, { autoplay, muted, start }) : null;

    if (!embedSrc) {
      return [
        "div",
        mergeAttributes(this.options.HTMLAttributes, {
          "data-youtube-video": "",
          "data-youtube-empty": "",
          style: wrapperStyle,
        }),
        [
          "div",
          {
            style:
              "width:100%;aspect-ratio:16/9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:#f9fafb;border-radius:0.5rem;cursor:pointer;color:#9ca3af;padding:1rem;text-align:center",
          },
          [
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "36",
              height: "36",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "1.5",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            ["path", { d: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33Z" }],
            ["path", { d: "m9.75 15.02 5.75-3.27-5.75-3.27v6.54Z" }],
          ],
          ["span", { style: "font-size:13px;font-weight:600" }, "Add a YouTube video"],
          ["span", { style: "font-size:11px" }, "Click to paste a URL"],
        ],
      ];
    }

    const editing = !this.options.interactive;

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-youtube-video": "",
        style: `position:relative;${editing ? "cursor:pointer;" : ""}${wrapperStyle}`,
      }),
      [
        "iframe",
        {
          src: embedSrc,
          // Inside the admin editor (interactive:false, see rich-editor.tsx)
          // an <iframe>'s own browsing context means a click landing on the
          // actual embedded player never bubbles out to this document, so
          // ProseMirror never sees it and can't create a NodeSelection —
          // the click just plays the video instead of selecting it.
          // pointer-events:none there makes the iframe untargetable by the
          // mouse, so the click falls through to the wrapper div behind it,
          // a normal same-document element ProseMirror resolves like any
          // other click. On the public storefront `interactive` stays true
          // (DynamicPageRenderer never sets the option) so visitors can
          // actually play the video.
          style: `width:100%;aspect-ratio:16/9;border-radius:0.5rem;display:block${editing ? ";pointer-events:none" : ""}`,
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowfullscreen: "true",
        },
      ],
    ];
  },
});

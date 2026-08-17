"use client";

// Loads the site's large multi-family Google Fonts stylesheet (every font an
// admin can pick for a landing page's heading font — see lib/fonts.ts)
// without it blocking the initial render of every page on the site, most of
// which never use any of those families. Classic "preload as style, media
// swap on load" pattern: the server-rendered HTML already has media="print"
// baked in (non-blocking for on-screen rendering from byte one), and once
// the stylesheet finishes downloading — client-side, after this component
// hydrates — the onLoad handler flips it to media="all" so the fonts apply.
export function DeferredGoogleFonts({ href }: { href: string }) {
  return (
    <>
      <link rel="preload" as="style" href={href} />
      <link
        rel="stylesheet"
        href={href}
        media="print"
        onLoad={(e) => {
          (e.currentTarget as HTMLLinkElement).media = "all";
        }}
      />
      <noscript>
        <link rel="stylesheet" href={href} />
      </noscript>
    </>
  );
}

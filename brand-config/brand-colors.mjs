/**
 * Brand palettes as plain ESM data.
 *
 * Why this file is .mjs and not .ts: tailwind.config.ts is loaded by Turbopack's
 * PostCSS pipeline, whose resolver does not guess `.ts` extensions for nested
 * relative imports — `import ... from "./brand-config/site.config"` resolved
 * fine for the app graph but emitted a "Module not found" warning during the
 * Tailwind config load. An explicit `.mjs` specifier resolves under every
 * extension list, and .mjs is unambiguously ESM so Node never has to guess the
 * module type either.
 *
 * This is the single source of truth for brand colors: site.config.*.ts import
 * from here, so the palette is never duplicated between Tailwind and app code.
 */

/** @typedef {import("./site-config.types").BrandColors} BrandColors */

/** @type {BrandColors} */
export const adhyatmiksutraaColors = {
  // Extracted from the live site's Elementor global color palette (post-8.css).
  primary: "#7B3F7A",
  secondary: "#35093C",
  peacock: "#7B3F7A",
  earth: "#D5D4C0",
  sand: "#EEC6BC",
  accent: "#FD4380",
  support: "#7675B9",
  cta: "#FD4380",
  cream: "#EEC6BC",
  warm: "#D89E2E",
  dark: "#240429",
};

/** @type {BrandColors} */
export const pratipalColors = {
  primary: "#232d5f",
  secondary: "#1b244a",
  peacock: "#232d5f",
  earth: "#edeae3",
  sand: "#d4c6ad",
  accent: "#f2c094",
  support: "#2f6f8a",
  cta: "#d97745",
  cream: "#f5efe4",
  warm: "#e0d4c1",
  dark: "#081629",
};

/**
 * The palette Tailwind compiles into `brand-*` utilities. Keep this pointing at
 * the same brand as brand-config/site.config.ts — they are read by different
 * loaders and cannot import each other's selection.
 */
export const activeBrandColors = pratipalColors;

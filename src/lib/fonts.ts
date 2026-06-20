// Shared font list used by the blog editor, landing Rich Editor and the
// landing template font selectors. The Google families below are loaded once
// in the root layout so the chosen font-family resolves everywhere (admin
// editors + public pages).

export interface FontOption {
  label: string;
  /** CSS font-family stack. Empty string = "Default" (unset). */
  stack: string;
}

// Google Fonts families (with per-family available weights) loaded site-wide.
const GOOGLE_FAMILIES = [
  "Inter:wght@400;500;600;700",
  "Roboto:wght@400;500;700",
  "Open+Sans:wght@400;600;700",
  "Lato:wght@400;700",
  "Montserrat:wght@400;500;600;700",
  "Poppins:wght@400;500;600;700",
  "Raleway:wght@400;500;600;700",
  "Nunito:wght@400;600;700",
  "Work+Sans:wght@400;500;600;700",
  "Mulish:wght@400;600;700",
  "Rubik:wght@400;500;700",
  "DM+Sans:wght@400;500;700",
  "Manrope:wght@400;500;600;700",
  "Playfair+Display:wght@400;500;600;700",
  "Merriweather:wght@400;700",
  "Lora:wght@400;500;600;700",
  "PT+Serif:wght@400;700",
  "Cormorant+Garamond:wght@400;500;600;700",
  "EB+Garamond:wght@400;500;600;700",
  "Libre+Baskerville:wght@400;700",
  "Oswald:wght@400;500;600;700",
  "Bebas+Neue",
  "Pacifico",
  "Dancing+Script:wght@400;500;600;700",
  "Caveat:wght@400;500;600;700",
  "Lobster",
  "Abril+Fatface",
  "Roboto+Mono:wght@400;500;700",
  "JetBrains+Mono:wght@400;500;700",
];

export const GOOGLE_FONTS_HREF =
  `https://fonts.googleapis.com/css2?family=${GOOGLE_FAMILIES.join("&family=")}&display=swap`;

// Selectable fonts shown in the dropdowns.
export const FONT_OPTIONS: FontOption[] = [
  { label: "Default", stack: "" },
  // System / web-safe
  { label: "System Sans", stack: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
  { label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", stack: "'Times New Roman', Times, serif" },
  { label: "Courier New", stack: "'Courier New', Courier, monospace" },
  // Sans-serif (Google)
  { label: "Inter", stack: "'Inter', sans-serif" },
  { label: "Roboto", stack: "'Roboto', sans-serif" },
  { label: "Open Sans", stack: "'Open Sans', sans-serif" },
  { label: "Lato", stack: "'Lato', sans-serif" },
  { label: "Montserrat", stack: "'Montserrat', sans-serif" },
  { label: "Poppins", stack: "'Poppins', sans-serif" },
  { label: "Raleway", stack: "'Raleway', sans-serif" },
  { label: "Nunito", stack: "'Nunito', sans-serif" },
  { label: "Work Sans", stack: "'Work Sans', sans-serif" },
  { label: "Mulish", stack: "'Mulish', sans-serif" },
  { label: "Rubik", stack: "'Rubik', sans-serif" },
  { label: "DM Sans", stack: "'DM Sans', sans-serif" },
  { label: "Manrope", stack: "'Manrope', sans-serif" },
  { label: "Oswald", stack: "'Oswald', sans-serif" },
  { label: "Bebas Neue", stack: "'Bebas Neue', sans-serif" },
  // Serif (Google)
  { label: "Playfair Display", stack: "'Playfair Display', serif" },
  { label: "Merriweather", stack: "'Merriweather', serif" },
  { label: "Lora", stack: "'Lora', serif" },
  { label: "PT Serif", stack: "'PT Serif', serif" },
  { label: "Cormorant Garamond", stack: "'Cormorant Garamond', serif" },
  { label: "EB Garamond", stack: "'EB Garamond', serif" },
  { label: "Libre Baskerville", stack: "'Libre Baskerville', serif" },
  { label: "Abril Fatface", stack: "'Abril Fatface', serif" },
  // Handwriting / display (Google)
  { label: "Pacifico", stack: "'Pacifico', cursive" },
  { label: "Dancing Script", stack: "'Dancing Script', cursive" },
  { label: "Caveat", stack: "'Caveat', cursive" },
  { label: "Lobster", stack: "'Lobster', cursive" },
  // Monospace (Google)
  { label: "Roboto Mono", stack: "'Roboto Mono', monospace" },
  { label: "JetBrains Mono", stack: "'JetBrains Mono', monospace" },
];

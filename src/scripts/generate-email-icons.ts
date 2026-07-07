// One-time (re-run when icons change) asset build: rasterizes the email
// icon set defined in src/lib/email-template.ts into PNGs under
// public/assets/email-icons/<color>/<name>.png, since Gmail strips inline
// <svg> from email bodies — emails reference these hosted PNGs via <img>
// instead. Run with: npx tsx src/scripts/generate-email-icons.ts
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { ALL_ICON_NAMES, ALL_ICON_COLORS, buildIconSvgMarkup } from "../lib/email-template";

const OUT_DIR = path.join(__dirname, "..", "..", "public", "assets", "email-icons");
const SOURCE_SIZE = 96; // rasterized at 4x display size (~24px) for retina crispness

async function main() {
  let count = 0;
  for (const color of ALL_ICON_COLORS) {
    const dir = path.join(OUT_DIR, color);
    fs.mkdirSync(dir, { recursive: true });
    for (const name of ALL_ICON_NAMES) {
      const svg = buildIconSvgMarkup(name, color, SOURCE_SIZE);
      const outPath = path.join(dir, `${name}.png`);
      await sharp(Buffer.from(svg)).png().toFile(outPath);
      count++;
    }
  }
  console.log(`Generated ${count} icon PNGs in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

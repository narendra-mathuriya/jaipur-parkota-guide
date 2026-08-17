import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { directorySpots } from "../src/data/directory.ts";
import { buildSpotSlug } from "../lib/slugs.ts";

const sourceDir = path.resolve("scripts/listing-image-sources");

const sourceByTheme = {
  jewelry: "jewelry.png",
  textiles: "textiles.png",
  food: "food.png",
  temple: "temple.png",
  parks: "parks.png",
  mall: "mall.png",
  heritage: "heritage.png",
  crafts: "crafts.png",
  cafe: "cafe.png",
  general: "general.png"
};

const themePriority = [
  ["jewelry", "jewelry"],
  ["textiles", "textiles"],
  ["wedding", "textiles"],
  ["streetfood", "food"],
  ["food", "food"],
  ["temple", "temple"],
  ["parks", "parks"],
  ["toddler", "parks"],
  ["cafe", "cafe"],
  ["mall", "mall"],
  ["upcoming", "mall"],
  ["crafts", "crafts"],
  ["sightseeing", "heritage"],
  ["outskirts", "heritage"],
  ["general", "general"]
];

const outDir = path.resolve("public/images/listings");

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickTheme(spot) {
  for (const [category, theme] of themePriority) {
    if (spot.cats.includes(category)) {
      return theme;
    }
  }

  return "general";
}

function bits(seed, places) {
  return seed >>> places;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svgOverlay({ seed, title, area, theme }) {
  const hue = seed % 360;
  const secondaryHue = (hue + 42) % 360;
  const opacity = 0.1 + ((seed % 9) / 100);
  const x1 = 140 + (seed % 720);
  const y1 = 120 + (bits(seed, 3) % 560);
  const x2 = 220 + (bits(seed, 5) % 720);
  const y2 = 160 + (bits(seed, 7) % 560);

  return Buffer.from(`
    <svg width="1200" height="900" viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(${hue}, 42%, 44%)" stop-opacity="${opacity}" />
          <stop offset="1" stop-color="hsl(${secondaryHue}, 36%, 36%)" stop-opacity="${opacity + 0.04}" />
        </linearGradient>
        <radialGradient id="light" cx="${(seed % 100) / 100}" cy="${(bits(seed, 8) % 100) / 100}" r="0.72">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.16" />
          <stop offset="0.42" stop-color="#d8c59f" stop-opacity="0.07" />
          <stop offset="1" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#tone)" />
      <circle cx="${x1}" cy="${y1}" r="${120 + (seed % 180)}" fill="url(#light)" />
      <circle cx="${x2}" cy="${y2}" r="${90 + (bits(seed, 4) % 160)}" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1.4" />
      <path d="M0 ${640 + (seed % 80)} C260 ${540 + (seed % 130)} 420 ${760 - (seed % 110)} 720 ${650 + (bits(seed, 4) % 120)} S1020 ${580 + (bits(seed, 6) % 110)} 1200 ${680 - (bits(seed, 8) % 90)}" fill="none" stroke="#ffffff" stroke-opacity="0.055" stroke-width="2" />
      <path d="M0 ${220 + (bits(seed, 2) % 120)} C280 ${180 + (bits(seed, 5) % 100)} 460 ${330 + (bits(seed, 7) % 120)} 760 ${260 + (bits(seed, 9) % 130)} S1040 ${160 + (bits(seed, 11) % 140)} 1200 ${270 + (bits(seed, 13) % 90)}" fill="none" stroke="#d8c59f" stroke-opacity="0.05" stroke-width="2" />
      <rect x="0" y="0" width="1200" height="900" fill="none" stroke="#ffffff" stroke-opacity="0.055" />
      <desc>${escapeXml(title)} in ${escapeXml(area)}, Jaipur listing visual for ${escapeXml(theme)}</desc>
    </svg>
  `);
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const expected = new Set();

  for (const spot of directorySpots) {
    const slug = buildSpotSlug(spot);
    const theme = pickTheme(spot);
    const seed = hashString(`${slug}:${spot.cats.join(",")}:${spot.a_en}`);
    const source = path.join(sourceDir, sourceByTheme[theme]);
    const output = path.join(outDir, `${slug}.avif`);
    expected.add(output);

    const left = seed % 180;
    const top = bits(seed, 8) % 110;
    const rotate = ((seed % 7) - 3) * 0.08;
    const saturation = 0.88 + ((seed % 20) / 100);
    const brightness = 0.86 + ((bits(seed, 5) % 12) / 100);

    await sharp(source)
      .rotate(rotate, { background: "#050506" })
      .resize(1450, 1040, { fit: "cover", position: "center" })
      .extract({
        left,
        top,
        width: 1200,
        height: 900
      })
      .modulate({
        saturation,
        brightness
      })
      .composite([
        {
          input: svgOverlay({
            seed,
            title: spot.n_en,
            area: spot.a_en,
            theme
          }),
          blend: "overlay"
        }
      ])
      .avif({ quality: 54, effort: 2 })
      .toFile(output);
  }

  const existing = await fs.readdir(outDir);
  await Promise.all(
    existing
      .filter((file) => file.endsWith(".avif"))
      .map(async (file) => {
        const target = path.join(outDir, file);
        if (!expected.has(target)) {
          await fs.unlink(target);
        }
      })
  );

  console.log(`Generated ${expected.size} listing images in ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

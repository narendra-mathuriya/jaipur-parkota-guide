import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { directorySpots } from "../src/data/directory.ts";
import { buildSpotSlug } from "../lib/slugs.ts";
import { pickListingImageTheme } from "./listing-image-theme.mjs";

const outDir = path.resolve("public/images/listings");
const expected = new Map();
const themeCounts = new Map();
const errors = [];

for (const spot of directorySpots) {
  const slug = buildSpotSlug(spot);
  const theme = pickListingImageTheme(spot);
  const file = `${slug}.avif`;
  expected.set(file, { spot, slug, theme });
  themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
}

const files = await fs.readdir(outDir);
const avifs = files.filter((file) => file.endsWith(".avif"));

for (const file of avifs) {
  if (!expected.has(file)) {
    errors.push(`Unexpected image file: ${file}`);
  }
}

for (const [file, { spot, theme }] of expected) {
  const fullPath = path.join(outDir, file);

  try {
    const [stat, metadata] = await Promise.all([
      fs.stat(fullPath),
      sharp(fullPath).metadata()
    ]);

    if (stat.size < 30_000) {
      errors.push(`${file} is suspiciously small (${stat.size} bytes)`);
    }

    if (metadata.format !== "heif" || metadata.width !== 1200 || metadata.height !== 900) {
      errors.push(
        `${file} has invalid metadata: ${metadata.format} ${metadata.width}x${metadata.height}`
      );
    }

    if (spot.cats.includes("mall") && theme !== "mall") {
      errors.push(`${file} is a mall listing but resolved to ${theme}`);
    }

    if (spot.cats[0] === "temple" && theme !== "temple") {
      errors.push(`${file} is a temple listing but resolved to ${theme}`);
    }
  } catch (error) {
    errors.push(`${file} is missing or unreadable: ${error.message}`);
  }
}

if (avifs.length !== expected.size) {
  errors.push(`Expected ${expected.size} AVIF files, found ${avifs.length}`);
}

console.log(`Verified ${expected.size} listing images.`);
console.log(
  [...themeCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([theme, count]) => `${theme}: ${count}`)
    .join("\n")
);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

import { access } from "node:fs/promises";
import { buildSpotSlug, loadDirectorySource } from "./directory-data.mjs";

const { categories, directorySpots } = await loadDirectorySource();
const categoryIds = new Set(categories.map((category) => category.id));
const seenIds = new Set();
const seenSlugs = new Set();
const failures = [];

for (const category of categories) {
  if (!category.id || !category.en || !category.hi) {
    failures.push(`Category is incomplete: ${JSON.stringify(category)}`);
  }
}

for (const spot of directorySpots) {
  const slug = buildSpotSlug(spot);

  if (seenIds.has(spot.id)) {
    failures.push(`Duplicate spot id: ${spot.id}`);
  }

  if (seenSlugs.has(slug)) {
    failures.push(`Duplicate slug: ${slug}`);
  }

  seenIds.add(spot.id);
  seenSlugs.add(slug);

  for (const field of ["n", "n_en", "i", "i_en", "a", "a_en", "s", "s_en", "q"]) {
    if (!spot[field]) {
      failures.push(`Spot ${spot.id} is missing ${field}`);
    }
  }

  if (!Array.isArray(spot.cats) || spot.cats.length === 0) {
    failures.push(`Spot ${spot.id} has no categories`);
  }

  for (const categoryId of spot.cats) {
    if (!categoryIds.has(categoryId)) {
      failures.push(`Spot ${spot.id} references unknown category ${categoryId}`);
    }
  }

  try {
    await access(`public/images/listings/${slug}.avif`);
  } catch {
    failures.push(`Spot ${spot.id} is missing image public/images/listings/${slug}.avif`);
  }
}

if (!categoryIds.has("all")) {
  failures.push("Missing all category");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${directorySpots.length} spots, ${categories.length} categories, and ${seenSlugs.size} listing images.`
);

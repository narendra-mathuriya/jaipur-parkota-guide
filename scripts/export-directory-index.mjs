import { mkdir, writeFile } from "node:fs/promises";
import { buildSpotSlug, loadDirectorySource } from "./directory-data.mjs";

const { categories, directorySpots } = await loadDirectorySource();
const layoutCycle = ["tall", "compact", "medium", "compact", "medium"];
const categoryById = new Map(categories.map((category) => [category.id, category]));

const listings = directorySpots.map((spot, index) => {
  const slug = buildSpotSlug(spot);
  const primaryCategory =
    spot.cats.map((categoryId) => categoryById.get(categoryId)).find(Boolean) ??
    categories[0];

  return {
    ...spot,
    slug,
    href: `/places/${slug}/`,
    image: `/images/listings/${slug}.avif`,
    imageAlt: `${spot.n_en}, ${spot.a_en}, Jaipur`,
    layout: layoutCycle[index % layoutCycle.length],
    primaryCategory
  };
});

const categoryCounts = categories.reduce((counts, category) => {
  counts[category.id] =
    category.id === "all"
      ? listings.length
      : listings.filter((listing) => listing.cats.includes(category.id)).length;

  return counts;
}, {});

const payload = {
  totalCount: listings.length,
  categoryCounts,
  listings
};

await mkdir("public", { recursive: true });
await writeFile("public/directory-index.json", `${JSON.stringify(payload)}\n`);

console.log(`Exported ${listings.length} listings to public/directory-index.json.`);

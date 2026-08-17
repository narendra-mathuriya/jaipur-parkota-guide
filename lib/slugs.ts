import type { DirectorySpot } from "@/src/data/directory";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();
}

export function buildSpotSlug(spot: DirectorySpot) {
  return slugify(`${spot.n_en} ${spot.a_en} Jaipur`);
}

export function buildSpotUrl(slug: string) {
  return `/places/${slug}/`;
}

export function buildListingImagePath(slug: string) {
  return `/images/listings/${slug}.avif`;
}

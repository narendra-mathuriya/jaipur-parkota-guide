import {
  categories,
  directorySpots,
  type DirectoryCategory,
  type DirectorySpot
} from "@/src/data/directory";
import { heroImage, socialImage } from "@/lib/seo";
import { buildSpotSlug, buildSpotUrl } from "@/lib/slugs";

export type DirectoryListing = DirectorySpot & {
  slug: string;
  href: string;
  image: string;
  imageAlt: string;
  layout: "tall" | "medium" | "compact";
  primaryCategory: DirectoryCategory;
};

const layoutCycle: Array<DirectoryListing["layout"]> = [
  "tall",
  "compact",
  "medium",
  "compact",
  "medium"
];

const categoryById = new Map(categories.map((category) => [category.id, category]));

export async function getDirectoryListings(): Promise<DirectoryListing[]> {
  return directorySpots.map((spot, index) => {
    const slug = buildSpotSlug(spot);
    const primaryCategory =
      spot.cats.map((cat) => categoryById.get(cat)).find(Boolean) ??
      categories[0];

    return {
      ...spot,
      slug,
      href: buildSpotUrl(slug),
      image: index % 3 === 0 ? heroImage : socialImage,
      imageAlt: `${spot.n_en}, ${spot.a_en}, Jaipur`,
      layout: layoutCycle[index % layoutCycle.length],
      primaryCategory,
    };
  });
}

export async function getFeaturedListings() {
  const listings = await getDirectoryListings();
  return listings.slice(0, 6);
}

export async function getDirectoryCategories() {
  return categories;
}

export async function getDirectoryListingBySlug(slug: string) {
  const listings = await getDirectoryListings();
  return listings.find((listing) => listing.slug === slug) ?? null;
}

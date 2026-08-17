import type { MetadataRoute } from "next";
import { getDirectoryListings } from "@/lib/directory";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getDirectoryListings();
  const lastModified = new Date("2026-08-17");

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    ...listings.map((listing) => ({
      url: `${siteUrl}${listing.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.82
    }))
  ];
}

import type { MetadataRoute } from "next";
import { assetPath, withBasePath } from "@/lib/paths";
import { pageDescription, siteName } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Jaipur",
    description: pageDescription,
    start_url: withBasePath("/"),
    scope: withBasePath("/"),
    display: "standalone",
    background_color: "#050506",
    theme_color: "#050506",
    orientation: "portrait",
    categories: ["travel", "navigation", "lifestyle"],
    icons: [
      {
        src: assetPath("/icons/icon-192.png"),
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: assetPath("/icons/icon-512.png"),
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: assetPath("/icons/maskable-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}

import type { ReactNode } from "react";
import "./globals.css";
import { metadata } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";

export { metadata };

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050506"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <body>
        <a
          href="#explore"
          className="skip-link fixed left-4 top-4 z-[60] rounded-lg bg-white px-4 py-3 text-sm font-semibold !text-[#050506]"
        >
          Skip to directory
        </a>
        <div className="noise-mask" aria-hidden="true" />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

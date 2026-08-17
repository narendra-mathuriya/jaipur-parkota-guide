import type { ReactNode } from "react";
import "./globals.css";
import { metadata } from "@/lib/seo";

export { metadata };

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8C2D27"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}

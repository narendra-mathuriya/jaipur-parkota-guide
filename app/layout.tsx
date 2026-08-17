import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { metadata } from "@/lib/seo";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { SiteHeader } from "@/components/SiteHeader";

export { metadata };

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050506"
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SmoothScrollProvider>
          <div className="noise-mask" aria-hidden="true" />
          <SiteHeader />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

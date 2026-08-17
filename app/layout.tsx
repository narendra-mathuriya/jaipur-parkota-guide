import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { metadata } from "@/lib/seo";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
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
          <a
            href="#explore"
            className="skip-link fixed left-4 top-4 z-[60] rounded-lg bg-white px-4 py-3 text-sm font-semibold !text-[#050506]"
          >
            Skip to directory
          </a>
          <div className="noise-mask" aria-hidden="true" />
          <SiteHeader />
          {children}
          <ServiceWorkerRegistration />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

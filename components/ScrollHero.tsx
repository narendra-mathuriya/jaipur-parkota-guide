"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { heroImage } from "@/lib/seo";
import type { DirectoryListing } from "@/lib/directory";

export function ScrollHero({
  totalCount,
  featured
}: {
  totalCount: number;
  featured: DirectoryListing[];
}) {
  const trackRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);

    sync();
    media.addEventListener("change", sync);

    return () => media.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.72], [1, isMobile ? 0.9 : 0.78]);
  const opacity = useTransform(scrollYProgress, [0, 0.62], [1, isMobile ? 0.42 : 0.2]);
  const y = useTransform(scrollYProgress, [0, 0.72], [0, isMobile ? -32 : -96]);
  const imageScale = useTransform(scrollYProgress, [0, 0.8], [isMobile ? 1.03 : 1.08, 1]);

  return (
    <section
      ref={trackRef}
      id="top"
      className="hero-track relative"
      aria-labelledby="hero-heading"
    >
      <div className="sticky top-0 flex min-h-dvh items-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          className="hero-image absolute inset-0"
          style={prefersReducedMotion ? undefined : { scale: imageScale }}
        >
          <Image
            src={heroImage}
            alt="Jaipur walled city heritage bazaar viewed through pink sandstone arches"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-56"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.38)_0%,rgba(5,5,6,0.72)_58%,#050506_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050506_0%,rgba(5,5,6,0.76)_36%,rgba(5,5,6,0.2)_100%)]" />

        <motion.div
          className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end"
          style={prefersReducedMotion ? undefined : { scale, opacity, y }}
        >
          <div>
            <p className="font-mono text-xs tracking-[0.34em] text-gold uppercase">
              Luxury Jaipur Directory
            </p>
            <h1
              id="hero-heading"
              className="mt-6 max-w-5xl text-6xl leading-[0.88] font-semibold text-balance text-white sm:text-8xl lg:text-9xl"
            >
              Jaipur, edited.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              A refined, bilingual index of heritage streets, artisan lanes,
              temples, food legends, modern hubs, and quiet day trips across
              the Pink City.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#explore"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                <ArrowDown size={17} aria-hidden="true" />
                Browse {totalCount} places
              </a>
              <a
                href="#featured"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.14]"
              >
                View highlights
              </a>
            </div>
          </div>

          <aside
            id="featured"
            className="glass-panel-strong rounded-[2rem] p-4 sm:p-5 lg:mb-5"
            aria-label="Featured Jaipur places"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-[0.68rem] tracking-[0.28em] text-zinc-400 uppercase">
                First stops
              </span>
              <span className="font-mono text-[0.68rem] text-gold">
                {totalCount} indexed
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {featured.slice(0, 4).map((spot) => (
                <a
                  href={spot.href}
                  key={spot.id}
                  className="group flex min-h-14 items-center justify-between rounded-2xl border border-white/0 px-3 py-3 transition hover:border-white/10 hover:bg-white/[0.07]"
                >
                  <span>
                    <span className="block text-sm font-medium text-zinc-100">
                      {spot.n_en}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <MapPin size={12} aria-hidden="true" />
                      {spot.a_en}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-zinc-600 transition group-hover:text-gold">
                    {spot.slug.split("-").slice(0, 2).join(" ")}
                  </span>
                </a>
              ))}
            </div>
          </aside>
        </motion.div>
      </div>
    </section>
  );
}

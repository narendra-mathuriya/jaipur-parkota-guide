"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { PointerEvent } from "react";
import type { DirectoryListing } from "@/lib/directory";

type Language = "hi" | "en";

function cleanCategoryLabel(value: string) {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

export function ListingCard({
  listing,
  language,
  priority
}: {
  listing: DirectoryListing;
  language: Language;
  priority?: boolean;
}) {
  const title = language === "hi" ? listing.n : listing.n_en;
  const area = language === "hi" ? listing.a : listing.a_en;
  const highlights = language === "hi" ? listing.i : listing.i_en;
  const shops = language === "hi" ? listing.s : listing.s_en;
  const category =
    language === "hi" ? listing.primaryCategory.hi : listing.primaryCategory.en;

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--x",
      `${event.clientX - rect.left}px`
    );
    event.currentTarget.style.setProperty(
      "--y",
      `${event.clientY - rect.top}px`
    );
  }

  const heightClass =
    listing.layout === "tall"
      ? "card-tall"
      : listing.layout === "medium"
        ? "card-medium"
        : "card-compact";

  return (
    <article
      id={listing.slug}
      className={`group relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-3xl transition duration-500 hover:-translate-y-1 hover:border-white/20 active:scale-[0.99] ${heightClass}`}
      onPointerMove={handlePointerMove}
    >
      <div className="cursor-halo pointer-events-none absolute inset-0 z-0 opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full min-h-[24rem] flex-col overflow-hidden rounded-[1.55rem] border border-white/[0.08] bg-black/[0.24]">
        <div className="relative min-h-48 flex-1 overflow-hidden">
          <Image
            src={listing.image}
            alt={listing.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover opacity-[0.74] transition duration-700 group-hover:scale-105 group-hover:opacity-90"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.68)_100%)]" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full border border-white/[0.14] bg-black/[0.36] px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.22em] text-zinc-200 uppercase backdrop-blur-xl">
              {listing.slug.split("-").slice(0, 3).join(" ")}
            </span>
            <span className="rounded-full border border-white/[0.14] bg-black/[0.36] px-3 py-1.5 text-xs text-zinc-200 backdrop-blur-xl">
              {cleanCategoryLabel(category)}
            </span>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6">
          <div>
            <div className="mb-3 flex items-center gap-1.5 text-xs text-zinc-500">
              <MapPin size={13} aria-hidden="true" />
              <span>{area}</span>
            </div>
            <h3 className="text-2xl font-semibold leading-tight text-white">
              <Link href={listing.href} className="transition hover:text-gold">
                {title}
              </Link>
            </h3>
          </div>

          <div className="grid gap-3 text-sm leading-6 text-zinc-400">
            <p>{highlights}</p>
            <p className="text-zinc-500">{shops}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href={listing.href}
              className="inline-flex min-h-11 items-center justify-between rounded-full border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              aria-label={`Open ${listing.n_en} guide`}
            >
              View guide
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${listing.q}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-between rounded-full border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.12] hover:text-white"
              aria-label={`Open ${listing.n_en} in Google Maps`}
            >
              Maps
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

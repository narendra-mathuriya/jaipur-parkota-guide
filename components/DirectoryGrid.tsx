"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import type { DirectoryCategory } from "@/src/data/directory";
import type { DirectoryListing } from "@/lib/directory";

type Language = "hi" | "en";

function cleanCategoryLabel(value: string) {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/ou/g, "u")
    .replace(/ph/g, "f")
    .replace(/sh/g, "s")
    .replace(/kh/g, "k")
    .replace(/bh/g, "b")
    .replace(/dh/g, "d")
    .replace(/th/g, "t")
    .replace(/ch/g, "c")
    .replace(/jh/g, "j")
    .replace(/w/g, "v")
    .replace(/aa/g, "a")
    .trim();
}

export function DirectoryGrid({
  listings,
  categories
}: {
  listings: DirectoryListing[];
  categories: DirectoryCategory[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [language, setLanguage] = useState<Language>("en");

  const indexed = useMemo(
    () =>
      listings.map((listing) => {
        const raw = [
          listing.id,
          listing.n,
          listing.n_en,
          listing.i,
          listing.i_en,
          listing.a,
          listing.a_en,
          listing.s,
          listing.s_en,
          listing.en
        ]
          .join(" ")
          .toLowerCase();

        return { ...listing, raw, normalized: normalize(raw) };
      }),
    [listings]
  );

  const visible = useMemo(() => {
    const rawTokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const normalizedTokens = normalize(query).split(/\s+/).filter(Boolean);

    return indexed.filter((listing) => {
      if (category !== "all" && !listing.cats.includes(category)) {
        return false;
      }

      return rawTokens.every((token, index) => {
        const normalizedToken = normalizedTokens[index] || token;
        return (
          listing.raw.includes(token) ||
          listing.normalized.includes(normalizedToken)
        );
      });
    });
  }, [category, indexed, query]);

  return (
    <section
      id="explore"
      className="relative mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8"
      aria-labelledby="directory-heading"
    >
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.34em] text-gold uppercase">
            Curated index
          </p>
          <h2
            id="directory-heading"
            className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-6xl"
          >
            {visible.length} places, arranged for slower discovery.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-zinc-400">
          Heritage streets, contemporary retail, pilgrim routes, and food
          institutions held in one quiet index.
        </p>
      </div>

      <div className="sticky top-[5.75rem] z-40 -mx-1 mb-8 rounded-[2rem] bg-obsidian/92 p-1 shadow-[0_20px_70px_rgba(0,0,0,0.72)] backdrop-blur-2xl sm:top-24">
        <div className="glass-panel-strong grid gap-3 rounded-[1.75rem] bg-[#0b0b0c]/92 p-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search jewellery, kachori, gurudwara, parks..."
              className="min-h-12 w-full rounded-full border border-white/10 bg-black/[0.24] py-3 pl-12 pr-12 text-sm text-white placeholder:text-zinc-600 transition focus:border-white/[0.24] focus:bg-black/[0.36] focus:outline-none"
              aria-label="Search Jaipur directory"
            />
            {query ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 grid min-h-10 min-w-10 -translate-y-1/2 place-items-center rounded-full text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="flex min-h-12 items-center rounded-full border border-white/10 bg-black/[0.24] p-1">
            {(["en", "hi"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLanguage(item)}
                aria-pressed={language === item}
                className={`min-h-10 rounded-full px-4 font-mono text-xs tracking-[0.18em] uppercase transition ${
                  language === item
                    ? "bg-[#f4f4f5] !text-[#050506]"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            aria-pressed={category === item.id}
            className={`min-h-11 shrink-0 rounded-full border px-4 py-3 text-sm transition ${
              category === item.id
                ? "border-white bg-[#f4f4f5] !text-[#050506]"
                : "border-white/10 bg-white/[0.045] text-zinc-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {cleanCategoryLabel(language === "hi" ? item.hi : item.en)}
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="directory-bento grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              language={language}
              priority={index < 3}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[2rem] p-10 text-center text-zinc-400">
          No matching places found.
        </div>
      )}
    </section>
  );
}

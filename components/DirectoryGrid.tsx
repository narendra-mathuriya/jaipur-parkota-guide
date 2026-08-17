"use client";

import {
  Baby,
  Car,
  Castle,
  ChevronDown,
  Coffee,
  Diamond,
  Gem,
  Grid3X3,
  Landmark,
  Languages,
  MapPinned,
  Palette,
  Search,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Soup,
  Trees,
  Utensils,
  X,
  type LucideIcon
} from "lucide-react";
import { useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import type { DirectoryCategory } from "@/src/data/directory";
import type { DirectoryListing } from "@/lib/directory";

type Language = "hi" | "en";
type CategoryCounts = Record<string, number>;

const categoryIcons: Record<string, LucideIcon> = {
  all: Grid3X3,
  upcoming: MapPinned,
  mall: ShoppingBag,
  toddler: Baby,
  parks: Trees,
  temple: Landmark,
  outskirts: Car,
  cafe: Coffee,
  streetfood: Utensils,
  food: Soup,
  sightseeing: Castle,
  wedding: Gem,
  textiles: Shirt,
  jewelry: Diamond,
  crafts: Palette,
  general: SlidersHorizontal
};

function cleanCategoryLabel(value: string) {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function categoryLabel(category: DirectoryCategory, language: Language) {
  return cleanCategoryLabel(language === "hi" ? category.hi : category.en);
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

  const categoryCounts = useMemo<CategoryCounts>(() => {
    return categories.reduce<CategoryCounts>((counts, item) => {
      counts[item.id] =
        item.id === "all"
          ? listings.length
          : listings.filter((listing) => listing.cats.includes(item.id)).length;

      return counts;
    }, {});
  }, [categories, listings]);

  const activeCategory =
    categories.find((item) => item.id === category) ?? categories[0];
  const ActiveIcon = categoryIcons[activeCategory?.id ?? "all"] ?? Grid3X3;

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

  const hasFilters = query.trim().length > 0 || category !== "all";

  function clearFilters() {
    setQuery("");
    setCategory("all");
  }

  return (
    <section
      id="explore"
      className="relative mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8"
      aria-labelledby="directory-heading"
    >
      <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.28em] text-gold uppercase">
            Search the index
          </p>
          <h2
            id="directory-heading"
            className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl"
          >
            Find the right lane fast.
          </h2>
        </div>
        <div className="grid gap-3 rounded-lg border border-white/[0.08] bg-white/[0.035] p-4 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-zinc-500 uppercase">
              Results
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {visible.length}
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-zinc-500 uppercase">
              Total
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {listings.length}
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-zinc-500 uppercase">
              Tag
            </p>
            <p className="mt-2 truncate text-sm font-medium text-zinc-200">
              {categoryLabel(activeCategory, language)}
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-[4.75rem] z-40 -mx-4 mb-6 border-y border-white/[0.08] bg-[#050506]/88 px-4 py-3 shadow-[0_22px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem_auto] lg:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search places, areas, food, temples, malls..."
              className="min-h-12 w-full rounded-lg border border-white/[0.1] bg-white/[0.045] py-3 pl-10 pr-11 text-sm text-white placeholder:text-zinc-600 transition focus:border-white/[0.26] focus:bg-white/[0.075] focus:outline-none"
              aria-label="Search Jaipur directory"
            />
            {query ? (
              <button
                type="button"
                className="absolute right-1 top-1/2 grid min-h-10 min-w-10 -translate-y-1/2 place-items-center rounded-md text-zinc-500 transition hover:bg-white/[0.08] hover:text-white"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="relative">
            <label htmlFor="category-filter" className="sr-only">
              Filter by tag
            </label>
            <SlidersHorizontal
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={17}
              aria-hidden="true"
            />
            <select
              id="category-filter"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-12 w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.045] py-3 pl-10 pr-10 text-sm text-white transition focus:border-white/[0.26] focus:bg-white/[0.075] focus:outline-none"
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id} className="bg-[#050506]">
                  {categoryLabel(item, language)} ({categoryCounts[item.id] ?? 0})
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={17}
              aria-hidden="true"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2 lg:flex lg:items-center">
            <div className="flex min-h-12 items-center rounded-lg border border-white/[0.1] bg-white/[0.045] p-1">
              <Languages
                className="mx-2 hidden text-zinc-500 sm:block"
                size={16}
                aria-hidden="true"
              />
              {(["en", "hi"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  aria-pressed={language === item}
                  className={`min-h-10 flex-1 rounded-md px-3 font-mono text-xs tracking-[0.16em] uppercase transition lg:flex-none ${
                    language === item
                      ? "bg-white !text-[#050506]"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.045] px-3 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <X size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="inline-flex min-w-0 items-center gap-2 text-sm text-zinc-400">
            <ActiveIcon size={16} aria-hidden="true" />
            <span className="truncate">
              {categoryLabel(activeCategory, language)}
            </span>
            <span className="shrink-0 text-zinc-600">
              {categoryCounts[activeCategory.id] ?? visible.length} indexed
            </span>
          </div>
          <p className="hidden text-sm text-zinc-500 sm:block">
            {visible.length} matching places
          </p>
        </div>

        <div className="directory-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => {
            const Icon = categoryIcons[item.id] ?? Grid3X3;
            const selected = category === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                aria-pressed={selected}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  selected
                    ? "border-white bg-white !text-[#050506]"
                    : "border-white/[0.1] bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{categoryLabel(item, language)}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[0.68rem] ${
                    selected
                      ? "bg-black/[0.08] text-[#050506]"
                      : "bg-white/[0.06] text-zinc-500"
                  }`}
                >
                  {categoryCounts[item.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
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
        <div className="rounded-lg border border-white/[0.1] bg-white/[0.035] p-10 text-center">
          <p className="text-lg font-semibold text-white">
            No matching places found.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
            Try a shorter search or switch to another tag.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold !text-[#050506] transition hover:bg-zinc-200"
          >
            Reset search
          </button>
        </div>
      )}
    </section>
  );
}

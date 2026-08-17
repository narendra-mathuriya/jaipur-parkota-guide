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
  List,
  Map as MapIcon,
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
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import type { DirectoryCategory } from "@/src/data/directory";
import type { DirectoryListing } from "@/lib/directory";

type Language = "hi" | "en";
type DirectoryView = "cards" | "map";
type CategoryCounts = Record<string, number>;
type DirectoryIndexResponse = {
  listings: DirectoryListing[];
};

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

function buildMapSearchUrl(value: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
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
  initialListings,
  categories,
  categoryCounts,
  totalCount,
  initialPageSize
}: {
  initialListings: DirectoryListing[];
  categories: DirectoryCategory[];
  categoryCounts: CategoryCounts;
  totalCount: number;
  initialPageSize: number;
}) {
  const [listings, setListings] = useState(initialListings);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [language, setLanguage] = useState<Language>("en");
  const [view, setView] = useState<DirectoryView>("cards");
  const [urlStateReady, setUrlStateReady] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(initialPageSize);
  const [fullIndexLoaded, setFullIndexLoaded] = useState(
    initialListings.length >= totalCount
  );
  const deferredQuery = useDeferredValue(query);

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

  useEffect(() => {
    if (fullIndexLoaded) {
      return;
    }

    const controller = new AbortController();

    fetch("/directory-index.json", {
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Directory index request failed");
        }

        return response.json() as Promise<DirectoryIndexResponse>;
      })
      .then((payload) => {
        if (!Array.isArray(payload.listings) || !payload.listings.length) {
          throw new Error("Directory index is empty");
        }

        setListings(payload.listings);
        setFullIndexLoaded(true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      });

    return () => controller.abort();
  }, [fullIndexLoaded]);

  const visible = useMemo(() => {
    const rawTokens = deferredQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const normalizedTokens = normalize(deferredQuery).split(/\s+/).filter(Boolean);

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
  }, [category, deferredQuery, indexed]);

  const visibleTotal =
    fullIndexLoaded || deferredQuery.trim()
      ? visible.length
      : (categoryCounts[category] ?? visible.length);
  const visibleCards = view === "cards" ? visible.slice(0, displayLimit) : [];
  const canShowMoreCards =
    view === "cards" && fullIndexLoaded && visibleCards.length < visible.length;

  const areaGroups = useMemo(() => {
    const groups = new Map<string, DirectoryListing[]>();

    visible.forEach((listing) => {
      const area = language === "hi" ? listing.a : listing.a_en;
      const group = groups.get(area) ?? [];
      group.push(listing);
      groups.set(area, group);
    });

    return Array.from(groups.entries()).slice(0, 12);
  }, [language, visible]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextQuery = params.get("q") ?? "";
    const nextCategory = params.get("tag") ?? "all";
    const nextLanguage = params.get("lang");
    const nextView = params.get("view");
    const categoryIds = new Set(categories.map((item) => item.id));

    queueMicrotask(() => {
      setQuery(nextQuery);
      setCategory(categoryIds.has(nextCategory) ? nextCategory : "all");
      setLanguage(nextLanguage === "hi" ? "hi" : "en");
      setView(nextView === "map" ? "map" : "cards");
      setDisplayLimit(initialPageSize);
      setUrlStateReady(true);
    });
  }, [categories, initialPageSize]);

  useEffect(() => {
    if (!urlStateReady) {
      return;
    }

    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }

    if (category !== "all") {
      params.set("tag", category);
    }

    if (language !== "en") {
      params.set("lang", language);
    }

    if (view !== "cards") {
      params.set("view", view);
    }

    const nextUrl = `${window.location.pathname}${
      params.size ? `?${params.toString()}` : ""
    }${window.location.hash}`;

    window.history.replaceState(null, "", nextUrl);
  }, [category, language, query, urlStateReady, view]);

  const hasFilters =
    query.trim().length > 0 ||
    category !== "all" ||
    language !== "en" ||
    view !== "cards";

  const visibleMapUrl = buildMapSearchUrl(
    category === "all"
      ? `Jaipur ${query || "places to visit"}`
      : `${categoryLabel(activeCategory, language)} Jaipur ${query}`
  );

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setLanguage("en");
    setView("cards");
    setDisplayLimit(initialPageSize);
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
              {visibleTotal}
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-zinc-500 uppercase">
              Total
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {totalCount}
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-zinc-500 uppercase">
              View
            </p>
            <p className="mt-2 truncate text-sm font-medium text-zinc-200">
              {view === "cards" ? "Cards" : "Map"}
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-[4.75rem] z-40 -mx-4 mb-6 border-y border-white/[0.08] bg-[#050506]/88 px-4 py-3 shadow-[0_22px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem_auto_auto] lg:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setDisplayLimit(initialPageSize);
              }}
              type="search"
              placeholder="Search places, areas, food, temples, malls..."
              className="min-h-12 w-full rounded-lg border border-white/[0.1] bg-white/[0.045] py-3 pl-10 pr-11 text-sm text-white placeholder:text-zinc-600 transition focus:border-white/[0.26] focus:bg-white/[0.075] focus:outline-none"
              aria-label="Search Jaipur directory"
            />
            {query ? (
              <button
                type="button"
                className="absolute right-1 top-1/2 grid min-h-10 min-w-10 -translate-y-1/2 place-items-center rounded-md text-zinc-500 transition hover:bg-white/[0.08] hover:text-white"
                onClick={() => {
                  setQuery("");
                  setDisplayLimit(initialPageSize);
                }}
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
              onChange={(event) => {
                setCategory(event.target.value);
                setDisplayLimit(initialPageSize);
              }}
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

          <div className="flex min-h-12 items-center rounded-lg border border-white/[0.1] bg-white/[0.045] p-1">
            {([
              ["cards", List, "Cards"],
              ["map", MapIcon, "Map"]
            ] as const).map(([item, Icon, label]) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setView(item);
                  setDisplayLimit(initialPageSize);
                }}
                aria-pressed={view === item}
                className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm transition lg:flex-none ${
                  view === item
                    ? "bg-white !text-[#050506]"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
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
              {categoryCounts[activeCategory.id] ?? visibleTotal} indexed
            </span>
          </div>
          <p className="hidden text-sm text-zinc-500 sm:block">
            {visibleTotal} matching places
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
                onClick={() => {
                  setCategory(item.id);
                  setDisplayLimit(initialPageSize);
                }}
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

      {visible.length > 0 && view === "cards" ? (
        <>
          <div className="directory-bento grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleCards.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                language={language}
              />
            ))}
          </div>
          {canShowMoreCards ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setDisplayLimit((current) => current + initialPageSize)
                }
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.06] px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.12] hover:text-white"
              >
                Show more places
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {visible.length > 0 && view === "map" ? (
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="rounded-lg border border-white/[0.1] bg-white/[0.035] p-5">
            <p className="font-mono text-xs tracking-[0.24em] text-gold uppercase">
              Map search
            </p>
            <h3 className="mt-4 text-3xl font-semibold text-white">
              Open this set in maps.
            </h3>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Google Maps opens best around one place or theme. Use the full
              set action for the current search, then refine from there.
            </p>
            <a
              href={visibleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold !text-[#050506] transition hover:bg-zinc-200"
            >
              <MapPinned size={16} aria-hidden="true" />
              Open current set
            </a>
          </section>

          <section className="grid gap-3">
            {areaGroups.map(([area, group]) => (
              <article
                key={area}
                className="rounded-lg border border-white/[0.1] bg-white/[0.035] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-white">
                      {area}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {group.length} matching places
                    </p>
                  </div>
                  <a
                    href={buildMapSearchUrl(`${area} Jaipur`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] px-3 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Area map
                  </a>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {group.slice(0, 6).map((listing) => {
                    const title = language === "hi" ? listing.n : listing.n_en;

                    return (
                      <a
                        key={listing.id}
                        href={buildMapSearchUrl(
                          `${listing.n_en} ${listing.a_en} Jaipur`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-between gap-3 rounded-lg bg-black/[0.18] px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <span className="truncate">{title}</span>
                        <MapPinned
                          className="shrink-0"
                          size={15}
                          aria-hidden="true"
                        />
                      </a>
                    );
                  })}
                </div>
              </article>
            ))}
          </section>
        </div>
      ) : null}

      {!visible.length ? (
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
      ) : null}
    </section>
  );
}

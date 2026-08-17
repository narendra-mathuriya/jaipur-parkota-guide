"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { ListingCard } from "@/components/ListingCard";
import { assetPath } from "@/lib/paths";
import type { DirectoryCategory } from "@/src/data/directory";
import type { DirectoryListing } from "@/lib/directory";

type Language = "hi" | "en";
type DirectoryView = "cards" | "map";
type CategoryCounts = Record<string, number>;
type DirectoryIndexResponse = {
  listings: DirectoryListing[];
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
  const fullIndexRequest = useRef<Promise<void> | null>(null);
  const deferredQuery = useDeferredValue(query);

  const activeCategory =
    categories.find((item) => item.id === category) ?? categories[0];

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

  const loadFullIndex = useCallback(() => {
    if (fullIndexLoaded) {
      return Promise.resolve();
    }

    if (fullIndexRequest.current) {
      return fullIndexRequest.current;
    }

    fullIndexRequest.current = fetch(assetPath("/directory-index.json"), {
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
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error(error);
        }
      })
      .finally(() => {
        fullIndexRequest.current = null;
      });

    return fullIndexRequest.current;
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
    view === "cards" &&
    (fullIndexLoaded
      ? visibleCards.length < visible.length
      : visibleCards.length < visibleTotal);

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

  useEffect(() => {
    if (!urlStateReady) {
      return;
    }

    if (query.trim() || category !== "all" || view === "map") {
      void loadFullIndex();
    }
  }, [category, loadFullIndex, query, urlStateReady, view]);

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
      className="relative mx-auto max-w-7xl px-3 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-10 lg:px-8"
      aria-labelledby="directory-heading"
    >
      <div className="mb-5 grid gap-4 sm:mb-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.28em] text-gold uppercase">
            Search the index
          </p>
          <h2
            id="directory-heading"
            className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white sm:mt-4 sm:text-6xl"
          >
            Find the right lane fast.
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] p-3 sm:gap-3 sm:p-4">
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-zinc-500 uppercase">
              Results
            </p>
            <p className="mt-1 text-xl font-semibold text-white sm:mt-2 sm:text-2xl">
              {visibleTotal}
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-zinc-500 uppercase">
              Total
            </p>
            <p className="mt-1 text-xl font-semibold text-white sm:mt-2 sm:text-2xl">
              {totalCount}
            </p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-zinc-500 uppercase">
              View
            </p>
            <p className="mt-1 truncate text-xs font-medium text-zinc-200 sm:mt-2 sm:text-sm">
              {view === "cards" ? "Cards" : "Map"}
            </p>
          </div>
        </div>
      </div>

      <div className="z-40 -mx-3 mb-4 border-y border-white/[0.08] bg-[#050506]/88 px-3 py-2 shadow-[0_22px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:sticky sm:top-[4.75rem] sm:-mx-6 sm:mb-6 sm:px-6 sm:py-3 lg:-mx-8 lg:px-8">
        <div className="grid gap-2 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_18rem_auto_auto] lg:items-center">
          <div className="relative">
            <InlineIcon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={query}
              onFocus={() => void loadFullIndex()}
              onChange={(event) => {
                void loadFullIndex();
                setQuery(event.target.value);
                setDisplayLimit(initialPageSize);
              }}
              type="search"
              placeholder="Search places, areas, food, temples, malls..."
              className="min-h-11 w-full rounded-lg border border-white/[0.1] bg-white/[0.045] py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-zinc-600 focus:border-white/[0.26] focus:bg-white/[0.075] focus:outline-none sm:min-h-12 sm:py-3"
              aria-label="Search Jaipur directory"
            />
            {query ? (
              <button
                type="button"
                className="absolute right-1 top-1/2 grid min-h-10 min-w-10 -translate-y-1/2 place-items-center rounded-md text-zinc-500 hover:bg-white/[0.08] hover:text-white"
                onClick={() => {
                  setQuery("");
                  setDisplayLimit(initialPageSize);
                }}
                aria-label="Clear search"
              >
                <InlineIcon name="x" className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="relative">
            <label htmlFor="category-filter" className="sr-only">
              Filter by tag
            </label>
            <InlineIcon
              name="sliders"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <select
              id="category-filter"
              value={category}
              onFocus={() => void loadFullIndex()}
              onPointerDown={() => void loadFullIndex()}
              onChange={(event) => {
                void loadFullIndex();
                setCategory(event.target.value);
                setDisplayLimit(initialPageSize);
              }}
              className="min-h-12 w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.045] py-3 pl-10 pr-10 text-sm text-white focus:border-white/[0.26] focus:bg-white/[0.075] focus:outline-none"
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id} className="bg-[#050506]">
                  {categoryLabel(item, language)} ({categoryCounts[item.id] ?? 0})
                </option>
              ))}
            </select>
            <InlineIcon
              name="chevron"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2 lg:flex lg:items-center">
            <div className="flex min-h-11 items-center rounded-lg border border-white/[0.1] bg-white/[0.045] p-1 sm:min-h-12">
              <InlineIcon
                name="language"
                className="mx-2 hidden text-zinc-500 sm:block"
              />
              {(["en", "hi"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  aria-pressed={language === item}
                  className={`min-h-10 flex-1 rounded-md px-3 font-mono text-xs tracking-[0.16em] uppercase lg:flex-none ${
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
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.045] px-3 text-sm font-medium text-zinc-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <InlineIcon name="x" className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>

          <div className="flex min-h-11 items-center rounded-lg border border-white/[0.1] bg-white/[0.045] p-1 sm:min-h-12">
            {([
              ["cards", "list", "Cards"],
              ["map", "map", "Map"]
            ] as const).map(([item, icon, label]) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  void loadFullIndex();
                  setView(item);
                  setDisplayLimit(initialPageSize);
                }}
                aria-pressed={view === item}
                className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm lg:flex-none ${
                  view === item
                    ? "bg-white !text-[#050506]"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <InlineIcon name={icon} className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="inline-flex min-w-0 items-center gap-2 text-sm text-zinc-400">
            <CategoryDot categoryId={activeCategory.id} selected={false} />
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

        <div className="directory-scrollbar flex gap-1.5 overflow-x-auto pb-2 sm:gap-2">
          {categories.map((item) => {
            const selected = category === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  void loadFullIndex();
                  setCategory(item.id);
                  setDisplayLimit(initialPageSize);
                }}
                aria-pressed={selected}
                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs sm:min-h-11 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${
                  selected
                    ? "border-white bg-white !text-[#050506]"
                    : "border-white/[0.1] bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  }`}
              >
                <CategoryDot categoryId={item.id} selected={selected} />
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
          <div className="directory-bento grid grid-cols-1 gap-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleCards.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                language={language}
              />
            ))}
          </div>
          {canShowMoreCards ? (
            <div className="mt-5 flex justify-center sm:mt-8">
              <button
                type="button"
                onClick={() =>
                  void loadFullIndex().then(() => {
                    setDisplayLimit((current) => current + initialPageSize);
                  })
                }
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.06] px-5 py-3 text-sm font-medium text-zinc-200 hover:border-white/20 hover:bg-white/[0.12] hover:text-white"
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
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold !text-[#050506] hover:bg-zinc-200"
            >
              <InlineIcon name="pin" className="h-4 w-4" />
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
                    className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] px-3 text-sm text-zinc-300 hover:bg-white/[0.08] hover:text-white"
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
                        className="inline-flex min-h-11 items-center justify-between gap-3 rounded-lg bg-black/[0.18] px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      >
                        <span className="truncate">{title}</span>
                        <InlineIcon
                          name="pin"
                          className="h-4 w-4 shrink-0"
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
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold !text-[#050506] hover:bg-zinc-200"
          >
            Reset search
          </button>
        </div>
      ) : null}
    </section>
  );
}

type InlineIconName =
  | "chevron"
  | "language"
  | "list"
  | "map"
  | "pin"
  | "search"
  | "sliders"
  | "x";

function InlineIcon({
  name,
  className
}: {
  name: InlineIconName;
  className: string;
}) {
  const paths: Record<InlineIconName, string[]> = {
    chevron: ["M6 9l6 6 6-6"],
    language: ["M4 5h10", "M7 2h1", "M5 8l6 6", "M4 14l6-6 2-3", "M14 18h6", "M22 22l-5-10-5 10"],
    list: ["M8 6h12", "M8 12h12", "M8 18h12", "M4 6h.01", "M4 12h.01", "M4 18h.01"],
    map: ["M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z", "M9 4v14", "M15 6v14"],
    pin: ["M18 8c0 3.6-3.9 7.4-5.4 8.8a1 1 0 0 1-1.2 0C9.9 15.4 6 11.6 6 8a6 6 0 1 1 12 0Z", "M12 8h.01"],
    search: ["M21 21l-4.3-4.3", "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"],
    sliders: ["M3 6h8", "M15 6h6", "M3 18h12", "M19 18h2", "M13 4v4", "M17 16v4"],
    x: ["M18 6 6 18", "M6 6l12 12"]
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}

function CategoryDot({
  categoryId,
  selected
}: {
  categoryId: string;
  selected: boolean;
}) {
  const tone =
    categoryId === "all"
      ? "bg-zinc-300"
      : categoryId === "jewelry" || categoryId === "wedding"
        ? "bg-sky-300"
        : categoryId === "parks" || categoryId === "outskirts"
          ? "bg-emerald-300"
          : categoryId === "food" || categoryId === "streetfood" || categoryId === "cafe"
            ? "bg-amber-300"
            : "bg-gold";

  return (
    <span
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone} ${
        selected ? "ring-2 ring-black/20" : ""
      }`}
      aria-hidden="true"
    />
  );
}

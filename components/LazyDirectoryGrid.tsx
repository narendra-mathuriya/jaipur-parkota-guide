"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/paths";
import type { DirectoryCategory } from "@/src/data/directory";
import type { DirectoryListing } from "@/lib/directory";

const DirectoryGrid = lazy(() =>
  import("@/components/DirectoryGrid").then((module) => ({
    default: module.DirectoryGrid
  }))
);

type CategoryCounts = Record<string, number>;
type DirectoryIndexResponse = {
  listings: DirectoryListing[];
};

export function LazyDirectoryGrid({
  categories,
  categoryCounts,
  totalCount,
  initialPageSize
}: {
  categories: DirectoryCategory[];
  categoryCounts: CategoryCounts;
  totalCount: number;
  initialPageSize: number;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [listings, setListings] = useState<DirectoryListing[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || shouldLoad) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "900px 0px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad || listings) {
      return;
    }

    void import("@/components/DirectoryGrid");

    fetch(assetPath("/directory-index.json"), {
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
      })
      .catch((error: unknown) => {
        console.error(error);
        setLoadFailed(true);
      });
  }, [listings, shouldLoad]);

  if (listings) {
    return (
      <Suspense
        fallback={
          <DirectoryPlaceholder
            containerRef={containerRef}
            totalCount={totalCount}
            categoryCounts={categoryCounts}
            categories={categories}
            loadFailed={false}
          />
        }
      >
        <DirectoryGrid
          initialListings={listings}
          categories={categories}
          categoryCounts={categoryCounts}
          totalCount={totalCount}
          initialPageSize={initialPageSize}
        />
      </Suspense>
    );
  }

  return (
    <DirectoryPlaceholder
      containerRef={containerRef}
      totalCount={totalCount}
      categoryCounts={categoryCounts}
      categories={categories}
      loadFailed={loadFailed}
    />
  );
}

function DirectoryPlaceholder({
  containerRef,
  totalCount,
  categoryCounts,
  categories,
  loadFailed
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  totalCount: number;
  categoryCounts: CategoryCounts;
  categories: DirectoryCategory[];
  loadFailed: boolean;
}) {
  const previewCategories = categories.slice(0, 8);

  return (
    <section
      id="explore"
      ref={containerRef}
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
              {totalCount}
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
              Cards
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-8">
        <div className="directory-scrollbar flex gap-1.5 overflow-x-auto pb-2 sm:gap-2">
          {previewCategories.map((category) => (
            <span
              key={category.id}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.035] px-2.5 py-1.5 text-xs text-zinc-400 sm:min-h-11 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              <CategoryDot categoryId={category.id} />
              <span>{cleanCategoryLabel(category.en)}</span>
              <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.68rem] text-zinc-500">
                {categoryCounts[category.id] ?? 0}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="directory-bento grid grid-cols-1 gap-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="card-compact rounded-xl border border-white/10 bg-white/[0.045] p-1.5 sm:rounded-[2rem] sm:p-2"
            aria-hidden="true"
          >
            <div className="grid min-h-[5.75rem] grid-cols-[4.75rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-white/[0.08] bg-black/[0.24] sm:flex sm:h-full sm:min-h-[24rem] sm:flex-col sm:rounded-[1.55rem]">
              <div className="bg-white/[0.07] sm:min-h-48 sm:flex-1" />
              <div className="grid content-center gap-2 p-2.5 pr-12 sm:content-between sm:gap-5 sm:p-6">
                <div>
                  <div className="h-3 w-24 rounded-full bg-white/[0.08]" />
                  <div className="mt-3 h-5 w-3/4 rounded-full bg-white/[0.1]" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-white/[0.07]" />
                  <div className="h-3 w-2/3 rounded-full bg-white/[0.06]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loadFailed ? (
        <p className="mt-5 text-center text-sm text-zinc-500">
          Directory data is temporarily unavailable.
        </p>
      ) : null}
    </section>
  );
}

function cleanCategoryLabel(value: string) {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function CategoryDot({ categoryId }: { categoryId: string }) {
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
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone}`}
      aria-hidden="true"
    />
  );
}

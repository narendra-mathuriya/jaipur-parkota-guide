import { ArrowUpRight, MapPin } from "lucide-react";
import type { DirectoryListing } from "@/lib/directory";

type Language = "hi" | "en";

function cleanCategoryLabel(value: string) {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function responsiveListingBase(image: string) {
  return image
    .replace("/images/listings/", "/images/listings/responsive/")
    .replace(/\.avif$/, "");
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
  const imageBase = responsiveListingBase(listing.image);

  const heightClass =
    listing.layout === "tall"
      ? "card-tall"
      : listing.layout === "medium"
        ? "card-medium"
        : "card-compact";

  return (
    <article
      id={listing.slug}
      className={`group relative isolate overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] p-1.5 shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 active:scale-[0.99] sm:rounded-[2rem] sm:p-2 sm:shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:backdrop-blur-3xl sm:hover:-translate-y-1 sm:hover:border-white/20 ${heightClass}`}
    >
      <div className="cursor-halo pointer-events-none absolute inset-0 z-0 hidden opacity-0 transition duration-500 group-hover:opacity-100 sm:block" />
      <div className="relative z-10 grid min-h-[5.75rem] grid-cols-[4.75rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-white/[0.08] bg-black/[0.24] sm:flex sm:h-full sm:min-h-[24rem] sm:flex-col sm:rounded-[1.55rem]">
        <div className="relative min-h-full overflow-hidden sm:min-h-48 sm:flex-1">
          <picture>
            <source
              srcSet={`${imageBase}-480.avif 480w, ${imageBase}-720.avif 720w`}
              sizes="(min-width: 1280px) 390px, (min-width: 768px) 50vw, 76px"
            />
            <img
              src={`${imageBase}-480.avif`}
              alt={listing.imageAlt}
              width={480}
              height={360}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-[0.74] transition duration-700 group-hover:scale-105 group-hover:opacity-90"
            />
          </picture>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.46)_100%)] sm:bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.68)_100%)]" />
          <div className="absolute left-4 top-4 hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-white/[0.14] bg-black/[0.36] px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.22em] text-zinc-200 uppercase backdrop-blur-xl">
              {listing.slug.split("-").slice(0, 3).join(" ")}
            </span>
            <span className="rounded-full border border-white/[0.14] bg-black/[0.36] px-3 py-1.5 text-xs text-zinc-200 backdrop-blur-xl">
              {cleanCategoryLabel(category)}
            </span>
          </div>
        </div>

        <div className="grid min-w-0 content-center gap-1.5 p-2.5 pr-12 sm:content-between sm:gap-5 sm:p-6">
          <div className="min-w-0">
            <div className="mb-1 flex min-w-0 items-center gap-1 text-[0.68rem] text-zinc-500 sm:mb-3 sm:gap-1.5 sm:text-xs">
              <MapPin size={12} aria-hidden="true" />
              <span className="truncate">{area}</span>
            </div>
            <h3 className="truncate text-[0.98rem] font-semibold leading-tight text-white sm:whitespace-normal sm:text-2xl">
              <a href={listing.href} className="transition hover:text-gold">
                {title}
              </a>
            </h3>
            <div className="mt-1 flex items-center gap-2 sm:hidden">
              <span className="max-w-full truncate rounded-md border border-white/[0.1] bg-white/[0.055] px-2 py-1 text-[0.68rem] text-zinc-300">
                {cleanCategoryLabel(category)}
              </span>
            </div>
          </div>

          <div className="min-w-0 text-[0.74rem] leading-4 text-zinc-400 sm:grid sm:gap-3 sm:text-sm sm:leading-6">
            <p className="line-clamp-1 sm:line-clamp-none">{highlights}</p>
            <p className="hidden text-zinc-500 sm:block">{shops}</p>
          </div>

          <div className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1 sm:static sm:grid sm:translate-y-0 sm:grid-cols-2 sm:gap-2">
            <a
              href={listing.href}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#f4f4f5] text-xs font-semibold !text-[#050506] transition hover:bg-zinc-200 sm:h-auto sm:min-h-11 sm:w-auto sm:justify-between sm:gap-1.5 sm:rounded-full sm:px-4 sm:py-3 sm:text-sm [&_svg]:!text-[#050506]"
              aria-label={`Open ${listing.n_en} guide`}
            >
              <span className="sr-only sm:not-sr-only">Guide</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${listing.q}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.055] text-xs font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.12] hover:text-white sm:h-auto sm:min-h-11 sm:w-auto sm:justify-between sm:gap-1.5 sm:rounded-full sm:px-4 sm:py-3 sm:text-sm"
              aria-label={`Open ${listing.n_en} in Google Maps`}
            >
              <span className="sr-only sm:not-sr-only">Maps</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

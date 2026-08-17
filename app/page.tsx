import { Suspense } from "react";
import { DirectoryGrid } from "@/components/DirectoryGrid";
import { ScrollHero } from "@/components/ScrollHero";
import {
  getDirectoryCategories,
  getDirectoryListings,
  getFeaturedListings
} from "@/lib/directory";
import { buildStructuredData } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildStructuredData()).replace(/</g, "\\u003c")
        }}
      />
      <main>
        <Suspense fallback={<HeroFallback />}>
          <HeroEngine />
        </Suspense>
        <Suspense fallback={<DirectoryFallback />}>
          <DirectoryEngine />
        </Suspense>
        <EditorialSections />
      </main>
    </>
  );
}

async function HeroEngine() {
  const [featured, listings] = await Promise.all([
    getFeaturedListings(),
    getDirectoryListings()
  ]);

  return <ScrollHero totalCount={listings.length} featured={featured} />;
}

async function DirectoryEngine() {
  const [listings, directoryCategories] = await Promise.all([
    getDirectoryListings(),
    getDirectoryCategories()
  ]);

  return <DirectoryGrid listings={listings} categories={directoryCategories} />;
}

function HeroFallback() {
  return (
    <section className="hero-track relative">
      <div className="sticky top-0 flex min-h-dvh items-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="h-5 w-48 rounded-full bg-white/10" />
          <div className="mt-8 h-24 max-w-3xl rounded-3xl bg-white/10 sm:h-36" />
          <div className="mt-6 h-20 max-w-xl rounded-3xl bg-white/[0.08]" />
        </div>
      </div>
    </section>
  );
}

function DirectoryFallback() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="glass-panel min-h-96 rounded-[2rem] p-4"
          />
        ))}
      </div>
    </section>
  );
}

function EditorialSections() {
  return (
    <>
      <section
        id="editorial"
        className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8"
        aria-labelledby="editorial-heading"
      >
        <div className="lg:col-span-1">
          <p className="font-mono text-xs tracking-[0.34em] text-gold uppercase">
            Field notes
          </p>
          <h2
            id="editorial-heading"
            className="mt-4 text-4xl font-semibold text-white sm:text-5xl"
          >
            Calm routes through a dense city.
          </h2>
        </div>
        {[
          [
            "Walled City",
            "Gem lanes, textile katlas, bronze workshops, and old food counters remain grouped by walking geography."
          ],
          [
            "Outer Arc",
            "Parks, lakes, pilgrim drives, and hill routes sit beside the older bazaar index without visual noise."
          ]
        ].map(([title, copy]) => (
          <article className="glass-panel rounded-[2rem] p-7" key={title}>
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">{copy}</p>
          </article>
        ))}
      </section>

      <section
        id="faq"
        className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8"
        aria-labelledby="faq-heading"
      >
        <div className="glass-panel-strong rounded-[2rem] p-7 sm:p-10">
          <p className="font-mono text-xs tracking-[0.34em] text-gold uppercase">
            Essentials
          </p>
          <h2
            id="faq-heading"
            className="mt-4 text-4xl font-semibold text-white sm:text-5xl"
          >
            Before you go.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [
                "Best hours",
                "Most artisan lanes open late morning and stay active into early evening."
              ],
              [
                "Family routes",
                "City Park, Central Park, Smriti Van, and select gardens work best for stroller-first plans."
              ],
              [
                "Purchase checks",
                "Use hallmark testing for bullion and certified jewellers for gemstone purchases."
              ]
            ].map(([title, copy]) => (
              <article
                className="rounded-3xl border border-white/10 bg-black/[0.22] p-5"
                key={title}
              >
                <h3 className="font-medium text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

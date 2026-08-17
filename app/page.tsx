import { LazyDirectoryGrid } from "@/components/LazyDirectoryGrid";
import { ScrollHero } from "@/components/ScrollHero";
import {
  getDirectoryCategories,
  getCategoryCounts,
  getDirectoryListings,
  getFeaturedListings,
  initialDirectoryLimit
} from "@/lib/directory";
import { buildStructuredData } from "@/lib/seo";

export default async function HomePage() {
  const [featured, listings, directoryCategories] = await Promise.all([
    getFeaturedListings(),
    getDirectoryListings(),
    getDirectoryCategories()
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildStructuredData()).replace(/</g, "\\u003c")
        }}
      />
      <main id="main-content" tabIndex={-1}>
        <ScrollHero totalCount={listings.length} featured={featured} />
        <LazyDirectoryGrid
          categories={directoryCategories}
          categoryCounts={getCategoryCounts(listings)}
          totalCount={listings.length}
          initialPageSize={initialDirectoryLimit}
        />
        <EditorialSections />
      </main>
    </>
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

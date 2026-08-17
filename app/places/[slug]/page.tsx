import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import {
  getDirectoryListingBySlug,
  getDirectoryListings,
  type DirectoryListing
} from "@/lib/directory";
import { siteName, siteUrl, socialImage } from "@/lib/seo";

type PlacePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const listings = await getDirectoryListings();
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({
  params
}: PlacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getDirectoryListingBySlug(slug);

  if (!listing) {
    return {};
  }

  const title = `${listing.n_en}, ${listing.a_en} | Jaipur Explorer`;
  const description = `${listing.n_en} in ${listing.a_en}, Jaipur: ${listing.i_en}. Notable references: ${listing.s_en}.`;
  const url = `${siteUrl}${listing.href}`;

  return {
    title,
    description,
    alternates: {
      canonical: listing.href
    },
    openGraph: {
      type: "article",
      url,
      siteName,
      title,
      description,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 675,
          alt: listing.imageAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage]
    }
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const listing = await getDirectoryListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const structuredData = buildPlaceStructuredData(listing);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c")
        }}
      />
      <main className="relative px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-7xl" itemScope itemType="https://schema.org/Place">
          <Link
            href={`/#${listing.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.12] hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Directory
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <section className="glass-panel-strong overflow-hidden rounded-[2rem]">
              <div className="relative aspect-[4/5] min-h-[24rem] lg:sticky lg:top-28">
                <Image
                  src={listing.image}
                  alt={listing.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.76)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-mono text-xs tracking-[0.28em] text-gold uppercase">
                    {listing.slug}
                  </p>
                  <h1
                    className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-6xl"
                    itemProp="name"
                  >
                    {listing.n_en}
                  </h1>
                  <p className="mt-3 flex items-center gap-2 text-zinc-300" itemProp="address">
                    <MapPin size={17} aria-hidden="true" />
                    {listing.a_en}, Jaipur
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-5">
              <section className="glass-panel rounded-[2rem] p-7 sm:p-9">
                <p className="font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase">
                  Highlights
                </p>
                <p className="mt-5 text-2xl leading-9 text-white" itemProp="description">
                  {listing.i_en}
                </p>
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                <div className="glass-panel rounded-[2rem] p-7">
                  <h2 className="text-xl font-semibold text-white">Known for</h2>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {listing.s_en}
                  </p>
                </div>
                <div className="glass-panel rounded-[2rem] p-7">
                  <h2 className="text-xl font-semibold text-white">Category</h2>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {cleanCategoryLabel(listing.primaryCategory.en)}
                  </p>
                </div>
              </section>

              <section className="glass-panel rounded-[2rem] p-7 sm:p-9">
                <h2 className="text-2xl font-semibold text-white">
                  हिन्दी संदर्भ
                </h2>
                <p className="mt-5 text-lg leading-8 text-zinc-300">
                  {listing.n} में {listing.i}
                </p>
                <p className="mt-4 text-sm leading-7 text-zinc-500">
                  प्रमुख प्रतिष्ठान: {listing.s}
                </p>
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${listing.q}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-between rounded-full bg-[#f4f4f5] px-5 py-3 text-sm font-semibold !text-[#050506] transition hover:bg-zinc-200 [&_svg]:!text-[#050506]"
                >
                  Open Google Maps
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
                <Link
                  href={`/#${listing.slug}`}
                  className="inline-flex min-h-12 items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.12] hover:text-white"
                >
                  Back to directory card
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}

function cleanCategoryLabel(value: string) {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function buildPlaceStructuredData(listing: DirectoryListing) {
  const url = `${siteUrl}${listing.href}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": `${url}#place`,
        url,
        name: listing.n_en,
        alternateName: listing.n,
        description: listing.i_en,
        image: `${siteUrl}${socialImage}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: listing.a_en,
          addressLocality: "Jaipur",
          addressRegion: "Rajasthan",
          addressCountry: "IN"
        },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${listing.q}`,
        containedInPlace: {
          "@type": "TouristDestination",
          name: "Jaipur"
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Jaipur Explorer",
            item: `${siteUrl}/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: listing.n_en,
            item: url
          }
        ]
      }
    ]
  };
}

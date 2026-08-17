import type { Metadata } from "next";
import { assetPath, withBasePath } from "@/lib/paths";
import { i18n, totalSpotCount } from "@/src/data/directory";

export const siteUrl = "https://jaipur-explorer.netlify.app";
export const siteName = "Jaipur Explorer";
export const heroImage = "/images/jaipur-explorer-hero.avif";
export const socialImage = "/images/jaipur-explorer-og.jpg";

export const pageTitle =
  "Jaipur Explorer | Definitive Jaipur Travel Guide & Heritage Directory";

export const pageDescription =
  "Explore Jaipur with a curated directory of 145+ artisan alleys, historic bazaars, street food legends, temples, gurudwaras, modern malls, and day-trip getaways with direct GPS navigation.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDescription,
  manifest: withBasePath("/manifest.webmanifest"),
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "travel",
  keywords: [
    "explorer jaipur",
    "jaipur travel guide",
    "places to visit in jaipur",
    "jaipur heritage directory",
    "johari bazar shopping",
    "walled city jaipur",
    "jaipur street food",
    "khatu shyam ji",
    "kishan bagh",
    "city park jaipur"
  ],
  alternates: {
    canonical: "/",
    languages: {
      hi: "/",
      en: "/",
      "x-default": "/"
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: "Jaipur Explorer | Curated Heritage, Food & Travel Directory",
    description:
      "Discover 145+ authentic spots in Jaipur: Walled City karigars, street food gems, ancient temples, and new modern hubs with GPS coordinates.",
    locale: "hi_IN",
    alternateLocale: ["en_US"],
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 675,
        alt: "Jaipur walled city heritage bazaar viewed through pink sandstone arches"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaipur Explorer | Jaipur Travel & Heritage Directory",
    description:
      "Curated index of 145+ iconic places in Jaipur. Plan cultural, culinary, shopping, temple, and day-trip exploration.",
    images: [socialImage]
  },
  icons: {
    icon: [
      { url: assetPath("/favicon.ico"), sizes: "any" },
      { url: assetPath("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
      { url: assetPath("/icons/icon-512.png"), sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: assetPath("/icons/apple-touch-icon.png"), sizes: "180x180", type: "image/png" }
    ]
  },
  verification: {
    google: "jezElDhf8zfqM_KLDydiOFy6WZ9CWjs9pfaD8DjWLjQ"
  }
};

export function buildStructuredData() {
  const faq = i18n.en;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: siteName,
        description: pageDescription,
        inLanguage: ["hi", "en"],
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/#explore?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: `${siteUrl}/`,
        logo: `${siteUrl}${socialImage}`,
        sameAs: []
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/#collection`,
        url: `${siteUrl}/`,
        name: pageTitle,
        description: pageDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#destination-jaipur` },
        inLanguage: ["hi", "en"]
      },
      {
        "@type": "TouristDestination",
        "@id": `${siteUrl}/#destination-jaipur`,
        name: "Jaipur",
        description:
          "The Pink City of Rajasthan, renowned for UNESCO World Heritage architecture, ancestral artisan alleys, gems, textiles, temples, and street gastronomy.",
        touristType: [
          "Cultural Tourism",
          "Heritage Tourism",
          "Culinary Tourism",
          "Shopping"
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jaipur",
          addressRegion: "Rajasthan",
          addressCountry: "IN"
        }
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#directory-list`,
        name: `Jaipur Explorer ${totalSpotCount} curated places`,
        numberOfItems: totalSpotCount,
        itemListOrder: "https://schema.org/ItemListOrderAscending"
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq-schema`,
        mainEntity: [
          {
            "@type": "Question",
            name: faq.faqQ1,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.faqA1
            }
          },
          {
            "@type": "Question",
            name: faq.faqQ2,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.faqA2
            }
          },
          {
            "@type": "Question",
            name: faq.faqQ3,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.faqA3
            }
          }
        ]
      }
    ]
  };
}

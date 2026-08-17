"use client";

import Image from "next/image";
import {
  ArrowUp,
  Languages,
  MapPin,
  Menu,
  Search,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  categories,
  directorySpots,
  i18n,
  type DirectorySpot,
  type Language
} from "@/src/data/directory";
import { heroImage } from "@/lib/seo";

type IndexedSpot = DirectorySpot & {
  raw: string;
  normalized: string;
};

const indexedSpots: IndexedSpot[] = directorySpots.map((spot) => {
  const raw = [
    spot.id,
    spot.n,
    spot.n_en,
    spot.i,
    spot.i_en,
    spot.a,
    spot.a_en,
    spot.s,
    spot.s_en,
    spot.en
  ]
    .join(" ")
    .toLowerCase();

  return {
    ...spot,
    raw,
    normalized: normalize(raw)
  };
});

const faqKeys = [
  ["faqQ1", "faqA1"],
  ["faqQ2", "faqA2"],
  ["faqQ3", "faqA3"]
] as const;

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
    .replace(/bel/g, "ble")
    .trim();
}

export function JaipurExplorer() {
  const [language, setLanguage] = useState<Language>("hi");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);

  const t = i18n[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const visibleSpots = useMemo(() => {
    const rawTokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const normalizedTokens = normalize(query).split(/\s+/).filter(Boolean);

    return indexedSpots.filter((spot) => {
      if (
        selectedCategory !== "all" &&
        !spot.cats.includes(selectedCategory)
      ) {
        return false;
      }

      return rawTokens.every((token, index) => {
        const normalizedToken = normalizedTokens[index] || token;
        return (
          spot.raw.includes(token) || spot.normalized.includes(normalizedToken)
        );
      });
    });
  }, [query, selectedCategory]);

  function selectCategory(categoryId: string) {
    setSelectedCategory(categoryId);
    setMobileOpen(false);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <header className="site-nav">
        <div className="container nav-inner">
          <a href="#" className="nav-brand" aria-label="Jaipur Explorer Home">
            <span className="brand-mark" aria-hidden="true" />
            <span>Jaipur Explorer</span>
            <span className="nav-badge">{t.navBadge}</span>
          </a>

          <nav
            className={mobileOpen ? "primary-nav open" : "primary-nav"}
            aria-label="Primary Navigation"
          >
            <ul className="nav-links">
              <li>
                <a href="#explore" className="nav-link">
                  {t.navDirectory}
                </a>
              </li>
              <li>
                <a href="#features" className="nav-link">
                  {t.navHighlights}
                </a>
              </li>
              <li>
                <a href="#faq" className="nav-link">
                  {t.navFaq}
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  className="nav-link"
                  onClick={() => selectCategory("upcoming")}
                >
                  {t.navUpcoming}
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  className="nav-link"
                  onClick={() => selectCategory("streetfood")}
                >
                  {t.navStreetFood}
                </a>
              </li>
            </ul>
          </nav>

          <div className="nav-actions">
            <div className="lang-switcher" role="group" aria-label="Language">
              <button
                className={`lang-btn ${language === "hi" ? "active" : ""}`}
                type="button"
                onClick={() => setLanguage("hi")}
                aria-pressed={language === "hi"}
              >
                हिन्दी
              </button>
              <button
                className={`lang-btn ${language === "en" ? "active" : ""}`}
                type="button"
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
              >
                EN
              </button>
            </div>

            <a href="#explore" className="btn-nav-cta">
              {t.navCta}
            </a>
            <button
              className="menu-toggle"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <Image
            className="hero-bg"
            src={heroImage}
            alt="Jaipur walled city heritage bazaar viewed through pink sandstone arches"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-shade" aria-hidden="true" />
          <div className="container hero-content">
            <span className="hero-eyebrow">{t.heroEyebrow}</span>
            <h1 className="hero-title" id="hero-title">
              {t.heroTitle}
            </h1>
            <p className="hero-desc">{t.heroDesc}</p>
            <div className="hero-cta-group">
              <a href="#explore" className="btn-primary">
                <Search size={18} aria-hidden="true" />
                {t.heroPrimaryCta}
              </a>
              <a href="#features" className="btn-secondary">
                {t.heroSecondaryCta}
              </a>
            </div>
            <ul className="hero-proof" aria-label="Directory highlights">
              <li>{t.spotlightCount}</li>
              <li>{t.metric3Label}</li>
              <li>{t.metric4Label}</li>
            </ul>
          </div>
        </section>

        <section className="metrics-bar" aria-label="Key City Index Metrics">
          <div className="container metrics-grid">
            <Metric value="145+" label={t.metric1Label} />
            <Metric value="300+" label={t.metric2Label} />
            <Metric value="16" label={t.metric3Label} />
            <Metric value="100%" label={t.metric4Label} />
          </div>
        </section>

        <section
          className="directory-section"
          id="explore"
          aria-labelledby="directory-heading"
        >
          <div className="search-sticky-container">
            <div className="container">
              <div className="search-row">
                <Search className="search-icon" size={18} aria-hidden="true" />
                <input
                  type="search"
                  id="sb"
                  className="search-input"
                  placeholder={t.searchPlaceholder}
                  autoComplete="off"
                  aria-label="Search Jaipur Directory"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                  <button
                    className="search-clear-btn"
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="container">
            <div className="section-intro directory-intro">
              <span className="section-tag">{t.spotlightLabel}</span>
              <h2 className="section-heading" id="directory-heading">
                {t.navCta}
              </h2>
              <p className="section-sub">{t.footerStandards}</p>
            </div>

            <div className="category-pills-wrap">
              <div className="category-pills" role="toolbar" aria-label="Category filters">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`cat-pill ${
                      category.id === selectedCategory ? "active" : ""
                    }`}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    aria-pressed={category.id === selectedCategory}
                  >
                    {language === "hi" ? category.hi : category.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="directory-meta">
              <span>{t.directoryMeta}</span>
              <span className="directory-count-badge" id="st" aria-live="polite">
                {visibleSpots.length} / {directorySpots.length} {t.unitsText}
              </span>
            </div>

            <div className="directory-grid" id="list">
              {visibleSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} language={language} />
              ))}
            </div>

            {visibleSpots.length === 0 ? (
              <div id="noResult" className="empty-state" role="status">
                <p className="empty-state-title">{t.noResultTitle}</p>
                <p className="empty-state-copy">{t.noResultSub}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="features-section" id="features" aria-labelledby="features-heading">
          <div className="container">
            <div className="section-intro">
              <span className="section-tag">{t.featuresTag}</span>
              <h2 className="section-heading" id="features-heading">
                {t.featuresHeading}
              </h2>
              <p className="section-sub">{t.featuresSub}</p>
            </div>

            <div className="features-grid">
              <Feature number={t.feat1Num} title={t.feat1Title} text={t.feat1Text} />
              <Feature number={t.feat2Num} title={t.feat2Title} text={t.feat2Text} />
              <Feature number={t.feat3Num} title={t.feat3Title} text={t.feat3Text} />
            </div>
          </div>
        </section>

        <section className="faq-section" id="faq" aria-labelledby="faq-heading">
          <div className="container faq-grid">
            <div>
              <span className="section-tag">{t.faqTag}</span>
              <h2 className="section-heading" id="faq-heading">
                {t.faqHeading}
              </h2>
              <p className="section-sub">{t.faqSub}</p>
            </div>

            <div className="faq-list">
              {faqKeys.map(([questionKey, answerKey], index) => {
                const isExpanded = expandedFaq === index;
                const answerId = `faq-answer-${index}`;

                return (
                  <article className={`faq-item ${isExpanded ? "active" : ""}`} key={questionKey}>
                    <h3 className="faq-heading">
                      <button
                        className="faq-question"
                        type="button"
                        onClick={() => setExpandedFaq(isExpanded ? -1 : index)}
                        aria-expanded={isExpanded}
                        aria-controls={answerId}
                      >
                        <span>{t[questionKey]}</span>
                        <span className="faq-icon" aria-hidden="true">
                          +
                        </span>
                      </button>
                    </h3>
                    <div className="faq-answer" id={answerId}>
                      {t[answerKey]}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="editorial-section" aria-labelledby="editorial-heading">
          <div className="container">
            <div className="section-intro">
              <span className="section-tag">{t.editorialTag}</span>
              <h2 className="section-heading" id="editorial-heading">
                {t.editorialHeading}
              </h2>
            </div>

            <div className="editorial-grid">
              <EditorialQuote quote={t.quote1} name={t.author1Name} role={t.author1Role} initials="AM" />
              <EditorialQuote quote={t.quote2} name={t.author2Name} role={t.author2Role} initials="RS" />
              <EditorialQuote quote={t.quote3} name={t.author3Name} role={t.author3Role} initials="VK" />
            </div>
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-heading">
          <div className="container">
            <div className="cta-box">
              <h2 className="cta-title" id="cta-heading">
                {t.ctaTitle}
              </h2>
              <p className="cta-sub">{t.ctaSub}</p>
              <button className="cta-btn" type="button" onClick={scrollToTop}>
                <ArrowUp size={18} aria-hidden="true" />
                {t.ctaBtn}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="nav-brand">
                <span className="brand-mark" aria-hidden="true" />
                <span>Jaipur Explorer</span>
              </div>
              <p className="footer-brand-desc">{t.footerDesc}</p>
            </div>

            <FooterLinks
              title={t.footerCol1Title}
              links={[
                ["Johari Bazar", "jewelry"],
                ["Purohit Ji Katla", "wedding"],
                ["Tripolia & Kishanpole", "crafts"],
                ["Chandpole & Sireh Deori", "textiles"]
              ]}
              onSelect={selectCategory}
            />
            <FooterLinks
              title={t.footerCol2Title}
              links={[
                ["Upcoming Projects", "upcoming"],
                ["Shopping Malls", "mall"],
                ["Parks & Sanctuaries", "parks"],
                ["Weekend Getaways", "outskirts"]
              ]}
              onSelect={selectCategory}
            />

            <div>
              <h2 className="footer-heading">{t.footerCol3Title}</h2>
              <p className="footer-editorial">{t.footerStandards}</p>
              <p className="footer-editorial footer-language">
                <Languages size={14} aria-hidden="true" /> हिन्दी / English
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <span>{t.footerCopy}</span>
            <span>{t.footerTagline}</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric-item">
      <div className="metric-val">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

function Feature({
  number,
  title,
  text
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article className="feature-card">
      <div className="feature-num">{number}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-text">{text}</p>
    </article>
  );
}

function SpotCard({
  spot,
  language
}: {
  spot: DirectorySpot;
  language: Language;
}) {
  const t = i18n[language];
  const name = language === "hi" ? spot.n : spot.n_en || spot.n;
  const area = language === "hi" ? spot.a : spot.a_en || spot.a;
  const items = language === "hi" ? spot.i : spot.i_en || spot.i;
  const shops = language === "hi" ? spot.s : spot.s_en || spot.s;

  return (
    <article className="spot-card" id={`spot-${spot.id}`}>
      <div className="spot-card-top">
        <div className="spot-card-header">
          <h3 className="spot-card-title">
            {spot.id}. {name}
          </h3>
          <span className="spot-card-area">{area}</span>
        </div>
        <div className="spot-card-body">
          <p>
            <span className="spot-row-label">{t.cardHighlightLbl}</span>{" "}
            {items}
          </p>
          <p>
            <span className="spot-row-label">{t.cardShopsLbl}</span> {shops}
          </p>
        </div>
      </div>
      <a
        className="spot-card-action"
        href={`https://www.google.com/maps/search/?api=1&query=${spot.q}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${language === "hi" ? spot.n : spot.n_en} Google Maps`}
      >
        <MapPin size={16} aria-hidden="true" />
        <span>{t.cardNavBtn.replace("📍 ", "")}</span>
      </a>
    </article>
  );
}

function EditorialQuote({
  quote,
  name,
  role,
  initials
}: {
  quote: string;
  name: string;
  role: string;
  initials: string;
}) {
  return (
    <figure className="editorial-card">
      <blockquote className="editorial-quote">{quote}</blockquote>
      <figcaption className="editorial-author">
        <span className="author-avatar" aria-hidden="true">
          {initials}
        </span>
        <span>
          <span className="author-name">{name}</span>
          <span className="author-role">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function FooterLinks({
  title,
  links,
  onSelect
}: {
  title: string;
  links: Array<[string, string]>;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="footer-heading">{title}</h2>
      <ul className="footer-links">
        {links.map(([label, category]) => (
          <li key={category}>
            <a
              href="#explore"
              className="footer-link"
              onClick={() => onSelect(category)}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { content, href, type Locale } from "./i18n";
import type { Product } from "./data";
import { paths } from "./pages";

const SITE = import.meta.env.SITE;

export const absUrl = (locale: Locale, pagePath: string) => new URL(href(locale, pagePath), SITE).href;

export interface Crumb {
  name: string;
  /** Omitted for the current page. */
  path?: string;
}

const publisher = { "@type": "Organization", name: "Plugixa", url: "https://www.plugixa.com/" };

export function webPageLd(locale: Locale, pagePath: string, title: string, description: string, modified: string) {
  const ui = content(locale, "ui");
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absUrl(locale, pagePath),
    url: absUrl(locale, pagePath),
    name: title,
    description,
    inLanguage: locale,
    dateModified: modified,
    isPartOf: { "@type": "WebSite", name: ui.site.name, url: absUrl(locale, "/"), publisher },
  };
}

export function breadcrumbLd(locale: Locale, crumbs: Crumb[], currentPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absUrl(locale, c.path ?? currentPath),
    })),
  };
}

// No aggregateRating here on purpose: Google treats ratings a site publishes about its own product as self-serving.
export function softwareLd(locale: Locale, product: Product) {
  const summary: string = content(locale, "products")[product.slug].summary;
  return {
    "@type": "SoftwareApplication",
    name: product.name,
    description: summary,
    applicationCategory: "WebApplication",
    applicationSubCategory: "WordPress plugin",
    operatingSystem: "WordPress",
    softwareVersion: product.wporg?.version ?? product.version_checked,
    url: absUrl(locale, paths.plugin(product.slug)),
    sameAs: product.homepage,
    author: { "@type": "Organization", name: product.vendor },
    ...(product.pricing.free
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: product.pricing.currency } }
      : {}),
  };
}

export function itemListLd(locale: Locale, name: string, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: softwareLd(locale, p) })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function articleLd(locale: Locale, pagePath: string, headline: string, description: string, modified: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage: locale,
    dateModified: modified,
    mainEntityOfPage: absUrl(locale, pagePath),
    author: publisher,
    publisher,
  };
}

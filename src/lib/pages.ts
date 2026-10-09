// One place that knows every page of the site: its path, title, description and social image.
// Page files, the Open Graph image endpoint and internal links all read from here.
import { content, fmt, href, type Locale } from "./i18n";
import { diffStats, getFeatures, getPagesConfig, getProduct, getProducts, type Product } from "./data";

export const YEAR = new Date().getFullYear();
export const REPO_URL = "https://github.com/Plugixa/wordpress-recipe-plugins-comparison";

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  /** Short heading used on the page and on its social image. */
  h1: string;
  ogKey: string;
}

/** Cuts on a word boundary so meta descriptions stay within what search results show. */
export function truncate(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

const ogKey = (path: string) => path.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";

function meta(path: string, title: string, description: string, h1: string): PageMeta {
  return { path, title, description: truncate(description), h1, ogKey: ogKey(path) };
}

export const paths = {
  home: () => "/",
  plugin: (slug: string) => `/plugins/${slug}/`,
  compare: (a: string, b: string) => `/compare/${a}-vs-${b}/`,
  alternatives: (target: string) => `/alternatives/${target}/`,
  guide: (slug: string) => `/best/${slug}/`,
  methodology: () => "/methodology/",
};

export function homeMeta(locale: Locale): PageMeta {
  const ui = content(locale, "ui");
  const vars = { year: YEAR, n: getProducts().length, features: getFeatures().length };
  return meta(paths.home(), fmt(ui.home.title, vars), fmt(ui.home.description, vars), ui.home.h1);
}

export function pluginMeta(locale: Locale, product: Product): PageMeta {
  const ui = content(locale, "ui");
  const text = content(locale, "products")[product.slug];
  const vars = { name: product.name, year: YEAR };
  return meta(paths.plugin(product.slug), fmt(ui.plugin.title, vars), text.summary, fmt(ui.plugin.h1, vars));
}

export function compareMeta(locale: Locale, a: Product, b: Product): PageMeta {
  const ui = content(locale, "ui");
  const vars = { a: a.name, b: b.name, year: YEAR, features: getFeatures().length, ...diffStats(a, b) };
  return meta(
    paths.compare(a.slug, b.slug),
    fmt(ui.compare.title, vars),
    fmt(ui.compare.description, vars),
    fmt(ui.compare.h1, vars),
  );
}

export function alternativesTarget(target: string): { name: string; product?: Product } {
  const entry = getPagesConfig().alternatives.find((e) => e.target === target)!;
  if (entry.name) return { name: entry.name };
  const product = getProduct(target);
  return { name: product.name, product };
}

export function alternativesMeta(locale: Locale, target: string): PageMeta {
  const ui = content(locale, "ui");
  const text = content(locale, "alternatives")[target];
  const entry = getPagesConfig().alternatives.find((e) => e.target === target)!;
  const vars = { name: alternativesTarget(target).name, n: entry.picks.length, year: YEAR };
  return meta(paths.alternatives(target), fmt(ui.alternatives.title, vars), text.description, fmt(ui.alternatives.h1, vars));
}

export function guideMeta(locale: Locale, slug: string): PageMeta {
  const text = content(locale, "guides")[slug];
  return meta(paths.guide(slug), fmt(text.title, { year: YEAR }), text.description, text.h1);
}

export function methodologyMeta(locale: Locale): PageMeta {
  const ui = content(locale, "ui");
  return meta(paths.methodology(), ui.methodology.title, ui.methodology.description, ui.methodology.h1);
}

/** Every indexable page for a locale. */
export function allPages(locale: Locale): PageMeta[] {
  const cfg = getPagesConfig();
  return [
    homeMeta(locale),
    ...getProducts().map((p) => pluginMeta(locale, p)),
    ...cfg.compare.map((c) => compareMeta(locale, getProduct(c.a), getProduct(c.b))),
    ...cfg.alternatives.map((e) => alternativesMeta(locale, e.target)),
    ...cfg.guides.map((g) => guideMeta(locale, g.slug)),
    methodologyMeta(locale),
  ];
}

/** The "X vs Y" page for two products in either order, if one exists. */
export function comparePathFor(x: string, y: string): string | undefined {
  const pair = getPagesConfig().compare.find((c) => (c.a === x && c.b === y) || (c.a === y && c.b === x));
  return pair && paths.compare(pair.a, pair.b);
}

export function compareLinksFor(locale: Locale, slug: string) {
  return getPagesConfig()
    .compare.filter((c) => c.a === slug || c.b === slug)
    .map((c) => {
      const m = compareMeta(locale, getProduct(c.a), getProduct(c.b));
      return { href: href(locale, m.path), label: m.h1 };
    });
}

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

export const LOCALES = ["en", "fr", "es", "de", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
};

export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  it: "it_IT",
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const i18nDir = path.resolve(process.cwd(), "src/i18n");
const cache = new Map<string, unknown>();

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// Objects merge key by key so a missing translation falls back to English; arrays are replaced whole.
function merge(base: unknown, over: unknown): unknown {
  if (!isObject(base) || !isObject(over)) return over ?? base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = merge(base[k], v);
  return out;
}

function read(locale: Locale, name: string): unknown {
  const file = path.join(i18nDir, locale, `${name}.yaml`);
  return existsSync(file) ? parse(readFileSync(file, "utf8")) : undefined;
}

/** Loads src/i18n/{locale}/{name}.yaml layered over the English file. */
export function content<T = any>(locale: Locale, name: string): T {
  const key = `${locale}/${name}`;
  if (!cache.has(key)) {
    const en = read(DEFAULT_LOCALE, name);
    if (en === undefined) throw new Error(`Missing src/i18n/en/${name}.yaml`);
    cache.set(key, locale === DEFAULT_LOCALE ? en : merge(en, read(locale, name)));
  }
  return cache.get(key) as T;
}

/** Replaces {placeholders} in a UI string. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Site-relative URL for a page. `pagePath` starts and ends with "/". */
export function href(locale: Locale, pagePath: string): string {
  return `${BASE}${locale === DEFAULT_LOCALE ? "" : `/${locale}`}${pagePath}`;
}

/** URL of a file in public/. */
export function asset(file: string): string {
  return `${BASE}/${file.replace(/^\//, "")}`;
}

export function absolute(url: string, site: URL | undefined): string {
  return new URL(url, site).href;
}

export function localeParam(locale: Locale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale;
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function formatPrice(amount: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

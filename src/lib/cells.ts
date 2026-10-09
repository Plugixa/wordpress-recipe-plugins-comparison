import { content, fmt, formatPrice, type Locale } from "./i18n";
import type { Product } from "./data";

export interface CellView {
  /** yes | partial | no | unverified | text */
  state: string;
  label: string;
  tier?: string;
  note?: string;
  sourceUrl?: string;
  /** Compared between columns by the "only where plugins differ" filter. */
  signature: string;
}

export function cellView(locale: Locale, product: Product, featureId: string): CellView {
  const ui = content(locale, "ui");
  const text = content(locale, "products")[product.slug];
  const cell = product.features[featureId];
  const sourceUrl = cell.src ? product.sources[cell.src].url : undefined;

  const note: string | undefined = cell.note ? text.notes?.[featureId] : undefined;
  if (cell.note && !note) throw new Error(`${product.slug}: no note text for ${featureId}`);

  if (cell.text) {
    const label: string | undefined = text.texts?.[featureId];
    if (!label) throw new Error(`${product.slug}: no text for ${featureId}`);
    return { state: "text", label, note, sourceUrl, signature: `text:${product.slug}` };
  }

  const value = cell.value!;
  let tier: string | undefined;
  if (value === "yes" || value === "partial") {
    if (cell.tier === "free") tier = ui.values.free;
    else if (cell.tier === "addon") tier = ui.values.addon;
    else if (cell.tier === "paid") tier = fmt(ui.values.paid, { tier: cell.tier_name! });
  }
  return { state: value, label: ui.values[value], tier, note, sourceUrl, signature: `${value}:${cell.tier ?? ""}` };
}

/** Lowest listed yearly price, or undefined when only lifetime tiers exist. */
export function fromPrice(locale: Locale, product: Product): string {
  const ui = content(locale, "ui");
  const yearly = product.pricing.tiers.filter((t) => t.period === "year").map((t) => t.price);
  if (!yearly.length) return ui.pricing.free_only;
  return fmt(ui.pricing.from, { price: formatPrice(Math.min(...yearly), product.pricing.currency, locale) });
}

export function installsLabel(locale: Locale, product: Product): string | undefined {
  const ui = content(locale, "ui");
  const stats = product.wporg;
  if (!stats) return undefined;
  if (stats.active_installs < 10) return ui.stats.installs_new;
  return fmt(ui.stats.installs_value, { n: new Intl.NumberFormat(locale).format(stats.active_installs) });
}

export function ratingLabel(locale: Locale, product: Product): string | undefined {
  const ui = content(locale, "ui");
  const stats = product.wporg;
  if (!stats) return undefined;
  if (!stats.num_ratings || stats.rating === null) return ui.stats.rating_none;
  return fmt(ui.stats.rating_value, {
    rating: new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(stats.rating),
    count: stats.num_ratings,
  });
}

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "astro/zod";

const dataDir = path.resolve(process.cwd(), "src/data");
const readYaml = (file: string) => parse(readFileSync(path.join(dataDir, file), "utf8"));

// ---------- Features ----------

const featureSchema = z.object({
  id: z.string().regex(/^[a-z_]+\.[a-z_]+$/),
  type: z.enum(["support", "text"]),
});
const featuresSchema = z.object({
  areas: z.array(z.object({ id: z.string(), features: z.array(featureSchema).min(1) })).min(1),
});

export type Feature = z.infer<typeof featureSchema>;
export type Area = z.infer<typeof featuresSchema>["areas"][number];

// ---------- Products ----------

const cellSchema = z
  .object({
    value: z.enum(["yes", "partial", "no", "unverified"]).optional(),
    text: z.literal(true).optional(),
    tier: z.enum(["free", "paid", "addon"]).optional(),
    tier_name: z.string().optional(),
    src: z.string().optional(),
    note: z.literal(true).optional(),
  })
  .strict();

const tierSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  regular: z.number().positive().optional(),
  period: z.enum(["year", "lifetime"]),
  sites: z.string(),
});

const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  vendor: z.string(),
  own: z.boolean(),
  kind: z.enum(["card", "database"]),
  order: z.number(),
  wporg_slug: z.string().optional(),
  homepage: z.url(),
  verified_at: z.iso.date(),
  version_checked: z.string(),
  sources: z.record(z.string(), z.object({ url: z.url(), method: z.enum(["docs", "source-code", "hands-on"]) })),
  pricing: z.object({
    source: z.string(),
    currency: z.enum(["USD", "EUR"]),
    free: z.boolean(),
    lifetime: z.boolean(),
    refund: z.enum(["days_30", "days_14", "defect_14", "unknown"]),
    tiers: z.array(tierSchema),
  }),
  features: z.record(z.string(), cellSchema),
});

const wporgSchema = z.object({
  slug: z.string(),
  api_url: z.string(),
  fetched_at: z.string(),
  version: z.string(),
  active_installs: z.number(),
  rating: z.number().nullable(),
  num_ratings: z.number(),
  last_updated: z.string(),
  added: z.string(),
  requires_wp: z.string().nullable(),
  requires_php: z.string().nullable(),
  tested_up_to: z.string().nullable(),
});

export type Cell = z.infer<typeof cellSchema>;
export type PriceTier = z.infer<typeof tierSchema>;
export type WporgStats = z.infer<typeof wporgSchema>;
export type Product = z.infer<typeof productSchema> & { wporg?: WporgStats };

// A claim without a source fails the build: that rule is what keeps the table honest.
function checkProduct(product: Product, featureIds: Set<string>, file: string) {
  const fail = (msg: string) => {
    throw new Error(`${file}: ${msg}`);
  };
  if (`${product.slug}.yaml` !== file) fail(`slug "${product.slug}" does not match the filename`);
  if (!product.sources[product.pricing.source]) fail(`pricing.source "${product.pricing.source}" is not in sources`);
  if (product.verified_at > new Date().toISOString().slice(0, 10)) fail("verified_at is in the future");
  for (const id of featureIds) if (!product.features[id]) fail(`missing feature "${id}"`);
  for (const [id, cell] of Object.entries(product.features)) {
    if (!featureIds.has(id)) fail(`unknown feature "${id}"`);
    if (!cell.value && !cell.text) fail(`${id}: needs a value or text`);
    if (cell.value === "unverified") continue;
    if (!cell.src || !product.sources[cell.src]) fail(`${id}: a checked value needs a src listed in sources`);
    if (cell.tier === "paid" && !cell.tier_name) fail(`${id}: tier "paid" needs tier_name`);
    if (cell.value === "partial" && !cell.note) fail(`${id}: "partial" needs a note explaining what is missing`);
  }
}

let cached: { areas: Area[]; features: Feature[]; products: Product[] } | undefined;

function load() {
  if (cached) return cached;
  const { areas } = featuresSchema.parse(readYaml("features.yaml"));
  const features = areas.flatMap((a) => a.features);
  const featureIds = new Set(features.map((f) => f.id));

  const products = readdirSync(path.join(dataDir, "products"))
    .filter((f) => f.endsWith(".yaml"))
    .map((file) => {
      const product: Product = productSchema.parse(readYaml(`products/${file}`));
      checkProduct(product, featureIds, file);
      const statsFile = path.join(dataDir, "wporg", `${product.slug}.json`);
      if (existsSync(statsFile)) product.wporg = wporgSchema.parse(JSON.parse(readFileSync(statsFile, "utf8")));
      return product;
    })
    .sort((a, b) => a.order - b.order);

  cached = { areas, features, products };
  return cached;
}

export const getAreas = () => load().areas;
export const getFeatures = () => load().features;
export const getProducts = () => load().products;

export function getProduct(slug: string): Product {
  const product = load().products.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown product "${slug}"`);
  return product;
}

export const ownProduct = () => load().products.find((p) => p.own)!;

/** Number of features with a checked (not "unverified") value. */
export function checkedCount(product: Product): number {
  return Object.values(product.features).filter((c) => c.value !== "unverified").length;
}

/** Features where both products are checked, and how many of those differ. */
export function diffStats(a: Product, b: Product) {
  let both = 0;
  let differ = 0;
  for (const f of getFeatures()) {
    const ca = a.features[f.id];
    const cb = b.features[f.id];
    if (ca.value === "unverified" || cb.value === "unverified") continue;
    both++;
    if (ca.text || cb.text || ca.value !== cb.value || ca.tier !== cb.tier) differ++;
  }
  return { both, differ };
}

/** Latest date any listed product was checked. */
export function lastChecked(products: Product[] = getProducts()): string {
  return products.map((p) => p.verified_at).sort().at(-1)!;
}

// ---------- Page structure ----------

const pagesSchema = z.object({
  compare: z.array(z.object({ a: z.string(), b: z.string() })),
  alternatives: z.array(z.object({ target: z.string(), name: z.string().optional(), picks: z.array(z.string()) })),
  guides: z.array(z.object({ slug: z.string(), picks: z.array(z.string()) })),
  legacy: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      reason: z.enum(["author", "guideline", "security", "at_risk"]),
      date: z.string(),
      source: z.url(),
    }),
  ),
});

export type PagesConfig = z.infer<typeof pagesSchema>;
let pagesCache: PagesConfig | undefined;
export function getPagesConfig(): PagesConfig {
  pagesCache ??= pagesSchema.parse(readYaml("pages.yaml"));
  return pagesCache;
}

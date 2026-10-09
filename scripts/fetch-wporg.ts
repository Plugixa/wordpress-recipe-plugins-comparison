// Refreshes src/data/wporg/{slug}.json from the public wordpress.org plugin API.
// Run with `npm run wporg`. A failed request keeps the previous file.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productsDir = path.join(root, "src/data/products");
const outDir = path.join(root, "src/data/wporg");

const apiUrl = (slug: string) =>
  `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${slug}`;

function meanRating(ratings: Record<string, number> | undefined): number | null {
  if (!ratings) return null;
  let total = 0;
  let count = 0;
  for (const [stars, n] of Object.entries(ratings)) {
    total += Number(stars) * n;
    count += n;
  }
  return count ? Math.round((total / count) * 100) / 100 : null;
}

await mkdir(outDir, { recursive: true });
const files = (await readdir(productsDir)).filter((f) => f.endsWith(".yaml"));
let failed = 0;

for (const file of files) {
  const product = parse(await readFile(path.join(productsDir, file), "utf8"));
  const slug: string | undefined = product.wporg_slug;
  if (!slug) continue;
  try {
    const res = await fetch(apiUrl(slug));
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error ?? `HTTP ${res.status}`);
    const stats = {
      slug,
      api_url: apiUrl(slug),
      fetched_at: new Date().toISOString().slice(0, 10),
      listed: true,
      name: json.name as string,
      version: json.version as string,
      active_installs: json.active_installs as number,
      rating: meanRating(json.ratings),
      num_ratings: json.num_ratings as number,
      last_updated: String(json.last_updated).slice(0, 10),
      added: json.added as string,
      requires_wp: json.requires || null,
      requires_php: json.requires_php || null,
      tested_up_to: json.tested || null,
    };
    await writeFile(path.join(outDir, `${product.slug}.json`), JSON.stringify(stats, null, 2) + "\n");
    console.log(`ok    ${slug}  v${stats.version}  ${stats.active_installs}+ installs`);
  } catch (err) {
    failed++;
    console.warn(`skip  ${slug}: ${(err as Error).message}`);
  }
}

if (failed) console.warn(`${failed} plugin(s) not refreshed; previous data kept.`);

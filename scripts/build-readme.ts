// Regenerates the table between the markers in README.md from the same data the site uses.
// Run with `npm run readme`.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://plugixa.github.io/wordpress-recipe-plugins-comparison";
const START = "<!-- generated:start -->";
const END = "<!-- generated:end -->";

const read = (file: string) => parse(readFileSync(path.join(root, file), "utf8"));
const prose = read("src/i18n/en/products.yaml");

const products = readdirSync(path.join(root, "src/data/products"))
  .map((f) => read(`src/data/products/${f}`))
  .sort((a, b) => a.order - b.order);

const rows = products.map((p) => {
  const stats = JSON.parse(readFileSync(path.join(root, `src/data/wporg/${p.slug}.json`), "utf8"));
  const yearly = p.pricing.tiers.filter((t: any) => t.period === "year").map((t: any) => t.price);
  const symbol = p.pricing.currency === "EUR" ? "€" : "$";
  const installs = stats.active_installs < 10 ? "new" : `${stats.active_installs.toLocaleString("en")}+`;
  const rating = stats.num_ratings ? `${stats.rating} (${stats.num_ratings})` : "–";
  return `| [${p.name}](${SITE}/plugins/${p.slug}/) | ${prose[p.slug].award} | ${installs} | ${rating} | ${symbol}${Math.min(...yearly)}/yr |`;
});

const table = [
  "| Plugin | Best for | Active installs | Rating (count) | Paid from |",
  "|---|---|---|---|---|",
  ...rows,
].join("\n");

const file = path.join(root, "README.md");
const readme = readFileSync(file, "utf8");
const before = readme.slice(0, readme.indexOf(START) + START.length);
const after = readme.slice(readme.indexOf(END));
writeFileSync(file, `${before}\n${table}\n${after}`);
console.log(`README table updated with ${rows.length} plugins.`);

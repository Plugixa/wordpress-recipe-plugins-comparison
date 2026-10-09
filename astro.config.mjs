import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Moving to a custom domain later means changing only these two values.
const SITE = "https://plugixa.github.io";
const BASE = "/wordpress-recipe-plugins-comparison";

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: "always",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", fr: "fr", es: "es", de: "de", it: "it" },
      },
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
});

import type { APIRoute } from "astro";
import { asset } from "../lib/i18n";

// Note: on a github.io project site this file is served under the base path, so crawlers that only read
// the host root will not see it. The sitemap is also linked from every page's <head>.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(asset("sitemap-index.xml"), site).href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

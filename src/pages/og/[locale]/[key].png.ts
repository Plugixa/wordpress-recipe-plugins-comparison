// Builds one 1200x630 social image per page from its heading.
import type { APIRoute } from "astro";
import sharp from "sharp";
import { LOCALES, content, type Locale } from "../../../lib/i18n";
import { allPages } from "../../../lib/pages";

export function getStaticPaths() {
  return LOCALES.flatMap((locale) =>
    allPages(locale).map((page) => ({
      params: { locale, key: page.ogKey },
      props: { locale, heading: page.h1 },
    })),
  );
}

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && `${line} ${word}`.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export const GET: APIRoute = async ({ props }) => {
  const { locale, heading } = props as { locale: Locale; heading: string };
  const ui = content(locale, "ui");
  const long = heading.length > 44;
  const size = long ? 60 : 76;
  const lines = wrap(heading, long ? 30 : 23).slice(0, 4);
  const startY = 330 - ((lines.length - 1) * size * 1.18) / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fbfaf6"/>
  <rect width="1200" height="14" fill="#a83a0b"/>
  <text x="80" y="110" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#a83a0b">${escapeXml(ui.site.short.toUpperCase())}</text>
  ${lines
    .map(
      (l, i) =>
        `<text x="80" y="${Math.round(startY + i * size * 1.18)}" font-family="DejaVu Serif, Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="700" fill="#1e1b16">${escapeXml(l)}</text>`,
    )
    .join("\n  ")}
  <text x="80" y="570" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="26" fill="#655f54">${escapeXml(ui.site.tagline)}</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};

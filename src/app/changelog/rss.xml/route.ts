import { RELEASES } from "@/features/releases/data/releases";

// Static export: the feed is generated once at build time.
export const dynamic = "force-static";

// RSS 2.0 feed for the changelog — the standard way readers subscribe to
// releases (Linear / Vercel / GitHub all offer one). Served at /changelog/rss.xml.
const SITE = "https://twynity.design.4th-ir.com";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const items = RELEASES.map(
    (r) => `    <item>
      <title>${esc(r.title)} (v${r.version})</title>
      <link>${SITE}/changelog#${r.slug}</link>
      <guid isPermaLink="false">twynity-v${r.version}</guid>
      <pubDate>${new Date(`${r.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(r.summary)}</description>
    </item>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Twynity Changelog</title>
    <link>${SITE}/changelog</link>
    <description>Everything new, improved, and fixed in Twynity.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

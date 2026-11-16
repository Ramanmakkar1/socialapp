// /sitemap.xml must be machine-readable raw XML.
//
// This route serialises the SAME sitemap() entries as sitemap.ts. It deliberately
// emits no XSL stylesheet processing instruction: an XML-to-HTML transform made
// browsers show a "This site uses XSLT" warning and render a purple HTML page for
// a URL that crawlers expect to be plain XML. next.config rewrites /sitemap.xml here.
import sitemap from "@/app/sitemap";
import { BRAND, isApprovedProductionOrigin } from "@/lib/brand";

export const dynamic = "force-dynamic";

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatLastMod(value: Date | string | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function GET(request?: Request) {
  // A non-canonical (staging/legacy) host is always noindex, so it must never
  // advertise URLs in its sitemap even if a redirect is bypassed. The canonical
  // host keeps the normal sitemap; tests call GET() without a request.
  // Use the host the visitor asked for (proxy headers first). request.url inside the
  // standalone server is the internal bind address (0.0.0.0:3000), which made every
  // production request look like a staging host and emptied the sitemap (2026-11-15).
  const requestHost = request
    ? (
        request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
        request.headers.get("host") ||
        new URL(request.url).host
      ).toLowerCase()
    : null;
  const hostIsIndexable =
    requestHost === null || isApprovedProductionOrigin(`https://${requestHost}`);
  const urls = (hostIsIndexable ? await sitemap() : [])
    .map((entry) => {
      const lastmod = formatLastMod(entry.lastModified);
      const changefreq = entry.changeFrequency
        ? `\n    <changefreq>${entry.changeFrequency}</changefreq>`
        : "";
      const priority =
        typeof entry.priority === "number"
          ? `\n    <priority>${entry.priority}</priority>`
          : "";
      return `  <url>
    <loc>${xmlEscape(entry.url)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${changefreq}${priority}
  </url>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}${urls ? "\n" : ""}</urlset>
`;

  const headers: Record<string, string> = {
    "content-type": "application/xml; charset=utf-8",
    // Never let a CDN or browser serve a cached sitemap: the staging noindex
    // must take effect immediately and an empty index must not be cached.
    "cache-control": "no-store",
  };
  // While staging is noindex, tell crawlers not to index the XML itself.
  if (!BRAND.indexable) {
    headers["x-robots-tag"] = "noindex, nofollow";
  }

  return new Response(body, { headers });
}

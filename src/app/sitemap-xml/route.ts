// Browser-friendly /sitemap.xml.
//
// This route serialises the SAME sitemap() entries as sitemap.ts and adds an XSL
// stylesheet processing instruction. Crawlers still receive plain XML, while
// browsers render the styled page in public/sitemap.xsl (title, lang, viewport,
// one <h1>) instead of a bare XML tree. next.config rewrites /sitemap.xml here.
import sitemap from "@/app/sitemap";
import { isSiteIndexable } from "@/lib/indexability";

export const dynamic = "force-dynamic";

const STYLESHEET_HREF = "/sitemap.xsl";

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
  // The host is matched exactly (hostname only, optional port stripped) by
  // isApprovedProductionOrigin in sitemap.ts: a substring match would noindex
  // unrelated hosts such as evil-socialapp.splitforms.com.
  const requestHost = request
    ? (
        request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
        request.headers.get("host") ||
        new URL(request.url).host
      )
        .toLowerCase()
        .replace(/:\d+$/, "")
    : null;
  const urls = (await sitemap(requestHost))
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
<?xml-stylesheet type="text/xsl" href="${STYLESHEET_HREF}"?>
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
  // Re-resolve at request time so a stale module-load snapshot can never mask
  // a runtime noindex (e.g. a staging host or a flag turned off after build).
  if (!isSiteIndexable()) {
    headers["x-robots-tag"] = "noindex, nofollow";
  }

  return new Response(body, { headers });
}

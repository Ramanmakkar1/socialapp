// Browser-friendly /sitemap.xml.
//
// Next's native sitemap.ts emits a bare <urlset>, which Chrome renders as a
// nearly empty XML tree (and an empty one while staging is noindex). This route
// serialises the SAME sitemap() entries and adds an XSL stylesheet processing
// instruction, so browsers show a styled, readable page while crawlers still
// receive plain XML. next.config rewrites /sitemap.xml here.
import sitemap from "@/app/sitemap";

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

export async function GET() {
  const urls = (await sitemap())
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

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
}

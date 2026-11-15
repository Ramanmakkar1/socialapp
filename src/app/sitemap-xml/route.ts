// /sitemap.xml must be machine-readable raw XML.
//
// This route serialises the SAME sitemap() entries as sitemap.ts. It deliberately
// emits no XSL stylesheet processing instruction: an XML-to-HTML transform made
// browsers show a "This site uses XSLT" warning and render a purple HTML page for
// a URL that crawlers expect to be plain XML. next.config rewrites /sitemap.xml here.
import sitemap from "@/app/sitemap";

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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}${urls ? "\n" : ""}</urlset>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
}

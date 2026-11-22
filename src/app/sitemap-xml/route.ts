// Browser-friendly /sitemap.xml.
//
// This route serialises the SAME sitemap() entries as sitemap.ts. Crawlers
// receive plain XML; browsers receive a clean HTML page (title, lang, viewport,
// one <h1>) built from the same entries. No XSLT: Chrome deprecates
// <?xml-stylesheet?> on XML and shows a red warning banner that covered the
// page top (and the H1 on phone). next.config rewrites /sitemap.xml here.
import sitemap from "@/app/sitemap";
import { isSiteIndexable } from "@/lib/indexability";

export const dynamic = "force-dynamic";

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function htmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatLastMod(value: Date | string | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

// The styled page browsers see at /sitemap.xml. Same content as the XML: the
// URL list (or the staging noindex notice), rendered as HTML so no XSLT
// deprecation banner is shown.
function renderHtmlPage(entries: { url: string; lastmod: string | null }[]): string {
  const rows = entries
    .map(
      (entry) => `          <tr>
            <td class="url"><a href="${htmlEscape(entry.url)}">${htmlEscape(entry.url)}</a></td>
            <td class="date right">${entry.lastmod ? htmlEscape(entry.lastmod.slice(0, 10)) : ""}</td>
          </tr>`,
    )
    .join("\n");
  const body = entries.length
    ? `        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th class="date right">Last Modified</th>
            </tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>`
    : `        <div class="empty">
          <h2>Nothing to list right now</h2>
          <p>
            Poskoo is still in staging and set to <strong>noindex</strong>, so this sitemap is intentionally empty.
            Search engines should not index the staging site.
          </p>
          <p>
            When the site goes live, every public page will appear here automatically. In the meantime, explore
            <a href="https://poskoo.com">poskoo.com</a>.
          </p>
        </div>`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="robots" content="noindex, nofollow"/>
    <title>XML Sitemap — Poskoo</title>
    <style>
      :root {
        --ink: #1e1631;
        --muted: #5f5873;
        --line: #ece6da;
        --paper: #fffcf6;
        --card: #ffffff;
        --band: #f3eeff;
        --coral: #ff6a3d;
        --violet: #6b4eff;
        --lime: #ddf46b;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: var(--ink);
        background: var(--paper);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }
      .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px 56px; }
      .hero {
        background: linear-gradient(135deg, var(--violet) 0%, var(--ink) 100%);
        color: #fff;
        padding: 56px 24px 64px;
        margin-bottom: 28px;
      }
      .hero-inner { max-width: 1100px; margin: 0 auto; }
      .brand {
        font-size: 14px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        opacity: 0.85;
        margin-bottom: 12px;
      }
      .hero h1 {
        font-size: 48px;
        line-height: 1.05;
        margin: 0 0 12px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .hero p { margin: 0; font-size: 17px; opacity: 0.92; max-width: 760px; }
      .pill {
        display: inline-block;
        margin-top: 18px;
        padding: 8px 16px;
        background: rgba(255,255,255,0.15);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;
        color: var(--lime);
      }
      .about, .empty {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 20px 24px;
        font-size: 15px;
        color: #2a2d44;
        margin-bottom: 18px;
        box-shadow: 0 2px 0 rgba(30, 22, 49, 0.04), 0 18px 30px -26px rgba(30, 22, 49, 0.35);
      }
      .about strong, .empty strong { color: var(--ink); }
      .about a, .empty a { color: var(--violet); font-weight: 700; }
      .empty h2 { margin: 0 0 8px; font-size: 22px; letter-spacing: -0.02em; }
      .empty p { margin: 0 0 10px; }
      .empty p:last-child { margin-bottom: 0; }
      table {
        width: 100%;
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 18px;
        border-collapse: separate;
        border-spacing: 0;
        overflow: hidden;
      }
      thead th {
        background: var(--band);
        color: var(--ink);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-align: left;
        padding: 14px 22px;
        border-bottom: 1px solid var(--line);
      }
      tbody td {
        padding: 14px 22px;
        border-bottom: 1px solid var(--line);
        font-size: 14.5px;
        vertical-align: top;
      }
      tbody tr:last-child td { border-bottom: 0; }
      tbody tr:hover td { background: #faf8ff; }
      td.url a {
        color: var(--violet);
        text-decoration: none;
        font-weight: 600;
        word-break: break-all;
      }
      td.url a:hover { text-decoration: underline; }
      td.date, th.date { white-space: nowrap; color: var(--muted); }
      th.right, td.right { text-align: right; }
      .footer {
        margin-top: 24px;
        text-align: center;
        color: var(--muted);
        font-size: 13px;
      }
      .footer a { color: var(--violet); }
      @media (max-width: 640px) {
        .hero { padding: 36px 20px 44px; }
        .hero h1 { font-size: 34px; }
        .wrap { padding: 0 18px 40px; }
        thead th, tbody td { padding: 12px 14px; }
        th.date, td.date { display: none; }
      }
    </style>
  </head>
  <body>
    <header class="hero">
      <div class="hero-inner">
        <div class="brand">Poskoo</div>
        <h1>XML Sitemap</h1>
        <p>Every public page on Poskoo, in one file for search engines and AI answer engines.</p>
        <div class="pill">${entries.length} URLs</div>
      </div>
    </header>

    <div class="wrap">
      <div class="about">
        <strong>About this sitemap:</strong>
        This XML file is for crawlers such as Google, Bing, ChatGPT and Perplexity. It lists the public pages on
        <a href="https://poskoo.com">poskoo.com</a>, when each one last changed, and how often it changes.
        Humans can ignore it and visit <a href="https://poskoo.com">poskoo.com</a> instead.
      </div>

${body}

      <div class="footer">
        Generated by Poskoo · Compliant with
        <a href="https://www.sitemaps.org/protocol.html">sitemaps.org/0.9</a>
      </div>
    </div>
  </body>
</html>
`;
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
  const LEGACY_STAGING_HOST = "socialapp.splitforms.com";
  const normalizeHost = (value: string | null | undefined) =>
    (value ?? "").split(",")[0]?.trim().toLowerCase().replace(/:\d+$/, "") ?? "";
  const forwardedHost = request ? normalizeHost(request.headers.get("x-forwarded-host")) : "";
  const directHost = request
    ? normalizeHost(request.headers.get("host")) || normalizeHost(new URL(request.url).host)
    : "";
  // The legacy staging host must stay out of the sitemap even when a proxy
  // rewrites x-forwarded-host to the canonical domain, so check both headers
  // separately and pass the legacy host through when either one is it.
  const requestHost =
    forwardedHost === LEGACY_STAGING_HOST || directHost === LEGACY_STAGING_HOST
      ? LEGACY_STAGING_HOST
      : forwardedHost || directHost || null;
  const entries = (await sitemap(requestHost)).map((entry) => ({
    url: entry.url,
    lastmod: formatLastMod(entry.lastModified),
    changefreq: entry.changeFrequency ?? null,
    priority: typeof entry.priority === "number" ? entry.priority : null,
  }));

  // Browsers (Accept: text/html) get the clean HTML page; crawlers and
  // everything else get plain XML. No XSLT in either response.
  const wantsHtml = (request?.headers.get("accept") ?? "").includes("text/html");
  let body: string;
  let contentType: string;
  if (wantsHtml) {
    body = renderHtmlPage(entries);
    contentType = "text/html; charset=utf-8";
  } else {
    const urls = entries
      .map((entry) => {
        const changefreq = entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : "";
        const priority = entry.priority !== null ? `\n    <priority>${entry.priority}</priority>` : "";
        return `  <url>
    <loc>${xmlEscape(entry.url)}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}${changefreq}${priority}
  </url>`;
      })
      .join("\n");
    body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}${urls ? "\n" : ""}</urlset>
`;
    contentType = "application/xml; charset=utf-8";
  }

  const headers: Record<string, string> = {
    "content-type": contentType,
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

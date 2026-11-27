import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { BRAND, isApprovedProductionOrigin } from "@/lib/brand";
import { isPathIndexable } from "@/lib/indexability";
import { PUBLIC_PATHS, META, type PublicPath } from "@/lib/public-pages";
import { GUIDES } from "@/content/guides/registry";

// Evaluate indexability per request so a build never freezes the staging noindex.
export const dynamic = "force-dynamic";

// Stable last-modified date for every sitemap entry. A fixed default keeps the
// value identical across requests; SITEMAP_LAST_MODIFIED can override it.
const DEFAULT_SITEMAP_LAST_MODIFIED = "2026-11-01T00:00:00.000Z";

function resolveSitemapLastModified(): Date {
  const override = process.env.SITEMAP_LAST_MODIFIED?.trim();
  if (override) {
    const parsed = new Date(override);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(DEFAULT_SITEMAP_LAST_MODIFIED);
}

export const SITEMAP_LAST_MODIFIED = resolveSitemapLastModified();

// Each guide's real updated date as lastmod, so the sitemap shows when an
// article was actually changed instead of the site-wide default date.
const GUIDE_LASTMOD = new Map<string, Date>(
  GUIDES.map((guide) => [`/guides/${guide.slug}`, new Date(`${guide.updated}T00:00:00Z`)]),
);

// The staging homepage URL that must never appear in the sitemap while the
// site remains noindex. Named explicitly so the exclusion is visible at a
// glance and survives any future change to the generic origin checks.
const STAGING_HOMEPAGE_URL = "https://socialapp.splitforms.com";

// The homepage is the one URL the audit tracks separately. It is listed only
// while the site-wide noindex flag is off; the same isPathIndexable("/") call
// drives the robots meta in src/app/layout.tsx and src/app/page.tsx, so the
// sitemap can never advertise a noindex homepage.
const HOMEPAGE_PATH: PublicPath = "/";

// Tool routes whose page metadata sets `robots: { index: false }`. Grep
// src/app/tools for `index: false` and add each route here so a noindex tool
// can never be listed. As of 2026-11-23 no tool page is noindex (the grep finds
// nothing), so the list is empty; isPathIndexable still drops app/auth routes.
const NOINDEX_PATHS: readonly string[] = [];

function isListablePath(path: PublicPath): boolean {
  if (path === HOMEPAGE_PATH && !isPathIndexable(HOMEPAGE_PATH)) return false;
  return isPathIndexable(path);
}

// Only indexable paths are listed. An empty sitemap while staging is noindex is
// intended; the file stays raw XML with no XSLT styling.
// The tools URL list is PUBLIC_PATHS in src/lib/public-pages.ts; it already
// includes "/tools/tiktok-caption-generator" next to the other /tools entries.
function getSitemapPaths(host?: string | null): PublicPath[] {
  // The staging homepage is excluded from the sitemap while the site remains
  // noindex. This is a hard exclusion: the URL is never listed, regardless of
  // the indexability flag or any future change to the origin checks below.
  if (host && `https://${host}` === STAGING_HOMEPAGE_URL) return [];
  // Staging is noindex: list nothing, on any host, until indexing is enabled.
  // isPathIndexable returns false for every path (including "/") while the site
  // is noindex, so the filter below yields an empty list for staging.
  // A non-canonical (staging/legacy) origin is always noindex, so never list it
  // even when the indexability flag is forced on. When the caller knows the
  // request host, use it: the legacy host must serve an empty sitemap even if
  // a redirect is bypassed.
  if (host && !isApprovedProductionOrigin(`https://${host}`)) return [];
  if (!isApprovedProductionOrigin(BRAND.url)) return [];
  // home is listed only when indexable (production); every other noindex path
  // is dropped by the same helper, so a fully noindex site returns an empty list.
  return PUBLIC_PATHS.filter(isListablePath).filter((path) => !NOINDEX_PATHS.includes(path));
}

// Synchronous entry builder for callers that already know the request host
// (and for tests, which run outside a Next.js request).
export function sitemapEntries(host?: string | null): MetadataRoute.Sitemap {
  // Re-check indexability at the output boundary: a path that is noindex for
  // any reason must never reach the XML, even if the candidate list changes.
  // isPathIndexable("/") is the same site-level noindex condition the root
  // layout uses for its robots meta (src/app/layout.tsx), so the sitemap
  // returns an empty array exactly while the site is noindex, on every host.
  const hostIsIndexable = isApprovedProductionOrigin(BRAND.url) && isPathIndexable("/");
  return getSitemapPaths(host)
    .filter((path) => hostIsIndexable && isListablePath(path))
    .map((path) => {
      return {
        url: `${BRAND.url}${path}`,
        lastModified: GUIDE_LASTMOD.get(path) ?? SITEMAP_LAST_MODIFIED,
        changeFrequency: META[path]?.changeFrequency ?? ("yearly" as const),
        priority: META[path]?.priority ?? 0.3,
      };
    })
    // Final host guard: every emitted URL must be on the approved production
    // origin. A staging/legacy host is always noindex, so it can never leak in
    // even if BRAND.url or the candidate path list changes.
    .filter((entry) => isApprovedProductionOrigin(entry.url))
    // Hard exclusion: the staging homepage is never listed while the site is
    // noindex, even if a future change to BRAND.url or the path list would
    // otherwise allow it.
    .filter((entry) => entry.url.replace(/\/$/, "") !== STAGING_HOMEPAGE_URL);
}

function normalizeHost(value: string | null | undefined): string {
  return (value ?? "").split(",")[0]?.trim().toLowerCase().replace(/:\d+$/, "") ?? "";
}

// Read the request host when the caller did not pass one. headers() throws
// outside a request (build, tests); then fall back to the BRAND.url checks.
async function readRequestHost(): Promise<string | null> {
  try {
    const h = await headers();
    return normalizeHost(h.get("x-forwarded-host")) || normalizeHost(h.get("host")) || null;
  } catch {
    return null;
  }
}

export default async function sitemap(host?: string | null): Promise<MetadataRoute.Sitemap> {
  const requestHost = typeof host === "string" && host ? normalizeHost(host) : await readRequestHost();
  // Any host other than poskoo.com (the old staging host, previews, localhost)
  // gets an empty sitemap.
  if (requestHost && !isApprovedProductionOrigin(`https://${requestHost}`)) return [];
  return sitemapEntries(requestHost);
}

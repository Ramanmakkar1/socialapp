import type { MetadataRoute } from "next";
import { BRAND, isApprovedProductionOrigin } from "@/lib/brand";
import { isPathIndexable } from "@/lib/indexability";
import { PUBLIC_PATHS, META, type PublicPath } from "@/lib/public-pages";

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

// The staging homepage URL that must never appear in the sitemap while the
// site remains noindex. Named explicitly so the exclusion is visible at a
// glance and survives any future change to the generic origin checks.
const STAGING_HOMEPAGE_URL = "https://socialapp.splitforms.com";

// The homepage is the one URL the audit tracks separately. It is listed only
// while the site-wide noindex flag is off; the same isPathIndexable("/") call
// drives the robots meta in src/app/layout.tsx and src/app/page.tsx, so the
// sitemap can never advertise a noindex homepage.
const HOMEPAGE_PATH: PublicPath = "/";

// Tool pages that render noindex, so they must never be advertised in the
// sitemap even though they stay in the PUBLIC_PATHS list for titles/meta.
const NOINDEX_TOOL_PATHS: readonly PublicPath[] = [
  "/tools/x-thread-maker",
  "/tools/pinterest-hashtag-generator",
  "/tools/x-hashtag-generator",
  "/tools/social-media-post-generator",
  "/tools/pinterest-description-generator",
];

function isListableToolPath(path: PublicPath): boolean {
  return !NOINDEX_TOOL_PATHS.includes(path);
}

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
  return PUBLIC_PATHS.filter(isListableToolPath).filter(isListablePath);
}

export default function sitemap(host?: string | null): MetadataRoute.Sitemap {
  // Re-check indexability at the output boundary: a path that is noindex for
  // any reason must never reach the XML, even if the candidate list changes.
  const hostIsIndexable = isApprovedProductionOrigin(BRAND.url);
  return getSitemapPaths(host)
    .filter((path) => hostIsIndexable && isListablePath(path))
    .map((path) => {
      return {
        url: `${BRAND.url}${path}`,
        lastModified: SITEMAP_LAST_MODIFIED,
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

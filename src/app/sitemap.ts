import type { MetadataRoute } from "next";
import { BRAND, isApprovedProductionOrigin } from "@/lib/brand";
import { isPathIndexable, isSiteIndexable } from "@/lib/indexability";
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

// Only indexable paths are listed. An empty sitemap while staging is noindex is
// intended; the file stays raw XML with no XSLT styling.
function getSitemapPaths(): PublicPath[] {
  // Staging is noindex: list nothing, on any host, until indexing is enabled.
  if (!isSiteIndexable()) return [];
  // A non-canonical (staging/legacy) origin is always noindex, so never list it
  // even when the indexability flag is forced on.
  if (!isApprovedProductionOrigin(BRAND.url)) return [];
  // The homepage is noindex, so it must never be listed in the sitemap.
  return PUBLIC_PATHS.filter((path) => path !== "/" && isPathIndexable(path));
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Re-check indexability at the output boundary: a path that is noindex for
  // any reason must never reach the XML, even if the candidate list changes.
  const hostIsIndexable = isApprovedProductionOrigin(BRAND.url);
  return getSitemapPaths()
    .filter((path) => hostIsIndexable && isPathIndexable(path))
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
    .filter((entry) => isApprovedProductionOrigin(entry.url));
}

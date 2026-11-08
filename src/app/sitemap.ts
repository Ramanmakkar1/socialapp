import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { PUBLIC_PATHS, META } from "@/lib/public-pages";

// Always-noindex pages (auth + app). PUBLIC_PATHS already excludes them, so this is
// a safety net: if one is ever added to PUBLIC_PATHS it must not leak into the sitemap.
const NOINDEX_PATHS = new Set(["/login", "/signup", "/data-deletion/status", "/app/review-guide"]);

// The single noindex check the sitemap filters on. A path is noindex when:
//  - the whole site is in staging (BRAND.indexable false -> root layout noindexes every page), or
//  - it is in the always-noindex safety-net set, or
//  - it lives under /app/ (app pages are never indexable).
// The sitemap must never list a noindex page, so this one predicate gates all of them.
const isNoindex = (path: string) =>
  !BRAND.indexable || NOINDEX_PATHS.has(path) || path.startsWith("/app/");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_PATHS
    .filter((path) => !isNoindex(path))
    .map((path) => ({
      url: `${BRAND.url}${path}`,
      lastModified,
      changeFrequency: META[path]?.changeFrequency ?? ("yearly" as const),
      priority: META[path]?.priority ?? 0.3,
    }));
}

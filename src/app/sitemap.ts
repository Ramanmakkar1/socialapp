import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { PUBLIC_PATHS, META } from "@/lib/public-pages";

// Always-noindex pages (auth + app). PUBLIC_PATHS already excludes them, so this is
// a safety net: if one is ever added to PUBLIC_PATHS it must not leak into the sitemap.
const NOINDEX_PATHS = new Set(["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/data-deletion/status", "/app/review-guide", "/admin"]);

// The single noindex check the sitemap filters on. A path is noindex when:
//  - the whole site is in staging (BRAND.indexable false -> root layout noindexes every page), or
//  - it is in the always-noindex safety-net set, or
//  - it lives under /app/ (app pages are never indexable).
// The sitemap must never list a noindex page, so this one predicate gates all of them.
const isNoindex = (path: string) =>
  !BRAND.indexable || NOINDEX_PATHS.has(path) || path.startsWith("/app/");

// Only indexable paths can become sitemap candidates. While staging is noindex
// this is empty, including for the home page on every host alias.
function getSitemapPaths(): string[] {
  return PUBLIC_PATHS.filter((path) => !isNoindex(path));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return getSitemapPaths().map((path) => ({
    url: `${BRAND.url}${path}`,
    lastModified,
    changeFrequency: META[path]?.changeFrequency ?? ("yearly" as const),
    priority: META[path]?.priority ?? 0.3,
  }));
}

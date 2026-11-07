import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { PUBLIC_PATHS, META } from "@/lib/public-pages";

// Always-noindex pages (auth + app). PUBLIC_PATHS already excludes them, so this is
// a safety net: if one is ever added to PUBLIC_PATHS it must not leak into the sitemap.
const NOINDEX_PATHS = new Set(["/login", "/signup", "/data-deletion/status", "/app/review-guide"]);

export default function sitemap(): MetadataRoute.Sitemap {
  // While BRAND.indexable is false the root layout applies robots noindex to every
  // page (staging), so the sitemap must be empty — no page, including the root, is listed.
  if (!BRAND.indexable) {
    return [];
  }
  const lastModified = new Date();
  return PUBLIC_PATHS
    .filter((path) => !NOINDEX_PATHS.has(path))
    .map((path) => ({
      url: `${BRAND.url}${path}`,
      lastModified,
      changeFrequency: META[path]?.changeFrequency ?? ("yearly" as const),
      priority: META[path]?.priority ?? 0.3,
    }));
}

import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { isPathIndexable } from "@/lib/indexability";
import { PUBLIC_PATHS, META, type PublicPath } from "@/lib/public-pages";

// Only indexable paths can become sitemap candidates. This uses the same
// isPathIndexable helper as the root layout robots meta, so a noindex page can
// never leak into the sitemap. While staging is noindex this is empty,
// including for the home page on every host alias.
function getSitemapPaths(): PublicPath[] {
  return PUBLIC_PATHS.filter((path) => isPathIndexable(path));
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

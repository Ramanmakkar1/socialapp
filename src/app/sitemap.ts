import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { isPathIndexable } from "@/lib/indexability";
import { PUBLIC_PATHS, META, type PublicPath } from "@/lib/public-pages";
import { GUIDES, guidePath } from "@/content/guides/registry";

// Only indexable paths can become sitemap candidates. This uses the same
// isPathIndexable helper as the root layout robots meta, so a noindex page can
// never leak into the sitemap. If BRAND.indexable is set to false this is empty,
// including for the home page on every host alias.
function getSitemapPaths(): PublicPath[] {
  return PUBLIC_PATHS.filter((path) => isPathIndexable(path));
}

const guideUpdated = new Map(GUIDES.map((g) => [guidePath(g.slug), g.updated]));
const latestGuide = GUIDES.map((g) => g.updated).sort().at(-1);

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapPaths().map((path) => {
    const lm = guideUpdated.get(path) ?? (path === "/guides" ? latestGuide : undefined);
    return {
      url: `${BRAND.url}${path}`,
      ...(lm ? { lastModified: lm } : {}),
      changeFrequency: META[path]?.changeFrequency ?? ("yearly" as const),
      priority: META[path]?.priority ?? 0.3,
    };
  });
}

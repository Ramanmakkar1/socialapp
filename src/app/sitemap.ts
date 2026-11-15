import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { isPathIndexable } from "@/lib/indexability";
import { PUBLIC_PATHS, META, type PublicPath } from "@/lib/public-pages";
import { GUIDES, guidePath } from "@/content/guides/registry";

// Evaluate indexability per request so a build never freezes the staging noindex.
export const dynamic = "force-dynamic";

// Only indexable paths are listed. An empty sitemap while staging is noindex is
// intended; public/sitemap.xsl explains it to anyone who opens the file.
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

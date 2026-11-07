import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { PUBLIC_PATHS, META } from "@/lib/public-pages";

// Paths whose page metadata sets robots index:false — must never appear in the sitemap.
const NOINDEX_PATHS = ["/login", "/signup", "/data-deletion/status", "/app/review-guide"];

export default function sitemap(): MetadataRoute.Sitemap {
  // Root layout applies robots noindex to every page when BRAND.indexable is false,
  // so a noindex site must have an empty sitemap.
  if (!BRAND.indexable) {
    return [];
  }
  const lastModified = new Date();
  return PUBLIC_PATHS
    .filter((path) => !NOINDEX_PATHS.includes(path))
    .map((path) => ({
      url: `${BRAND.url}${path}`,
      lastModified,
      changeFrequency: META[path]?.changeFrequency ?? ("yearly" as const),
      priority: META[path]?.priority ?? 0.3,
    }));
}

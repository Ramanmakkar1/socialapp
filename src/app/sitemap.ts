import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

const PUBLIC_PATHS = ["/", "/privacy", "/terms", "/data-deletion"];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!BRAND.indexable) {
    return [];
  }
  const lastModified = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${BRAND.url}${path}`,
    lastModified,
    changeFrequency: path === "/" ? ("weekly" as const) : ("yearly" as const),
    priority: path === "/" ? 1 : 0.3,
  }));
}

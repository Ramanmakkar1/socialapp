import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

const PUBLIC_PATHS = ["/", "/instagram-auto-dm", "/privacy", "/terms", "/data-deletion"];

const META: Record<string, { priority: number; changeFrequency: "weekly" | "yearly" }> = {
  "/": { priority: 1, changeFrequency: "weekly" },
  "/instagram-auto-dm": { priority: 0.8, changeFrequency: "weekly" },
  "/privacy": { priority: 0.3, changeFrequency: "yearly" },
  "/terms": { priority: 0.3, changeFrequency: "yearly" },
  "/data-deletion": { priority: 0.3, changeFrequency: "yearly" },
};

export default function sitemap(): MetadataRoute.Sitemap {
  if (!BRAND.indexable) {
    return [];
  }
  const lastModified = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${BRAND.url}${path}`,
    lastModified,
    changeFrequency: META[path]?.changeFrequency ?? ("yearly" as const),
    priority: META[path]?.priority ?? 0.3,
  }));
}

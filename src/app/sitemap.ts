import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

const PUBLIC_PATHS = [
  "/",
  "/instagram-auto-dm",
  "/instagram-auto-dm/templates",
  "/buffer-alternative",
  "/manychat-alternative",
  "/later-alternative",
  "/privacy",
  "/terms",
  "/data-deletion",
  "/tools/instagram-caption-counter",
  "/tools/instagram-line-break-generator",
  "/tools/instagram-image-size",
  "/tools/instagram-font-generator",
  "/tools/instagram-engagement-rate-calculator",
  "/tools",
];

const META: Record<string, { priority: number; changeFrequency: "weekly" | "yearly" }> = {
  "/": { priority: 1, changeFrequency: "weekly" },
  "/instagram-auto-dm": { priority: 0.8, changeFrequency: "weekly" },
  "/instagram-auto-dm/templates": { priority: 0.7, changeFrequency: "weekly" },
  "/buffer-alternative": { priority: 0.8, changeFrequency: "weekly" },
  "/manychat-alternative": { priority: 0.8, changeFrequency: "weekly" },
  "/later-alternative": { priority: 0.8, changeFrequency: "weekly" },
  "/privacy": { priority: 0.3, changeFrequency: "yearly" },
  "/terms": { priority: 0.3, changeFrequency: "yearly" },
  "/data-deletion": { priority: 0.3, changeFrequency: "yearly" },
  "/tools/instagram-caption-counter": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-line-break-generator": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-image-size": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-font-generator": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-engagement-rate-calculator": { priority: 0.7, changeFrequency: "weekly" },
  "/tools": { priority: 0.6, changeFrequency: "weekly" },
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

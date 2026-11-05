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
  "/tools/instagram-comment-keyword-tester",
  "/tools/instagram-hashtag-generator",
  "/tools/instagram-dm-link-generator",
  "/tools/instagram-line-break-generator",
  "/tools/instagram-image-size",
  "/tools/instagram-font-generator",
  "/tools/instagram-bio-generator",
  "/tools/instagram-engagement-rate-calculator",
  "/tools/instagram-post-preview",
  "/tools/instagram-utm-builder",
  "/tools",
  "/help",
  "/contact",
  "/help/getting-started",
  "/help/instagram-auto-dm-not-working",
  "/instagram-scheduler",
  "/pricing",
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
  "/tools/instagram-comment-keyword-tester": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-hashtag-generator": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-dm-link-generator": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-line-break-generator": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-image-size": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-font-generator": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-bio-generator": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-engagement-rate-calculator": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-post-preview": { priority: 0.7, changeFrequency: "weekly" },
  "/tools/instagram-utm-builder": { priority: 0.7, changeFrequency: "weekly" },
  "/tools": { priority: 0.6, changeFrequency: "weekly" },
  "/help": { priority: 0.7, changeFrequency: "weekly" },
  "/contact": { priority: 0.4, changeFrequency: "yearly" },
  "/help/getting-started": { priority: 0.7, changeFrequency: "weekly" },
  "/help/instagram-auto-dm-not-working": { priority: 0.6, changeFrequency: "weekly" },
  "/instagram-scheduler": { priority: 0.8, changeFrequency: "weekly" },
  "/pricing": { priority: 0.8, changeFrequency: "weekly" },
};

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

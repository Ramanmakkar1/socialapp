import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

/** Private areas: the signed-in app, the API and short-link redirects. */
const ROBOTS_DISALLOW = ["/app", "/app/", "/api/", "/l/"];

/**
 * Search and AI crawlers named explicitly so public pages stay open to them.
 * A crawler that matches its own group ignores the "*" group, so each group
 * repeats the same disallow list.
 */
const AI_AND_SEARCH_BOTS = [
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ROBOTS_DISALLOW },
      { userAgent: AI_AND_SEARCH_BOTS, allow: "/", disallow: ROBOTS_DISALLOW },
    ],
    ...(BRAND.indexable ? { sitemap: `${BRAND.url}/sitemap.xml` } : {}),
  };
}

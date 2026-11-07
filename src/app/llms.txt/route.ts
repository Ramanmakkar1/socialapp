import { BRAND } from "@/lib/brand";
import { PUBLIC_PATHS, PAGE_TITLES, PAGE_DESCRIPTIONS, PublicPath } from "@/lib/public-pages";

export async function GET() {
  // Return 404 if site is not indexable
  if (!BRAND.indexable) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const baseUrl = BRAND.url;

  let content = `# ${BRAND.name}

`;

  // Product summary (from landing page facts)
  content += `${BRAND.name} is a social media scheduler for Instagram with comment-to-DM automation, AI replies and lead capture. Plan a month of posts on one calendar, and send your link to everyone who comments a keyword within seconds. Free to start on the official Meta API.

`;

  // Free tools section
  content += `## Free tools

`;

  const toolsPaths: PublicPath[] = [
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
    "/tools/instagram-comment-picker",
    "/tools/instagram-safe-zone-checker",
    "/tools",
  ];

  for (const path of toolsPaths) {
    if (PUBLIC_PATHS.includes(path)) {
      const title = PAGE_TITLES[path] || path;
      const desc = PAGE_DESCRIPTIONS[path] || "";
      content += `- [${title}](${baseUrl}${path}): ${desc}\n`;
    }
  }

  // Comparisons section
  content += `
## Comparisons

`;

  const comparisonPaths: PublicPath[] = [
    "/buffer-alternative",
    "/manychat-alternative",
    "/later-alternative",
    "/sprout-social-alternative",
    "/hootsuite-alternative",
  ];

  for (const path of comparisonPaths) {
    if (PUBLIC_PATHS.includes(path)) {
      const title = PAGE_TITLES[path] || path;
      const desc = PAGE_DESCRIPTIONS[path] || "";
      content += `- [${title}](${baseUrl}${path}): ${desc}\n`;
    }
  }

  // Guides section
  content += `
## Guides

`;

  const guidePaths: PublicPath[] = [
    "/help/getting-started",
    "/help/instagram-auto-dm-not-working",
    "/instagram-scheduler",
    "/instagram-auto-dm",
    "/instagram-auto-dm/templates",
    "/pricing",
    "/contact",
    "/privacy",
    "/terms",
    "/data-deletion",
  ];

  for (const path of guidePaths) {
    if (PUBLIC_PATHS.includes(path)) {
      const title = PAGE_TITLES[path] || path;
      const desc = PAGE_DESCRIPTIONS[path] || "";
      content += `- [${title}](${baseUrl}${path}): ${desc}\n`;
    }
  }

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
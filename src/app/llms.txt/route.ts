import { BRAND } from "@/lib/brand";
import { PUBLIC_PATHS, PAGE_TITLES, PAGE_DESCRIPTIONS, PublicPath } from "@/lib/public-pages";

export const dynamic = "force-static";

export function GET() {
  // Served only when the site is indexable; staging/noindex returns 404.
  if (!BRAND.indexable) {
    return new Response("Not found", { status: 404 });
  }

  const baseUrl = BRAND.url;

  // Build a link line from a page's own metadata, using the brand constant
  // (never a hard-coded brand name) in the body text.
  const line = (path: PublicPath) => {
    const title = PAGE_TITLES[path];
    const desc = PAGE_DESCRIPTIONS[path].replace(/Poskoo/g, BRAND.name);
    return `- [${title}](${baseUrl}${path}): ${desc}`;
  };

  let content = `# ${BRAND.name}\n\n`;
  content += `> ${BRAND.description}\n\n`;
  content +=
    `${BRAND.name} uses the official Meta Instagram API and never asks for your password. ` +
    `A Free plan is available. Built by ${BRAND.company}. Support: ${BRAND.supportEmail}.\n\n`;

  content += `## Product\n\n`;
  const productPaths: PublicPath[] = [
    "/",
    "/instagram-scheduler",
    "/instagram-auto-dm",
    "/instagram-auto-dm/templates",
    "/pricing",
  ];
  for (const path of productPaths) {
    if (PUBLIC_PATHS.includes(path)) content += `${line(path)}\n`;
  }
  content += "\n";

  content += `## Free Instagram tools\n\n`;
  const toolPaths: PublicPath[] = [
    "/tools/instagram-caption-counter",
    "/tools/instagram-comment-keyword-tester",
    "/tools/instagram-hashtag-generator",
    "/tools/instagram-dm-link-generator",
    "/tools/instagram-line-break-generator",
    "/tools/instagram-image-size",
    "/tools/instagram-font-generator",
    "/tools/instagram-bio-generator",
    "/tools/instagram-username-generator",
    "/tools/instagram-caption-generator",
    "/tools/instagram-engagement-rate-calculator",
    "/tools/instagram-post-preview",
    "/tools/instagram-utm-builder",
    "/tools/instagram-comment-picker",
    "/tools/instagram-safe-zone-checker",
    "/tools/instagram-highlight-cover-maker",
    "/tools/instagram-post-ideas-generator",
  ];
  for (const path of toolPaths) {
    if (PUBLIC_PATHS.includes(path)) content += `${line(path)}\n`;
  }
  content += "\n";

  content += `## Comparisons\n\n`;
  const comparisonPaths: PublicPath[] = [
    "/buffer-alternative",
    "/publer-alternative",
    "/later-alternative",
    "/planoly-alternative",
    "/sprout-social-alternative",
    "/metricool-alternative",
    "/manychat-alternative",
    "/hootsuite-alternative",
    "/meta-business-suite-alternative",
  ];
  for (const path of comparisonPaths) {
    if (PUBLIC_PATHS.includes(path)) content += `${line(path)}\n`;
  }
  content += "\n";

  content += `## Help\n\n`;
  const helpPaths: PublicPath[] = [
    "/help",
    "/help/getting-started",
    "/help/instagram-auto-dm-not-working",
    "/help/schedule-instagram-stories",
    "/contact",
    "/privacy",
    "/terms",
  ];
  for (const path of helpPaths) {
    if (PUBLIC_PATHS.includes(path)) content += `${line(path)}\n`;
  }

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

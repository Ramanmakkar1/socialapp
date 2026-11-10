import { BRAND } from "@/lib/brand";
import {
  META,
  PAGE_DESCRIPTIONS,
  PAGE_TITLES,
  PUBLIC_PATHS,
} from "@/lib/public-pages";

const NOINDEX_PATHS = new Set(["/login", "/signup", "/data-deletion/status", "/app/review-guide"]);

const isNoindex = (path: string) =>
  !BRAND.indexable || NOINDEX_PATHS.has(path) || path.startsWith("/app/");

export async function GET() {
  if (!BRAND.indexable) {
    return new Response("Not found", { status: 404 });
  }

  const pageLines: string[] = [];
  for (const path of PUBLIC_PATHS) {
    if (isNoindex(path) || !META[path]) continue;

    const title = PAGE_TITLES[path] || path;
    const description = PAGE_DESCRIPTIONS[path];
    if (!description) continue;

    pageLines.push(`- [${title}](${BRAND.url}${path}): ${description}`);
  }

  const body = [
    `# ${BRAND.name}`,
    "",
    `> ${BRAND.description}`,
    "",
    "## What it does",
    "",
    "- Schedule posts for Instagram, Facebook Pages and Threads.",
    "- Automate Instagram comment-to-DM conversations.",
    "- Create captions with AI.",
    "- Capture leads.",
    "",
    "## Pages",
    "",
    ...pageLines,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

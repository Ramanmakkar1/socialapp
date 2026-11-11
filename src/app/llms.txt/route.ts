import { BRAND } from "@/lib/brand";
import {
  META,
  PAGE_DESCRIPTIONS,
  PAGE_TITLES,
  PUBLIC_PATHS,
} from "@/lib/public-pages";
import { networkAvailability } from "@/lib/networks/registry";

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

  // Only networks that can actually be connected on this server are listed as working.
  const nets = networkAvailability();
  const keyed = ([["tiktok", "TikTok"], ["linkedin", "LinkedIn"], ["pinterest", "Pinterest"], ["x", "X"], ["gbp", "Google Business Profile"]] as const);
  const live = ["Instagram", "Facebook Pages", "Threads", "YouTube (videos and Shorts)", "Bluesky", "Mastodon", ...keyed.filter(([id]) => nets[id]).map(([, l]) => l)];
  const soon = [...keyed.filter(([id]) => !nets[id]).map(([, l]) => l), "WhatsApp", "Messenger"];

  const body = [
    `# ${BRAND.name}`,
    "",
    `> ${BRAND.description}`,
    "",
    "## What it does",
    "",
    `- Schedule posts for ${live.slice(0, -1).join(", ")} and ${live[live.length - 1]}.`,
    "- Automate Instagram comment-to-DM, Story-reply and DM-keyword conversations (Instagram only).",
    "- Draft captions and DM message ideas with AI.",
    "- Capture leads: ask for an email in the DM before the link is sent.",
    "- Lead magnets: hand out a free file or link after the email gate.",
    "- Digital products with Stripe checkout (payments switching on soon).",
    "- Refer and earn: +500 bonus auto-DMs a month for each referred user who connects an account.",
    "",
    "## Not available yet",
    "",
    "- AI replies to DMs: coming soon.",
    `- ${soon.slice(0, -1).join(", ")} and ${soon[soon.length - 1]}: coming soon.`,
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

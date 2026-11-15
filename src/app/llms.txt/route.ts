import { BRAND } from "@/lib/brand";
import { isPathIndexable } from "@/lib/indexability";
import {
  META,
  PAGE_DESCRIPTIONS,
  PAGE_TITLES,
  PUBLIC_PATHS,
} from "@/lib/public-pages";
import { getPlatformCopy, listText } from "@/lib/platform-support";
import { featureReadiness, planReadiness } from "@/lib/featureReadiness";
import { PLANS } from "@/lib/plans";

const isNoindex = (path: string) => !isPathIndexable(path);

/** Page groups, matched in order. New pages (help, tools, guides) fall into a group by their path. */
const GROUPS: { heading: string; match: (path: string) => boolean }[] = [
  { heading: "Product", match: (p) => ["/", "/features", "/pricing", "/developers", "/contact", "/social-media-scheduler-for-small-business"].includes(p) || p.startsWith("/instagram-auto-dm") || ["/instagram-dm-automation", "/instagram-link-in-bio", "/instagram-content-planner"].includes(p) },
  { heading: "Schedulers", match: (p) => /-scheduler(\/|$)/.test(p) || p === "/social-media-scheduler-comparison" },
  { heading: "Free tools", match: (p) => p === "/tools" || p.startsWith("/tools/") },
  { heading: "Guides", match: (p) => p === "/guides" || p.startsWith("/guides/") },
  { heading: "Help", match: (p) => p === "/help" || p.startsWith("/help/") },
  { heading: "Alternatives", match: (p) => p.endsWith("-alternative") },
  // "Optional" is the llms.txt convention for links a model can skip when context is short.
  { heading: "Optional", match: () => true },
];

export async function GET() {
  if (!BRAND.indexable) {
    return new Response("Not found", { status: 404 });
  }

  const grouped = new Map<string, string[]>(GROUPS.map((g) => [g.heading, []]));
  for (const path of PUBLIC_PATHS) {
    if (isNoindex(path) || !META[path]) continue;
    const title = PAGE_TITLES[path] || path;
    const description = PAGE_DESCRIPTIONS[path];
    if (!description) continue;
    const heading = GROUPS.find((g) => g.match(path))!.heading;
    grouped.get(heading)!.push(`- [${title}](${BRAND.url}${path === "/" ? "/" : path}): ${description}`);
  }
  const pageSections = GROUPS.flatMap(({ heading }) => {
    const lines = grouped.get(heading)!;
    return lines.length ? [`## ${heading}`, "", ...lines, ""] : [];
  });

  // Only networks that can publish on this server today count as live (keys + platform approvals,
  // src/lib/platform-support.ts); the rest carry "awaiting approval" / "not available yet".
  const platforms = getPlatformCopy();
  const awaiting = platforms.awaiting;
  const soon = [...platforms.soon, "WhatsApp", "Messenger"];
  const list = listText;

  const { paidPlans, ai } = planReadiness();
  const cardPayments = featureReadiness("card_payments", process.env).ready;
  const aiReplies = featureReadiness("ai_replies", process.env).ready;
  const planLines = PLANS.map((p) => {
    const highlights = p.items.slice(0, 3).map((i) => i.text).join(", ");
    const price = p.price === "$0" ? "free forever" : `${p.price} USD ${p.per.replace("/ ", "per ")}${p.yearly ? ` (${p.yearly})` : ""}`;
    const status = p.price !== "$0" && !paidPlans ? " Launching soon." : "";
    return `- ${p.name}: ${price}. ${highlights}.${status}`;
  });

  const body = [
    `# ${BRAND.name}`,
    "",
    `> ${BRAND.description}`,
    "",
    "## About",
    "",
    `- ${BRAND.name} is a social media scheduler and Instagram comment-to-DM automation tool made by ${BRAND.company}.`,
    `- Official website: ${BRAND.url}`,
    `- Tagline: ${BRAND.tagline}`,
    `- Support: ${BRAND.supportEmail} or ${BRAND.url}/contact`,
    `- Plans and the free plan: ${BRAND.url}/pricing`,
    `- Free tools (character counters, caption, hashtag and image-size tools): ${BRAND.url}/tools`,
    `- Help center: ${BRAND.url}/help`,
    "",
    `${BRAND.name} is a web app for creators and small businesses. It schedules and auto-publishes social posts through each network's official API, and it sends an automatic Instagram DM to everyone who comments a keyword. It is made by ${BRAND.company}. Support: ${BRAND.supportEmail}.`,
    "",
    "## What it does",
    "",
    `- Schedule and auto-publish posts to ${platforms.liveCountText}:`,
    ...(platforms.live.social.length ? [`  - Social: ${list(platforms.live.social)}.`] : []),
    ...(platforms.live.chat.length ? [`  - Chat: ${list(platforms.live.chat)}.`] : []),
    ...(platforms.live.blogs.length ? [`  - Blogs, newsletters and self-hosted servers: ${list(platforms.live.blogs)}.`] : []),
    ...(awaiting.length ? [`- ${list(awaiting)}: publishing is built and awaiting the platform's API approval.`] : []),
    ...(platforms.remindersReady ? ["- Instagram personal accounts and Facebook Groups work as reminders: Poskoo e-mails the post at the scheduled time for the owner to share."] : []),
    "- Automate Instagram comment-to-DM, Story-reply and DM-keyword conversations (auto-DM works on Instagram only).",
    ...(ai ? ["- Draft captions and DM message ideas with AI, tailor a caption per network, and draft a whole campaign from a brief."] : []),
    "- Capture leads: ask for an email in the DM before the link is sent.",
    "- Lead magnets: hand out a free file or link after the email gate.",
    "- Link-in-bio page with your links.",
    cardPayments
      ? "- Sell digital products with Stripe card checkout, or direct UPI payments to the seller for sellers in India."
      : "- Sell digital products: direct UPI payments to the seller work today for sellers in India; card checkout for sellers is not available yet.",
    "- Refer and earn: +500 bonus auto-DMs a month for each referred user who connects an account.",
    "- Free browser tools (caption counters, hashtag and bio generators, image size guides) with no sign-up.",
    "",
    "## AI assistants (MCP)",
    "",
    `- MCP server (Streamable HTTP): ${BRAND.url}/api/mcp. Authenticate with a Poskoo API key as a Bearer token; setup guide: ${BRAND.url}/developers`,
    `- Tools: list_channels, list_posts, create_post (any connected channel, up to 10 media links, per-network captions), update_post, delete_post, get_post_status, add_idea, list_contacts, create_dm_rule, ${ai ? "create_campaign_from_brief (AI drafts a whole campaign from a brief), " : ""}get_analytics_summary.`,
    "- API keys are draft-only by default: the assistant creates drafts and paused Auto-DMs that the account owner approves. Keys with \"Allow publishing\" may schedule posts.",
    "",
    "## Plans (USD)",
    "",
    ...planLines,
    "- Every account starts on Free; no credit card is needed to start.",
    "",
    "## Not available yet",
    "",
    ...(aiReplies ? [] : ["- AI replies to DMs: not available yet."]),
    `- ${list(soon)}: not available yet.`,
    "",
    ...pageSections,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

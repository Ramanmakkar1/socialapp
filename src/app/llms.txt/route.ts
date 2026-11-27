import { APPROVED_PRODUCTION_URL, BRAND } from "@/lib/brand";
import { isPathIndexable, isSiteIndexable } from "@/lib/indexability";
import {
  META,
  PAGE_DESCRIPTIONS,
  PAGE_TITLES,
  PUBLIC_PATHS,
} from "@/lib/public-pages";
import { getPlatformCopy, listText } from "@/lib/platform-support";
import { featureReadiness, planReadiness } from "@/lib/featureReadiness";
import { runtimeEnv } from "@/lib/featureReadinessNow";
import { PLANS } from "@/lib/plans";

// On production, honour per-page noindex. On staging the whole site is noindex,
// but public pages still belong in llms.txt; only private paths are skipped.
const isNoindex = (path: string) => isSiteIndexable() && !isPathIndexable(path);

// llms.txt always points at the public production origin, even when served from
// a staging host, so models never pick up a staging URL.
const SITE_URL = APPROVED_PRODUCTION_URL;

// List every public page, including the legal pages, so AI answers can cite the right one.
const LINK_PATHS = new Set(PUBLIC_PATHS);

// Live descriptions for scheduler and help pages whose network is not live yet.
// Text is copied verbatim from each page's `description` const (or metadata description).
// Used in the PUBLIC_PATHS loop only when the matching platform catalog entry is live.
const LIVE_DESCRIPTIONS: Partial<Record<string, { id: string; text: string }>> = {
  "/tiktok-scheduler": {
    id: "tiktok",
    text: "Schedule TikTok videos and photo posts on one calendar and publish them automatically through TikTok's official API. Plan ahead and post on time.",
  },
  "/pinterest-scheduler": {
    id: "pinterest",
    text: "Schedule Pinterest Pins to any board with the official API. Add a title and destination link, upload a JPG or PNG image, and choose the publishing time.",
  },
  "/x-scheduler": {
    id: "x",
    text: "Poskoo schedules posts to X through X's official API: connect your account, write the post, add up to 4 images or one video, and pick a time.",
  },
  "/google-business-profile-scheduler": {
    id: "gbp",
    text: "Schedule Google Business Profile posts, offers and events to your locations with the official API. Add a photo and a button like Book or Call. Free plan.",
  },
  "/help/schedule-tiktok-posts": {
    id: "tiktok",
    text: "Step-by-step help for scheduling TikTok videos in Poskoo: connect TikTok with its login, upload a vertical video, set privacy, pick a time and publish.",
  },
  "/help/schedule-x-posts": {
    id: "x",
    text: "Step-by-step help for scheduling X (Twitter) posts in Poskoo: connect X, write the post, add images or one video, pick a time and Poskoo publishes it.",
  },
  "/help/schedule-pinterest-posts": {
    id: "pinterest",
    text: "Step-by-step help for scheduling Pinterest Pins in Poskoo: connect Pinterest, pick a board, add an image, title and link, then choose a time.",
  },
};

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
  const indexable = isSiteIndexable();

  const platforms = getPlatformCopy();
  const smsLive = ["tiktok", "pinterest", "x"].every((id) => platforms.catalog.find((e) => e.id === id)?.live);

  const grouped = new Map<string, string[]>(GROUPS.map((g) => [g.heading, []]));
  for (const path of PUBLIC_PATHS) {
    if (!LINK_PATHS.has(path) || isNoindex(path) || !META[path]) continue;
    const title = PAGE_TITLES[path] || path;
    const liveDesc = LIVE_DESCRIPTIONS[path];
    const description =
      path === "/social-media-scheduler" && !smsLive
        ? "Free social media scheduler for Instagram, Facebook, Threads, LinkedIn, YouTube, Bluesky and Mastodon on one calendar. Official APIs, no credit card."
        : liveDesc && platforms.catalog.find((e) => e.id === liveDesc.id)?.live
          ? liveDesc.text
          : PAGE_DESCRIPTIONS[path];
    if (!description) continue;
    const heading = GROUPS.find((g) => g.match(path))!.heading;
    grouped.get(heading)!.push(`- [${title}](${SITE_URL}${path === "/" ? "/" : path}): ${description}`);
  }
  const pageSections = GROUPS.flatMap(({ heading }) => {
    const lines = grouped.get(heading)!;
    return lines.length ? [`## ${heading}`, "", ...lines, ""] : [];
  });

  // Only networks that can publish on this server today count as live (keys + platform approvals,
  // src/lib/platform-support.ts); the rest carry "awaiting approval" / "not available yet".
  const awaiting = platforms.awaiting;
  const soon = [...platforms.soon, "WhatsApp", "Messenger"];
  const list = listText;

  const env = await runtimeEnv();
  const { paidPlans, ai } = planReadiness(env);
  const cardPayments = featureReadiness("card_payments", env).ready;
  const aiReplies = featureReadiness("ai_replies", env).ready;
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
    `- ${BRAND.name} is a social media scheduler with ${aiReplies ? "Instagram comment-to-DM automation, AI replies and lead capture" : "Instagram comment-to-DM automation and lead capture"} for creators and small businesses, made by ${BRAND.company}.`,
    `- Official website: ${SITE_URL}`,
    `- Tagline: ${BRAND.tagline}`,
    `- Support: ${BRAND.supportEmail} or ${SITE_URL}/contact`,
    `- Plans and the free plan: ${SITE_URL}/pricing`,
    `- Free tools (character counters, caption, hashtag and image-size tools): ${SITE_URL}/tools`,
    `- Help center: ${SITE_URL}/help`,
    "",
    `${BRAND.name} is a web app for creators and small businesses. It schedules and auto-publishes social posts through each network's official API, and it sends an automatic Instagram DM to everyone who comments a keyword. It is made by ${BRAND.company}. Support: ${BRAND.supportEmail}.`,
    "",
    "## Key pages",
    "",
    `- Features: ${SITE_URL}/features`,
    `- Pricing and free plan: ${SITE_URL}/pricing`,
    `- Free tools: ${SITE_URL}/tools`,
    `- Social media scheduler: ${SITE_URL}/social-media-scheduler`,
    `- Instagram scheduler: ${SITE_URL}/instagram-scheduler`,
    `- Guides: ${SITE_URL}/guides`,
    `- Help center: ${SITE_URL}/help`,
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
    `- MCP server (Streamable HTTP): ${SITE_URL}/api/mcp. Authenticate with a Poskoo API key as a Bearer token; setup guide: ${SITE_URL}/developers`,
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
      // Served on staging too, but never indexable there; site-wide noindex is unchanged.
      ...(indexable ? {} : { "X-Robots-Tag": "noindex" }),
      "Cache-Control": "public, max-age=3600",
    },
  });
}

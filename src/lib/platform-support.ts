// Server only: the "which networks work today" copy for marketing pages, llms.txt and FAQs.
// Derived from the real channel registry (src/lib/platforms.ts ids, src/lib/networks/tokenNetworks.ts,
// src/lib/channelStatus.ts) and this server's env, so the list and the count grow on their own as
// keys and platform approvals land. Fails closed: a missing key (e.g. at `next build` without
// secrets) never counts a network as live; the 10-minute revalidate picks up the runtime env.
import { CHANNEL_STATUS_CONFIG, channelStatus, envKey, type ComingChannel } from "@/lib/channelStatus";
import { reminderChannelStatus } from "@/lib/featureReadiness";
import { isIgConfigured } from "@/lib/instagram";
import { isMetaLoginConfigured } from "@/lib/metaLogin";
import { isFarcasterConfigured, isPlurkConfigured, isTumblrConfigured, isTwitchConfigured, isWpcomConfigured } from "@/lib/networks/apps";
import { isGbpConfigured } from "@/lib/networks/gbp";
import { isLinkedInConfigured, linkedinConfig } from "@/lib/networks/linkedin";
import { isPinterestConfigured } from "@/lib/networks/pinterest";
import { isTikTokConfigured } from "@/lib/networks/tiktok";
import { TOKEN_NETWORK_IDS, TOKEN_NETWORKS, type TokenNetworkId } from "@/lib/networks/tokenNetworks";
import { isXConfigured } from "@/lib/networks/x";
import { isThreadsConfigured } from "@/lib/threadsAuth";
import { isYouTubeConfigured } from "@/lib/youtubeAuth";

type Env = Record<string, string | undefined>;

export type PlatformGroup = "social" | "chat" | "blogs";
export type PlatformEntry = { id: string; label: string; group: PlatformGroup; live: boolean; awaiting: boolean };

type CatalogItem = { id: string; label: string; group: PlatformGroup; coming?: ComingChannel };

const TOKEN_GROUP: Record<TokenNetworkId, PlatformGroup> = {
  telegram: "chat",
  discord: "chat",
  slack: "chat",
  mattermost: "chat",
  matrix: "chat",
  misskey: "blogs",
  pixelfed: "blogs",
  peertube: "blogs",
  devto: "blogs",
  hashnode: "blogs",
  ghost: "blogs",
  wordpress: "blogs",
  discourse: "blogs",
  listmonk: "blogs",
  nostr: "blogs",
};

/** Every publishing network, in the order the copy lists them. Reminder channels are not here. */
export const PLATFORM_CATALOG: CatalogItem[] = [
  { id: "instagram", label: "Instagram", group: "social" },
  { id: "facebook", label: "Facebook Pages", group: "social" },
  { id: "threads", label: "Threads", group: "social" },
  { id: "youtube", label: "YouTube", group: "social" },
  { id: "linkedin", label: "LinkedIn profiles", group: "social" },
  { id: "linkedin_pages", label: "LinkedIn Pages", group: "social", coming: "linkedin_pages" },
  { id: "tiktok", label: "TikTok", group: "social", coming: "tiktok" },
  { id: "pinterest", label: "Pinterest", group: "social", coming: "pinterest" },
  { id: "x", label: "X", group: "social", coming: "x" },
  { id: "gbp", label: "Google Business Profile", group: "social", coming: "gbp" },
  { id: "bluesky", label: "Bluesky", group: "social" },
  { id: "mastodon", label: "Mastodon", group: "social" },
  { id: "tumblr", label: "Tumblr", group: "social", coming: "tumblr" },
  { id: "farcaster", label: "Farcaster", group: "social", coming: "farcaster" },
  { id: "plurk", label: "Plurk", group: "social", coming: "plurk" },
  ...TOKEN_NETWORK_IDS.filter((id) => TOKEN_GROUP[id] === "chat").map((id) => ({ id, label: TOKEN_NETWORKS[id].label, group: "chat" as const })),
  { id: "twitch", label: "Twitch chat", group: "chat", coming: "twitch" },
  ...TOKEN_NETWORK_IDS.filter((id) => TOKEN_GROUP[id] === "blogs").map((id) => ({ id, label: TOKEN_NETWORKS[id].label, group: "blogs" as const })),
  { id: "wpcom", label: "WordPress.com", group: "blogs", coming: "wpcom" },
];

/**
 * Pure: which catalog networks are live, given which have their server keys and the env overrides.
 * A channel that needs a platform review (whenOff "awaiting": TikTok, Pinterest, Google, LinkedIn
 * Pages) only counts once CHANNEL_STATUS_<ID>=ready says the approval landed: keys alone can mean a
 * sandbox / unaudited app.
 */
export function buildPlatformCatalog(configured: Record<string, boolean>, env: Env): PlatformEntry[] {
  return PLATFORM_CATALOG.map(({ id, label, group, coming }) => {
    const keys = configured[id] === true;
    if (!coming) return { id, label, group, live: keys, awaiting: false };
    const override = env[envKey(coming)];
    const status = channelStatus(coming, keys, override);
    const needsApproval = CHANNEL_STATUS_CONFIG[coming].whenOff === "awaiting";
    const live = status.state === "ready" && (!needsApproval || (override ?? "").trim().toLowerCase() === "ready");
    return { id, label, group, live, awaiting: !live && (status.state === "awaiting" || (needsApproval && status.state === "ready")) };
  });
}

/** Which networks have their server keys on this server (token networks need none). */
export function configuredNetworks(): Record<string, boolean> {
  const meta = isMetaLoginConfigured();
  const linkedin = isLinkedInConfigured();
  const out: Record<string, boolean> = {
    instagram: meta || isIgConfigured(),
    facebook: meta,
    threads: isThreadsConfigured(),
    youtube: isYouTubeConfigured(),
    linkedin,
    linkedin_pages: linkedin && linkedinConfig().companyPages,
    tiktok: isTikTokConfigured(),
    pinterest: isPinterestConfigured(),
    x: isXConfigured(),
    gbp: isGbpConfigured(),
    bluesky: true,
    mastodon: true,
    tumblr: isTumblrConfigured(),
    farcaster: isFarcasterConfigured(),
    plurk: isPlurkConfigured(),
    twitch: isTwitchConfigured(),
    wpcom: isWpcomConfigured(),
  };
  for (const id of TOKEN_NETWORK_IDS) out[id] = true;
  return out;
}

/** "A, B and C". */
export function listText(items: readonly string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export type PlatformCopy = {
  catalog: PlatformEntry[];
  liveCount: number;
  /** "21 platforms". */
  liveCountText: string;
  /** Live networks by group, labels only. */
  live: Record<PlatformGroup, string[]>;
  awaiting: string[];
  soon: string[];
  remindersReady: boolean;
  /** Short inline list for sentences: "Instagram, Facebook Pages, ... and 15 more networks". */
  liveText: string;
  /** Full FAQ answer for "Which platforms are supported?". */
  answer: string;
};

export function platformCopy(catalog: PlatformEntry[], remindersReady: boolean): PlatformCopy {
  const live = { social: [] as string[], chat: [] as string[], blogs: [] as string[] };
  for (const e of catalog) if (e.live) live[e.group].push(e.label);
  const liveCount = live.social.length + live.chat.length + live.blogs.length;
  const awaiting = catalog.filter((e) => e.awaiting).map((e) => e.label);
  const soon = catalog.filter((e) => !e.live && !e.awaiting).map((e) => e.label);
  const liveCountText = `${liveCount} ${liveCount === 1 ? "platform" : "platforms"}`;
  const others = liveCount - live.social.length;
  const liveText = others > 0 ? `${live.social.join(", ")} and ${others} more ${others === 1 ? "network" : "networks"}` : listText(live.social);
  const parts = [
    `Scheduling works today on ${liveCountText}`,
  ];
  const groups = [
    live.social.length ? `${listText(live.social)} for social` : "",
    live.chat.length ? `${listText(live.chat)} for chat` : "",
    live.blogs.length ? `${listText(live.blogs)} for blogs, newsletters and self-hosted servers` : "",
  ].filter(Boolean);
  const answer = [
    `${parts[0]}${groups.length ? `: ${groups.join("; ")}` : ""}, plus Instagram auto-DMs.`,
    awaiting.length ? `${listText(awaiting)} ${awaiting.length === 1 ? "is" : "are"} built and waiting on platform approval.` : "",
    soon.length ? `${listText(soon)} ${soon.length === 1 ? "is" : "are"} coming soon.` : "",
    remindersReady ? "Instagram personal accounts and Facebook Groups work as reminders: Poskoo e-mails you the post at the scheduled time to share yourself." : "",
  ]
    .filter(Boolean)
    .join(" ");
  return { catalog, liveCount, liveCountText, live, awaiting, soon, remindersReady, liveText, answer };
}

/** This server's platform copy (reads env; call per render, it is cheap). */
export function getPlatformCopy(env: Env = process.env): PlatformCopy {
  return platformCopy(buildPlatformCatalog(configuredNetworks(), env), reminderChannelStatus("Reminders", env).state === "ready");
}

// Module constants for pages that build their copy at import time. Pages revalidate every 10
// minutes and the server process evaluates this with the runtime env.
const COPY = getPlatformCopy();
export const LIVE_PLATFORMS_TEXT = COPY.liveText;
export const LIVE_PLATFORM_COUNT = COPY.liveCount;
export const LIVE_PLATFORM_COUNT_TEXT = COPY.liveCountText;
export const PLATFORMS_ANSWER = COPY.answer;

// Pure (client-safe): networks connected with a token, key, webhook or self-hosted server address
// instead of an OAuth app that needs platform review. One spec per network drives the Connect
// dialog's form, the composer label / limit and the save-time media rule. The server side lives in
// src/lib/networks/tokenConnect.ts (verify + store) and the per-network publish files.
import type { MediaItem } from "@/lib/networks/common";

export const TOKEN_NETWORK_IDS = [
  "telegram",
  "discord",
  "slack",
  "mattermost",
  "matrix",
  "misskey",
  "pixelfed",
  "peertube",
  "devto",
  "hashnode",
  "ghost",
  "wordpress",
  "discourse",
  "listmonk",
  "nostr",
  // 2026-11-24, ported from Postiz (AGPL-3.0): src/lib/networks/moreTokens.ts
  "medium",
  "lemmy",
  "moltbook",
] as const;

export type TokenNetworkId = (typeof TOKEN_NETWORK_IDS)[number];

export function isTokenNetwork(value: unknown): value is TokenNetworkId {
  return typeof value === "string" && (TOKEN_NETWORK_IDS as readonly string[]).includes(value);
}

export type TokenField = {
  name: string;
  label: string;
  placeholder?: string;
  /** password = a secret (never echoed back), url = server / webhook address. */
  type?: "text" | "password" | "url";
  optional?: boolean;
};

/** What a post to this network may carry. */
export type TokenMediaRule = "none" | "images" | "images_required" | "any" | "one_video";

export type TokenNetworkSpec = {
  label: string;
  /** Card subtitle in the Connect grid. */
  sub: string;
  color: string;
  captionMax: number;
  fields: TokenField[];
  /** One plain-words line on where to get the token. */
  help: string;
  helpUrl?: string;
  media: TokenMediaRule;
  maxMedia: number;
  /** Blogs / newsletters / forums: the first line of the caption becomes the title. */
  titled?: boolean;
  /** Shown above the form in a warning box (e.g. "use a dedicated key"). */
  warning?: string;
};

const SERVER = (placeholder: string, label = "Server address"): TokenField => ({ name: "instance", label, placeholder, type: "url" });

export const TOKEN_NETWORKS: Record<TokenNetworkId, TokenNetworkSpec> = {
  telegram: {
    label: "Telegram",
    sub: "Channel or Group",
    color: "#229ed9",
    captionMax: 4096,
    fields: [
      { name: "token", label: "Bot token", placeholder: "123456789:AA…", type: "password" },
      { name: "chat", label: "Channel or group", placeholder: "@yourchannel or -1001234567890" },
    ],
    help: "Create a bot with @BotFather, copy its token, and add the bot to your channel or group as an admin that can post.",
    helpUrl: "https://core.telegram.org/bots/features#botfather",
    media: "any",
    maxMedia: 10,
  },
  discord: {
    label: "Discord",
    sub: "Channel (webhook)",
    color: "#5865f2",
    captionMax: 2000,
    fields: [{ name: "webhook", label: "Webhook URL", placeholder: "https://discord.com/api/webhooks/…", type: "password" }],
    help: "In Discord: Channel settings → Integrations → Webhooks → New Webhook → Copy Webhook URL.",
    helpUrl: "https://support.discord.com/hc/en-us/articles/228383668",
    media: "any",
    maxMedia: 10,
  },
  slack: {
    label: "Slack",
    sub: "Channel (webhook)",
    color: "#4a154b",
    captionMax: 3000,
    fields: [
      { name: "webhook", label: "Incoming webhook URL", placeholder: "https://hooks.slack.com/services/…", type: "password" },
      { name: "name", label: "Channel name", placeholder: "#marketing", optional: true },
    ],
    help: "Create a Slack app in your workspace, turn on Incoming Webhooks and add one for the channel. Slack webhooks post text only.",
    helpUrl: "https://api.slack.com/messaging/webhooks",
    media: "none",
    maxMedia: 0,
  },
  mattermost: {
    label: "Mattermost",
    sub: "Channel (webhook)",
    color: "#1e325c",
    captionMax: 16383,
    fields: [
      { name: "webhook", label: "Incoming webhook URL", placeholder: "https://chat.example.com/hooks/…", type: "password" },
      { name: "name", label: "Channel name", placeholder: "town-square", optional: true },
    ],
    help: "In Mattermost: Product menu → Integrations → Incoming Webhooks → Add. Webhooks post text only.",
    helpUrl: "https://developers.mattermost.com/integrate/webhooks/incoming/",
    media: "none",
    maxMedia: 0,
  },
  matrix: {
    label: "Matrix",
    sub: "Room",
    color: "#0dbd8b",
    captionMax: 30000,
    fields: [
      SERVER("matrix.org", "Homeserver"),
      { name: "token", label: "Access token", placeholder: "syt_…", type: "password" },
      { name: "room", label: "Room", placeholder: "#room:matrix.org or !roomid:matrix.org" },
    ],
    help: "Use a separate bot account if you can. In Element: Settings → Help & About → Access token. The account must be able to post in the room.",
    media: "any",
    maxMedia: 10,
  },
  misskey: {
    label: "Misskey",
    sub: "Profile",
    color: "#86b300",
    captionMax: 3000,
    fields: [SERVER("misskey.io"), { name: "token", label: "Access token", type: "password" }],
    help: "In Misskey: Settings → API → Generate access token, with “Compose or delete notes” and “Access your Drive files”.",
    media: "any",
    maxMedia: 16,
  },
  pixelfed: {
    label: "Pixelfed",
    sub: "Profile",
    color: "#6366f1",
    captionMax: 500,
    fields: [SERVER("pixelfed.social"), { name: "token", label: "Personal access token", type: "password" }],
    help: "In Pixelfed: Settings → Applications → Personal Access Tokens → Create, with read and write scopes. Every post needs a photo.",
    media: "images_required",
    maxMedia: 4,
  },
  peertube: {
    label: "PeerTube",
    sub: "Channel",
    color: "#f1680d",
    captionMax: 10000,
    fields: [
      SERVER("peertube.example.com"),
      { name: "username", label: "Username" },
      { name: "password", label: "Password", type: "password" },
    ],
    help: "Your password is used once to get an access token and is not stored. Every post is one video; the first line becomes the video title.",
    media: "one_video",
    maxMedia: 1,
    titled: true,
  },
  devto: {
    label: "DEV",
    sub: "Blog (dev.to)",
    color: "#0a0a0a",
    captionMax: 100000,
    fields: [{ name: "token", label: "API key", type: "password" }],
    help: "On dev.to: Settings → Extensions → DEV Community API Keys → Generate API Key. The first line becomes the title; the rest is Markdown.",
    helpUrl: "https://dev.to/settings/extensions",
    media: "none",
    maxMedia: 0,
    titled: true,
  },
  hashnode: {
    label: "Hashnode",
    sub: "Blog",
    color: "#2962ff",
    captionMax: 100000,
    fields: [
      { name: "token", label: "Personal access token", type: "password" },
      { name: "blog", label: "Blog address", placeholder: "yourblog.hashnode.dev", optional: true },
    ],
    help: "On Hashnode: Account settings → Developer → Generate new token. Leave the blog empty to use your first one. The first line becomes the title.",
    helpUrl: "https://hashnode.com/settings/developer",
    media: "none",
    maxMedia: 0,
    titled: true,
  },
  ghost: {
    label: "Ghost",
    sub: "Blog",
    color: "#15171a",
    captionMax: 100000,
    fields: [SERVER("yourblog.ghost.io", "Site address"), { name: "token", label: "Admin API key", placeholder: "id:secret", type: "password" }],
    help: "In Ghost Admin: Settings → Integrations → Add custom integration → copy the Admin API key. The first line becomes the title.",
    media: "images",
    maxMedia: 10,
    titled: true,
  },
  wordpress: {
    label: "WordPress",
    sub: "Self-hosted site",
    color: "#21759b",
    captionMax: 100000,
    fields: [
      SERVER("yoursite.com", "Site address"),
      { name: "username", label: "Username" },
      { name: "token", label: "Application password", placeholder: "xxxx xxxx xxxx xxxx xxxx xxxx", type: "password" },
    ],
    help: "In WordPress: Users → Profile → Application Passwords → Add New. Don't use your login password. The first line becomes the title.",
    helpUrl: "https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/",
    media: "images",
    maxMedia: 10,
    titled: true,
  },
  discourse: {
    label: "Discourse",
    sub: "Forum topic",
    color: "#231f20",
    captionMax: 32000,
    fields: [
      SERVER("forum.example.com", "Forum address"),
      { name: "username", label: "Username" },
      { name: "token", label: "API key", type: "password" },
      { name: "category", label: "Category ID", placeholder: "e.g. 4", optional: true },
    ],
    help: "A forum admin creates the key: Admin → API → New API Key (single user, scope “topics: write” and “uploads: create”). The first line becomes the topic title.",
    media: "images",
    maxMedia: 10,
    titled: true,
  },
  listmonk: {
    label: "Listmonk",
    sub: "Newsletter",
    color: "#0055d4",
    captionMax: 100000,
    fields: [
      SERVER("lists.example.com"),
      { name: "username", label: "API user" },
      { name: "token", label: "API token", type: "password" },
      { name: "lists", label: "List IDs", placeholder: "e.g. 1, 3" },
    ],
    help: "In Listmonk: Admin → Users → New API user. Each post is sent as a campaign to these lists; the first line becomes the subject.",
    helpUrl: "https://listmonk.app/docs/apis/apis/",
    media: "none",
    maxMedia: 0,
    titled: true,
  },
  nostr: {
    label: "Nostr",
    sub: "Profile",
    color: "#8e30eb",
    captionMax: 10000,
    fields: [
      { name: "key", label: "Bunker link or private key", placeholder: "bunker://… or nsec1…", type: "password" },
      { name: "relays", label: "Relays", placeholder: "wss://relay.damus.io, wss://nos.lol", optional: true },
    ],
    help: "Best: a bunker:// link from a remote signer (nsec.app, Amber, nsecBunker). Your key stays in the signer; Poskoo asks it to sign each note, so the signer must be online at posting time. Leave relays empty to use popular public relays.",
    helpUrl: "https://nsec.app",
    warning: "Only paste an nsec if it's a dedicated key for scheduled posts. Poskoo stores it encrypted, but anyone with your nsec controls that identity forever.",
    media: "none",
    maxMedia: 0,
  },
  // Medium's API takes Markdown posts; the first line is the title. Medium stopped issuing NEW
  // integration tokens in 2023, so this works for people who already have one.
  medium: {
    label: "Medium",
    sub: "Profile or publication",
    color: "#000000",
    captionMax: 100000,
    fields: [
      { name: "token", label: "Integration token", type: "password" },
      { name: "publication", label: "Publication ID", placeholder: "Leave empty to post on your profile", optional: true },
    ],
    help: "Medium → Settings → Security and apps → Integration tokens. Medium no longer issues new tokens, so this only works if you already have one. Posts to a publication are saved as drafts for the editors.",
    helpUrl: "https://github.com/Medium/medium-api-docs",
    media: "none",
    maxMedia: 0,
    titled: true,
  },
  // Lemmy (fediverse link aggregator): one connected channel = one community. Poskoo logs in once
  // and keeps only the session token (JWT); the password is never stored.
  lemmy: {
    label: "Lemmy",
    sub: "Community",
    color: "#00bc8c",
    captionMax: 10000,
    fields: [
      SERVER("lemmy.world", "Instance"),
      { name: "username", label: "Username or email" },
      { name: "password", label: "Password", type: "password" },
      { name: "community", label: "Community", placeholder: "technology or technology@lemmy.world" },
    ],
    help: "Poskoo signs in once to get a session token and does NOT keep your password. The first line of each post is its title. Connect each community you post to as its own channel.",
    helpUrl: "https://join-lemmy.org/docs/users/01-getting-started.html",
    warning: "Accounts with two-factor login can't connect this way yet.",
    media: "none",
    maxMedia: 0,
    titled: true,
  },
  // Moltbook: the social network for AI agents. An agent's API key posts to a "submolt".
  moltbook: {
    label: "Moltbook",
    sub: "Agent",
    color: "#e8472b",
    captionMax: 40000,
    fields: [
      { name: "token", label: "Agent API key", placeholder: "moltbook_…", type: "password" },
      { name: "submolt", label: "Submolt", placeholder: "general", optional: true },
    ],
    help: "Register your agent on Moltbook and copy its API key. Posts go to the submolt you pick (general by default); the first line is the title.",
    helpUrl: "https://www.moltbook.com",
    media: "none",
    maxMedia: 0,
    titled: true,
  },
};

// ---- Networks connected through an OAuth app (or Neynar's sign-in) that the Poskoo owner registers.
// They need server env vars; until then the Connect card shows "Not available yet" (channelStatus.ts).

export const APP_NETWORK_IDS = ["tumblr", "wpcom", "plurk", "twitch", "farcaster", "reddit", "dribbble", "vk", "kick", "whop", "mewe", "tiktok_business"] as const;
export type AppNetworkId = (typeof APP_NETWORK_IDS)[number];
export type AppNetworkSpec = Omit<TokenNetworkSpec, "fields" | "help" | "helpUrl" | "warning">;

export const APP_NETWORKS: Record<AppNetworkId, AppNetworkSpec> = {
  // NPF text blocks; Poskoo splits long text into paragraphs.
  tumblr: { label: "Tumblr", sub: "Blog", color: "#001935", captionMax: 20000, media: "images", maxMedia: 10 },
  wpcom: { label: "WordPress.com", sub: "Site", color: "#3858e9", captionMax: 100000, media: "images", maxMedia: 10, titled: true },
  // plurkAdd content: max 360 characters.
  plurk: { label: "Plurk", sub: "Profile", color: "#ff574d", captionMax: 360, media: "none", maxMedia: 0 },
  // Helix Send Chat Message: max 500 characters, text only.
  twitch: { label: "Twitch", sub: "Channel chat", color: "#9146ff", captionMax: 500, media: "none", maxMedia: 0 },
  // Casts: 320 bytes for regular accounts (longer casts need Farcaster Pro).
  farcaster: { label: "Farcaster", sub: "Profile", color: "#855dcd", captionMax: 320, media: "none", maxMedia: 0 },
  // 2026-11-24, ported from Postiz (AGPL-3.0): src/lib/networks/moreApps.ts
  // Reddit self posts: the first line is the title (300), the rest the body (40,000). Subreddit per post.
  reddit: { label: "Reddit", sub: "Subreddits", color: "#ff4500", captionMax: 40000, media: "none", maxMedia: 0, titled: true },
  // Dribbble shots: exactly one image; the first line is the shot title.
  dribbble: { label: "Dribbble", sub: "Shots", color: "#ea4c89", captionMax: 2000, media: "images_required", maxMedia: 1, titled: true },
  // VK wall posts (VK ID OAuth), text for now.
  vk: { label: "VK", sub: "Wall", color: "#0077ff", captionMax: 15000, media: "none", maxMedia: 0 },
  // Kick has no posts API: a chat message in your own channel (500 characters), like Twitch.
  kick: { label: "Kick", sub: "Channel chat", color: "#53fc18", captionMax: 500, media: "none", maxMedia: 0 },
  // Whop forum posts in one of your experiences (forum picked per post).
  whop: { label: "Whop", sub: "Forum", color: "#ff6243", captionMax: 10000, media: "none", maxMedia: 0 },
  // MeWe timeline posts (MeWe developer API), text and up to 10 photos.
  mewe: { label: "MeWe", sub: "Timeline", color: "#17377f", captionMax: 63206, media: "images", maxMedia: 10 },
  // TikTok API for Business (business accounts): one video by URL, or up to 35 photos.
  tiktok_business: { label: "TikTok Business", sub: "Business account", color: "#000000", captionMax: 2200, media: "any", maxMedia: 35 },
};

export function isAppNetwork(value: unknown): value is AppNetworkId {
  return typeof value === "string" && (APP_NETWORK_IDS as readonly string[]).includes(value);
}

/** Every network defined in this file (token + app). */
export const EXTRA_NETWORK_IDS = [...TOKEN_NETWORK_IDS, ...APP_NETWORK_IDS] as const;
export type ExtraNetworkId = TokenNetworkId | AppNetworkId;
export const EXTRA_NETWORKS: Record<ExtraNetworkId, AppNetworkSpec> = { ...TOKEN_NETWORKS, ...APP_NETWORKS };

export function isExtraNetwork(value: unknown): value is ExtraNetworkId {
  return isTokenNetwork(value) || isAppNetwork(value);
}

export const EXTRA_NETWORK_LABEL = Object.fromEntries(EXTRA_NETWORK_IDS.map((id) => [id, EXTRA_NETWORKS[id].label])) as Record<ExtraNetworkId, string>;
export const EXTRA_NETWORK_COLOR = Object.fromEntries(EXTRA_NETWORK_IDS.map((id) => [id, EXTRA_NETWORKS[id].color])) as Record<ExtraNetworkId, string>;

/** PLATFORMS entries (src/lib/platforms.ts). */
export const EXTRA_PLATFORMS = Object.fromEntries(
  EXTRA_NETWORK_IDS.map((id) => [id, { label: EXTRA_NETWORKS[id].label, captionMax: EXTRA_NETWORKS[id].captionMax }]),
) as Record<ExtraNetworkId, { label: string; captionMax: number }>;

/** Save-time media rule for a token network; null when the mix is fine. */
export function extraMediaError(id: ExtraNetworkId, media: MediaItem[], scheduling: boolean): string | null {
  const spec = EXTRA_NETWORKS[id];
  const videos = media.filter((m) => m.type === "video").length;
  const images = media.length - videos;
  switch (spec.media) {
    case "none":
      return media.length > 0 ? `${spec.label} posts from Poskoo are text only. Remove the media or untick ${spec.label}.` : null;
    case "images":
    case "images_required":
      if (videos > 0) return `${spec.label} posts from Poskoo take images only. Remove the video or untick ${spec.label}.`;
      if (images > spec.maxMedia) return `${spec.label} takes up to ${spec.maxMedia} images per post.`;
      if (spec.media === "images_required" && scheduling && images === 0) return `${spec.label} posts need at least one image.`;
      return null;
    case "one_video":
      if (images > 0 || videos > 1) return `${spec.label} posts are one video. Remove the other files or untick ${spec.label}.`;
      if (scheduling && videos === 0) return `${spec.label} posts need a video.`;
      return null;
    case "any":
      return media.length > spec.maxMedia ? `${spec.label} takes up to ${spec.maxMedia} files per post.` : null;
  }
}

/** Blogs and newsletters: the first non-empty line is the title (leading "#" stripped), the rest the body. */
export function splitTitle(text: string, maxTitle = 250): { title: string; body: string } {
  const lines = text.trim().split(/\r?\n/);
  const first = (lines.shift() ?? "").replace(/^#+\s*/, "").trim();
  const rest = lines.join("\n").trim();
  const title = first.length > maxTitle ? `${first.slice(0, maxTitle - 1).trimEnd()}…` : first;
  return { title, body: rest || first };
}

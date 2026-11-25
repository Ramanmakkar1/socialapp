// Server-only: the Poskoo MCP tools (src/app/api/mcp). Every handler is scoped to
// the API key's owner, so one user's key can never read or write another user's data.
// create_post / update_post validate with the exact same server code as the calendar
// (savePostForUser); create_dm_rule uses the Auto-DM page's code (src/lib/dmRuleCreate.ts).
//
// Draft-then-approve: a key without "can publish" (api_keys.can_publish, migration 048) only ever
// creates drafts and paused Auto-DM rules; the owner reviews and schedules them in Poskoo.
import { query } from "@/lib/db";
import { getPostPerformance } from "@/lib/analytics";
import { cleanMediaUrls, ideaInsertStatement, normalizeIdeaStatus } from "@/lib/ideas";
import { ALLOWED_PLATFORMS, nextQueueSlot, savePostForUser, type SavePostInput } from "@/lib/savePost";
import type { PlatformId } from "@/lib/platforms";
import { deletePostForUser, UUID_RE } from "@/lib/postMutations";
import { buildContactQuery } from "@/lib/contactsQuery";
import { createDmRuleForUser, type RuleTrigger } from "@/lib/dmRuleCreate";
import { ANY_COMMENT_KEYWORD } from "@/lib/keywordChips";
import { createCampaignForUser } from "@/lib/campaign";
import { createHash } from "node:crypto";
import { getAssets, listAssets, viewOf } from "@/lib/mediaLibrary";
import { BRAND } from "@/lib/brand";
import { rateLimit, type RateLimitResult } from "@/lib/rateLimit";

// MCP request limits: per API key (authenticated use) and per IP (stops key guessing before the DB lookup).
export const MCP_KEY_LIMIT_PER_MINUTE = 60;
export const MCP_IP_LIMIT_PER_MINUTE = 120;

/** Rate limit one MCP request. The raw key is never kept in memory: buckets use a short hash. */
export function mcpRateLimit(apiKey: string, ip: string, now = Date.now()): RateLimitResult {
  const byIp = rateLimit(`mcp-ip:${ip}`, MCP_IP_LIMIT_PER_MINUTE, 60_000, now);
  if (!byIp.ok) return byIp;
  const keyHash = createHash("sha256").update(apiKey).digest("hex").slice(0, 32);
  return rateLimit(`mcp-key:${keyHash}`, MCP_KEY_LIMIT_PER_MINUTE, 60_000, now);
}

export type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

/** What the calling API key may do. Draft-only keys never schedule, publish or activate. */
export type McpAccess = { canPublish: boolean };

const CHANNELS = ALLOWED_PLATFORMS as readonly string[];
const CHANNEL_LIST = CHANNELS.join(", ");
const DRAFT_NOTE =
  "With a draft-only API key (the default) posts are saved as drafts for the owner to review and schedule in Poskoo; keys with \"Allow publishing\" may schedule.";

export const MCP_TOOLS: McpTool[] = [
  {
    name: "list_channels",
    description: "List the social channels connected to this Poskoo account (Instagram, Facebook, Threads, YouTube, TikTok, LinkedIn, X, Bluesky, Mastodon, Pinterest, Google Business Profile, reminder channels) with their status.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "list_posts",
    description:
      "List this account's posts (drafts, scheduled and published). Optional status filter: draft, scheduled, published, failed. Returns at most 100 posts, newest first.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["draft", "scheduled", "published", "failed"] },
        limit: { type: "number", minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "create_post",
    description:
      `Create a post in Poskoo. caption is required. channels: any of ${CHANNEL_LIST} (default: every connected channel; \"channel\" with one id also works). mediaUrls: up to 10 public https .jpg/.png/.mp4 links (a carousel, or one video). captions: optional per-network caption overrides, e.g. {\"x\": \"short version\"}. scheduleAt: an ISO time like 2026-12-01T09:00:00Z or \"next slot\" (the default) for the next free slot from the channel schedules. mode: \"draft\" or \"schedule\". mediaAssetIds: ids from list_media (this account's media library), attached after any mediaUrls with their saved alt text. ${DRAFT_NOTE} networkOptions passes per-network settings (e.g. {\"pinterest\": {\"boardId\": \"…\"}}); ytTitle is required for YouTube.`,
    inputSchema: {
      type: "object",
      properties: {
        caption: { type: "string" },
        channels: { type: "array", items: { type: "string", enum: [...CHANNELS] } },
        channel: { type: "string", enum: [...CHANNELS] },
        mediaUrls: { type: "array", items: { type: "string" }, maxItems: 10 },
        mediaUrl: { type: "string" },
        mediaAssetIds: { type: "array", items: { type: "string" }, maxItems: 10 },
        captions: { type: "object", additionalProperties: { type: "string" } },
        scheduleAt: { type: "string" },
        mode: { type: "string", enum: ["draft", "schedule"] },
        ytTitle: { type: "string" },
        firstComment: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        networkOptions: { type: "object" },
      },
      required: ["caption"],
      additionalProperties: false,
    },
  },
  {
    name: "list_media",
    description:
      "List this account's media library (uploaded images and videos), newest first. Optional: query (matches file name or alt text), kind (image or video), limit (1-50, default 20). Returns ids to pass as mediaAssetIds to create_post.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        kind: { type: "string", enum: ["image", "video"] },
        limit: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "update_post",
    description:
      `Edit a draft or scheduled post that has not started publishing. postId is required; every other field is optional and keeps its current value when left out (caption, channels, mediaUrls, captions — set a network to \"\" to drop its override — scheduleAt, ytTitle, networkOptions). mode \"schedule\" approves a draft (publishing keys only); mode \"draft\" unschedules a post. Draft-only keys can edit drafts only.`,
    inputSchema: {
      type: "object",
      properties: {
        postId: { type: "string" },
        caption: { type: "string" },
        channels: { type: "array", items: { type: "string", enum: [...CHANNELS] } },
        mediaUrls: { type: "array", items: { type: "string" }, maxItems: 10 },
        captions: { type: "object", additionalProperties: { type: "string" } },
        scheduleAt: { type: "string" },
        mode: { type: "string", enum: ["draft", "schedule"] },
        ytTitle: { type: "string" },
        networkOptions: { type: "object" },
      },
      required: ["postId"],
      additionalProperties: false,
    },
  },
  {
    name: "delete_post",
    description: "Delete a draft, scheduled or failed post (never one that is publishing or published). Draft-only keys can delete drafts only.",
    inputSchema: {
      type: "object",
      properties: { postId: { type: "string" } },
      required: ["postId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_post_status",
    description: "Status of one post and of each network it goes to (pending, publishing, published, failed), with the error message and the published time when there is one.",
    inputSchema: {
      type: "object",
      properties: { postId: { type: "string" } },
      required: ["postId"],
      additionalProperties: false,
    },
  },
  {
    name: "add_idea",
    description: "Save a post idea to this account's ideas board. text is required; mediaUrl is optional; status is one of unassigned, todo, in_progress, done.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string" },
        mediaUrl: { type: "string" },
        status: { type: "string", enum: ["unassigned", "todo", "in_progress", "done"] },
      },
      required: ["text"],
      additionalProperties: false,
    },
  },
  {
    name: "list_contacts",
    description:
      "List contacts captured by Auto-DMs (username, name, email, phone, tags, which automation found them), most recently active first. Optional: search (matches username, name, email or phone), withEmail (only contacts who shared an email), limit (1-100, default 50).",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string" },
        withEmail: { type: "boolean" },
        limit: { type: "number", minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "create_dm_rule",
    description:
      "Create an Instagram Auto-DM: when someone comments a keyword (or replies to a Story / DMs it), Poskoo sends them dmText. keywords is a list (or [\"*\"] for any comment); dmText may use {{username}} and {{link}}; linkUrl is an https link; emailGate asks for their email before sending the link; followGate asks them to follow first; triggers: comment, story_reply, dm (default comment); matchType: contains (default) or exact. Draft-only keys create the rule paused, for the owner to switch on; publishing keys can pass activate: true.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        keywords: { type: "array", items: { type: "string" } },
        dmText: { type: "string" },
        linkUrl: { type: "string" },
        linkLabel: { type: "string" },
        emailGate: { type: "boolean" },
        followGate: { type: "boolean" },
        triggers: { type: "array", items: { type: "string", enum: ["comment", "story_reply", "dm"] } },
        matchType: { type: "string", enum: ["contains", "exact"] },
        publicReply: { type: "string" },
        activate: { type: "boolean" },
      },
      required: ["name", "keywords", "dmText"],
      additionalProperties: false,
    },
  },
  {
    name: "create_campaign_from_brief",
    description:
      `Draft a whole campaign with Poskoo's AI: goal (required), offer, startDate (YYYY-MM-DD, default tomorrow), endDate or days (default 7), tone, postCount (1-14, default 5), channels (required, any of ${CHANNEL_LIST}), mediaUrls (shared across the posts). Every post is saved as a DRAFT at a proposed time (from the channel schedules or best posting hours) with per-network captions; nothing is scheduled. Needs AI to be configured on the Poskoo server and counts toward the monthly AI quota.`,
    inputSchema: {
      type: "object",
      properties: {
        goal: { type: "string" },
        offer: { type: "string" },
        startDate: { type: "string" },
        endDate: { type: "string" },
        days: { type: "number", minimum: 1, maximum: 60 },
        tone: { type: "string" },
        postCount: { type: "number", minimum: 1, maximum: 14 },
        channels: { type: "array", items: { type: "string", enum: [...CHANNELS] } },
        mediaUrls: { type: "array", items: { type: "string" }, maxItems: 10 },
        name: { type: "string" },
      },
      required: ["goal", "channels"],
      additionalProperties: false,
    },
  },
  {
    name: "get_analytics_summary",
    description: "Summarize this account's published post performance (reach, likes, comments, saves) for the last 7, 30 or 90 days (default 30).",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", enum: [7, 30, 90] },
      },
      additionalProperties: false,
    },
  },
];

export type McpCallResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

function textResult(value: unknown, isError = false): McpCallResult {
  return {
    content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

function str(args: Record<string, unknown>, key: string): string | null {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

async function listChannels(userId: string): Promise<unknown> {
  const channels: { platform: string; username: string | null; status: string }[] = [];
  try {
    const rows = await query<{ platform: string; username: string | null; status: string }>(
      "select platform, username, status from socialapp.social_accounts where user_id=$1 order by platform, created_at",
      [userId],
    );
    channels.push(...rows);
  } catch {
    // social_accounts missing: nothing to list.
  }
  try {
    const yt = await query<{ title: string; status: string }>(
      "select title, status from socialapp.youtube_channels where user_id=$1 order by updated_at desc",
      [userId],
    );
    for (const row of yt) channels.push({ platform: "youtube", username: row.title, status: row.status });
  } catch {
    // youtube_channels missing: nothing to list.
  }
  return channels;
}

async function listPosts(userId: string, args: Record<string, unknown>): Promise<unknown> {
  const status = str(args, "status");
  if (status && !["draft", "scheduled", "published", "failed"].includes(status)) {
    return { error: "status must be one of: draft, scheduled, published, failed." };
  }
  const limitRaw = args.limit;
  const limit =
    typeof limitRaw === "number" && Number.isInteger(limitRaw) && limitRaw >= 1 && limitRaw <= 100
      ? limitRaw
      : 50;
  const rows = await query<{
    id: string;
    caption: string;
    status: string;
    scheduled_at: Date | null;
    platforms: string[];
  }>(
    `select p.id, p.caption, p.status, p.scheduled_at,
       coalesce(array_agg(distinct t.platform) filter (where t.platform is not null), '{}') as platforms
     from socialapp.scheduled_posts p
     left join socialapp.post_targets t on t.post_id = p.id
     where p.user_id=$1${status ? " and p.status=$2" : ""}
     group by p.id
     order by coalesce(p.scheduled_at, p.created_at) desc
     limit ${limit}`,
    status ? [userId, status] : [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    caption: r.caption,
    status: r.status,
    scheduledAt: r.scheduled_at ? new Date(r.scheduled_at).toISOString() : null,
    platforms: r.platforms ?? [],
  }));
}

type ArgError = { error: string };
const isArgError = (v: unknown): v is ArgError => typeof v === "object" && v !== null && "error" in v;

/** channels (array) or the older single `channel`; null when neither was given. */
function channelsArg(args: Record<string, unknown>): PlatformId[] | null | ArgError {
  const raw = args.channels !== undefined ? args.channels : args.channel !== undefined ? [args.channel] : undefined;
  if (raw === undefined || raw === null) return null;
  if (!Array.isArray(raw)) return { error: "channels must be a list of channel ids." };
  const out: PlatformId[] = [];
  for (const c of raw) {
    if (typeof c !== "string" || !CHANNELS.includes(c.trim())) {
      return { error: `channel must be one of: ${CHANNEL_LIST}.` };
    }
    if (!out.includes(c.trim() as PlatformId)) out.push(c.trim() as PlatformId);
  }
  return out.length > 0 ? out : null;
}

/** mediaUrls (array) or the older single `mediaUrl`; null when neither was given. */
function mediaArg(args: Record<string, unknown>): string[] | null | ArgError {
  if (args.mediaUrls !== undefined && args.mediaUrls !== null) {
    if (!Array.isArray(args.mediaUrls) || args.mediaUrls.some((u) => typeof u !== "string")) {
      return { error: "mediaUrls must be a list of https links." };
    }
    if (args.mediaUrls.length > 10) return { error: "Up to 10 media links per post." };
    return (args.mediaUrls as string[]).map((u) => u.trim()).filter(Boolean);
  }
  const one = str(args, "mediaUrl");
  return one ? [one] : null;
}

/** Per-network caption overrides; "" removes an override (update_post). */
function captionsArg(args: Record<string, unknown>): Record<string, string> | ArgError {
  const raw = args.captions;
  if (raw === undefined || raw === null) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return { error: "captions must be an object like {\"x\": \"text\"}." };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!CHANNELS.includes(k)) return { error: `captions has an unknown channel: ${k}.` };
    if (typeof v !== "string") return { error: `captions.${k} must be text.` };
    out[k] = v;
  }
  return out;
}

function objectArg(args: Record<string, unknown>, key: string): Record<string, unknown> | null {
  const v = args[key];
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function modeArg(args: Record<string, unknown>): "draft" | "schedule" | null | ArgError {
  const mode = str(args, "mode");
  if (mode === null) return null;
  if (mode !== "draft" && mode !== "schedule") return { error: "mode must be draft or schedule." };
  return mode;
}

const APPROVAL_NOTE =
  "Saved as a draft. The account owner reviews and schedules it in Poskoo (Calendar → Drafts). To let this assistant schedule directly, the owner can create an API key with \"Allow publishing\".";

/** Every connected, usable channel (social_accounts rows plus YouTube channels), in registry order. */
async function connectedChannels(userId: string): Promise<PlatformId[]> {
  const rows = await query<{ platform: string }>(
    "select platform from socialapp.social_accounts where user_id=$1 and status='active' and access_token_enc is not null",
    [userId],
  );
  const set = new Set<string>(rows.map((r) => r.platform));
  try {
    const yt = await query<{ status: string }>(
      "select status from socialapp.youtube_channels where user_id=$1 and status='active' limit 1",
      [userId],
    );
    if (yt.length > 0) set.add("youtube");
  } catch {
    // youtube_channels missing: ignore.
  }
  return (ALLOWED_PLATFORMS as PlatformId[]).filter((p) => set.has(p));
}

function parseScheduleAt(args: Record<string, unknown>): { nextSlot: boolean; at: string | null } {
  const scheduleAt = str(args, "scheduleAt");
  const nextSlot = scheduleAt === null || /^next\s+slot$/i.test(scheduleAt);
  return { nextSlot, at: nextSlot ? null : scheduleAt };
}

async function createPost(userId: string, args: Record<string, unknown>, access: McpAccess): Promise<unknown> {
  const caption = str(args, "caption");
  if (!caption) return { error: "caption is required." };
  const channels = channelsArg(args);
  if (isArgError(channels)) return channels;
  const media = mediaArg(args);
  if (isArgError(media)) return media;
  const library = await libraryMediaArg(userId, args);
  if (isArgError(library)) return library;
  const captions = captionsArg(args);
  if (isArgError(captions)) return captions;
  const mode = modeArg(args);
  if (isArgError(mode)) return mode;
  const allMedia = [...(media ?? []), ...library.urls];
  if (allMedia.length > 10) return { error: "Up to 10 media items per post (mediaUrls + mediaAssetIds)." };

  // Channels: the requested ones, or every connected active channel when omitted.
  const platforms = channels ?? (await connectedChannels(userId));
  if (platforms.length === 0) {
    return { error: "No connected channel. Connect Instagram (or another channel) in Poskoo Settings first." };
  }

  const schedule = mode !== "draft" && access.canPublish;
  const when = parseScheduleAt(args);
  let scheduledAt: string | null = when.at;
  if (!schedule && when.nextSlot) {
    // A draft still gets a planned time (the next free slot) so it shows on the calendar.
    scheduledAt = (await nextQueueSlot(userId, platforms))?.toISOString() ?? null;
  }
  const overrides: Partial<Record<string, string>> = {};
  for (const [k, v] of Object.entries(captions)) if (platforms.includes(k as PlatformId) && v.trim()) overrides[k] = v;
  const input: SavePostInput = {
    caption,
    platforms,
    overrides,
    scheduledAt,
    mode: schedule ? (when.nextSlot ? "queue" : "schedule") : "draft",
    mediaUrls: allMedia,
    ...(Object.keys(library.alts).length ? { mediaAlts: library.alts } : {}),
    ...(platforms.includes("youtube") ? { ytTitle: str(args, "ytTitle") ?? caption.slice(0, 100) } : {}),
    ...(str(args, "firstComment") ? { firstComment: str(args, "firstComment")! } : {}),
    ...(Array.isArray(args.tags) ? { tags: args.tags.filter((t): t is string => typeof t === "string") } : {}),
    ...(objectArg(args, "networkOptions") ? { netOptions: objectArg(args, "networkOptions")! } : {}),
  };
  const result = await savePostForUser(userId, input);
  if (!result.ok) return { error: result.error };
  return schedule
    ? { ok: true, postId: result.id, status: "scheduled" }
    : {
        ok: true,
        postId: result.id,
        status: "draft",
        plannedFor: scheduledAt,
        ...(access.canPublish ? {} : { needsApproval: true, note: APPROVAL_NOTE }),
      };
}

type StoredPost = {
  id: string;
  caption: string;
  status: string;
  scheduled_at: string | null;
  media: { type?: string; url?: string }[] | null;
  first_comment: string | null;
  ig_format: string | null;
  dm_rule_id: string | null;
  tags?: string[] | null;
};
type StoredTarget = {
  platform: string;
  caption_override: string | null;
  yt_metadata?: { title?: string; tags?: string[]; privacy?: string; shorts?: boolean } | null;
  net_options?: Record<string, unknown> | null;
};

async function loadPost(userId: string, postId: string): Promise<{ post: StoredPost; targets: StoredTarget[] } | null> {
  // to_jsonb(row): columns from later migrations (tags, net_options) are simply absent when missing.
  const rows = await query<{ row: StoredPost }>(
    "select to_jsonb(p) as row from socialapp.scheduled_posts p where p.id=$1 and p.user_id=$2",
    [postId, userId],
  );
  if (!rows[0]) return null;
  const targets = await query<{ row: StoredTarget }>(
    "select to_jsonb(t) as row from socialapp.post_targets t where t.post_id=$1",
    [postId],
  );
  return { post: rows[0].row, targets: targets.map((t) => t.row) };
}

async function updatePost(userId: string, args: Record<string, unknown>, access: McpAccess): Promise<unknown> {
  const postId = str(args, "postId");
  if (!postId || !UUID_RE.test(postId)) return { error: "postId must be a post id from list_posts or create_post." };
  const channels = channelsArg(args);
  if (isArgError(channels)) return channels;
  const media = mediaArg(args);
  if (isArgError(media)) return media;
  const captions = captionsArg(args);
  if (isArgError(captions)) return captions;
  const mode = modeArg(args);
  if (isArgError(mode)) return mode;

  const loaded = await loadPost(userId, postId);
  if (!loaded) return { error: "Post not found." };
  const { post, targets } = loaded;
  if (post.status !== "draft" && post.status !== "scheduled") {
    return { error: `This post is ${post.status} and can't be edited.` };
  }
  if (!access.canPublish && post.status !== "draft") {
    return { error: "This API key can edit drafts only. Edit scheduled posts in Poskoo, or use a key with \"Allow publishing\"." };
  }
  if (!access.canPublish && mode === "schedule") {
    return { error: "This API key can't schedule posts. The owner approves drafts in Poskoo (Calendar → Drafts)." };
  }

  const platforms = channels ?? (targets.map((t) => t.platform).filter((p) => CHANNELS.includes(p)) as PlatformId[]);
  const overrides: Partial<Record<string, string>> = {};
  const netOptions: Record<string, unknown> = {};
  let yt: StoredTarget["yt_metadata"] = null;
  for (const t of targets) {
    if (t.caption_override !== null && t.caption_override !== undefined) overrides[t.platform] = t.caption_override;
    if (t.net_options) netOptions[t.platform] = t.net_options;
    if (t.platform === "youtube" && t.yt_metadata) yt = t.yt_metadata;
  }
  for (const [k, v] of Object.entries(captions)) {
    if (v.trim()) overrides[k] = v;
    else delete overrides[k];
  }
  for (const k of Object.keys(overrides)) if (!platforms.includes(k as PlatformId)) delete overrides[k];
  Object.assign(netOptions, objectArg(args, "networkOptions") ?? {});

  const scheduleAt = str(args, "scheduleAt");
  const nextMode: "draft" | "schedule" | "queue" =
    mode === "draft" ? "draft" : mode === "schedule" || post.status === "scheduled" ? "schedule" : "draft";
  const scheduledAt =
    scheduleAt && /^next\s+slot$/i.test(scheduleAt) ? null : scheduleAt ?? (post.scheduled_at ? new Date(post.scheduled_at).toISOString() : null);
  const input: SavePostInput = {
    draftId: postId,
    caption: str(args, "caption") ?? post.caption,
    platforms,
    overrides,
    scheduledAt,
    mode: nextMode === "schedule" && scheduledAt === null ? "queue" : nextMode,
    mediaUrls: media ?? (post.media ?? []).map((m) => m.url ?? "").filter(Boolean),
    firstComment: post.first_comment ?? "",
    tags: post.tags ?? [],
    dmRuleId: post.dm_rule_id,
    igFormat: post.ig_format === "story" ? "story" : "feed",
    netOptions,
    ...(platforms.includes("youtube")
      ? {
          ytTitle: str(args, "ytTitle") ?? yt?.title ?? (str(args, "caption") ?? post.caption).slice(0, 100),
          ytTags: yt?.tags ?? [],
          ytPrivacy: yt?.privacy === "unlisted" || yt?.privacy === "private" ? yt.privacy : "public",
          ytShorts: yt?.shorts === true,
        }
      : {}),
  };
  const result = await savePostForUser(userId, input);
  if (!result.ok) return { error: result.error };
  return { ok: true, postId, status: input.mode === "draft" ? "draft" : "scheduled" };
}

async function deletePost(userId: string, args: Record<string, unknown>, access: McpAccess): Promise<unknown> {
  const postId = str(args, "postId");
  if (!postId || !UUID_RE.test(postId)) return { error: "postId must be a post id from list_posts or create_post." };
  if (!access.canPublish) {
    const rows = await query<{ status: string }>(
      "select status from socialapp.scheduled_posts where id=$1 and user_id=$2",
      [postId, userId],
    );
    if (!rows[0]) return { error: "Post not found." };
    if (rows[0].status !== "draft") return { error: "This API key can delete drafts only." };
  }
  const result = await deletePostForUser(postId, userId);
  return result.ok ? { ok: true, postId, deleted: true } : { error: result.error };
}

async function postStatus(userId: string, args: Record<string, unknown>): Promise<unknown> {
  const postId = str(args, "postId");
  if (!postId || !UUID_RE.test(postId)) return { error: "postId must be a post id from list_posts or create_post." };
  const rows = await query<{ id: string; status: string; scheduled_at: Date | string | null; caption: string }>(
    "select p.id, p.status, p.scheduled_at, p.caption from socialapp.scheduled_posts p where p.id=$1 and p.user_id=$2",
    [postId, userId],
  );
  const post = rows[0];
  if (!post) return { error: "Post not found." };
  const targets = await query<{ platform: string; status: string; error: string | null; published_at: Date | string | null; external_post_id: string | null }>(
    "select platform, status, error, published_at, external_post_id from socialapp.post_targets where post_id=$1 order by platform",
    [postId],
  );
  const iso = (v: Date | string | null) => (v ? new Date(v).toISOString() : null);
  return {
    id: post.id,
    status: post.status,
    scheduledAt: iso(post.scheduled_at),
    caption: post.caption,
    networks: targets.map((t) => ({
      platform: t.platform,
      status: t.status,
      error: t.error,
      publishedAt: iso(t.published_at),
      externalPostId: t.external_post_id,
    })),
  };
}

async function listContacts(userId: string, args: Record<string, unknown>): Promise<unknown> {
  const limitRaw = args.limit;
  const limit = typeof limitRaw === "number" && Number.isInteger(limitRaw) && limitRaw >= 1 && limitRaw <= 100 ? limitRaw : 50;
  const { where, params } = buildContactQuery(userId, {
    search: (str(args, "search") ?? "").slice(0, 100),
    onlyWithEmail: args.withEmail === true,
    rule: "",
  });
  const rows = await query<{
    username: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    tags: string[] | null;
    created_at: Date | string;
    last_seen_at: Date | string | null;
    rule_name: string | null;
  }>(
    `select c.username, c.name, c.email, c.phone, to_jsonb(c)->'tags' as tags, c.created_at, c.last_seen_at, r.name as rule_name from socialapp.contacts c left join socialapp.dm_rules r on r.id = c.source_rule_id where ${where} order by c.last_seen_at desc nulls last, c.id desc limit ${limit}`,
    params,
  );
  return rows.map((r) => ({
    username: r.username,
    name: r.name,
    email: r.email,
    phone: r.phone,
    tags: Array.isArray(r.tags) ? r.tags : [],
    automation: r.rule_name,
    firstSeen: new Date(r.created_at).toISOString(),
    lastSeen: r.last_seen_at ? new Date(r.last_seen_at).toISOString() : null,
  }));
}

const RULE_TRIGGERS: RuleTrigger[] = ["comment", "story_reply", "dm"];

async function createDmRule(userId: string, args: Record<string, unknown>, access: McpAccess): Promise<unknown> {
  const keywordsRaw = Array.isArray(args.keywords) ? args.keywords : typeof args.keywords === "string" ? [args.keywords] : [];
  const keywords = keywordsRaw
    .filter((k): k is string => typeof k === "string")
    .map((k) => (k.trim() === ANY_COMMENT_KEYWORD ? ANY_COMMENT_KEYWORD : k.trim()))
    .filter(Boolean);
  const triggersRaw = Array.isArray(args.triggers) ? args.triggers : ["comment"];
  const triggers = triggersRaw.filter((t): t is RuleTrigger => RULE_TRIGGERS.includes(t as RuleTrigger));
  if (triggers.length !== triggersRaw.length) return { error: "triggers must be comment, story_reply and/or dm." };
  const matchType = str(args, "matchType") ?? "contains";
  if (matchType !== "contains" && matchType !== "exact") return { error: "matchType must be contains or exact." };
  const activate = access.canPublish && args.activate === true;
  const result = await createDmRuleForUser(
    userId,
    {
      name: str(args, "name") ?? "",
      keywords,
      matchType,
      dmText: typeof args.dmText === "string" ? args.dmText : "",
      linkUrl: str(args, "linkUrl") ?? "",
      linkLabel: str(args, "linkLabel") ?? undefined,
      emailGate: args.emailGate === true,
      followGate: args.followGate === true,
      triggers,
      socialAccountId: null,
      publicReply: typeof args.publicReply === "string" ? args.publicReply : "",
    },
    activate ? "active" : "paused",
  );
  if (!result.ok) return { error: result.errors.join(" ") };
  return {
    ok: true,
    ruleId: result.id,
    status: activate ? "active" : "paused",
    ...(activate
      ? {}
      : { note: "Created paused. The account owner switches it on in Poskoo (Auto-DM)." }),
  };
}

async function createCampaign(userId: string, args: Record<string, unknown>): Promise<unknown> {
  const channels = channelsArg(args);
  if (isArgError(channels)) return channels;
  const result = await createCampaignForUser(userId, { ...args, platforms: channels ?? [] });
  if (!result.ok) return { error: result.error };
  return {
    ok: true,
    campaign: result.name,
    status: "draft",
    posts: result.posts.map((p) => ({ postId: p.id, plannedFor: p.scheduledAt, angle: p.angle, caption: p.caption })),
    ...(result.skipped.length ? { skipped: result.skipped } : {}),
    note: "Every post is a draft. The account owner reviews and schedules them in Poskoo (Calendar → Drafts).",
  };
}

async function addIdea(userId: string, args: Record<string, unknown>): Promise<unknown> {
  const text = str(args, "text");
  if (!text) return { error: "text is required." };
  if (text.length > 2000) return { error: "text must be 2,000 characters or fewer." };
  const mediaUrl = str(args, "mediaUrl");
  const mediaUrls = cleanMediaUrls(mediaUrl ? [mediaUrl] : []);
  const statusRaw = str(args, "status");
  const status = statusRaw ? normalizeIdeaStatus(statusRaw) : "unassigned";
  const { text: sql, params } = ideaInsertStatement({ userId, text, mediaUrls, status });
  const rows = await query<{ id: string }>(sql, params);
  if (rows.length === 0) return { error: "Could not save the idea. Please try again." };
  return { ok: true, ideaId: rows[0].id };
}

async function analyticsSummary(userId: string, args: Record<string, unknown>): Promise<unknown> {
  const daysRaw = args.days;
  const days = daysRaw === 7 || daysRaw === 90 ? daysRaw : 30;
  const rows = await getPostPerformance(userId, days);
  const sum = (f: (r: (typeof rows)[number]) => number | null) =>
    rows.reduce((acc, r) => acc + (f(r) ?? 0), 0);
  const top = [...rows]
    .filter((r) => r.reach !== null)
    .sort((a, b) => (b.reach ?? 0) - (a.reach ?? 0))
    .slice(0, 3)
    .map((r) => ({ caption: r.caption.slice(0, 80), reach: r.reach, likes: r.likes, comments: r.comments }));
  return {
    days,
    publishedPosts: rows.length,
    totalReach: sum((r) => r.reach),
    totalImpressions: sum((r) => r.impressions),
    totalLikes: sum((r) => r.likes),
    totalComments: sum((r) => r.comments),
    totalSaves: sum((r) => r.saved),
    topPosts: top,
  };
}

/** mediaAssetIds -> signed links of the key owner's own library files (+ their alt text). */
async function libraryMediaArg(userId: string, args: Record<string, unknown>): Promise<{ urls: string[]; alts: Record<string, string> } | ArgError> {
  if (args.mediaAssetIds === undefined || args.mediaAssetIds === null) return { urls: [], alts: {} };
  if (!Array.isArray(args.mediaAssetIds) || args.mediaAssetIds.some((x) => typeof x !== "string")) {
    return { error: "mediaAssetIds must be a list of ids from list_media." };
  }
  const ids = (args.mediaAssetIds as string[]).slice(0, 10);
  const assets = await getAssets(userId, ids);
  const missing = ids.filter((id) => !assets.some((a) => a.id === id));
  if (missing.length > 0) return { error: `Media not found in this account's library: ${missing.join(", ")}` };
  const urls: string[] = [];
  const alts: Record<string, string> = {};
  for (const id of ids) {
    const v = viewOf(assets.find((a) => a.id === id)!, BRAND.url);
    if (!v.url) return { error: "Media links are not configured on this server." };
    urls.push(v.url);
    if (v.alt) alts[v.url] = v.alt;
  }
  return { urls, alts };
}

async function listMedia(userId: string, args: Record<string, unknown>): Promise<unknown> {
  const kindRaw = str(args, "kind");
  const kind = kindRaw === "image" || kindRaw === "video" ? kindRaw : "all";
  const limit = Math.min(50, Math.max(1, Number(args.limit) || 20));
  const items = await listAssets(userId, { q: str(args, "query") ?? "", kind, limit });
  return {
    media: items.map((a) => ({
      id: a.id,
      name: a.name,
      kind: a.kind,
      bytes: a.bytes,
      width: a.width,
      height: a.height,
      durationSec: a.durationSec,
      alt: a.alt,
      createdAt: a.createdAt,
    })),
  };
}

/** Runs one MCP tool for the API key's owner. Unknown tools and bad input return isError results. */
export async function callMcpTool(
  name: string,
  args: Record<string, unknown>,
  userId: string,
  access: McpAccess = { canPublish: false },
): Promise<McpCallResult> {
  const safeArgs = args && typeof args === "object" ? args : {};
  try {
    switch (name) {
      case "list_channels":
        return textResult(await listChannels(userId));
      case "list_posts":
        return textResult(await listPosts(userId, safeArgs));
      case "create_post":
        return textResult(await createPost(userId, safeArgs, access));
      case "update_post":
        return textResult(await updatePost(userId, safeArgs, access));
      case "delete_post":
        return textResult(await deletePost(userId, safeArgs, access));
      case "get_post_status":
        return textResult(await postStatus(userId, safeArgs));
      case "list_contacts":
        return textResult(await listContacts(userId, safeArgs));
      case "create_dm_rule":
        return textResult(await createDmRule(userId, safeArgs, access));
      case "create_campaign_from_brief":
        return textResult(await createCampaign(userId, safeArgs));
      case "add_idea":
        return textResult(await addIdea(userId, safeArgs));
      case "list_media":
        return textResult(await listMedia(userId, safeArgs));
      case "get_analytics_summary":
        return textResult(await analyticsSummary(userId, safeArgs));
      default:
        return textResult({ error: `Unknown tool: ${name}` }, true);
    }
  } catch (err) {
    console.error(`mcp tool ${name} failed`, userId, err instanceof Error ? err.message : err);
    return textResult({ error: "The tool could not be run right now. Please try again." }, true);
  }
}

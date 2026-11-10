// Server-only: the Poskoo MCP tools (src/app/api/mcp). Every handler is scoped to
// the API key's owner, so one user's key can never read or write another user's data.
// create_post validates with the exact same server code as the calendar (savePostForUser).
import { query } from "@/lib/db";
import { getPostPerformance } from "@/lib/analytics";
import { cleanMediaUrls, ideaInsertStatement, normalizeIdeaStatus } from "@/lib/ideas";
import { savePostForUser } from "@/lib/savePost";
import type { PlatformId } from "@/lib/platforms";

export type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export const MCP_TOOLS: McpTool[] = [
  {
    name: "list_channels",
    description: "List the social channels connected to this Poskoo account (Instagram, Facebook, Threads, YouTube) with their status.",
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
      "Schedule a post in Poskoo. caption is required; mediaUrl is a public https image (.jpg/.png) or video (.mp4) link; channel is one of instagram, facebook, threads, youtube (default: every connected channel); scheduleAt is an ISO time like 2026-12-01T09:00:00Z or \"next slot\" to use the next free slot from the channel schedules (the default).",
    inputSchema: {
      type: "object",
      properties: {
        caption: { type: "string" },
        mediaUrl: { type: "string" },
        channel: { type: "string", enum: ["instagram", "facebook", "threads", "youtube"] },
        scheduleAt: { type: "string" },
        ytTitle: { type: "string" },
      },
      required: ["caption"],
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

async function createPost(userId: string, args: Record<string, unknown>): Promise<unknown> {
  const caption = str(args, "caption");
  if (!caption) return { error: "caption is required." };

  const mediaUrl = str(args, "mediaUrl");
  const channel = str(args, "channel");
  if (channel && !["instagram", "facebook", "threads", "youtube"].includes(channel)) {
    return { error: "channel must be one of: instagram, facebook, threads, youtube." };
  }

  // Channels: the requested one, or every connected active channel when omitted.
  let platforms: PlatformId[];
  if (channel) {
    platforms = [channel as PlatformId];
  } else {
    const rows = await query<{ platform: string }>(
      "select platform from socialapp.social_accounts where user_id=$1 and status='active' and access_token_enc is not null",
      [userId],
    );
    const set = new Set<PlatformId>();
    for (const r of rows) set.add(r.platform as PlatformId);
    try {
      const yt = await query<{ status: string }>(
        "select status from socialapp.youtube_channels where user_id=$1 and status='active' limit 1",
        [userId],
      );
      if (yt.length > 0) set.add("youtube");
    } catch {
      // youtube_channels missing: ignore.
    }
    const all: PlatformId[] = ["instagram", "facebook", "threads", "youtube"];
    platforms = all.filter((p) => set.has(p));
    if (platforms.length === 0) {
      return { error: "No connected channel. Connect Instagram (or another channel) in Poskoo Settings first." };
    }
  }

  // Schedule time: an ISO instant, or "next slot" (the default) from the channel schedules.
  const scheduleAt = str(args, "scheduleAt");
  const useNextSlot = scheduleAt === null || /^next\s+slot$/i.test(scheduleAt);
  const input = {
    caption,
    platforms,
    overrides: {},
    scheduledAt: useNextSlot ? null : scheduleAt,
    mode: (useNextSlot ? "queue" : "schedule") as "queue" | "schedule",
    mediaUrls: mediaUrl ? [mediaUrl] : [],
    ...(channel === "youtube" || (channel === null && platforms.includes("youtube"))
      ? { ytTitle: str(args, "ytTitle") ?? caption.slice(0, 100) }
      : {}),
  };
  const result = await savePostForUser(userId, input);
  if (!result.ok) return { error: result.error };
  return { ok: true, postId: result.id };
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

/** Runs one MCP tool for the API key's owner. Unknown tools and bad input return isError results. */
export async function callMcpTool(
  name: string,
  args: Record<string, unknown>,
  userId: string,
): Promise<McpCallResult> {
  const safeArgs = args && typeof args === "object" ? args : {};
  try {
    switch (name) {
      case "list_channels":
        return textResult(await listChannels(userId));
      case "list_posts":
        return textResult(await listPosts(userId, safeArgs));
      case "create_post":
        return textResult(await createPost(userId, safeArgs));
      case "add_idea":
        return textResult(await addIdea(userId, safeArgs));
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

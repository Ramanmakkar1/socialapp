// AI campaign from a brief: the user (or an MCP agent) describes the goal, offer, dates and tone,
// picks channels, and gets N post DRAFTS on the calendar at proposed times. Nothing here ever
// schedules or publishes: every post is saved with mode "draft" through savePostForUser, the same
// validation path as the composer, so the user reviews and schedules each one.
//
// Times come from the user's posting schedules (Settings → Channels) when set, otherwise from the
// best comment hours (src/lib/bestTime.ts, same data the composer uses), spread over the dates.
import { query } from "@/lib/db";
import { generateCampaignDrafts, type CampaignPostDraft } from "@/lib/ai";
import { consumeAiRequest } from "@/lib/aiQuota";
import { topHours } from "@/lib/bestTime";
import { fitCaption, isKnownPlatform } from "@/lib/captionFit";
import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { cleanMediaUrls } from "@/lib/ideas";
import { checkCaption, type PlatformId } from "@/lib/platforms";
import { nextSlot, type ChannelSchedule } from "@/lib/postingSchedule";
import { ALLOWED_PLATFORMS, savePostForUser, type SavePostInput } from "@/lib/savePost";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
export const CAMPAIGN_MAX_POSTS = 14;
export const CAMPAIGN_MAX_DAYS = 60;
/** Fallback posting hours (UTC) when there is no schedule and no comment history yet. */
export const DEFAULT_CAMPAIGN_HOURS_UTC = [14, 17, 20];

export const AI_OFF_MESSAGE =
  "AI isn't configured on this Poskoo server yet, so it can't draft a campaign. You can still plan and schedule posts yourself.";

export type CampaignBriefInput = {
  goal?: unknown;
  offer?: unknown;
  /** YYYY-MM-DD (UTC). Default: tomorrow. */
  startDate?: unknown;
  /** YYYY-MM-DD (UTC), inclusive. Wins over `days`. */
  endDate?: unknown;
  days?: unknown;
  tone?: unknown;
  postCount?: unknown;
  platforms?: unknown;
  mediaUrls?: unknown;
  name?: unknown;
};

export type CampaignBrief = {
  goal: string;
  offer: string;
  tone: string;
  name: string;
  startMs: number;
  endMs: number;
  postCount: number;
  platforms: PlatformId[];
  mediaUrls: string[];
};

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function dayStart(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const ms = Date.parse(`${value.trim()}T00:00:00Z`);
  return Number.isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== value.trim() ? null : ms;
}

/** Validates a brief. Errors are user-facing sentences. */
export function parseCampaignBrief(
  input: CampaignBriefInput,
  nowMs = Date.now(),
): { ok: true; brief: CampaignBrief } | { ok: false; error: string } {
  const goal = text(input.goal, 600);
  if (goal.length < 3) return { ok: false, error: "Describe the campaign goal (what you want people to do)." };
  const platformsRaw = Array.isArray(input.platforms) ? input.platforms : [];
  const platforms: PlatformId[] = [];
  for (const p of platformsRaw) {
    if (typeof p !== "string" || !(ALLOWED_PLATFORMS as string[]).includes(p) || !isKnownPlatform(p)) {
      return { ok: false, error: `Unknown channel: ${String(p)}.` };
    }
    if (!platforms.includes(p)) platforms.push(p);
  }
  if (platforms.length === 0) return { ok: false, error: "Pick at least one channel." };

  const today = Math.floor(nowMs / DAY_MS) * DAY_MS;
  const startRaw = input.startDate === undefined || input.startDate === "" ? today + DAY_MS : dayStart(input.startDate);
  if (startRaw === null) return { ok: false, error: "Start date must look like 2026-12-01." };
  if (startRaw < today) return { ok: false, error: "Start date can't be in the past." };
  let endMs: number;
  if (input.endDate !== undefined && input.endDate !== "") {
    const end = dayStart(input.endDate);
    if (end === null) return { ok: false, error: "End date must look like 2026-12-14." };
    if (end < startRaw) return { ok: false, error: "End date must be on or after the start date." };
    endMs = end + DAY_MS;
  } else {
    const days = input.days === undefined || input.days === "" ? 7 : Number(input.days);
    if (!Number.isInteger(days) || days < 1) return { ok: false, error: "Duration must be a whole number of days." };
    endMs = startRaw + days * DAY_MS;
  }
  if (endMs - startRaw > CAMPAIGN_MAX_DAYS * DAY_MS) {
    return { ok: false, error: `Keep a campaign to ${CAMPAIGN_MAX_DAYS} days or fewer.` };
  }

  const countRaw = input.postCount === undefined || input.postCount === "" ? 5 : Number(input.postCount);
  if (!Number.isInteger(countRaw) || countRaw < 1 || countRaw > CAMPAIGN_MAX_POSTS) {
    return { ok: false, error: `Choose between 1 and ${CAMPAIGN_MAX_POSTS} posts.` };
  }

  return {
    ok: true,
    brief: {
      goal,
      offer: text(input.offer, 600),
      tone: text(input.tone, 60),
      name: text(input.name, 40),
      startMs: startRaw,
      endMs,
      postCount: countRaw,
      platforms,
      mediaUrls: cleanMediaUrls(input.mediaUrls),
    },
  };
}

/** The brief as the prompt sees it. */
export function briefText(brief: CampaignBrief): string {
  const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const days = Math.round((brief.endMs - brief.startMs) / DAY_MS);
  return [
    `Goal: ${brief.goal}`,
    brief.offer ? `Offer: ${brief.offer}` : "",
    `Dates: ${fmt(brief.startMs)} to ${fmt(brief.endMs - DAY_MS)} (${days} day${days === 1 ? "" : "s"})`,
    brief.mediaUrls.length ? `Media: ${brief.mediaUrls.length} image/video file(s) will be attached.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Proposed instants for `count` posts in [startMs, endMs). With posting schedules, picks slots
 * from them spread evenly over the window; otherwise spreads the posts over the days at the best
 * hours. Never earlier than an hour from now, never on a minute that is already `taken`.
 */
export function planCampaignSlots(input: {
  count: number;
  startMs: number;
  endMs: number;
  nowMs: number;
  schedules: ChannelSchedule[];
  bestHoursUtc: number[];
  taken?: number[];
}): number[] {
  const { count, endMs, nowMs } = input;
  const earliest = Math.max(input.startMs, nowMs + HOUR_MS);
  const takenMin = new Set((input.taken ?? []).map((t) => Math.floor(t / 60_000)));
  const free = (ms: number) => !takenMin.has(Math.floor(ms / 60_000));

  if (input.schedules.length > 0) {
    const candidates: number[] = [];
    let cursor = earliest - 61_000;
    for (let guard = 0; guard < 1000; guard++) {
      const slot = nextSlot(input.schedules, cursor);
      if (slot === null || slot >= endMs) break;
      if (slot >= earliest && free(slot)) candidates.push(slot);
      cursor = slot;
    }
    if (candidates.length >= count) {
      if (count === 1) return [candidates[0]];
      return Array.from({ length: count }, (_, i) => candidates[Math.round((i * (candidates.length - 1)) / (count - 1))]);
    }
  }

  const hours = input.bestHoursUtc.filter((h) => Number.isInteger(h) && h >= 0 && h <= 23);
  const useHours = hours.length > 0 ? hours : DEFAULT_CAMPAIGN_HOURS_UTC;
  const firstDay = Math.floor(earliest / DAY_MS) * DAY_MS;
  const spanDays = Math.max(1, Math.ceil((endMs - firstDay) / DAY_MS));
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const day = Math.floor((i * spanDays) / count);
    let ms = firstDay + day * DAY_MS + useHours[i % useHours.length] * HOUR_MS;
    while (ms < earliest || !free(ms) || out.includes(ms)) ms += HOUR_MS;
    out.push(ms);
  }
  return out.sort((a, b) => a - b);
}

/**
 * Turns AI posts into composer save inputs (drafts). Each network gets the AI variant when there is
 * one, otherwise the main caption, trimmed to the network's limits when it would not fit.
 */
export function campaignPostInputs(
  posts: CampaignPostDraft[],
  brief: CampaignBrief,
  slots: number[],
  tag: string,
): SavePostInput[] {
  return posts.map((post, i) => {
    const overrides: Partial<Record<string, string>> = {};
    for (const platform of brief.platforms) {
      const variant = post.variants[platform];
      if (variant && variant !== post.caption) overrides[platform] = variant;
      else if (checkCaption(platform, post.caption).errors.length > 0) overrides[platform] = fitCaption(platform, post.caption);
    }
    const media = brief.mediaUrls.length ? [brief.mediaUrls[i % brief.mediaUrls.length]] : [];
    const firstLine = post.caption.split(/\r?\n/)[0]?.trim() ?? "";
    return {
      caption: post.caption,
      platforms: brief.platforms,
      overrides,
      scheduledAt: slots[i] !== undefined ? new Date(slots[i]).toISOString() : null,
      mode: "draft" as const,
      mediaUrls: media,
      tags: tag ? [tag] : [],
      ...(brief.platforms.includes("youtube") ? { ytTitle: (post.ytTitle || firstLine || brief.goal).slice(0, 100) } : {}),
    };
  });
}

export type CampaignResult =
  | {
      ok: true;
      name: string;
      posts: { id: string; scheduledAt: string | null; caption: string; angle: string }[];
      skipped: string[];
    }
  | { ok: false; error: string; aiOff?: boolean };

async function loadBrandVoice(userId: string): Promise<string | undefined> {
  try {
    const rows = await query<{ brand_voice: string | null }>("select brand_voice from socialapp.users where id=$1", [userId]);
    return rows[0]?.brand_voice?.trim().slice(0, 500) || undefined;
  } catch {
    return undefined;
  }
}

async function loadTiming(userId: string, brief: CampaignBrief) {
  let schedules: ChannelSchedule[] = [];
  try {
    const rows = await query<{ platform: string; timezone: string; days: number[]; times: string[] }>(
      "select platform, timezone, days, times from socialapp.posting_schedules where user_id=$1",
      [userId],
    );
    schedules = rows
      .filter((r) => (brief.platforms as string[]).includes(r.platform))
      .map((r) => ({ platform: r.platform as PlatformId, timezone: r.timezone, days: r.days ?? [], times: r.times ?? [] }));
  } catch {
    schedules = [];
  }
  let bestHoursUtc: number[] = [];
  try {
    const rows = await query<{ hour: number; count: number }>(
      `select extract(hour from created_at at time zone 'UTC')::int as hour, count(*)::int as count from socialapp.dm_queue where user_id=$1 and created_at > now() - interval '30 days' group by 1`,
      [userId],
    );
    bestHoursUtc = topHours(rows, 3).map((r) => r.hour);
  } catch {
    bestHoursUtc = [];
  }
  let taken: number[] = [];
  try {
    const rows = await query<{ scheduled_at: Date | string }>(
      "select scheduled_at from socialapp.scheduled_posts where user_id=$1 and status in ('draft','scheduled') and scheduled_at >= $2 and scheduled_at < $3",
      [userId, new Date(brief.startMs).toISOString(), new Date(brief.endMs).toISOString()],
    );
    taken = rows.map((r) => new Date(r.scheduled_at).getTime());
  } catch {
    taken = [];
  }
  return { schedules, bestHoursUtc, taken };
}

/**
 * The whole flow for one user: validate, check AI is on and the AI quota, ask the model, plan the
 * times and save every post as a draft. Used by the calendar ("Campaign from brief") and the MCP
 * create_campaign_from_brief tool.
 */
export async function createCampaignForUser(userId: string, input: CampaignBriefInput): Promise<CampaignResult> {
  const parsed = parseCampaignBrief(input);
  if (!parsed.ok) return parsed;
  const brief = parsed.brief;
  if (!(await isFeatureReadyNow("ai"))) return { ok: false, error: AI_OFF_MESSAGE, aiOff: true };

  const quota = await consumeAiRequest(userId, "campaign");
  if (!quota.ok) return { ok: false, error: quota.error };

  const [brandVoice, timing] = await Promise.all([loadBrandVoice(userId), loadTiming(userId, brief)]);
  const ai = await generateCampaignDrafts({
    brief: briefText(brief),
    platforms: brief.platforms,
    count: brief.postCount,
    tone: brief.tone || undefined,
    brandVoice,
  });
  if (!ai.ok) return { ok: false, error: ai.error };

  const slots = planCampaignSlots({
    count: ai.posts.length,
    startMs: brief.startMs,
    endMs: brief.endMs,
    nowMs: Date.now(),
    ...timing,
  });
  const name = brief.name || ai.name || "Campaign";
  const inputs = campaignPostInputs(ai.posts, brief, slots, name);
  const saved: { id: string; scheduledAt: string | null; caption: string; angle: string }[] = [];
  const skipped: string[] = [];
  for (let i = 0; i < inputs.length; i++) {
    const result = await savePostForUser(userId, inputs[i]);
    if (result.ok) {
      saved.push({ id: result.id, scheduledAt: inputs[i].scheduledAt, caption: inputs[i].caption, angle: ai.posts[i].angle });
    } else {
      skipped.push(`Post ${i + 1}: ${result.error}`);
    }
  }
  if (saved.length === 0) return { ok: false, error: skipped[0] ?? "Could not save the campaign drafts." };
  return { ok: true, name, posts: saved, skipped };
}

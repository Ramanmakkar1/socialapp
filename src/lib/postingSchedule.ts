// Pure helpers for per-channel posting schedules and queue reordering.
// No React, no DB: safe to unit test and to run in the browser.
import type { PlatformId } from "@/lib/platforms";

export type ChannelSchedule = {
  platform: PlatformId;
  /** IANA timezone, e.g. "America/Toronto". */
  timezone: string;
  /** 1=Monday .. 7=Sunday. */
  days: number[];
  /** "HH:MM" wall-clock times in `timezone`. */
  times: string[];
};

export const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export const DAY_LABELS: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

/** Common IANA timezones offered in Settings (kept small on purpose). */
export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Athens",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

const DAY_MS = 86_400_000;
const MIN_LEAD_MS = 60_000;

type WallParts = { y: number; mo: number; d: number; h: number; mi: number; s: number };

function zonedParts(timezone: string, ms: number): WallParts | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date(ms));
    const get = (type: string) => parts.find((p) => p.type === type)?.value;
    let hour = Number(get("hour") ?? NaN);
    if (Number.isNaN(hour)) return null;
    if (hour === 24) hour = 0; // some engines report midnight as "24"
    return {
      y: Number(get("year")),
      mo: Number(get("month")),
      d: Number(get("day")),
      h: hour,
      mi: Number(get("minute")),
      s: Number(get("second")),
    };
  } catch {
    return null;
  }
}

/**
 * UTC instant of a wall-clock time in `timezone` (fixed-point iteration; converges in
 * 1-2 steps for real zones). Returns null for an unknown timezone.
 */
export function zonedTimeToUtc(
  timezone: string,
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
): number | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  // Target wall-clock time, as a UTC number (the value we want T(U) to equal).
  const target = Date.UTC(y, mo - 1, d, h, mi, 0);
  if (Number.isNaN(target)) return null;
  // Fixed-point: U = target - offset(U), where offset(U) = T(U) - U. Converges in
  // 1-2 steps for real zones (the offset is locally constant away from DST changes).
  let guess = target;
  for (let i = 0; i < 4; i++) {
    const parts = zonedParts(timezone, guess);
    if (!parts) return null;
    const wallAtGuess = Date.UTC(parts.y, parts.mo - 1, parts.d, parts.h, parts.mi, parts.s);
    const offset = wallAtGuess - guess;
    const next = target - offset;
    if (next === guess) return guess;
    guess = next;
  }
  return guess;
}

/** 1=Monday .. 7=Sunday for a UTC date. */
function weekdayMon1(d: Date): number {
  const dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}

function sortedTimes(times: string[]): string[] {
  return [...times].filter((t) => /^\d{2}:\d{2}$/.test(t)).sort();
}

/**
 * Next free slot for one channel after `nowMs` (at least one minute ahead),
 * or null when the channel has no usable days/times.
 */
export function nextSlotForChannel(schedule: ChannelSchedule, nowMs: number): number | null {
  const days = schedule.days.filter((d) => d >= 1 && d <= 7);
  const times = sortedTimes(schedule.times);
  if (days.length === 0 || times.length === 0) return null;
  const tz = schedule.timezone || "UTC";
  const today = zonedParts(tz, nowMs);
  if (!today) return null;
  for (let offset = 0; offset < 8; offset++) {
    const dayDate = new Date(Date.UTC(today.y, today.mo - 1, today.d) + offset * DAY_MS);
    if (!days.includes(weekdayMon1(dayDate))) continue;
    for (const t of times) {
      const [h, mi] = t.split(":").map(Number);
      const instant = zonedTimeToUtc(tz, dayDate.getUTCFullYear(), dayDate.getUTCMonth() + 1, dayDate.getUTCDate(), h, mi);
      if (instant !== null && instant > nowMs + MIN_LEAD_MS) return instant;
    }
  }
  return null;
}

/** Earliest next free slot across the given channel schedules, or null. */
export function nextSlot(schedules: ChannelSchedule[], nowMs: number): number | null {
  let best: number | null = null;
  for (const schedule of schedules) {
    const slot = nextSlotForChannel(schedule, nowMs);
    if (slot !== null && (best === null || slot < best)) best = slot;
  }
  return best;
}

export type UpcomingSlot = { ms: number; timezone: string };

/**
 * The next `count` slots across the channel schedules, earliest first, skipping instants in
 * `taken` (already-scheduled posts, compared to the minute). Each slot carries the timezone of
 * the channel schedule that produced it. Looks at most ~3 weeks ahead.
 */
export function upcomingSlots(
  schedules: ChannelSchedule[],
  nowMs: number,
  count: number,
  taken: Iterable<number> = [],
): UpcomingSlot[] {
  const takenMinutes = new Set([...taken].map((t) => Math.floor(t / 60_000)));
  const out: UpcomingSlot[] = [];
  let cursor = nowMs;
  const horizon = nowMs + 21 * DAY_MS;
  for (let guard = 0; out.length < count && guard < 200; guard++) {
    let best: UpcomingSlot | null = null;
    for (const schedule of schedules) {
      const slot = nextSlotForChannel(schedule, cursor);
      if (slot !== null && (best === null || slot < best.ms)) best = { ms: slot, timezone: schedule.timezone || "UTC" };
    }
    if (!best || best.ms > horizon) break;
    if (!takenMinutes.has(Math.floor(best.ms / 60_000))) out.push(best);
    // nextSlotForChannel wants a slot more than one minute after the cursor.
    cursor = best.ms;
  }
  return out;
}

/** Human label for a slot in the viewer's local time, e.g. "Tue, Nov 10, 9:00 AM". */
export function slotLabel(slotMs: number): string {
  return new Date(slotMs).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type QueuePostTime = { id: string; scheduledAt: number | null };

/**
 * New publish times for a queue after a drag reorder (given in the new order).
 * The first post keeps its time when it is still at least one minute away,
 * otherwise the queue starts one minute from now. Following posts are spaced by
 * the median gap of the original times (minimum one minute), so the new order
 * is also the publish order.
 */
export function reassignQueueTimes(posts: QueuePostTime[], nowMs: number): Map<string, number> {
  const result = new Map<string, number>();
  if (posts.length === 0) return result;
  const original = posts
    .map((p) => p.scheduledAt)
    .filter((t): t is number => t !== null)
    .sort((a, b) => a - b);
  let gap = MIN_LEAD_MS;
  if (original.length >= 2) {
    const gaps = original.slice(1).map((t, i) => t - original[i]).filter((g) => g > 0).sort((a, b) => a - b);
    if (gaps.length > 0) gap = Math.max(MIN_LEAD_MS, gaps[Math.floor(gaps.length / 2)]);
  }
  const first = posts[0];
  let cursor = first && first.scheduledAt !== null && first.scheduledAt > nowMs + MIN_LEAD_MS ? first.scheduledAt : nowMs + MIN_LEAD_MS;
  for (const post of posts) {
    result.set(post.id, cursor);
    cursor += gap;
  }
  return result;
}

/** Platforms that have a posting schedule (posting_schedules.platform check). */
export const SCHEDULABLE_PLATFORMS = ["instagram", "facebook", "threads"] as const;

/** The default schedule offered and seeded for a new channel: Mon-Fri at 9:00, 12:00 and 18:00. */
export const DEFAULT_SCHEDULE_DAYS = [1, 2, 3, 4, 5];
export const DEFAULT_SCHEDULE_TIMES = ["09:00", "12:00", "18:00"];

/** True for a real IANA zone the runtime knows (e.g. "America/Edmonton"). */
export function isValidTimeZone(tz: string): boolean {
  if (!tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Schedules to seed when a user has connected channels but no posting schedule at all yet:
 * the default schedule for every connected schedulable platform, in `timezone` (the browser's;
 * UTC when unknown). Empty as soon as the user has any schedule row, so their choices are never
 * overwritten.
 */
export function defaultSchedulesToSeed(
  connectedPlatforms: string[],
  existingSchedulePlatforms: string[],
  timezone: string,
): ChannelSchedule[] {
  if (existingSchedulePlatforms.length > 0) return [];
  const tz = isValidTimeZone(timezone) ? timezone : "UTC";
  const platforms = [...new Set(connectedPlatforms)].filter((p) => (SCHEDULABLE_PLATFORMS as readonly string[]).includes(p)).sort();
  return platforms.map((platform) => ({
    platform: platform as PlatformId,
    timezone: tz,
    days: [...DEFAULT_SCHEDULE_DAYS],
    times: [...DEFAULT_SCHEDULE_TIMES],
  }));
}

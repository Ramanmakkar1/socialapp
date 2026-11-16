// Pure helpers for the week time grid (Buffer-style): day/hour slot maths in the viewer's
// time zone, the calendar filters and the post-type badge. No React, no DB: unit tested.
import { postMatchesTag } from "@/lib/tagFilter";

export const HOURS = Array.from({ length: 24 }, (_, h) => h);

/** "YYYY-MM-DD" of the Sunday on or before `key`. */
export function sundayOnOrBefore(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

/** Offset of `tz` from UTC at `instant`, in ms (positive east of Greenwich). */
function tzOffsetMs(instant: number, tz: string): number {
  if (!tz || tz === "UTC") return 0;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/**
 * The instant (ISO) of wall time `key` `hour`:`minute` in `tz` ("" = UTC). A wall time skipped by a
 * DST jump resolves to the hour after it, so a slot never maps to an earlier time.
 */
export function zonedInstant(key: string, hour: number, minute: number, tz: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d, hour, minute);
  let guess = wall - tzOffsetMs(wall, tz);
  const second = wall - tzOffsetMs(guess, tz);
  if (second !== guess) {
    // Offset changed between the two guesses (DST edge): keep whichever really shows `hour`.
    const shown = (at: number) => new Date(at + tzOffsetMs(at, tz)).getUTCHours();
    guess = shown(second) === hour ? second : Math.max(guess, second);
  }
  return new Date(guess).toISOString();
}

/** Local day + hour of an instant in `tz`. */
export function slotOf(at: Date | string, tz: string): { key: string; hour: number; minute: number } {
  const t = new Date(at).getTime();
  const local = new Date(t + tzOffsetMs(t, tz));
  return { key: local.toISOString().slice(0, 10), hour: local.getUTCHours(), minute: local.getUTCMinutes() };
}

export function slotId(key: string, hour: number): string {
  return `${key}|${hour}`;
}

/** Posts grouped by "day|hour" slot, each slot sorted by time. Posts without a time are skipped. */
export function groupBySlot<T extends { scheduled_at: Date | string | null }>(posts: T[], tz: string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  const sorted = posts
    .filter((p) => p.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());
  for (const post of sorted) {
    const { key, hour } = slotOf(post.scheduled_at!, tz);
    const id = slotId(key, hour);
    const list = out.get(id);
    if (list) list.push(post);
    else out.set(id, [post]);
  }
  return out;
}

/** New time for a post dropped on slot `key` `hour`: same minute, new local day and hour. */
export function movedToSlot(scheduledAt: Date | string, key: string, hour: number, tz: string): string {
  return zonedInstant(key, hour, slotOf(scheduledAt, tz).minute, tz);
}

/** True once the whole hour slot is over (no new posts, no drops). */
export function isSlotPast(key: string, hour: number, tz: string, now: Date = new Date()): boolean {
  const end = hour === 23 ? zonedInstant(nextDay(key), 0, 0, tz) : zonedInstant(key, hour + 1, 0, tz);
  return new Date(end).getTime() <= now.getTime();
}

/** Start time for a post created from an empty slot: the slot's hour, or the next 15 minutes when that hour is under way. */
export function slotStart(key: string, hour: number, tz: string, now: Date = new Date()): string {
  const start = new Date(zonedInstant(key, hour, 0, tz));
  if (start.getTime() > now.getTime()) return start.toISOString();
  const next = new Date(Math.ceil((now.getTime() + 60_000) / 900_000) * 900_000);
  return next.toISOString();
}

function nextDay(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Hour the grid opens scrolled to: now (this week), else the first post, else 8 AM. */
export function initialScrollHour(days: string[], firstPostHour: number | null, now: { key: string; hour: number }): number {
  if (days.includes(now.key)) return Math.max(0, now.hour - 1);
  if (firstPostHour != null) return Math.max(0, firstPostHour - 1);
  return 8;
}

/* ---------- Filters (URL: ?channel=a,b&status=draft&tag=x) ---------- */

export const STATUS_FILTERS = ["scheduled", "draft", "published", "failed"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number] | "";

/** "instagram,facebook" -> ["instagram", "facebook"] (deduped, ids only). */
export function parseChannels(param: string | null | undefined): string[] {
  if (!param) return [];
  return [...new Set(param.split(",").map((c) => c.trim()).filter((c) => /^[a-z0-9_]{1,32}$/.test(c)))];
}

export function toggleChannel(selected: string[], channel: string): string[] {
  return selected.includes(channel) ? selected.filter((c) => c !== channel) : [...selected, channel];
}

export function parseStatus(param: string | null | undefined): StatusFilter {
  return (STATUS_FILTERS as readonly string[]).includes(param ?? "") ? (param as StatusFilter) : "";
}

export type FilterablePost = { status: string; platforms: string[]; tags?: string[] | null };

/** Posts matching every active filter: any selected channel, the status, the tag. */
export function filterPosts<T extends FilterablePost>(posts: T[], f: { channels: string[]; status: StatusFilter; tag: string }): T[] {
  return posts.filter(
    (p) =>
      (f.channels.length === 0 || p.platforms.some((pl) => f.channels.includes(pl))) &&
      (!f.status || p.status === f.status) &&
      postMatchesTag(p, f.tag),
  );
}

/* ---------- Post type badge ---------- */

export type PostKind = "story" | "reel" | "video" | "carousel" | "image" | "text";

const REEL_NETWORKS = ["instagram", "facebook", "ig_personal"];

export function postKind(p: { igFormat?: string | null; mediaCount: number; isVideo: boolean; platforms: string[] }): PostKind {
  if (p.igFormat === "story" && p.mediaCount > 0) return "story";
  if (p.mediaCount > 1) return "carousel";
  if (p.isVideo) return p.platforms.some((pl) => REEL_NETWORKS.includes(pl)) ? "reel" : "video";
  if (p.mediaCount === 1) return "image";
  return "text";
}

export const KIND_LABEL: Record<PostKind, string> = { story: "Story", reel: "Reel", video: "Video", carousel: "Carousel", image: "Image", text: "Text" };

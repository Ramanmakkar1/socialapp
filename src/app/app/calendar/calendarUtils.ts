// Client-safe helpers shared by the week / month calendar, post cards and the post popover.
import { AtSign, Facebook, Instagram, Youtube } from "lucide-react";
import { NEW_NETWORK_ICON } from "@/components/brandIcons";
import { engagementRate } from "@/lib/engagementRate";

export type CalendarPost = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
  /** First image/video URL, if any. */
  thumb?: string | null;
  thumbIsVideo?: boolean;
  /** Instagram insights for published posts (null = not fetched yet). */
  insights?: { reach?: number | null; impressions?: number | null; likes?: number | null; comments?: number | null; saved?: number | null; shares?: number | null } | null;
  /** Public link to the live post when the app can derive one. */
  permalink?: string | null;
  error?: string | null;
};

/** platform -> account handle shown in the popover ("@brewhouse.coffee"). */
export type AccountNames = Record<string, string>;

export const PLATFORM_ICON: Record<string, typeof Instagram> = { instagram: Instagram, facebook: Facebook, threads: AtSign, youtube: Youtube, ...NEW_NETWORK_ICON };
export const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", threads: "Threads", youtube: "YouTube",
  tiktok: "TikTok", bluesky: "Bluesky", mastodon: "Mastodon", linkedin: "LinkedIn", pinterest: "Pinterest", x: "X", gbp: "Google Business Profile",
};

export const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
};

export function isMovable(status: string): boolean {
  return status === "scheduled" || status === "draft";
}

/** Date parts of an instant in a time zone ("" = UTC, used for the server render). */
export function zonedParts(at: Date | string, tz: string): { key: string; hour: number; minute: number } {
  const d = typeof at === "string" ? new Date(at) : at;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { key: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")), minute: Number(get("minute")) };
}

export function formatTime(at: Date | string, tz: string): string {
  return new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz || "UTC" });
}

/** "Sun, Nov 8 · 7:00 PM" in the viewer's time zone. */
export function formatDayTime(at: Date | string, tz: string): string {
  const d = new Date(at);
  const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: tz || "UTC" });
  return `${day} · ${formatTime(d, tz)}`;
}

/** "Sun, Nov 8" for a "YYYY-MM-DD" day key. */
export function dayKeyLabel(key: string): string {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export function formatDateTime(at: Date | string, tz: string): string {
  return new Date(at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: tz || "UTC" });
}

export function hourLabel(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${hour < 12 ? "AM" : "PM"}`;
}

/** "YYYY-MM-DD" + n days (calendar arithmetic, no time zone involved). */
export function addDays(key: string, n: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * The UTC date to send to reschedulePost() so a post lands on `targetKey` in `tz`.
 * reschedulePost keeps the UTC time of day, so this picks the UTC date of
 * "targetKey at the post's current local time".
 */
export function utcDateForLocalDay(scheduledAt: Date | string, targetKey: string, tz: string): string {
  return movedToLocalDay(scheduledAt, targetKey, tz).slice(0, 10);
}

/** The post's new time (ISO) after moving it to local day `targetKey`, keeping its time of day: what the calendar shows optimistically. */
export function movedToLocalDay(scheduledAt: Date | string, targetKey: string, tz: string): string {
  const at = new Date(scheduledAt);
  const fromKey = zonedParts(at, tz).key;
  const diff = Math.round((Date.parse(`${targetKey}T00:00:00Z`) - Date.parse(`${fromKey}T00:00:00Z`)) / 86_400_000);
  return new Date(at.getTime() + diff * 86_400_000).toISOString();
}

/** Same list with one post moved to a new time (optimistic drag-and-drop / reschedule). */
export function withMovedPost(posts: CalendarPost[], id: string, scheduledAt: string): CalendarPost[] {
  return posts.map((p) => (p.id === id ? { ...p, scheduled_at: scheduledAt } : p));
}

export function groupByDay(posts: CalendarPost[], tz: string): Map<string, CalendarPost[]> {
  const byDay = new Map<string, CalendarPost[]>();
  const sorted = posts
    .filter((p) => p.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());
  for (const post of sorted) {
    const key = zonedParts(post.scheduled_at!, tz).key;
    const list = byDay.get(key);
    if (list) list.push(post);
    else byDay.set(key, [post]);
  }
  return byDay;
}

export function engagementRateOf(insights: CalendarPost["insights"]): number | null {
  if (!insights || insights.likes == null || insights.comments == null || !insights.reach) return null;
  return engagementRate({ likes: insights.likes, comments: insights.comments, saves: insights.saved ?? undefined, shares: insights.shares ?? undefined, base: insights.reach });
}

/** Week header label: "November 2026", "Oct – Nov 2026" or "Dec 2026 – Jan 2027" for a week crossing months. */
export function weekMonthLabel(weekStart: Date, weekEndDay: Date): string {
  const sameMonth = weekStart.getUTCMonth() === weekEndDay.getUTCMonth() && weekStart.getUTCFullYear() === weekEndDay.getUTCFullYear();
  if (sameMonth) return weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const short = (d: Date, withYear: boolean) =>
    d.toLocaleDateString("en-US", withYear ? { month: "short", year: "numeric", timeZone: "UTC" } : { month: "short", timeZone: "UTC" });
  if (weekStart.getUTCFullYear() === weekEndDay.getUTCFullYear()) return `${short(weekStart, false)} – ${short(weekEndDay, true)}`;
  return `${short(weekStart, true)} – ${short(weekEndDay, true)}`;
}

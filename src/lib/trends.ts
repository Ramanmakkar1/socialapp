// Trends: pure helpers for the "Reels trends of the week" page (no DB, no fetch, testable with node:test).
// Data comes from Meta's Instagram Business Discovery API: public numbers of Business/Creator accounts
// the user chose to watch. Nothing here invents a metric: engagement = likes + comments as Instagram reports them.

export type TrendPlan = "Free" | "Pro" | "Agency";

/** How many accounts each plan may watch. */
export const TREND_WATCH_LIMITS: Record<TrendPlan, number> = { Free: 10, Pro: 50, Agency: 50 };

export function trendWatchLimit(plan: TrendPlan): number {
  return TREND_WATCH_LIMITS[plan] ?? TREND_WATCH_LIMITS.Free;
}

/** Cached data older than this is refreshed when the page is viewed. */
export const TREND_STALE_MS = 6 * 60 * 60 * 1000;
export const TREND_WINDOW_DAYS = 7;
/** A post is "Rising" when its engagement is at least this many times the account's median. */
export const RISING_MULTIPLIER = 2;
/** The median needs a few posts to mean anything. */
export const RISING_MIN_POSTS = 4;

const USERNAME_RE = /^[a-z0-9._]{1,30}$/;

/**
 * Accepts "name", "@name", "instagram.com/name", "https://www.instagram.com/name/?hl=en".
 * Returns the lowercase username or null when it is not a valid Instagram username.
 */
export function normalizeIgUsername(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let s = input.trim();
  const url = s.match(/^(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/([^/?#\s]+)/i);
  if (url) s = url[1];
  s = s.replace(/^@+/, "").replace(/\/+$/, "").toLowerCase();
  if (!USERNAME_RE.test(s)) return null;
  // Instagram usernames cannot start or end with a period or contain "..".
  if (s.startsWith(".") || s.endsWith(".") || s.includes("..")) return null;
  // Reserved paths are not accounts.
  if (["p", "reel", "reels", "explore", "stories", "tv", "accounts"].includes(s)) return null;
  return s;
}

/** Splits a pasted list ("@a, @b\n@c") into unique valid usernames plus the rejected bits. */
export function parseUsernameList(input: string): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const part of input.split(/[\s,;]+/)) {
    if (!part) continue;
    const u = normalizeIgUsername(part);
    if (u) {
      if (!valid.includes(u)) valid.push(u);
    } else invalid.push(part);
  }
  return { valid, invalid };
}

export function isStale(attemptedAt: Date | string | null | undefined, now: number, staleMs = TREND_STALE_MS): boolean {
  if (!attemptedAt) return true;
  const t = new Date(attemptedAt).getTime();
  return !Number.isFinite(t) || now - t >= staleMs;
}

// ---- Graph errors -------------------------------------------------------------------------------

export type TrendErrorKind = "not_found" | "rate_limited" | "token" | "permission" | "error";

/** Meta throttling codes: app (4), user (17), page/account (32), and 613 (calls within one hour exceeded). */
export const RATE_LIMIT_CODES = new Set([4, 17, 32, 613, 80002]);

export function isRateLimitCode(code: number | null | undefined): boolean {
  return code !== null && code !== undefined && RATE_LIMIT_CODES.has(code);
}

/** Maps a failed Business Discovery call to a kind + a message safe to show (never holds a token). */
export function classifyGraphError(status: number, code: number | null, subcode: number | null = null): { kind: TrendErrorKind; message: string } {
  if (isRateLimitCode(code) || status === 429) {
    return { kind: "rate_limited", message: "Instagram asked us to slow down. We'll try again in a few hours." };
  }
  if (code === 190 || code === 102 || status === 401) {
    return { kind: "token", message: "Your Instagram connection expired. Reconnect Instagram via Facebook." };
  }
  if (code === 10 || (code !== null && code >= 200 && code < 300)) {
    return { kind: "permission", message: "Your Instagram connection is missing the permission to look up other accounts. Reconnect Instagram via Facebook." };
  }
  // 110 / 100 with subcode 2207013 (or similar): no such Business/Creator account.
  if (code === 110 || code === 100 || subcode === 2207013 || status === 404) {
    return { kind: "not_found", message: "Not found as a Business or Creator account. Personal and private accounts can't be read." };
  }
  return { kind: "error", message: "Instagram didn't return this account right now. We'll try again later." };
}

// ---- Business Discovery response ----------------------------------------------------------------

export type DiscoveredMedia = {
  id: string;
  caption: string | null;
  mediaType: string | null;
  productType: string | null;
  likes: number | null;
  comments: number;
  permalink: string | null;
  postedAt: string;
  thumbnailUrl: string | null;
  mediaUrl: string | null;
};

export type DiscoveredAccount = {
  username: string;
  name: string | null;
  profilePictureUrl: string | null;
  followers: number | null;
  mediaCount: number | null;
  media: DiscoveredMedia[];
};

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v !== "" ? v : null;
}

function httpsUrl(v: unknown): string | null {
  const s = str(v);
  return s && /^https:\/\//i.test(s) ? s : null;
}

/** Validates the JSON of `?fields=business_discovery.username(x){...}`; null when the shape is wrong. */
export function parseBusinessDiscovery(json: unknown): DiscoveredAccount | null {
  if (!json || typeof json !== "object") return null;
  const bd = (json as { business_discovery?: unknown }).business_discovery;
  if (!bd || typeof bd !== "object") return null;
  const b = bd as Record<string, unknown>;
  const username = str(b.username);
  if (!username) return null;
  const rawMedia = (b.media as { data?: unknown } | undefined)?.data;
  const media: DiscoveredMedia[] = [];
  if (Array.isArray(rawMedia)) {
    for (const m of rawMedia) {
      if (!m || typeof m !== "object") continue;
      const r = m as Record<string, unknown>;
      const id = str(r.id);
      const postedAt = str(r.timestamp);
      if (!id || !postedAt || !Number.isFinite(new Date(postedAt).getTime())) continue;
      media.push({
        id,
        caption: str(r.caption),
        mediaType: str(r.media_type),
        productType: str(r.media_product_type),
        likes: num(r.like_count),
        comments: num(r.comments_count) ?? 0,
        permalink: httpsUrl(r.permalink),
        postedAt: new Date(postedAt).toISOString(),
        thumbnailUrl: httpsUrl(r.thumbnail_url),
        mediaUrl: httpsUrl(r.media_url),
      });
    }
  }
  return {
    username: username.toLowerCase(),
    name: str(b.name),
    profilePictureUrl: httpsUrl(b.profile_picture_url),
    followers: num(b.followers_count),
    mediaCount: num(b.media_count),
    media,
  };
}

// ---- Ranking ------------------------------------------------------------------------------------

export type TrendKind = "reel" | "carousel" | "post";
export type TrendFilter = "all" | "reels" | "carousels" | "posts";
export type TrendSort = "engagement" | "newest" | "rate";

export type TrendMediaInput = {
  id: string;
  username: string;
  accountName?: string | null;
  profilePictureUrl?: string | null;
  followers: number | null;
  mediaType: string | null;
  productType: string | null;
  caption: string | null;
  permalink: string | null;
  thumbnailUrl: string | null;
  mediaUrl: string | null;
  postedAt: string;
  likes: number | null;
  comments: number;
};

export type TrendItem = TrendMediaInput & {
  kind: TrendKind;
  engagement: number;
  /** Engagement as % of the account's followers; null when followers are unknown. */
  rate: number | null;
  /** Engagement / the account's median engagement; null when there are too few posts. */
  vsMedian: number | null;
  rising: boolean;
  /** Image to show: the video cover for reels/videos, else the image itself. */
  image: string | null;
};

export function kindOf(m: Pick<TrendMediaInput, "mediaType" | "productType">): TrendKind {
  if (m.productType === "REELS") return "reel";
  if (m.mediaType === "CAROUSEL_ALBUM") return "carousel";
  return "post";
}

export function engagementOf(m: Pick<TrendMediaInput, "likes" | "comments">): number {
  return (m.likes ?? 0) + (m.comments ?? 0);
}

export function engagementRateOf(engagement: number, followers: number | null): number | null {
  if (!followers || followers <= 0) return null;
  return Math.round((engagement / followers) * 10000) / 100;
}

export function median(values: number[]): number | null {
  const v = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

/** Median engagement per account (lowercase username), over every cached post of that account. */
export function accountMedians(media: TrendMediaInput[]): Map<string, { median: number | null; posts: number }> {
  const by = new Map<string, number[]>();
  for (const m of media) {
    const list = by.get(m.username) ?? [];
    list.push(engagementOf(m));
    by.set(m.username, list);
  }
  const out = new Map<string, { median: number | null; posts: number }>();
  for (const [u, list] of by) out.set(u, { median: median(list), posts: list.length });
  return out;
}

function inWindow(postedAt: string, now: number, days: number): boolean {
  const t = new Date(postedAt).getTime();
  return Number.isFinite(t) && t <= now + 5 * 60_000 && now - t < days * 86_400_000;
}

function matchesFilter(kind: TrendKind, filter: TrendFilter): boolean {
  if (filter === "all") return true;
  return (filter === "reels" && kind === "reel") || (filter === "carousels" && kind === "carousel") || (filter === "posts" && kind === "post");
}

/**
 * Posts from the last `days` days, scored and ranked. `media` should hold every cached post (older ones too)
 * so each account's median is computed over its recent history, not just this week.
 */
export function rankTrends(
  media: TrendMediaInput[],
  opts: { now: number; filter?: TrendFilter; sort?: TrendSort; days?: number },
): TrendItem[] {
  return filterAndSortTrends(scoreTrends(media, opts.now, opts.days), opts.filter ?? "all", opts.sort ?? "engagement");
}

/** Every post of the window, scored (unfiltered, unsorted). */
export function scoreTrends(media: TrendMediaInput[], now: number, days = TREND_WINDOW_DAYS): TrendItem[] {
  const medians = accountMedians(media);
  const items: TrendItem[] = [];
  for (const m of media) {
    if (!inWindow(m.postedAt, now, days)) continue;
    const kind = kindOf(m);
    const engagement = engagementOf(m);
    const acct = medians.get(m.username);
    const med = acct && acct.posts >= RISING_MIN_POSTS ? acct.median : null;
    const vsMedian = med && med > 0 ? Math.round((engagement / med) * 10) / 10 : null;
    items.push({
      ...m,
      kind,
      engagement,
      rate: engagementRateOf(engagement, m.followers),
      vsMedian,
      rising: vsMedian !== null && vsMedian >= RISING_MULTIPLIER,
      image: m.thumbnailUrl ?? (m.mediaType === "VIDEO" ? null : m.mediaUrl),
    });
  }
  return items;
}

/** Filter chip + sort over scored items (returns a new array). */
export function filterAndSortTrends(scored: TrendItem[], filter: TrendFilter, sort: TrendSort): TrendItem[] {
  const items = scored.filter((i) => matchesFilter(i.kind, filter));
  const newest = (a: TrendItem, b: TrendItem) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  items.sort((a, b) => {
    if (sort === "newest") return newest(a, b) || b.engagement - a.engagement;
    if (sort === "rate") return (b.rate ?? -1) - (a.rate ?? -1) || b.engagement - a.engagement || newest(a, b);
    return b.engagement - a.engagement || newest(a, b);
  });
  return items;
}

// ---- Watched account summary ----------------------------------------------------------------------

export type AccountWeek = {
  postsThisWeek: number;
  avgEngagementThisWeek: number | null;
  avgEngagementLastWeek: number | null;
  /** % change of the average engagement vs the week before; null when either week has no posts. */
  changePct: number | null;
};

/** This week vs the week before for one account's cached posts. */
export function accountWeek(media: Pick<TrendMediaInput, "postedAt" | "likes" | "comments">[], now: number): AccountWeek {
  const week = 7 * 86_400_000;
  const cur: number[] = [];
  const prev: number[] = [];
  for (const m of media) {
    const age = now - new Date(m.postedAt).getTime();
    if (!Number.isFinite(age) || age < -5 * 60_000) continue;
    if (age < week) cur.push(engagementOf(m));
    else if (age < 2 * week) prev.push(engagementOf(m));
  }
  const avg = (l: number[]) => (l.length ? Math.round(l.reduce((s, n) => s + n, 0) / l.length) : null);
  const a = avg(cur);
  const b = avg(prev);
  return {
    postsThisWeek: cur.length,
    avgEngagementThisWeek: a,
    avgEngagementLastWeek: b,
    changePct: a !== null && b !== null && b > 0 ? Math.round(((a - b) / b) * 100) : null,
  };
}

// ---- Composer hand-off ----------------------------------------------------------------------------

const KIND_LABEL: Record<TrendKind, string> = { reel: "reel", carousel: "carousel", post: "post" };

/** First line of a caption, trimmed to `max` characters on a word boundary. */
export function captionSnippet(caption: string | null, max = 140): string {
  if (!caption) return "";
  const line = caption.split("\n").map((l) => l.trim()).find((l) => l !== "") ?? "";
  if (line.length <= max) return line;
  const cut = line.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/**
 * Text of the idea the "Make a post like this" button saves and opens in the composer. It credits the
 * source and asks for an original take; it never copies the media.
 */
export function draftIdeaText(item: Pick<TrendItem, "username" | "kind" | "caption" | "permalink" | "likes" | "comments">): string {
  const hook = captionSnippet(item.caption, 160);
  const stats = `${item.likes === null ? "likes hidden" : `${item.likes.toLocaleString("en-US")} likes`}, ${item.comments.toLocaleString("en-US")} comments`;
  const lines = [
    `Idea: my own ${KIND_LABEL[item.kind]} on the same topic as @${item.username}'s ${KIND_LABEL[item.kind]} (${stats}).`,
  ];
  if (hook) lines.push("", `Their opening line: "${hook}"`);
  lines.push("", "My angle:", "- Hook in the first second:", "- 3 key points:", "- Call to action:");
  if (item.permalink) lines.push("", `Reference: ${item.permalink}`);
  return lines.join("\n").slice(0, 2000);
}

/** 1234 -> "1.2K", 1_250_000 -> "1.3M". */
export function compactNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

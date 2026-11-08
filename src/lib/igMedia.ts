// Server only: the connected Instagram account's latest posts and reels for the dashboard ("Today's actions").
import { graphCall, type GraphAccount } from "@/lib/igGraph";
import { isFacebookLogin } from "@/lib/graphHost";

export type IgMediaItem = {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  isReel: boolean;
  /** Image to show: thumbnail for videos/reels, the media itself for images. */
  imageUrl: string | null;
  permalink: string | null;
  timestamp: string | null;
  likes: number | null;
  comments: number | null;
};

export const MEDIA_FIELDS = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";

type RawMedia = {
  id?: unknown;
  caption?: unknown;
  media_type?: unknown;
  media_product_type?: unknown;
  media_url?: unknown;
  thumbnail_url?: unknown;
  permalink?: unknown;
  timestamp?: unknown;
  like_count?: unknown;
  comments_count?: unknown;
};

const str = (v: unknown): string | null => (typeof v === "string" && v ? v : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Parses a Graph `/media` response into dashboard cards. Skips items without an id. */
export function parseMediaList(json: unknown): IgMediaItem[] {
  const data = typeof json === "object" && json !== null ? (json as { data?: unknown }).data : undefined;
  if (!Array.isArray(data)) return [];
  const out: IgMediaItem[] = [];
  for (const raw of data as RawMedia[]) {
    const id = str(raw?.id);
    if (!id) continue;
    const mediaType = str(raw.media_type) ?? "IMAGE";
    const isVideo = mediaType === "VIDEO";
    out.push({
      id,
      caption: str(raw.caption) ?? "",
      mediaType,
      isReel: isVideo || str(raw.media_product_type) === "REELS",
      imageUrl: isVideo ? str(raw.thumbnail_url) ?? null : str(raw.media_url) ?? str(raw.thumbnail_url),
      permalink: str(raw.permalink),
      timestamp: str(raw.timestamp),
      likes: num(raw.like_count),
      comments: num(raw.comments_count),
    });
  }
  return out;
}

/** "Today", "Yesterday", or a short date - in the given time zone (defaults to the server's). */
export function relativeDay(iso: string | null, now = new Date(), timeZone?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const fmt = (x: Date) => x.toLocaleDateString("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const today = fmt(now);
  const yesterday = fmt(new Date(now.getTime() - 864e5));
  const day = fmt(d);
  if (day === today) return "Today";
  if (day === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { timeZone, month: "short", day: "numeric" });
}

/** Latest posts/reels of the account (newest first). Throws GraphError on Meta errors. */
export async function fetchRecentMedia(account: GraphAccount, limit = 12): Promise<IgMediaItem[]> {
  const owner = isFacebookLogin(account.auth_type) ? encodeURIComponent(account.external_id) : "me";
  const json = await graphCall<unknown>(account, `${owner}/media`, {
    params: { fields: MEDIA_FIELDS, limit: String(Math.max(1, Math.min(limit, 25))) },
  });
  return parseMediaList(json);
}

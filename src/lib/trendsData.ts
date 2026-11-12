// Server only: Trends data access. Reads Meta's Instagram Business Discovery API with the user's own
// Instagram account connected through Facebook Login (Page-linked, instagram_basic). Tokens are
// decrypted here and never returned to callers that render to the client.
import { decryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { FB_GRAPH } from "@/lib/graphHost";
import {
  classifyGraphError,
  isStale,
  parseBusinessDiscovery,
  type DiscoveredAccount,
  type TrendErrorKind,
  type TrendMediaInput,
} from "@/lib/trends";

export type TrendConnection =
  | { state: "ready"; username: string | null }
  | { state: "expired"; username: string | null }
  | { state: "instagram_login_only"; username: string | null }
  | { state: "none" };

type AccountRow = { external_id: string; username: string | null; status: string; auth_type: string | null; access_token_enc: string | null };

async function instagramAccounts(userId: string): Promise<AccountRow[]> {
  return query<AccountRow>(
    `select external_id, username, status, auth_type, access_token_enc from socialapp.social_accounts
     where user_id=$1 and platform='instagram' and status <> 'disconnected'
     order by (auth_type='facebook_login' and status='active') desc, updated_at desc nulls last`,
    [userId],
  );
}

/** Which kind of Instagram connection the user has, for the page's connect / reconnect message. */
export async function trendConnection(userId: string): Promise<TrendConnection> {
  const rows = await instagramAccounts(userId);
  const fb = rows.find((r) => r.auth_type === "facebook_login" && r.access_token_enc);
  if (fb && fb.status === "active") return { state: "ready", username: fb.username };
  if (fb) return { state: "expired", username: fb.username };
  if (rows.length > 0) return { state: "instagram_login_only", username: rows[0].username };
  return { state: "none" };
}

/** The ig-user-id + decrypted Page token for Business Discovery, or null. Never send this to the client. */
async function discoveryCredentials(userId: string): Promise<{ igUserId: string; token: string } | null> {
  const rows = await instagramAccounts(userId);
  const fb = rows.find((r) => r.auth_type === "facebook_login" && r.status === "active" && r.access_token_enc);
  if (!fb?.access_token_enc) return null;
  try {
    return { igUserId: fb.external_id, token: decryptToken(fb.access_token_enc) };
  } catch {
    return null;
  }
}

export type WatchRow = {
  id: string;
  username: string;
  name: string | null;
  profile_picture_url: string | null;
  followers_count: number | null;
  media_count: number | null;
  fetched_at: Date | null;
  attempted_at: Date | null;
  error_kind: TrendErrorKind | null;
  error_message: string | null;
  followers_week_ago: number | null;
};

export async function listWatches(userId: string): Promise<WatchRow[]> {
  return query<WatchRow>(
    `select w.id, w.username, w.name, w.profile_picture_url, w.followers_count, w.media_count, w.fetched_at, w.attempted_at,
            w.error_kind, w.error_message,
            (select s.followers_count from socialapp.trend_account_snapshots s
              where s.watch_id=w.id and s.day <= (now() at time zone 'utc')::date - 7 order by s.day desc limit 1) as followers_week_ago
     from socialapp.trend_watches w where w.user_id=$1 order by w.created_at, w.username`,
    [userId],
  );
}

type MediaRow = {
  media_id: string;
  username: string;
  name: string | null;
  profile_picture_url: string | null;
  followers_count: number | null;
  media_type: string | null;
  media_product_type: string | null;
  caption: string | null;
  permalink: string | null;
  thumbnail_url: string | null;
  media_url: string | null;
  posted_at: Date;
  like_count: number | null;
  comments_count: number;
};

/** Cached posts of the user's watched accounts from the last 60 days (enough for medians + last week). */
export async function listTrendMedia(userId: string): Promise<TrendMediaInput[]> {
  const rows = await query<MediaRow>(
    `select m.media_id, w.username, w.name, w.profile_picture_url, w.followers_count, m.media_type, m.media_product_type,
            m.caption, m.permalink, m.thumbnail_url, m.media_url, m.posted_at, m.like_count, m.comments_count
     from socialapp.trend_media m join socialapp.trend_watches w on w.id=m.watch_id
     where w.user_id=$1 and m.posted_at > now() - interval '60 days'
     order by m.posted_at desc limit 3000`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.media_id,
    username: r.username,
    accountName: r.name,
    profilePictureUrl: r.profile_picture_url,
    followers: r.followers_count,
    mediaType: r.media_type,
    productType: r.media_product_type,
    caption: r.caption,
    permalink: r.permalink,
    thumbnailUrl: r.thumbnail_url,
    mediaUrl: r.media_url,
    postedAt: new Date(r.posted_at).toISOString(),
    likes: r.like_count,
    comments: r.comments_count,
  }));
}

// ---- Business Discovery fetch ---------------------------------------------------------------------

const MEDIA_FIELDS =
  "id,caption,media_type,media_product_type,like_count,comments_count,permalink,timestamp,thumbnail_url,media_url";

export function businessDiscoveryUrl(igUserId: string, username: string, token: string): string {
  const fields = `business_discovery.username(${username}){username,name,profile_picture_url,followers_count,media_count,media.limit(25){${MEDIA_FIELDS}}}`;
  const params = new URLSearchParams({ fields, access_token: token });
  return `${FB_GRAPH}/${encodeURIComponent(igUserId)}?${params.toString()}`;
}

type FetchResult = { ok: true; account: DiscoveredAccount } | { ok: false; kind: TrendErrorKind; message: string };

async function fetchDiscovery(igUserId: string, token: string, username: string): Promise<FetchResult> {
  let res: Response;
  try {
    res = await fetch(businessDiscoveryUrl(igUserId, username, token), { cache: "no-store", signal: AbortSignal.timeout(12_000) });
  } catch {
    return { ok: false, kind: "error", message: "Instagram didn't answer in time. We'll try again later." };
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body && typeof body === "object" ? (body as { error?: { code?: unknown; error_subcode?: unknown } }).error : undefined;
    const code = Number(err?.code);
    const sub = Number(err?.error_subcode);
    return { ok: false, ...classifyGraphError(res.status, Number.isFinite(code) ? code : null, Number.isFinite(sub) ? sub : null) };
  }
  const account = parseBusinessDiscovery(body);
  if (!account) return { ok: false, kind: "not_found", message: "Not found as a Business or Creator account. Personal and private accounts can't be read." };
  return { ok: true, account };
}

async function saveSuccess(watchId: string, a: DiscoveredAccount): Promise<void> {
  await query(
    `update socialapp.trend_watches set name=$2, profile_picture_url=$3, followers_count=$4, media_count=$5,
       fetched_at=now(), attempted_at=now(), error_kind=null, error_message=null where id=$1`,
    [watchId, a.name, a.profilePictureUrl, a.followers, a.mediaCount],
  );
  await query(
    `insert into socialapp.trend_account_snapshots (watch_id, day, followers_count, media_count)
     values ($1, (now() at time zone 'utc')::date, $2, $3)
     on conflict (watch_id, day) do update set followers_count=excluded.followers_count, media_count=excluded.media_count`,
    [watchId, a.followers, a.mediaCount],
  );
  if (a.media.length > 0) {
    await query(
      `insert into socialapp.trend_media (watch_id, media_id, media_type, media_product_type, caption, permalink, thumbnail_url, media_url, posted_at, like_count, comments_count)
       select $1, x.id, x.media_type, x.product_type, x.caption, x.permalink, x.thumbnail_url, x.media_url, x.posted_at, x.likes, coalesce(x.comments, 0)
       from jsonb_to_recordset($2::jsonb) as x(id text, media_type text, product_type text, caption text, permalink text, thumbnail_url text, media_url text, posted_at timestamptz, likes int, comments int)
       on conflict (watch_id, media_id) do update set media_type=excluded.media_type, media_product_type=excluded.media_product_type,
         caption=excluded.caption, permalink=excluded.permalink, thumbnail_url=excluded.thumbnail_url, media_url=excluded.media_url,
         posted_at=excluded.posted_at, like_count=excluded.like_count, comments_count=excluded.comments_count, updated_at=now()`,
      [
        watchId,
        JSON.stringify(
          a.media.map((m) => ({
            id: m.id,
            media_type: m.mediaType,
            product_type: m.productType,
            caption: m.caption ? m.caption.slice(0, 2200) : null,
            permalink: m.permalink,
            thumbnail_url: m.thumbnailUrl,
            media_url: m.mediaUrl,
            posted_at: m.postedAt,
            likes: m.likes,
            comments: m.comments,
          })),
        ),
      ],
    );
  }
  // Keep the cache small: posts older than 60 days and snapshots older than 120 days are not shown.
  await query("delete from socialapp.trend_media where watch_id=$1 and posted_at < now() - interval '60 days'", [watchId]);
  await query("delete from socialapp.trend_account_snapshots where watch_id=$1 and day < (now() at time zone 'utc')::date - 120", [watchId]);
}

async function saveFailure(watchId: string, kind: TrendErrorKind, message: string): Promise<void> {
  await query("update socialapp.trend_watches set attempted_at=now(), error_kind=$2, error_message=$3 where id=$1", [watchId, kind, message]);
}

export type RefreshSummary =
  | { ok: true; refreshed: number; failed: number; skipped: number; stoppedForRateLimit: boolean }
  | { ok: false; reason: "no_connection" | "busy" };

/** One refresh per user at a time inside this process. */
const running = new Set<string>();
/** Two Business Discovery calls in flight at most per user. */
const CONCURRENCY = 2;
/** A manual refresh still skips accounts read in the last 10 minutes. */
const FORCE_MIN_GAP_MS = 10 * 60 * 1000;

/**
 * Refreshes the user's watched accounts whose cache is stale (or, with `force`, all not read in the
 * last 10 minutes; `only` limits it to one watch id). Small concurrency; on a throttling error
 * (codes 4/17/32/613) or an invalid token it stops and leaves the rest for later.
 */
export async function refreshWatches(userId: string, opts: { force?: boolean; only?: string } = {}): Promise<RefreshSummary> {
  if (running.has(userId)) return { ok: false, reason: "busy" };
  running.add(userId);
  try {
    const creds = await discoveryCredentials(userId);
    if (!creds) return { ok: false, reason: "no_connection" };
    const now = Date.now();
    const watches = (await listWatches(userId)).filter((w) => {
      if (opts.only && w.id !== opts.only) return false;
      return opts.force ? isStale(w.attempted_at, now, FORCE_MIN_GAP_MS) : isStale(w.attempted_at, now);
    });
    let refreshed = 0;
    let failed = 0;
    let stop = false;
    let stoppedForRateLimit = false;
    let next = 0;
    const worker = async () => {
      while (!stop && next < watches.length) {
        const w = watches[next++];
        const r = await fetchDiscovery(creds.igUserId, creds.token, w.username);
        try {
          if (r.ok) {
            await saveSuccess(w.id, r.account);
            refreshed++;
          } else {
            await saveFailure(w.id, r.kind, r.message);
            failed++;
            if (r.kind === "rate_limited") {
              stop = true;
              stoppedForRateLimit = true;
            }
            if (r.kind === "token" || r.kind === "permission") stop = true;
          }
        } catch {
          failed++;
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, watches.length) }, worker));
    return { ok: true, refreshed, failed, skipped: watches.length - refreshed - failed, stoppedForRateLimit };
  } finally {
    running.delete(userId);
  }
}

import { decryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { graphBaseFor } from "@/lib/graphHost";
import { describeGraphError, fetchFollowersCount, GraphError } from "@/lib/igGraph";

export type MediaInsights = {
  reach: number | null;
  /**
   * Meta removed the media "impressions" metric (Graph v22+, April 2025) and replaced it with "views".
   * New data stores the views count here too, so existing readers keep working; `views` is the real name.
   */
  impressions: number | null;
  views?: number | null;
  likes: number | null;
  comments: number | null;
  saved: number | null;
  shares: number | null;
};

type GraphInsightRow = {
  name?: string;
  values?: { value?: number }[];
};

type GraphInsightsResponse = {
  data?: GraphInsightRow[];
  error?: { code?: number; message?: string; type?: string };
};

const METRIC_NAMES = ["reach", "impressions", "views", "likes", "comments", "saved", "shares"] as const;

// Currently supported Instagram media insight metrics (Graph API v22+). Stories do not support
// likes/comments/saved; asking for an unsupported metric fails the whole request.
const FEED_METRICS = ["reach", "views", "likes", "comments", "saved", "shares"] as const;
const STORY_METRICS = ["reach", "views", "shares"] as const;

export function insightMetricsFor(format: string | null | undefined): readonly string[] {
  return format === "story" ? STORY_METRICS : FEED_METRICS;
}

function emptyInsights(): MediaInsights {
  return { reach: null, impressions: null, views: null, likes: null, comments: null, saved: null, shares: null };
}

export function parseInsights(json: unknown): MediaInsights {
  const out = emptyInsights();
  if (!json || typeof json !== "object") return out;
  const data = (json as GraphInsightsResponse).data;
  if (!Array.isArray(data)) return out;
  for (const row of data) {
    const name = row.name;
    if (!name || !METRIC_NAMES.includes(name as (typeof METRIC_NAMES)[number])) continue;
    const raw = row.values?.[0]?.value;
    const value = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
    out[name as keyof MediaInsights] = value;
  }
  // "views" replaced "impressions": keep the old field filled for existing charts and exports.
  if (out.impressions == null && out.views != null) out.impressions = out.views;
  return out;
}

function mergeInsights(a: MediaInsights, b: MediaInsights): MediaInsights {
  const out = { ...a };
  for (const key of Object.keys(b) as (keyof MediaInsights)[]) {
    if (b[key] != null) out[key] = b[key];
  }
  return out;
}

type InsightsError = Error & { status: number; body: unknown };

async function requestInsights(
  mediaId: string,
  token: string,
  metrics: readonly string[],
  authType: string | null | undefined,
  fetchImpl: typeof fetch,
): Promise<MediaInsights> {
  // Token in the Authorization header (both graph.instagram.com and graph.facebook.com accept it),
  // never in the URL where proxies, logs and error messages would keep it.
  const params = new URLSearchParams({ metric: metrics.join(",") });
  const res = await fetchImpl(`${graphBaseFor(authType)}/${encodeURIComponent(mediaId)}/insights?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  let json: GraphInsightsResponse = {};
  try {
    json = (await res.json()) as GraphInsightsResponse;
  } catch {
    // non-JSON body
  }
  if (!res.ok || json.error) {
    const err = new Error(json.error?.message ?? `Instagram insights failed (${res.status})`) as InsightsError;
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return parseInsights(json);
}

/**
 * Fetch media insights with the metrics the current Graph API supports for this media type.
 * If the combined request is rejected for a non-permission reason (e.g. one metric unsupported
 * for this media), each metric is fetched on its own and the ones that work are kept.
 */
export async function fetchMediaInsights(
  mediaId: string,
  token: string,
  authType?: string | null,
  format?: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<MediaInsights> {
  const metrics = insightMetricsFor(format);
  try {
    return await requestInsights(mediaId, token, metrics, authType, fetchImpl);
  } catch (e) {
    const err = e as InsightsError;
    if (isInsightsPermissionError(err.status ?? 0, err.body)) throw e;
    if ((err.status ?? 0) >= 500 || err.status === 429 || !err.status) throw e;
  }
  let out = emptyInsights();
  let ok = 0;
  let lastError: unknown = null;
  for (const metric of metrics) {
    try {
      out = mergeInsights(out, await requestInsights(mediaId, token, [metric], authType, fetchImpl));
      ok++;
    } catch (e) {
      const err = e as InsightsError;
      if (isInsightsPermissionError(err.status ?? 0, err.body)) throw e;
      lastError = e;
    }
  }
  if (ok === 0 && lastError) throw lastError;
  return out;
}

function isInsightsPermissionError(status: number, body: unknown): boolean {
  if (status === 403) return true;
  if (!body || typeof body !== "object") return false;
  const err = (body as GraphInsightsResponse).error;
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  if (msg.includes("permission") || msg.includes("scope")) return true;
  if (err.code === 10 || err.code === 200 || err.code === 190) return true;
  return false;
}

type TargetRow = {
  id: string;
  external_post_id: string;
  access_token_enc: string;
  auth_type?: string | null;
  ig_format?: string | null;
};

export async function refreshRecentInsights(limit = 50, fetchImpl: typeof fetch = fetch): Promise<{ updated: number }> {
  const rows = await query<TargetRow>(
    `select t.id, t.external_post_id, a.access_token_enc, a.auth_type, p.ig_format
     from socialapp.post_targets t
     join socialapp.social_accounts a on a.id = t.social_account_id
     join socialapp.scheduled_posts p on p.id = t.post_id
     where t.platform = 'instagram'
       and t.status = 'published'
       and t.published_at > now() - interval '30 days'
       and t.external_post_id is not null
       and a.status = 'active'
       and a.access_token_enc is not null
       and (t.insights_at is null or t.insights_at < now() - interval '6 hours')
     order by t.insights_at nulls first, t.published_at desc
     limit $1`,
    [limit]
  );

  let updated = 0;

  for (const row of rows) {
    let token = "";
    try {
      token = decryptToken(row.access_token_enc);
    } catch {
      await query(`update socialapp.post_targets set insights_at=now() where id=$1`, [row.id]);
      continue;
    }

    try {
      const insights = await fetchMediaInsights(row.external_post_id, token, row.auth_type, row.ig_format, fetchImpl);
      await query(`update socialapp.post_targets set insights=$2::jsonb, insights_at=now() where id=$1`, [
        row.id,
        JSON.stringify(insights),
      ]);
      updated++;
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0;
      const body = (e as { body?: unknown }).body;
      if (isInsightsPermissionError(status, body)) {
        await query(`update socialapp.post_targets set insights_at=now() where id=$1`, [row.id]);
        continue;
      }
      console.error("refreshRecentInsights: fetch failed for target", row.id);
    }
  }

  return { updated };
}

type SnapshotAccountRow = {
  id: string;
  user_id: string;
  external_id: string;
  access_token_enc: string;
  auth_type?: string | null;
};

// Record today's follower count for each active Instagram account (growth chart data).
// At most one snapshot per account per ~24 h. Tolerates the snapshots table being absent.
export async function snapshotAccountFollowers(limit = 20): Promise<{ snapshotted: number }> {
  const rows = await query<SnapshotAccountRow>(
    `select id, user_id, external_id, access_token_enc, auth_type
     from socialapp.social_accounts
     where platform = 'instagram' and status = 'active' and access_token_enc is not null
     order by updated_at desc
     limit $1`,
    [limit]
  );

  let snapshotted = 0;
  for (const row of rows) {
    let followers: number | null;
    try {
      followers = await fetchFollowersCount(row);
    } catch (e) {
      // Rate limits and expired tokens are expected noise (graphCall marks expired accounts); log the rest with the Graph code/message.
      if (e instanceof GraphError && (e.kind === "rate_limited" || e.kind === "token")) continue;
      console.error(
        `snapshotAccountFollowers: profile fetch failed for account ${row.id} (auth_type=${row.auth_type ?? "instagram_login"}): ${describeGraphError(e)}`
      );
      continue;
    }
    if (followers == null) continue;
    try {
      await query(
        `insert into socialapp.account_snapshots (user_id, account_id, followers, taken_at)
         select $1, $2, $3, now()
         where not exists (
           select 1 from socialapp.account_snapshots
           where account_id = $2 and taken_at > now() - interval '20 hours'
         )`,
        [row.user_id, row.id, followers]
      );
      snapshotted++;
    } catch (e) {
      console.error(`snapshotAccountFollowers: saving snapshot failed for account ${row.id}: ${e instanceof Error ? e.message.slice(0, 200) : "unknown error"}`);
    }
  }

  return { snapshotted };
}

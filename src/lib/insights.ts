import { decryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";

export type MediaInsights = {
  reach: number | null;
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

const METRIC_NAMES = ["reach", "likes", "comments", "saved", "shares"] as const;

function emptyInsights(): MediaInsights {
  return { reach: null, likes: null, comments: null, saved: null, shares: null };
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
  return out;
}

export async function fetchMediaInsights(mediaId: string, token: string): Promise<MediaInsights> {
  const params = new URLSearchParams({
    metric: "reach,likes,comments,saved,shares",
    access_token: token,
  });
  const res = await fetch(`https://graph.instagram.com/v21.0/${encodeURIComponent(mediaId)}/insights?${params.toString()}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as GraphInsightsResponse;
  if (!res.ok) {
    const err = new Error(`Instagram insights failed (${res.status})`);
    (err as Error & { status: number; body: unknown }).status = res.status;
    (err as Error & { status: number; body: unknown }).body = json;
    throw err;
  }
  if (json.error) {
    const err = new Error(json.error.message ?? "Instagram insights error");
    (err as Error & { status: number; body: unknown }).status = res.status;
    (err as Error & { status: number; body: unknown }).body = json;
    throw err;
  }
  return parseInsights(json);
}

function isInsightsPermissionError(status: number, body: unknown): boolean {
  if (status === 403) return true;
  if (!body || typeof body !== "object") return false;
  const err = (body as GraphInsightsResponse).error;
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  if (msg.includes("permission") || msg.includes("scope") || msg.includes("insights")) return true;
  if (err.code === 10 || err.code === 200 || err.code === 190) return true;
  return false;
}

type TargetRow = {
  id: string;
  external_post_id: string;
  access_token_enc: string;
};

export async function refreshRecentInsights(limit = 50): Promise<{ updated: number }> {
  const rows = await query<TargetRow>(
    `select t.id, t.external_post_id, a.access_token_enc
     from socialapp.post_targets t
     join socialapp.social_accounts a on a.id = t.social_account_id
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
      const insights = await fetchMediaInsights(row.external_post_id, token);
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

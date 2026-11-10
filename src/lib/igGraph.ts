// Server only: small Instagram Graph API client for the dashboard (profile, account insights, replies).
// GET retries rate limits / 5xx with backoff; POST is single-attempt. Marks the account "expired" when Meta says the token is invalid.
import { decryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { graphBaseFor, isFacebookLogin } from "@/lib/graphHost";

const TIMEOUT_MS = 6_000;
const RATE_LIMIT_CODES = new Set([4, 17, 32, 613]);
// 190 = invalid/expired OAuth token; 102 = session expired; 463/467 = token subcodes.
const TOKEN_CODES = new Set([102, 190]);

/** auth_type picks the host: facebook_login = graph.facebook.com + Page token, else graph.instagram.com. */
export type GraphAccount = { id: string; external_id: string; access_token_enc: string | null; auth_type?: string | null };

export class GraphError extends Error {
  readonly kind: "token" | "rate_limited" | "other";
  readonly code: number | null;
  constructor(message: string, kind: "token" | "rate_limited" | "other", code: number | null) {
    super(message);
    this.kind = kind;
    this.code = code;
  }
}

function metaError(body: unknown): { code: number | null; message: string } {
  const err = typeof body === "object" && body !== null ? (body as { error?: { code?: unknown; message?: unknown } }).error : undefined;
  const code = Number(err?.code);
  return { code: Number.isFinite(code) ? code : null, message: typeof err?.message === "string" ? err.message : "" };
}

export function classifyGraphError(status: number, body: unknown): "token" | "rate_limited" | "other" {
  const { code } = metaError(body);
  if (status === 429 || (code !== null && RATE_LIMIT_CODES.has(code))) return "rate_limited";
  if (status === 401 || (code !== null && TOKEN_CODES.has(code))) return "token";
  return "other";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function markAccountExpired(accountId: string): Promise<void> {
  await query("update socialapp.social_accounts set status='expired', updated_at=now() where id=$1 and status='active'", [accountId]).catch(() => undefined);
}

const POST_UNCERTAIN_MSG =
  "We couldn't confirm whether your message was delivered. Check Instagram before sending again.";

// GET: up to 2 retries (1s, 3s) on rate limits / 5xx / network errors. POST: single attempt (no retry) so replies/DMs are not duplicated. Throws GraphError.
export async function graphCall<T>(
  account: GraphAccount,
  path: string,
  init: { method?: "GET" | "POST"; params?: Record<string, string>; body?: unknown } = {}
): Promise<T> {
  if (!account.access_token_enc) throw new GraphError("Instagram is not connected", "token", null);
  let token: string;
  try {
    token = decryptToken(account.access_token_enc);
  } catch {
    throw new GraphError("Stored Instagram token cannot be read", "token", null);
  }
  const method = init.method ?? "GET";
  const canRetry = method === "GET";
  const qs = init.params ? `?${new URLSearchParams(init.params).toString()}` : "";
  const delays = [1_000, 3_000];
  for (let attempt = 0; ; attempt++) {
    let status = 0;
    let body: unknown = null;
    try {
      const res = await fetch(`${graphBaseFor(account.auth_type)}/${path}${qs}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, ...(init.body ? { "Content-Type": "application/json" } : {}) },
        body: init.body ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      status = res.status;
      body = await res.json().catch(() => null);
      if (res.ok && !metaError(body).message) return body as T;
    } catch (err) {
      if (!canRetry) throw new GraphError(POST_UNCERTAIN_MSG, "other", null);
      if (attempt >= delays.length) throw new GraphError(err instanceof Error ? err.message : "network error", "other", null);
      await sleep(delays[attempt]);
      continue;
    }
    const kind = classifyGraphError(status, body);
    const { code, message } = metaError(body);
    if (kind === "token") {
      await markAccountExpired(account.id);
      throw new GraphError("Instagram access expired or was removed. Reconnect Instagram in Settings.", "token", code);
    }
    if (!canRetry && status >= 500) throw new GraphError(POST_UNCERTAIN_MSG, "other", code);
    if ((kind === "rate_limited" || status >= 500) && canRetry && attempt < delays.length) {
      await sleep(delays[attempt]);
      continue;
    }
    throw new GraphError(
      kind === "rate_limited" ? "Instagram rate limit reached. Please try again in a few minutes." : (message || `Instagram error (${status})`).slice(0, 300).split(token).join("[redacted]"),
      kind,
      code
    );
  }
}

export type IgProfile = {
  username: string;
  name: string | null;
  profilePictureUrl: string | null;
  followers: number | null;
  mediaCount: number | null;
};

export async function fetchIgProfile(account: GraphAccount): Promise<IgProfile> {
  const json = await graphCall<{ username?: string; name?: string; profile_picture_url?: string; followers_count?: number; media_count?: number }>(
    account,
    // With a Page token "me" is the Page, so Facebook-login accounts ask for the IG user id directly.
    isFacebookLogin(account.auth_type) ? encodeURIComponent(account.external_id) : "me",
    {
      params: {
        fields: isFacebookLogin(account.auth_type)
          ? "username,name,profile_picture_url,followers_count,media_count"
          : "user_id,username,name,profile_picture_url,followers_count,media_count",
      },
    }
  );
  return {
    username: json.username ?? "",
    name: json.name ?? null,
    profilePictureUrl: json.profile_picture_url ?? null,
    followers: typeof json.followers_count === "number" ? json.followers_count : null,
    mediaCount: typeof json.media_count === "number" ? json.media_count : null,
  };
}

export type AccountInsights = { reach: number | null; accountsEngaged: number | null; totalInteractions: number | null; profileViews: number | null };

export function parseAccountInsights(json: unknown): AccountInsights {
  const out: AccountInsights = { reach: null, accountsEngaged: null, totalInteractions: null, profileViews: null };
  const data = typeof json === "object" && json !== null ? (json as { data?: unknown }).data : null;
  if (!Array.isArray(data)) return out;
  const map: Record<string, keyof AccountInsights> = {
    reach: "reach",
    accounts_engaged: "accountsEngaged",
    total_interactions: "totalInteractions",
    profile_views: "profileViews",
  };
  for (const row of data as { name?: string; total_value?: { value?: unknown } }[]) {
    const key = row?.name ? map[row.name] : undefined;
    const v = row?.total_value?.value;
    if (key && typeof v === "number" && Number.isFinite(v)) out[key] = v;
  }
  return out;
}

// Account-level insights for the last 7 days.
export async function fetchAccountInsights(account: GraphAccount): Promise<AccountInsights> {
  const until = Math.floor(Date.now() / 1000);
  const since = until - 7 * 24 * 60 * 60;
  const json = await graphCall<unknown>(account, `${encodeURIComponent(account.external_id)}/insights`, {
    params: {
      metric: "reach,accounts_engaged,total_interactions,profile_views",
      period: "day",
      metric_type: "total_value",
      since: String(since),
      until: String(until),
    },
  });
  return parseAccountInsights(json);
}

export async function replyToCommentPublicly(account: GraphAccount, commentId: string, message: string): Promise<void> {
  await graphCall(account, `${encodeURIComponent(commentId)}/replies`, { method: "POST", body: { message } });
}

// Like a comment (instagram_business_manage_comments). No body.
export async function likeComment(account: GraphAccount, commentId: string): Promise<void> {
  await graphCall(account, `${encodeURIComponent(commentId)}/likes`, { method: "POST" });
}

export async function sendDirectMessage(account: GraphAccount, recipientId: string, text: string): Promise<void> {
  await graphCall(account, `${encodeURIComponent(account.external_id)}/messages`, {
    method: "POST",
    body: { recipient: { id: recipientId }, message: { text } },
  });
}

export async function userAccount(userId: string, accountId: string): Promise<GraphAccount | null> {
  const rows = await query<GraphAccount>(
    "select id, external_id, access_token_enc, auth_type from socialapp.social_accounts where id=$1 and user_id=$2 and platform='instagram' and status='active'",
    [accountId, userId]
  );
  return rows[0] ?? null;
}

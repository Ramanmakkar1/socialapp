// Meta "Facebook Login for Business" (config_id) for Instagram: OAuth dialog, code exchange,
// Page + Instagram professional account discovery, webhook subscription and Page-token checks.
// Secrets only from env vars; errors never carry a token.
import { createHmac, timingSafeEqual } from "node:crypto";
import { BRAND } from "./brand.ts";
import { FB_GRAPH, GRAPH_VERSION } from "./graphHost.ts";

export const META_GRAPH = FB_GRAPH;

/**
 * Permissions the Instagram features need. The config_id in the Meta dashboard decides what the
 * dialog asks for; these are checked after login so a user who unticks one gets a clear message.
 */
export const REQUIRED_META_SCOPES = [
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
] as const;
// 2026-11-07: pages_manage_metadata is NOT required. The Meta app's Instagram use case cannot grant it, and
// subscribePage() failing without it is already handled (account is saved, subscribed=false).

export type MetaLoginConfig = {
  appId: string;
  configId: string;
  appSecret: string;
  redirectUri: string;
};

export function metaLoginConfig(): MetaLoginConfig {
  return {
    appId: process.env.META_APP_ID || "2785977518463252",
    configId: process.env.META_LOGIN_CONFIG_ID ?? "",
    appSecret: process.env.META_APP_SECRET ?? "",
    redirectUri: `${BRAND.url}/api/instagram/callback`,
  };
}

export function isMetaLoginConfigured(): boolean {
  const { appId, configId, appSecret } = metaLoginConfig();
  return appId !== "" && configId !== "" && appSecret !== "";
}

// Facebook Login dialog URL. No scope param: the scopes come from the config_id.
export function metaAuthorizeUrl(state: string): string {
  const { appId, configId, redirectUri } = metaLoginConfig();
  const params = new URLSearchParams({
    client_id: appId,
    config_id: configId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

// state = `${nonce}.${hexsig}` where hexsig = HMAC-SHA256(nonce, appSecret).
export function signState(nonce: string): string {
  const { appSecret } = metaLoginConfig();
  const sig = createHmac("sha256", appSecret).update(nonce, "utf8").digest("hex");
  return `${nonce}.${sig}`;
}

export function verifyState(signed: string, cookieNonce: string): boolean {
  const { appSecret } = metaLoginConfig();
  if (!appSecret) return false;
  const dot = signed.indexOf(".");
  if (dot <= 0 || dot === signed.length - 1) return false;
  const nonce = signed.slice(0, dot);
  if (nonce !== cookieNonce) return false;
  const expected = createHmac("sha256", appSecret).update(nonce, "utf8").digest();
  const received = Buffer.from(signed.slice(dot + 1), "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

/** A failed Meta call. `code` is Meta's error code (190 = token invalid/expired). Never holds a token. */
export class MetaApiError extends Error {
  readonly status: number;
  readonly code: number | null;
  constructor(status: number, code: number | null) {
    super(String(status));
    this.status = status;
    this.code = code;
  }
  get tokenInvalid(): boolean {
    return this.code === 190 || this.code === 102 || this.status === 401;
  }
}

function errorCode(body: unknown): number | null {
  const err = typeof body === "object" && body !== null ? (body as { error?: { code?: unknown } }).error : undefined;
  const code = Number(err?.code);
  return Number.isFinite(code) && err ? code : null;
}

async function readJson(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}

async function metaGet(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  const body = await readJson(res);
  if (!res.ok) throw new MetaApiError(res.status, errorCode(body));
  return body;
}

async function metaPost(url: string, body: Record<string, string>): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const json = await readJson(res);
  if (!res.ok) throw new MetaApiError(res.status, errorCode(json));
  return json;
}

function requireToken(json: unknown): string {
  const token = typeof json === "object" && json !== null ? (json as { access_token?: unknown }).access_token : undefined;
  if (typeof token !== "string" || token === "") throw new MetaApiError(500, null);
  return token;
}

// Short-lived user token from the OAuth code.
export async function exchangeMetaCode(code: string): Promise<string> {
  const { appId, appSecret, redirectUri } = metaLoginConfig();
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });
  return requireToken(await metaGet(`${META_GRAPH}/oauth/access_token?${params.toString()}`));
}

// Long-lived user token (~60 days) exchanged from the short-lived one. Page tokens read with it do not expire.
export async function metaLongLivedUserToken(short: string): Promise<string> {
  const { appId, appSecret } = metaLoginConfig();
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: short,
  });
  return requireToken(await metaGet(`${META_GRAPH}/oauth/access_token?${params.toString()}`));
}

export type MetaPageWithInstagram = {
  pageId: string;
  pageName: string;
  pageToken: string;
  igUserId: string;
  igUsername: string;
  igPicture: string | null;
};

type PageRow = {
  id?: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id?: string; username?: string; profile_picture_url?: string } | null;
};

export type MetaPages = {
  /** Pages the user granted (with or without Instagram). */
  pageCount: number;
  /** Pages that have an Instagram professional account linked. */
  withInstagram: MetaPageWithInstagram[];
};

const MAX_PAGE_REQUESTS = 5;

// All Pages the user granted, following Graph paging (max 5 x 100 pages).
export async function fetchMetaPages(userToken: string): Promise<MetaPages> {
  const fields = "id,name,access_token,instagram_business_account{id,username,profile_picture_url}";
  let url: string | null =
    `${META_GRAPH}/me/accounts?fields=${encodeURIComponent(fields)}&limit=100&access_token=${encodeURIComponent(userToken)}`;
  const out: MetaPages = { pageCount: 0, withInstagram: [] };
  for (let i = 0; url && i < MAX_PAGE_REQUESTS; i++) {
    const json = (await metaGet(url)) as { data?: PageRow[]; paging?: { next?: unknown } };
    for (const row of Array.isArray(json?.data) ? json.data : []) {
      if (typeof row?.id !== "string") continue;
      out.pageCount += 1;
      const ig = row.instagram_business_account;
      if (!ig || typeof ig.id !== "string" || typeof row.name !== "string" || typeof row.access_token !== "string") continue;
      out.withInstagram.push({
        pageId: row.id,
        pageName: row.name,
        pageToken: row.access_token,
        igUserId: ig.id,
        igUsername: typeof ig.username === "string" ? ig.username : "",
        igPicture: typeof ig.profile_picture_url === "string" ? ig.profile_picture_url : null,
      });
    }
    const next = json?.paging?.next;
    url = typeof next === "string" && next.startsWith("https://graph.facebook.com/") ? next : null;
  }
  return out;
}

// Pages the user manages that have an attached Instagram business account.
export async function fetchPagesWithInstagram(userToken: string): Promise<MetaPageWithInstagram[]> {
  return (await fetchMetaPages(userToken)).withInstagram;
}

export type MetaPermissions = { granted: string[]; declined: string[] };

export async function fetchPermissions(userToken: string): Promise<MetaPermissions> {
  const json = (await metaGet(`${META_GRAPH}/me/permissions?access_token=${encodeURIComponent(userToken)}`)) as {
    data?: { permission?: string; status?: string }[];
  };
  const out: MetaPermissions = { granted: [], declined: [] };
  for (const row of Array.isArray(json?.data) ? json.data : []) {
    if (typeof row?.permission !== "string") continue;
    if (row.status === "granted") out.granted.push(row.permission);
    else out.declined.push(row.permission);
  }
  return out;
}

// Scope names Meta granted to the app for this user token.
export async function fetchGrantedScopes(userToken: string): Promise<string[]> {
  return (await fetchPermissions(userToken)).granted;
}

export function missingScopes(granted: readonly string[]): string[] {
  return REQUIRED_META_SCOPES.filter((s) => !granted.includes(s));
}

// App-scoped Facebook user id: the user_id Meta puts in deauthorize / data-deletion signed_requests.
export async function fetchMetaUserId(userToken: string): Promise<string | null> {
  try {
    const json = (await metaGet(`${META_GRAPH}/me?fields=id&access_token=${encodeURIComponent(userToken)}`)) as { id?: unknown };
    return typeof json?.id === "string" ? json.id : null;
  } catch {
    return null;
  }
}

/** Page webhook fields. Instagram comments/messages arrive on the app's "instagram" subscription
 *  once the Page has the app installed; "feed" needs only pages_manage_metadata. */
export const PAGE_SUBSCRIBED_FIELDS = "feed";

// Installs the app on the Page so Meta delivers the Instagram comment and message webhooks for it.
export async function subscribePage(pageId: string, pageToken: string): Promise<void> {
  await metaPost(`${META_GRAPH}/${encodeURIComponent(pageId)}/subscribed_apps`, {
    subscribed_fields: PAGE_SUBSCRIBED_FIELDS,
    access_token: pageToken,
  });
}

export type MetaDiscovery =
  | { ok: true; userToken: string; scopes: string[]; metaUserId: string | null; pages: MetaPageWithInstagram[] }
  | { ok: false; reason: "missing_permissions" | "no_pages" | "no_ig_business"; missing?: string[] };

/**
 * Callback core: code -> short-lived user token -> long-lived user token -> granted permissions,
 * Pages and their Instagram professional accounts. Throws MetaApiError on Meta/network failures.
 */
export async function discoverMetaAccounts(code: string): Promise<MetaDiscovery> {
  const short = await exchangeMetaCode(code);
  const userToken = await metaLongLivedUserToken(short);
  const [perms, pages, metaUserId] = await Promise.all([
    fetchPermissions(userToken),
    fetchMetaPages(userToken),
    fetchMetaUserId(userToken),
  ]);
  const missing = missingScopes(perms.granted);
  if (missing.length > 0) return { ok: false, reason: "missing_permissions", missing };
  if (pages.pageCount === 0) return { ok: false, reason: "no_pages" };
  if (pages.withInstagram.length === 0) return { ok: false, reason: "no_ig_business" };
  return { ok: true, userToken, scopes: perms.granted, metaUserId, pages: pages.withInstagram };
}

export type PageTokenCheck = "valid" | "invalid" | "unknown";

/**
 * Long-lived Page tokens do not expire but are invalidated when the user changes their password,
 * removes the app or loses the Page role. debug_token with the app token says which.
 */
export async function checkPageToken(pageToken: string): Promise<PageTokenCheck> {
  const { appId, appSecret } = metaLoginConfig();
  if (!appSecret) return "unknown";
  const params = new URLSearchParams({ input_token: pageToken, access_token: `${appId}|${appSecret}` });
  try {
    const json = (await metaGet(`${META_GRAPH}/debug_token?${params.toString()}`)) as {
      data?: { is_valid?: unknown; expires_at?: unknown };
    };
    if (json?.data?.is_valid === true) return "valid";
    if (json?.data?.is_valid === false) return "invalid";
    return "unknown";
  } catch (err) {
    if (err instanceof MetaApiError && err.tokenInvalid) return "invalid";
    return "unknown";
  }
}

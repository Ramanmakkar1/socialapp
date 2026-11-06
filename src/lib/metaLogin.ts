// Meta unified login (Facebook Login with config_id) building blocks.
// Owner instruction #73, step 1 of 3: adds code only; no route or token flow uses it yet.
import { createHmac, timingSafeEqual } from "node:crypto";
import { BRAND } from "./brand.ts";

export const META_GRAPH = "https://graph.facebook.com/v23.0";

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

// Facebook Login dialog URL for the unified login. No scope param: the scopes come from the config_id.
export function metaAuthorizeUrl(state: string): string {
  const { appId, configId, redirectUri } = metaLoginConfig();
  const params = new URLSearchParams({
    client_id: appId,
    config_id: configId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`;
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

// Meta Graph calls. Every failure throws an Error whose message is the HTTP status only
// (never a token or secret); the caller decides what to show.
async function metaGet(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

async function metaPost(url: string, body: Record<string, string>): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

function requireToken(json: unknown): string {
  const token = typeof json === "object" && json !== null ? (json as { access_token?: unknown }).access_token : undefined;
  if (typeof token !== "string" || token === "") throw new Error("500");
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

// Long-lived user token exchanged from the short-lived one.
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

// Pages the user manages that have an attached Instagram business account.
export async function fetchPagesWithInstagram(userToken: string): Promise<MetaPageWithInstagram[]> {
  const fields = "id,name,access_token,instagram_business_account{id,username,profile_picture_url}";
  const json = (await metaGet(
    `${META_GRAPH}/me/accounts?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(userToken)}`
  )) as { data?: PageRow[] };
  const out: MetaPageWithInstagram[] = [];
  for (const row of Array.isArray(json?.data) ? json.data : []) {
    const ig = row?.instagram_business_account;
    if (!ig || typeof row.id !== "string" || typeof row.name !== "string" || typeof row.access_token !== "string") continue;
    out.push({
      pageId: row.id,
      pageName: row.name,
      pageToken: row.access_token,
      igUserId: typeof ig.id === "string" ? ig.id : "",
      igUsername: typeof ig.username === "string" ? ig.username : "",
      igPicture: typeof ig.profile_picture_url === "string" ? ig.profile_picture_url : null,
    });
  }
  return out;
}

// Scope names Meta granted to the app for this user token.
export async function fetchGrantedScopes(userToken: string): Promise<string[]> {
  const json = (await metaGet(`${META_GRAPH}/me/permissions?access_token=${encodeURIComponent(userToken)}`)) as {
    data?: { permission?: string; status?: string }[];
  };
  const out: string[] = [];
  for (const row of Array.isArray(json?.data) ? json.data : []) {
    if (row?.status === "granted" && typeof row.permission === "string") out.push(row.permission);
  }
  return out;
}

// Subscribe the app to the page's feed + messages so the webhook receives page posts and comments.
export async function subscribePage(pageId: string, pageToken: string): Promise<void> {
  await metaPost(`${META_GRAPH}/${encodeURIComponent(pageId)}/subscribed_apps`, {
    subscribed_fields: "feed,messages",
    access_token: pageToken,
  });
}

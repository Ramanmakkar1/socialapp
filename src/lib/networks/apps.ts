// Server only: networks that connect through an app the Poskoo owner registers (no platform review
// for any of them, but each needs its client keys in env vars). Until the keys are set, the Connect
// card shows "Not available yet" (src/lib/channelStatus.ts) and the connect route refuses.
//   - Tumblr: OAuth 2 (basic write offline_access), NPF posts with uploaded images.
//   - WordPress.com: OAuth 2 (the user picks one site on WordPress.com), WP REST v2 via the shared
//     wpPublish() from blogs.ts.
//   - Plurk: OAuth 1.0a (HMAC-SHA1), /APP/Timeline/plurkAdd, text only (360 characters).
//   - Twitch: OAuth 2 (user:write:chat), a chat message in the user's own channel (Helix Send Chat
//     Message), text only (500 characters). Twitch has no API for posts.
//   - Farcaster: Sign in with Neynar (Neynar-managed signer), casts through Neynar's API, text only.
import { createHmac, randomBytes } from "node:crypto";
import { BRAND } from "@/lib/brand";
import { NetworkAuthError, obj, redact, str, tokenSetFrom, type Fetch, type PublishInput, type PublishOutcome, type TokenSet } from "@/lib/networks/common";
import { wpPublish } from "@/lib/networks/blogs";
import { blobOf, call, downloadAll, failed } from "@/lib/networks/http";
import type { SaveAccountInput } from "@/lib/networks/store";

const MB = 1024 * 1024;
const env = (k: string) => (process.env[k] ?? "").trim();

/** Standard OAuth 2 token POST (form body, client id + secret in the body). Throws NetworkAuthError. */
async function oauth2Token(url: string, label: string, body: Record<string, string>, secret: string, fetchImpl: Fetch): Promise<Record<string, unknown>> {
  const r = await call(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body: new URLSearchParams(body).toString() }, fetchImpl, 15_000);
  if (!r.ok) {
    throw new NetworkAuthError("exchange_failed", redact(`${label} token request failed (${r.status}) ${r.error}`, secret, body.code, body.refresh_token), r.status === 400 || r.status === 401);
  }
  return r.json;
}

// ---- Tumblr ---------------------------------------------------------------------------------------

export const TUMBLR_SCOPES = ["basic", "write", "offline_access"];
const TUMBLR_API = "https://api.tumblr.com/v2";

export function tumblrConfig() {
  return { clientId: env("TUMBLR_CLIENT_ID"), clientSecret: env("TUMBLR_CLIENT_SECRET"), redirectUri: `${BRAND.url}/api/tumblr/callback` };
}
export const isTumblrConfigured = () => tumblrConfig().clientId !== "" && tumblrConfig().clientSecret !== "";

export function tumblrAuthorizeUrl(state: string): string {
  const c = tumblrConfig();
  const p = new URLSearchParams({ client_id: c.clientId, response_type: "code", scope: TUMBLR_SCOPES.join(" "), state, redirect_uri: c.redirectUri });
  return `https://www.tumblr.com/oauth2/authorize?${p.toString()}`;
}

async function tumblrToken(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet> {
  const c = tumblrConfig();
  const json = await oauth2Token(`${TUMBLR_API}/oauth2/token`, "Tumblr", { client_id: c.clientId, client_secret: c.clientSecret, ...body }, c.clientSecret, fetchImpl);
  return tokenSetFrom(json, "Tumblr");
}

export const exchangeTumblrCode = (code: string, fetchImpl: Fetch = fetch) => tumblrToken({ grant_type: "authorization_code", code, redirect_uri: tumblrConfig().redirectUri }, fetchImpl);
/** Access tokens live ~42 minutes; refresh tokens rotate on every refresh. */
export const refreshTumblrToken = (refreshToken: string, fetchImpl: Fetch = fetch) => tumblrToken({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);

/** The user's primary blog (Poskoo posts there). */
export async function tumblrPrimaryBlog(token: string, fetchImpl: Fetch = fetch): Promise<{ uuid: string; name: string; title: string; url: string }> {
  const r = await call(`${TUMBLR_API}/user/info`, { method: "GET", headers: { Authorization: `Bearer ${token}` } }, fetchImpl, 15_000);
  const blogs = r.ok && Array.isArray(obj(obj(r.json.response).user).blogs) ? (obj(obj(r.json.response).user).blogs as unknown[]).map(obj) : [];
  const blog = blogs.find((b) => b.primary === true) ?? blogs[0];
  if (!blog || !str(blog.name)) throw new NetworkAuthError("profile_failed", "Tumblr didn't return a blog for this account.");
  return { uuid: str(blog.uuid) || str(blog.name), name: str(blog.name), title: str(blog.title), url: str(blog.url) };
}

/** NPF content: one text block per paragraph (Tumblr caps a single block), then image blocks. */
export function tumblrContent(text: string, imageTypes: string[] = []): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = text
    .trim()
    .split(/\n{2,}/)
    .filter((p) => p.trim() !== "")
    .flatMap((p) => (p.match(/[\s\S]{1,4000}/g) ?? []).map((chunk) => ({ type: "text", text: chunk })));
  imageTypes.forEach((type, i) => blocks.push({ type: "image", media: [{ type, identifier: `f${i}` }] }));
  return blocks;
}

export async function publishToTumblr(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const blog = str(input.account.meta.blog);
  if (!blog) return { ok: false, error: "This Tumblr account has no blog stored. Reconnect Tumblr in Settings.", tokenDead: true };
  if (input.media.some((m) => m.type === "video")) return { ok: false, error: "Tumblr posts from Poskoo take images only." };
  let body: BodyInit;
  let headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (input.media.length === 0) {
    body = JSON.stringify({ content: tumblrContent(input.text), state: "published" });
    headers = { ...headers, "Content-Type": "application/json" };
  } else {
    const dl = await downloadAll(input.media, fetchImpl, 20 * MB);
    if (!dl.ok) return dl;
    const content = tumblrContent(input.text, dl.files.map((f) => f.contentType));
    const form = new FormData();
    form.set("json", new Blob([JSON.stringify({ content, state: "published" })], { type: "application/json" }));
    dl.files.forEach((file, i) => form.set(`f${i}`, blobOf(file), file.filename));
    body = form;
  }
  const r = await call(`${TUMBLR_API}/blog/${encodeURIComponent(blog)}/posts`, { method: "POST", headers, body }, fetchImpl, 5 * 60_000);
  if (!r.ok) return failed("Tumblr", "post", r, token);
  const id = str(obj(r.json.response).id_string) || str(obj(r.json.response).id);
  return { ok: true, id, url: id ? `https://www.tumblr.com/${blog}/${id}` : undefined };
}

// ---- WordPress.com --------------------------------------------------------------------------------

const WPCOM = "https://public-api.wordpress.com";

export function wpcomConfig() {
  return { clientId: env("WPCOM_CLIENT_ID"), clientSecret: env("WPCOM_CLIENT_SECRET"), redirectUri: `${BRAND.url}/api/wpcom/callback` };
}
export const isWpcomConfigured = () => wpcomConfig().clientId !== "" && wpcomConfig().clientSecret !== "";

/** Default scope: the user picks one site on WordPress.com's consent screen. */
export function wpcomAuthorizeUrl(state: string): string {
  const c = wpcomConfig();
  const p = new URLSearchParams({ client_id: c.clientId, redirect_uri: c.redirectUri, response_type: "code", state });
  return `${WPCOM}/oauth2/authorize?${p.toString()}`;
}

/** WordPress.com tokens don't expire; the response names the site the user picked. */
export async function exchangeWpcomCode(code: string, fetchImpl: Fetch = fetch): Promise<{ tokens: TokenSet; blogId: string; blogUrl: string }> {
  const c = wpcomConfig();
  const json = await oauth2Token(
    `${WPCOM}/oauth2/token`,
    "WordPress.com",
    { client_id: c.clientId, client_secret: c.clientSecret, redirect_uri: c.redirectUri, code, grant_type: "authorization_code" },
    c.clientSecret,
    fetchImpl,
  );
  const tokens = tokenSetFrom(json, "WordPress.com");
  const blogId = str(json.blog_id);
  if (!blogId || blogId === "0") throw new NetworkAuthError("profile_failed", "WordPress.com didn't say which site to post to. Connect again and pick a site.");
  return { tokens: { accessToken: tokens.accessToken }, blogId, blogUrl: str(json.blog_url) };
}

export async function wpcomSiteName(blogId: string, token: string, fetchImpl: Fetch = fetch): Promise<string> {
  const r = await call(`${WPCOM}/rest/v1.1/sites/${encodeURIComponent(blogId)}`, { method: "GET", headers: { Authorization: `Bearer ${token}` } }, fetchImpl, 15_000);
  return r.ok ? str(r.json.name) : "";
}

export async function publishToWpcom(input: PublishInput): Promise<PublishOutcome> {
  const blogId = str(input.account.meta.blogId);
  if (!blogId) return { ok: false, error: "This WordPress.com site has no ID stored. Reconnect it in Settings.", tokenDead: true };
  const token = input.account.accessToken;
  return wpPublish(input, (route) => `${WPCOM}${route.replace(/^\/wp\/v2/, `/wp/v2/sites/${encodeURIComponent(blogId)}`)}`, `Bearer ${token}`, "WordPress.com", token);
}

// ---- Plurk (OAuth 1.0a) ---------------------------------------------------------------------------

const PLURK = "https://www.plurk.com";

export function plurkConfig() {
  return { key: env("PLURK_APP_KEY"), secret: env("PLURK_APP_SECRET"), callback: `${BRAND.url}/api/plurk/callback` };
}
export const isPlurkConfigured = () => plurkConfig().key !== "" && plurkConfig().secret !== "";

const pct = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

/** RFC 5849 HMAC-SHA1 Authorization header for a form-encoded POST. */
export function oauth1Header(
  url: string,
  params: Record<string, string>,
  creds: { key: string; secret: string; token?: string; tokenSecret?: string },
  extra: Record<string, string> = {},
  nonce = randomBytes(16).toString("hex"),
  timestamp = String(Math.floor(Date.now() / 1000)),
): string {
  const oauth: Record<string, string> = {
    oauth_consumer_key: creds.key,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_version: "1.0",
    ...(creds.token ? { oauth_token: creds.token } : {}),
    ...extra,
  };
  const all = { ...params, ...oauth };
  const paramString = Object.keys(all)
    .sort()
    .map((k) => `${pct(k)}=${pct(all[k])}`)
    .join("&");
  const base = ["POST", pct(url), pct(paramString)].join("&");
  const signature = createHmac("sha1", `${pct(creds.secret)}&${pct(creds.tokenSecret ?? "")}`).update(base).digest("base64");
  return `OAuth ${Object.entries({ ...oauth, oauth_signature: signature })
    .map(([k, v]) => `${pct(k)}="${pct(v)}"`)
    .join(", ")}`;
}

async function plurkPost(path: string, params: Record<string, string>, creds: { token?: string; tokenSecret?: string }, extra: Record<string, string>, fetchImpl: Fetch) {
  const c = plurkConfig();
  const url = `${PLURK}${path}`;
  return call(
    url,
    { method: "POST", headers: { Authorization: oauth1Header(url, params, { key: c.key, secret: c.secret, ...creds }, extra), "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params).toString() },
    fetchImpl,
    30_000,
  );
}

/** Step 1: a request token; the callback carries our state so finishOAuth can check it. */
export async function plurkRequestToken(state: string, fetchImpl: Fetch = fetch): Promise<{ token: string; secret: string; authorizeUrl: string }> {
  const r = await plurkPost("/OAuth/request_token", {}, {}, { oauth_callback: `${plurkConfig().callback}?state=${encodeURIComponent(state)}` }, fetchImpl);
  const p = new URLSearchParams(typeof r.body === "string" ? r.body : "");
  const token = p.get("oauth_token") ?? "";
  const secret = p.get("oauth_token_secret") ?? "";
  if (!r.ok || !token || !secret) throw new NetworkAuthError("exchange_failed", "Plurk didn't hand out a request token.");
  return { token, secret, authorizeUrl: `${PLURK}/OAuth/authorize?oauth_token=${encodeURIComponent(token)}` };
}

/** Step 3: the verifier from the callback -> a permanent access token + secret. */
export async function exchangePlurkVerifier(token: string, tokenSecret: string, verifier: string, fetchImpl: Fetch = fetch): Promise<{ token: string; secret: string }> {
  const r = await plurkPost("/OAuth/access_token", {}, { token, tokenSecret }, { oauth_verifier: verifier }, fetchImpl);
  const p = new URLSearchParams(typeof r.body === "string" ? r.body : "");
  const access = p.get("oauth_token") ?? "";
  const secret = p.get("oauth_token_secret") ?? "";
  if (!r.ok || !access || !secret) throw new NetworkAuthError("exchange_failed", "Plurk didn't hand out an access token.");
  return { token: access, secret };
}

export async function plurkProfile(token: string, tokenSecret: string, fetchImpl: Fetch = fetch): Promise<{ id: string; nick: string }> {
  const r = await plurkPost("/APP/Users/me", {}, { token, tokenSecret }, {}, fetchImpl);
  if (!r.ok || !str(r.json.id)) throw new NetworkAuthError("profile_failed", "Plurk didn't return your profile.");
  return { id: str(r.json.id), nick: str(r.json.nick_name) };
}

export async function publishToPlurk(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  if (input.media.length > 0) return { ok: false, error: "Plurk posts from Poskoo are text only. Remove the media or untick Plurk." };
  const tokenSecret = input.account.secret.tokenSecret ?? "";
  const r = await plurkPost("/APP/Timeline/plurkAdd", { content: input.text.trim(), qualifier: ":" }, { token: input.account.accessToken, tokenSecret }, {}, fetchImpl);
  if (!r.ok) return failed("Plurk", "post", r, input.account.accessToken, tokenSecret);
  const id = str(r.json.plurk_id);
  return { ok: true, id, url: id ? `${PLURK}/p/${Number(id).toString(36)}` : undefined };
}

// ---- Twitch (chat message in the user's own channel) ----------------------------------------------

export const TWITCH_SCOPES = ["user:write:chat"];

export function twitchConfig() {
  return { clientId: env("TWITCH_CLIENT_ID"), clientSecret: env("TWITCH_CLIENT_SECRET"), redirectUri: `${BRAND.url}/api/twitch/callback` };
}
export const isTwitchConfigured = () => twitchConfig().clientId !== "" && twitchConfig().clientSecret !== "";

export function twitchAuthorizeUrl(state: string): string {
  const c = twitchConfig();
  const p = new URLSearchParams({ response_type: "code", client_id: c.clientId, redirect_uri: c.redirectUri, scope: TWITCH_SCOPES.join(" "), state });
  return `https://id.twitch.tv/oauth2/authorize?${p.toString()}`;
}

async function twitchToken(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet> {
  const c = twitchConfig();
  const json = await oauth2Token("https://id.twitch.tv/oauth2/token", "Twitch", { client_id: c.clientId, client_secret: c.clientSecret, ...body }, c.clientSecret, fetchImpl);
  return tokenSetFrom(json, "Twitch");
}

export const exchangeTwitchCode = (code: string, fetchImpl: Fetch = fetch) => twitchToken({ grant_type: "authorization_code", code, redirect_uri: twitchConfig().redirectUri }, fetchImpl);
/** User tokens live ~4 hours; refresh tokens don't expire (until the user disconnects the app). */
export const refreshTwitchToken = (refreshToken: string, fetchImpl: Fetch = fetch) => twitchToken({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);

const helixHeaders = (token: string) => ({ Authorization: `Bearer ${token}`, "Client-Id": twitchConfig().clientId });

export async function twitchUser(token: string, fetchImpl: Fetch = fetch): Promise<{ id: string; login: string; name: string }> {
  const r = await call("https://api.twitch.tv/helix/users", { method: "GET", headers: helixHeaders(token) }, fetchImpl, 15_000);
  const data = r.ok ? r.json.data : null;
  const u = obj(Array.isArray(data) ? data[0] : {});
  if (!r.ok || !str(u.id)) throw new NetworkAuthError("profile_failed", "Twitch didn't return your account.");
  return { id: str(u.id), login: str(u.login), name: str(u.display_name) };
}

export async function publishToTwitch(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const id = input.account.externalId;
  if (input.media.length > 0) return { ok: false, error: "Twitch chat messages are text only. Remove the media or untick Twitch." };
  const r = await call(
    "https://api.twitch.tv/helix/chat/messages",
    { method: "POST", headers: { ...helixHeaders(token), "Content-Type": "application/json" }, body: JSON.stringify({ broadcaster_id: id, sender_id: id, message: input.text.trim().slice(0, 500) }) },
    fetchImpl,
    15_000,
  );
  if (!r.ok) return failed("Twitch", "chat message", r, token);
  const row = obj(Array.isArray(r.json.data) ? (r.json.data as unknown[])[0] : {});
  if (row.is_sent !== true) return { ok: false, error: `Twitch didn't send the message: ${str(obj(row.drop_reason).message) || "dropped"}` };
  const login = str(input.account.meta.login);
  return { ok: true, id: str(row.message_id), url: login ? `https://www.twitch.tv/${login}` : undefined };
}

// ---- Farcaster (Neynar) ---------------------------------------------------------------------------

const NEYNAR = "https://api.neynar.com/v2/farcaster";

export function neynarConfig() {
  return { apiKey: env("NEYNAR_API_KEY"), clientId: env("NEYNAR_CLIENT_ID") };
}
export const isFarcasterConfigured = () => neynarConfig().apiKey !== "" && neynarConfig().clientId !== "";

/**
 * After "Sign in with Neynar" in the browser: check with Neynar that the signer is approved and
 * belongs to that fid (the browser could send anything), then build the account.
 */
export async function connectFarcasterSigner(signerUuid: string, fid: string, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const { apiKey } = neynarConfig();
  if (!/^[0-9a-f-]{36}$/i.test(signerUuid) || !/^\d{1,12}$/.test(fid)) throw new NetworkAuthError("bad_login", "Farcaster sign-in returned an unexpected answer. Try again.");
  const headers = { "x-api-key": apiKey, Accept: "application/json" };
  const s = await call(`${NEYNAR}/signer?signer_uuid=${encodeURIComponent(signerUuid)}`, { method: "GET", headers }, fetchImpl, 15_000);
  if (!s.ok || str(s.json.status) !== "approved" || str(s.json.fid) !== fid) {
    throw new NetworkAuthError("bad_login", "That Farcaster sign-in isn't approved yet. Approve Poskoo in Warpcast, then try again.");
  }
  const u = await call(`${NEYNAR}/user/bulk?fids=${encodeURIComponent(fid)}`, { method: "GET", headers }, fetchImpl, 15_000);
  const users = u.ok ? u.json.users : null;
  const user = obj(Array.isArray(users) ? users[0] : {});
  const username = str(user.username);
  return {
    externalId: fid,
    username: username ? `@${username}` : `fid ${fid}`,
    // The signer UUID only works with Poskoo's Neynar API key; it's stored encrypted like a token.
    tokens: { accessToken: signerUuid },
    scopes: ["neynar_signer"],
    meta: { username },
  };
}

export async function publishToFarcaster(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const { apiKey } = neynarConfig();
  if (!apiKey) return { ok: false, error: "Farcaster isn't switched on on this server (NEYNAR_API_KEY)." };
  if (input.media.length > 0) return { ok: false, error: "Farcaster casts from Poskoo are text only. Remove the media or untick Farcaster." };
  const text = input.text.trim();
  if (Buffer.byteLength(text, "utf8") > 320) return { ok: false, error: "A Farcaster cast is at most 320 bytes (emoji and accents count as several)." };
  const r = await call(
    `${NEYNAR}/cast`,
    {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ signer_uuid: input.account.accessToken, text, ...(input.idempotencyKey ? { idem: input.idempotencyKey.replace(/-/g, "").slice(0, 16) } : {}) }),
    },
    fetchImpl,
    30_000,
  );
  if (!r.ok) return failed("Farcaster", "cast", r, apiKey, input.account.accessToken);
  const hash = str(obj(r.json.cast).hash);
  const username = str(input.account.meta.username);
  return { ok: true, id: hash, url: hash && username ? `https://farcaster.xyz/${username}/${hash.slice(0, 10)}` : undefined };
}

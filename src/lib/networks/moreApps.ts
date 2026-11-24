// Portions adapted from Postiz (https://github.com/gitroomhq/postiz-app), AGPL-3.0:
// reddit, dribbble, vk, kick, whop, mewe and tiktok.business providers.
//
// Server only: networks that connect through an OAuth app the Poskoo owner registers. Each one is
// switched off ("Not available yet", src/lib/channelStatus.ts) until its keys are in the env.
//   - Reddit: OAuth 2 (identity submit read, permanent refresh), self posts; subreddit per post.
//   - Dribbble: OAuth 2 (public upload), one-image shots.
//   - VK: VK ID OAuth 2.1 with PKCE (+ device_id), text wall posts.
//   - Kick: OAuth 2.1 with PKCE (chat:write), a chat message in your own channel (500 characters).
//   - Whop: OAuth 2.1 with PKCE (forum:post:create), forum posts in an experience you pick per post.
//   - MeWe: MeWe developer login (loginRequestToken), timeline posts with photos.
//   - TikTok Business: TikTok API for Business (business accounts), PULL_FROM_URL video / photo posts.
import { BRAND } from "@/lib/brand";
import { NetworkAuthError, obj, pkceS256, redact, str, tokenSetFrom, type Fetch, type PublishInput, type PublishOutcome, type TokenSet } from "@/lib/networks/common";
import { blobOf, call, downloadAll, failed } from "@/lib/networks/http";
import { parseDestOptions } from "@/lib/networks/options";
import { splitTitle } from "@/lib/networks/tokenNetworks";

const MB = 1024 * 1024;
const env = (k: string) => (process.env[k] ?? "").trim();
const redirect = (network: string) => `${BRAND.url}/api/${network}/callback`;
const form = (b: Record<string, string>) => new URLSearchParams(b).toString();

// ---- Reddit -----------------------------------------------------------------------------------------

export const REDDIT_SCOPES = ["identity", "submit", "read"];
// Reddit requires a descriptive User-Agent on every API call.
const REDDIT_UA = "web:com.poskoo.scheduler:v1.0 (by /u/poskoo)";

export function redditConfig() {
  return { clientId: env("REDDIT_CLIENT_ID"), clientSecret: env("REDDIT_CLIENT_SECRET"), redirectUri: redirect("reddit") };
}
export const isRedditConfigured = () => redditConfig().clientId !== "" && redditConfig().clientSecret !== "";

export function redditAuthorizeUrl(state: string): string {
  const c = redditConfig();
  const p = new URLSearchParams({ client_id: c.clientId, response_type: "code", state, redirect_uri: c.redirectUri, duration: "permanent", scope: REDDIT_SCOPES.join(" ") });
  return `https://www.reddit.com/api/v1/authorize?${p.toString()}`;
}

async function redditToken(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet> {
  const c = redditConfig();
  const basic = Buffer.from(`${c.clientId}:${c.clientSecret}`).toString("base64");
  const r = await call(
    "https://www.reddit.com/api/v1/access_token",
    { method: "POST", headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": REDDIT_UA }, body: form(body) },
    fetchImpl,
    15_000,
  );
  if (!r.ok || r.json.error) {
    const err = r.ok ? str(r.json.error) : r.error;
    throw new NetworkAuthError("exchange_failed", redact(`Reddit token request failed: ${err}`, c.clientSecret, body.code, body.refresh_token), !r.ok ? r.status === 400 || r.status === 401 : true);
  }
  return tokenSetFrom(r.json, "Reddit");
}

export const exchangeRedditCode = (code: string, fetchImpl: Fetch = fetch) => redditToken({ grant_type: "authorization_code", code, redirect_uri: redditConfig().redirectUri }, fetchImpl);
/** Access tokens last an hour; the permanent refresh token doesn't rotate. */
export async function refreshRedditToken(refreshToken: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  const t = await redditToken({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);
  return { ...t, refreshToken: t.refreshToken ?? refreshToken };
}

export async function redditMe(token: string, fetchImpl: Fetch = fetch): Promise<{ id: string; name: string }> {
  const r = await call("https://oauth.reddit.com/api/v1/me", { method: "GET", headers: { Authorization: `Bearer ${token}`, "User-Agent": REDDIT_UA } }, fetchImpl, 15_000);
  if (!r.ok || !str(r.json.name)) throw new NetworkAuthError("profile_failed", "Reddit didn't return your profile.");
  return { id: str(r.json.id), name: str(r.json.name) };
}

/** "r/foo", "/r/foo/", "https://reddit.com/r/foo" -> "foo". */
export function cleanSubreddit(raw: string): string {
  return raw.trim().replace(/^https?:\/\/(www\.|old\.)?reddit\.com/i, "").replace(/^\/?r\//i, "").replace(/^\/+|\/+$/g, "").toLowerCase();
}

export async function publishToReddit(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const sr = cleanSubreddit(parseDestOptions(input.options).dest);
  if (!sr) return { ok: false, error: "Pick the subreddit to post to (Reddit options in the composer).", status: 400 };
  if (input.media.length > 0) return { ok: false, error: "Reddit posts from Poskoo are text posts. Remove the media or untick Reddit.", status: 400 };
  const { title, body } = splitTitle(input.text, 300);
  const r = await call(
    "https://oauth.reddit.com/api/submit",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": REDDIT_UA },
      body: form({ api_type: "json", kind: "self", sr, title, text: body === title ? "" : body, resubmit: "true" }),
    },
    fetchImpl,
  );
  if (!r.ok) return failed("Reddit", "post", r, token);
  // Reddit rejects submissions with HTTP 200 and json.errors: [[CODE, message, field], ...].
  const errors = Array.isArray(obj(r.json.json).errors) ? (obj(r.json.json).errors as unknown[][]) : [];
  if (errors.length > 0) {
    const text = errors.map((e) => `${str(e?.[0])}: ${str(e?.[1])}`).join("; ");
    return { ok: false, error: redact(`Reddit refused the post to r/${sr}: ${text}`, token), status: errors.every((e) => str(e?.[0]) === "RATELIMIT") ? 429 : 400 };
  }
  const data = obj(obj(r.json.json).data);
  return { ok: true, id: str(data.name) || str(data.id), url: str(data.url) || `https://www.reddit.com/r/${sr}` };
}

// ---- Dribbble ---------------------------------------------------------------------------------------

export const DRIBBBLE_SCOPES = ["public", "upload"];

export function dribbbleConfig() {
  return { clientId: env("DRIBBBLE_CLIENT_ID"), clientSecret: env("DRIBBBLE_CLIENT_SECRET"), redirectUri: redirect("dribbble") };
}
export const isDribbbleConfigured = () => dribbbleConfig().clientId !== "" && dribbbleConfig().clientSecret !== "";

export function dribbbleAuthorizeUrl(state: string): string {
  const c = dribbbleConfig();
  const p = new URLSearchParams({ client_id: c.clientId, redirect_uri: c.redirectUri, scope: DRIBBBLE_SCOPES.join(" "), state });
  return `https://dribbble.com/oauth/authorize?${p.toString()}`;
}

/** Dribbble tokens don't expire. */
export async function exchangeDribbbleCode(code: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  const c = dribbbleConfig();
  const r = await call(
    "https://dribbble.com/oauth/token",
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body: form({ client_id: c.clientId, client_secret: c.clientSecret, code, redirect_uri: c.redirectUri }) },
    fetchImpl,
    15_000,
  );
  if (!r.ok) throw new NetworkAuthError("exchange_failed", redact(`Dribbble token request failed (${r.status}) ${r.error}`, c.clientSecret, code), true);
  return tokenSetFrom(r.json, "Dribbble");
}

export async function dribbbleUser(token: string, fetchImpl: Fetch = fetch): Promise<{ id: string; login: string; name: string }> {
  const r = await call("https://api.dribbble.com/v2/user", { method: "GET", headers: { Authorization: `Bearer ${token}` } }, fetchImpl, 15_000);
  if (!r.ok || !str(r.json.id)) throw new NetworkAuthError("profile_failed", "Dribbble didn't return your profile.");
  return { id: str(r.json.id), login: str(r.json.login), name: str(r.json.name) };
}

export async function publishToDribbble(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const images = input.media.filter((m) => m.type === "image");
  if (images.length !== 1 || input.media.length !== 1) return { ok: false, error: "A Dribbble shot needs exactly one image.", status: 400 };
  const dl = await downloadAll(images, fetchImpl, 8 * MB);
  if (!dl.ok) return dl;
  const { title, body } = splitTitle(input.text, 120);
  const fd = new FormData();
  fd.set("image", blobOf(dl.files[0]), dl.files[0].filename);
  fd.set("title", title);
  if (body !== title) fd.set("description", body);
  // Dribbble answers 202 with the new shot's URL in the Location header (no body).
  let res: Response;
  try {
    res = await fetchImpl("https://api.dribbble.com/v2/shots", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd, signal: AbortSignal.timeout(5 * 60_000) });
  } catch (err) {
    return { ok: false, error: redact(`Dribbble upload failed: ${err instanceof Error ? err.message : String(err)}`, token), status: 0 };
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return failed("Dribbble", "upload", { status: res.status, error: text.slice(0, 300) || `HTTP ${res.status}` }, token);
  }
  const id = (res.headers.get("location") ?? "").split("/").filter(Boolean).at(-1) ?? "";
  return { ok: true, id, url: id ? `https://dribbble.com/shots/${id}` : undefined, mediaPending: true };
}

// ---- VK (VK ID) -------------------------------------------------------------------------------------

export const VK_SCOPES = ["vkid.personal_info", "wall"];
const VK_API = "https://api.vk.ru/method";
const VK_V = "5.251";

export function vkConfig() {
  return { clientId: env("VK_CLIENT_ID"), redirectUri: redirect("vk") };
}
export const isVkConfigured = () => vkConfig().clientId !== "";

export function vkAuthorizeUrl(state: string, verifier: string): string {
  const c = vkConfig();
  const p = new URLSearchParams({
    response_type: "code",
    client_id: c.clientId,
    code_challenge_method: "S256",
    code_challenge: pkceS256(verifier),
    redirect_uri: c.redirectUri,
    state,
    scope: VK_SCOPES.join(" "),
  });
  return `https://id.vk.ru/authorize?${p.toString()}`;
}

async function vkToken(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet & { userId: string }> {
  const r = await call("https://id.vk.ru/oauth2/auth", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form({ client_id: vkConfig().clientId, ...body }) }, fetchImpl, 15_000);
  if (!r.ok || r.json.error) {
    const err = r.ok ? str(r.json.error_description) || str(r.json.error) : r.error;
    throw new NetworkAuthError("exchange_failed", redact(`VK token request failed: ${err}`, body.code, body.refresh_token), true);
  }
  return { ...tokenSetFrom(r.json, "VK"), userId: str(r.json.user_id) };
}

/** VK ID returns device_id next to the code; it's needed again for every refresh (kept in meta). */
export const exchangeVkCode = (code: string, verifier: string, deviceId: string, state: string, fetchImpl: Fetch = fetch) =>
  vkToken({ grant_type: "authorization_code", code, code_verifier: verifier, device_id: deviceId, redirect_uri: vkConfig().redirectUri, state }, fetchImpl);

export function refreshVkToken(refreshToken: string, deviceId: string, fetchImpl: Fetch = fetch) {
  return vkToken({ grant_type: "refresh_token", refresh_token: refreshToken, device_id: deviceId, state: "refresh" }, fetchImpl);
}

export async function vkUser(token: string, fetchImpl: Fetch = fetch): Promise<{ id: string; name: string }> {
  const r = await call("https://id.vk.ru/oauth2/user_info", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form({ client_id: vkConfig().clientId, access_token: token }) }, fetchImpl, 15_000);
  const u = r.ok ? obj(r.json.user) : {};
  if (!str(u.user_id)) throw new NetworkAuthError("profile_failed", "VK didn't return your profile.");
  return { id: str(u.user_id), name: `${str(u.first_name)} ${str(u.last_name)}`.trim() };
}

export async function publishToVk(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  if (input.media.length > 0) return { ok: false, error: "VK posts from Poskoo are text only for now. Remove the media or untick VK.", status: 400 };
  const r = await call(`${VK_API}/wall.post?v=${VK_V}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form({ access_token: token, message: input.text }) }, fetchImpl);
  if (!r.ok) return failed("VK", "post", r, token);
  // VK API errors come back as HTTP 200 with {error: {error_code, error_msg}}.
  const e = obj(r.json.error);
  if (str(e.error_code)) {
    const code = Number(e.error_code);
    return { ok: false, error: redact(`VK post failed (${code}): ${str(e.error_msg)}`, token), tokenDead: code === 5, status: code === 5 ? 401 : code === 6 || code === 9 ? 429 : 400 };
  }
  const postId = str(obj(r.json.response).post_id);
  const owner = input.account.externalId;
  return { ok: true, id: postId, url: postId ? `https://vk.com/wall${owner}_${postId}` : undefined };
}

// ---- Kick -------------------------------------------------------------------------------------------

export const KICK_SCOPES = ["user:read", "channel:read", "chat:write"];

export function kickConfig() {
  return { clientId: env("KICK_CLIENT_ID"), clientSecret: env("KICK_CLIENT_SECRET"), redirectUri: redirect("kick") };
}
export const isKickConfigured = () => kickConfig().clientId !== "" && kickConfig().clientSecret !== "";

export function kickAuthorizeUrl(state: string, verifier: string): string {
  const c = kickConfig();
  const p = new URLSearchParams({
    response_type: "code",
    client_id: c.clientId,
    redirect_uri: c.redirectUri,
    scope: KICK_SCOPES.join(" "),
    code_challenge: pkceS256(verifier),
    code_challenge_method: "S256",
    state,
  });
  return `https://id.kick.com/oauth/authorize?${p.toString()}`;
}

async function kickToken(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet> {
  const c = kickConfig();
  const r = await call("https://id.kick.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form({ client_id: c.clientId, client_secret: c.clientSecret, ...body }) }, fetchImpl, 15_000);
  if (!r.ok) throw new NetworkAuthError("exchange_failed", redact(`Kick token request failed (${r.status}) ${r.error}`, c.clientSecret, body.code, body.refresh_token), r.status === 400 || r.status === 401);
  return tokenSetFrom(r.json, "Kick");
}

export const exchangeKickCode = (code: string, verifier: string, fetchImpl: Fetch = fetch) =>
  kickToken({ grant_type: "authorization_code", code, code_verifier: verifier, redirect_uri: kickConfig().redirectUri }, fetchImpl);
export const refreshKickToken = (refreshToken: string, fetchImpl: Fetch = fetch) => kickToken({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);

export async function kickUser(token: string, fetchImpl: Fetch = fetch): Promise<{ id: string; name: string }> {
  const r = await call("https://api.kick.com/public/v1/users", { method: "GET", headers: { Authorization: `Bearer ${token}` } }, fetchImpl, 15_000);
  const list = r.ok && Array.isArray(r.json.data) ? (r.json.data as unknown[]).map(obj) : [];
  const u = list[0] ?? (r.ok ? obj(r.json.data) : {});
  const id = str(u.user_id) || str(u.id);
  if (!id) throw new NetworkAuthError("profile_failed", "Kick didn't return your profile.");
  return { id, name: str(u.name) };
}

export async function publishToKick(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  if (input.media.length > 0) return { ok: false, error: "Kick chat messages are text only. Remove the media or untick Kick.", status: 400 };
  const r = await call(
    "https://api.kick.com/public/v1/chat",
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ type: "user", content: Array.from(input.text).slice(0, 500).join(""), broadcaster_user_id: Number(input.account.externalId) }) },
    fetchImpl,
  );
  if (!r.ok) return failed("Kick", "chat message", r, token);
  const data = obj(r.json.data);
  if (data.is_sent === false) return { ok: false, error: "Kick didn't send the chat message (is your channel's chat open?).", status: 400 };
  const handle = input.account.username ?? "";
  return { ok: true, id: str(data.message_id) || `kick-${Date.now()}`, url: handle ? `https://kick.com/${handle}` : undefined };
}

// ---- Whop -------------------------------------------------------------------------------------------

export const WHOP_SCOPES = ["openid", "profile", "forum:post:create", "forum:read", "company:basic:read"];
const WHOP = "https://api.whop.com";

export function whopConfig() {
  return { clientId: env("WHOP_CLIENT_ID"), redirectUri: redirect("whop") };
}
export const isWhopConfigured = () => whopConfig().clientId !== "";

export function whopAuthorizeUrl(state: string, verifier: string): string {
  const c = whopConfig();
  const p = new URLSearchParams({
    response_type: "code",
    client_id: c.clientId,
    redirect_uri: c.redirectUri,
    scope: WHOP_SCOPES.join(" "),
    state,
    code_challenge: pkceS256(verifier),
    code_challenge_method: "S256",
  });
  return `${WHOP}/oauth/authorize?${p.toString()}`;
}

async function whopToken(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet> {
  const r = await call(`${WHOP}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: whopConfig().clientId, ...body }) }, fetchImpl, 15_000);
  if (!r.ok || r.json.error) {
    const err = r.ok ? str(r.json.error_description) || str(r.json.error) : r.error;
    throw new NetworkAuthError("exchange_failed", redact(`Whop token request failed: ${err}`, body.code, body.refresh_token), true);
  }
  return tokenSetFrom(r.json, "Whop");
}

export const exchangeWhopCode = (code: string, verifier: string, fetchImpl: Fetch = fetch) =>
  whopToken({ grant_type: "authorization_code", code, code_verifier: verifier, redirect_uri: whopConfig().redirectUri }, fetchImpl);
export const refreshWhopToken = (refreshToken: string, fetchImpl: Fetch = fetch) => whopToken({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);

export async function whopUser(token: string, fetchImpl: Fetch = fetch): Promise<{ id: string; name: string }> {
  const r = await call(`${WHOP}/oauth/userinfo`, { method: "GET", headers: { Authorization: `Bearer ${token}` } }, fetchImpl, 15_000);
  if (!r.ok || !str(r.json.sub)) throw new NetworkAuthError("profile_failed", "Whop didn't return your profile.");
  return { id: str(r.json.sub), name: str(r.json.preferred_username) || str(r.json.name) };
}

/** The forums (experiences) of the user's companies, for the default forum at connect time. */
export async function whopForums(token: string, fetchImpl: Fetch = fetch): Promise<{ id: string; name: string }[]> {
  const auth = { Authorization: `Bearer ${token}` };
  const companies = await call(`${WHOP}/api/v1/companies?first=50`, { method: "GET", headers: auth }, fetchImpl, 15_000);
  const list = companies.ok && Array.isArray(companies.json.data) ? (companies.json.data as unknown[]).map(obj) : [];
  const out: { id: string; name: string }[] = [];
  for (const c of list.slice(0, 10)) {
    const f = await call(`${WHOP}/api/v1/forums?company_id=${encodeURIComponent(str(c.id))}&first=50`, { method: "GET", headers: auth }, fetchImpl, 15_000);
    const forums = f.ok && Array.isArray(f.json.data) ? (f.json.data as unknown[]).map(obj) : [];
    for (const forum of forums) {
      const exp = obj(forum.experience);
      const id = str(exp.id) || str(forum.experience_id) || str(forum.id);
      if (id) out.push({ id, name: `${str(c.title) || str(c.name)} · ${str(exp.name) || str(forum.name) || "Forum"}` });
    }
  }
  return out;
}

export async function publishToWhop(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const experience = parseDestOptions(input.options).dest || str(input.account.meta.defaultExperience);
  if (!experience) return { ok: false, error: "Pick the Whop forum to post to (Whop options in the composer).", status: 400 };
  if (input.media.length > 0) return { ok: false, error: "Whop posts from Poskoo are text only for now. Remove the media or untick Whop.", status: 400 };
  const { title, body } = splitTitle(input.text, 200);
  const r = await call(
    `${WHOP}/api/v1/forum_posts`,
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ experience_id: experience, title, content: body }) },
    fetchImpl,
  );
  if (!r.ok) return failed("Whop", "post", r, token);
  const id = str(r.json.id);
  return { ok: true, id, url: id ? `https://whop.com/experiences/${experience}/${id}` : undefined };
}

// ---- MeWe -------------------------------------------------------------------------------------------

export function meweConfig() {
  return { appId: env("MEWE_APP_ID"), apiKey: env("MEWE_API_KEY"), host: env("MEWE_HOST") || "https://mewe.com", redirectUri: redirect("mewe") };
}
export const isMeweConfigured = () => meweConfig().appId !== "" && meweConfig().apiKey !== "";

const meweHeaders = (token?: string) => {
  const c = meweConfig();
  return { "X-App-Id": c.appId, "X-Api-Key": c.apiKey, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

/** MeWe may not echo `state`, so it also rides in the redirect URI (the callback checks it as usual). */
export function meweAuthorizeUrl(state: string): string {
  const c = meweConfig();
  const back = `${c.redirectUri}?state=${encodeURIComponent(state)}`;
  return `${c.host}/login?${new URLSearchParams({ client_id: c.appId, redirect_uri: back, state }).toString()}`;
}

/** MeWe hands back a loginRequestToken that is swapped for an API token (no refresh token). */
export async function exchangeMeweLogin(loginRequestToken: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  const c = meweConfig();
  const r = await call(`${c.host}/api/dev/token?loginRequestToken=${encodeURIComponent(loginRequestToken)}`, { method: "GET", headers: meweHeaders() }, fetchImpl, 15_000);
  if (!r.ok) throw new NetworkAuthError("exchange_failed", redact(`MeWe token request failed (${r.status}) ${r.error}`, c.apiKey, loginRequestToken), true);
  if (r.json.pending) throw new NetworkAuthError("exchange_failed", "Approve the login in MeWe first, then try again.");
  const token = str(r.json.apiToken);
  if (!token) throw new NetworkAuthError("exchange_failed", "MeWe returned no API token.");
  const expiresAt = Date.parse(str(r.json.expiresAt));
  return { accessToken: token, expiresIn: Number.isFinite(expiresAt) ? Math.max(0, Math.round((expiresAt - Date.now()) / 1000)) : 30 * 86400 };
}

export async function meweMe(token: string, fetchImpl: Fetch = fetch): Promise<{ id: string; handle: string; name: string }> {
  const r = await call(`${meweConfig().host}/api/dev/me`, { method: "GET", headers: meweHeaders(token) }, fetchImpl, 15_000);
  if (!r.ok || !str(r.json.userId)) throw new NetworkAuthError("profile_failed", "MeWe didn't return your profile.");
  return { id: str(r.json.userId), handle: str(r.json.handle), name: str(r.json.name) || `${str(r.json.firstName)} ${str(r.json.lastName)}`.trim() };
}

export async function publishToMewe(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const host = meweConfig().host;
  if (input.media.some((m) => m.type === "video")) return { ok: false, error: "MeWe posts from Poskoo take photos only. Remove the video or untick MeWe.", status: 400 };
  const photoIds: string[] = [];
  if (input.media.length > 0) {
    const dl = await downloadAll(input.media, fetchImpl, 20 * MB);
    if (!dl.ok) return dl;
    for (const file of dl.files) {
      const fd = new FormData();
      fd.set("file", blobOf(file), file.filename);
      const { "Content-Type": _ct, ...headers } = meweHeaders(token);
      void _ct;
      const up = await call(`${host}/api/dev/photo/upload`, { method: "POST", headers, body: fd }, fetchImpl, 5 * 60_000);
      if (!up.ok) return failed("MeWe", "photo upload", up, token);
      const id = str(up.json.id) || str(obj(up.json.photo).id);
      if (id) photoIds.push(id);
    }
  }
  const r = await call(`${host}/api/dev/me/post`, { method: "POST", headers: meweHeaders(token), body: JSON.stringify({ text: input.text, ...(photoIds.length ? { uploadedPhotoIds: photoIds } : {}) }) }, fetchImpl);
  if (!r.ok) return failed("MeWe", "post", r, token);
  const handle = input.account.username ?? "";
  // MeWe answers 204 without the post id.
  return { ok: true, id: str(r.json.postItemId) || `mewe-${Date.now()}`, url: handle ? `https://mewe.com/${handle}/posts` : undefined };
}

// ---- TikTok Business (TikTok API for Business) ------------------------------------------------------

export const TIKTOK_BUSINESS_SCOPES = ["user.info.basic", "user.info.username", "video.publish", "video.upload"];
const TTB = "https://business-api.tiktok.com/open_api/v1.3";

export function tiktokBusinessConfig() {
  return { clientId: env("TIKTOK_BUSINESS_CLIENT_ID"), clientSecret: env("TIKTOK_BUSINESS_CLIENT_SECRET"), redirectUri: redirect("tiktok_business") };
}
export const isTikTokBusinessConfigured = () => tiktokBusinessConfig().clientId !== "" && tiktokBusinessConfig().clientSecret !== "";

export function tiktokBusinessAuthorizeUrl(state: string): string {
  const c = tiktokBusinessConfig();
  const p = new URLSearchParams({ client_key: c.clientId, redirect_uri: c.redirectUri, state, response_type: "code", disable_auto_auth: "1", scope: TIKTOK_BUSINESS_SCOPES.join(",") });
  return `https://www.tiktok.com/v2/auth/authorize/?${p.toString()}`;
}

/** The Business API answers HTTP 200 with {code, message, data}; code 0 = success. */
async function ttbCall(path: string, init: RequestInit, fetchImpl: Fetch): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; status: number; error: string; code: number }> {
  const r = await call(`${TTB}${path}`, init, fetchImpl);
  if (!r.ok) return { ok: false, status: r.status, error: r.error, code: -1 };
  const code = Number(r.json.code);
  if (code !== 0) return { ok: false, status: code === 40105 || code === 40104 ? 401 : 400, error: `${str(r.json.message) || "refused"} (code ${code})`, code };
  return { ok: true, data: obj(r.json.data) };
}

async function ttbToken(path: string, body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet & { openId: string }> {
  const c = tiktokBusinessConfig();
  const r = await ttbCall(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: c.clientId, client_secret: c.clientSecret, ...body }) }, fetchImpl);
  if (!r.ok) throw new NetworkAuthError("exchange_failed", redact(`TikTok Business token request failed: ${r.error}`, c.clientSecret, body.auth_code, body.refresh_token), true);
  return { ...tokenSetFrom(r.data, "TikTok Business"), openId: str(r.data.open_id) };
}

export const exchangeTikTokBusinessCode = (code: string, fetchImpl: Fetch = fetch) =>
  ttbToken("/tt_user/oauth2/token/", { grant_type: "authorization_code", auth_code: code, redirect_uri: tiktokBusinessConfig().redirectUri }, fetchImpl);
export const refreshTikTokBusinessToken = (refreshToken: string, fetchImpl: Fetch = fetch) =>
  ttbToken("/tt_user/oauth2/refresh_token/", { grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);

export async function tiktokBusinessProfile(token: string, businessId: string, fetchImpl: Fetch = fetch): Promise<{ username: string; displayName: string }> {
  const fields = encodeURIComponent(JSON.stringify(["username", "display_name"]));
  const r = await ttbCall(`/business/get/?business_id=${encodeURIComponent(businessId)}&fields=${fields}`, { method: "GET", headers: { "Access-Token": token } }, fetchImpl);
  if (!r.ok) throw new NetworkAuthError("profile_failed", "TikTok didn't return the business account's profile.");
  return { username: str(r.data.username), displayName: str(r.data.display_name) };
}

export async function publishToTikTokBusiness(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const businessId = input.account.externalId;
  const videos = input.media.filter((m) => m.type === "video");
  const images = input.media.filter((m) => m.type === "image");
  if (videos.length > 1 || (videos.length === 1 && images.length > 0)) return { ok: false, error: "TikTok takes one video, or up to 35 photos.", status: 400 };
  if (input.media.length === 0) return { ok: false, error: "TikTok posts need a video or at least one photo.", status: 400 };
  // PULL_FROM_URL only: TikTok downloads the media from Poskoo's public media URLs.
  const isPhoto = videos.length === 0;
  const body = isPhoto
    ? { business_id: businessId, photo_images: images.map((m) => m.url), photo_cover_index: 0, post_info: { caption: input.text, privacy_level: "PUBLIC_TO_EVERYONE" } }
    : { business_id: businessId, video_url: videos[0].url, post_info: { caption: input.text } };
  const r = await ttbCall(isPhoto ? "/business/photo/publish/" : "/business/video/publish/", { method: "POST", headers: { "Content-Type": "application/json", "Access-Token": token }, body: JSON.stringify(body) }, fetchImpl);
  if (!r.ok) return { ok: false, error: redact(`TikTok Business publish failed: ${r.error}`, token), tokenDead: r.status === 401, status: r.status };
  const shareId = str(r.data.share_id);
  const handle = input.account.username ?? "";
  // TikTok processes the post asynchronously; keep the media until it has pulled it.
  return { ok: true, id: shareId, url: handle ? `https://www.tiktok.com/@${handle}` : undefined, mediaPending: true };
}

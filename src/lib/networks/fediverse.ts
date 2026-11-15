// Server only: fediverse servers connected with a server address + token (no app review):
// Misskey (and forks such as Sharkey / Firefish that keep its API), Pixelfed (Mastodon-compatible
// API, so publishing reuses publishToMastodon) and PeerTube (OAuth password grant against the
// server's own local client; the password is used once and never stored).
import { safeFetch } from "@/lib/netGuard";
import { NetworkAuthError, obj, redact, str, tokenSetFrom, type Fetch, type NetAccount, type PublishInput, type PublishOutcome, type TokenSet } from "@/lib/networks/common";
import { blobOf, call, downloadAll, failed, hostOf, normalizeBaseUrl } from "@/lib/networks/http";
import { fetchInstanceLimits, publishToMastodon, verifyMastodonCredentials } from "@/lib/networks/mastodon";
import type { SaveAccountInput } from "@/lib/networks/store";
import { splitTitle } from "@/lib/networks/tokenNetworks";

type Fields = Record<string, string>;
const MB = 1024 * 1024;

/** Server address -> "https://host" (these servers live at the root of their host). */
function serverBase(input: string, label: string): string {
  const base = normalizeBaseUrl(input);
  if (!base) throw new NetworkAuthError("bad_instance", `Enter your ${label} server address, just the host name (https only).`);
  return `https://${hostOf(base)}`;
}

// ---- Misskey --------------------------------------------------------------------------------------

export async function connectMisskey(f: Fields, fetchImpl: Fetch = safeFetch): Promise<SaveAccountInput> {
  const base = serverBase(f.instance, "Misskey");
  const token = f.token.trim();
  const r = await call(`${base}/api/i`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ i: token }) }, fetchImpl, 15_000);
  if (!r.ok || !str(r.json.id)) {
    throw new NetworkAuthError("bad_login", r.status === 401 || r.status === 403 ? "That server didn't accept the access token." : redact(`We couldn't reach that Misskey server (${r.ok ? "no account" : r.error}).`, token));
  }
  const host = hostOf(base);
  return {
    externalId: `${str(r.json.id)}@${host}`,
    username: `${str(r.json.username)}@${host}`,
    tokens: { accessToken: token },
    scopes: ["access_token"],
    meta: { base },
  };
}

export async function publishToMisskey(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? safeFetch;
  const token = input.account.accessToken;
  const base = str(input.account.meta.base);
  if (!base) return { ok: false, error: "This Misskey account has no server stored. Reconnect it in Settings.", tokenDead: true };
  const fileIds: string[] = [];
  if (input.media.length > 0) {
    const dl = await downloadAll(input.media, fetchImpl, 100 * MB);
    if (!dl.ok) return dl;
    for (const file of dl.files) {
      const form = new FormData();
      form.set("i", token);
      form.set("name", file.filename);
      form.set("file", blobOf(file), file.filename);
      const up = await call(`${base}/api/drive/files/create`, { method: "POST", body: form }, fetchImpl, 5 * 60_000);
      if (!up.ok) return failed("Misskey", "upload", up, token);
      fileIds.push(str(up.json.id));
    }
  }
  const text = input.text.trim();
  const r = await call(
    `${base}/api/notes/create`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ i: token, visibility: "public", text: text || null, ...(fileIds.length > 0 ? { fileIds } : {}) }),
    },
    fetchImpl,
    60_000,
  );
  if (!r.ok) return failed("Misskey", "post", r, token);
  const id = str(obj(r.json.createdNote).id);
  return { ok: true, id, url: id ? `${base}/notes/${id}` : undefined };
}

// ---- Pixelfed (Mastodon-compatible API) -----------------------------------------------------------

export async function connectPixelfed(f: Fields, fetchImpl: Fetch = safeFetch): Promise<SaveAccountInput> {
  const instance = hostOf(serverBase(f.instance, "Pixelfed"));
  const token = f.token.trim();
  let profile;
  try {
    profile = await verifyMastodonCredentials(instance, token, fetchImpl);
  } catch {
    throw new NetworkAuthError("bad_login", "That Pixelfed server didn't accept the token. Check the server address and that the token has read and write scopes.");
  }
  const limits = await fetchInstanceLimits(instance, fetchImpl);
  return {
    externalId: `${profile.id}@${instance}`,
    username: `${profile.username}@${instance}`,
    tokens: { accessToken: token },
    scopes: ["personal_access_token"],
    meta: { instance, profileUrl: profile.url, maxChars: limits.maxChars, maxMedia: limits.maxMedia },
  };
}

/** Same calls as Mastodon; the network name in errors is swapped. */
export async function publishToPixelfed(input: PublishInput): Promise<PublishOutcome> {
  if (!input.media.some((m) => m.type === "image")) return { ok: false, error: "Pixelfed posts need at least one image." };
  const out = await publishToMastodon(input);
  return out.ok ? out : { ...out, error: out.error.replace(/Mastodon/g, "Pixelfed") };
}

// ---- PeerTube -------------------------------------------------------------------------------------

export async function connectPeerTube(f: Fields, fetchImpl: Fetch = safeFetch): Promise<SaveAccountInput> {
  const base = serverBase(f.instance, "PeerTube");
  const username = f.username.trim();
  const password = f.password ?? "";
  const client = await call(`${base}/api/v1/oauth-clients/local`, { method: "GET" }, fetchImpl, 15_000);
  const clientId = client.ok ? str(client.json.client_id) : "";
  const clientSecret = client.ok ? str(client.json.client_secret) : "";
  if (!clientId || !clientSecret) throw new NetworkAuthError("bad_instance", "We couldn't reach that PeerTube server. Check the address.");
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "password", username, password });
  const t = await call(`${base}/api/v1/users/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() }, fetchImpl, 15_000);
  if (!t.ok) {
    throw new NetworkAuthError("bad_login", t.status === 400 || t.status === 401 ? "PeerTube didn't accept that username and password." : redact(`PeerTube login failed: ${t.error}`, password));
  }
  const tokens = tokenSetFrom(t.json, "PeerTube");
  const me = await call(`${base}/api/v1/users/me`, { method: "GET", headers: { Authorization: `Bearer ${tokens.accessToken}` } }, fetchImpl, 15_000);
  if (!me.ok) throw new NetworkAuthError("profile_failed", "PeerTube logged in but didn't return your account. Try again.");
  const channels = Array.isArray(me.json.videoChannels) ? me.json.videoChannels.map(obj) : [];
  const channel = channels[0];
  if (!channel || !str(channel.id)) throw new NetworkAuthError("bad_login", "That PeerTube account has no channel to upload to. Create one, then try again.");
  const host = hostOf(base);
  return {
    externalId: `${str(me.json.id)}@${host}`,
    username: `${str(me.json.username) || username}@${host}`,
    tokens,
    scopes: ["password_grant"],
    meta: { base, clientId, channelId: str(channel.id), channelName: str(channel.displayName) || str(channel.name) },
    secret: { clientSecret },
  };
}

/** grant_type=refresh_token with the server's local client. */
export async function refreshPeerTube(account: NetAccount, fetchImpl: Fetch = safeFetch): Promise<TokenSet> {
  const base = str(account.meta.base);
  const clientId = str(account.meta.clientId);
  const clientSecret = account.secret.clientSecret ?? "";
  if (!account.refreshToken || !base || !clientId || !clientSecret) throw new NetworkAuthError("refresh_failed", "PeerTube access expired. Reconnect PeerTube in Settings.", true);
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token", refresh_token: account.refreshToken });
  const r = await call(`${base}/api/v1/users/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() }, fetchImpl, 15_000);
  if (!r.ok) throw new NetworkAuthError("refresh_failed", redact(`PeerTube refresh failed: ${r.error}`, account.refreshToken, clientSecret), r.status === 400 || r.status === 401);
  return tokenSetFrom(r.json, "PeerTube");
}

/** PeerTube video titles: 3 to 120 characters. */
export function peertubeTitle(text: string): string {
  const { title } = splitTitle(text, 120);
  return title.length >= 3 ? title : `${title || "Video"} ${new Date().toISOString().slice(0, 10)}`.trim();
}

export async function publishToPeerTube(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? safeFetch;
  const token = input.account.accessToken;
  const base = str(input.account.meta.base);
  const channelId = str(input.account.meta.channelId);
  if (!base || !channelId) return { ok: false, error: "This PeerTube channel has no server stored. Reconnect it in Settings.", tokenDead: true };
  const videos = input.media.filter((m) => m.type === "video");
  if (videos.length !== 1 || input.media.length !== 1) return { ok: false, error: "PeerTube posts are one video. Attach exactly one video." };
  const dl = await downloadAll(videos, fetchImpl, 2 * 1024 * MB);
  if (!dl.ok) return dl;
  const { body } = splitTitle(input.text);
  const form = new FormData();
  form.set("channelId", channelId);
  form.set("name", peertubeTitle(input.text));
  if (body && body !== peertubeTitle(input.text)) form.set("description", body.slice(0, 10000));
  form.set("privacy", "1");
  form.set("videofile", blobOf(dl.files[0]), dl.files[0].filename);
  const r = await call(`${base}/api/v1/videos/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }, fetchImpl, 30 * 60_000);
  if (!r.ok) return { ...failed("PeerTube", "upload", r, token), tokenDead: r.status === 401 };
  const video = obj(r.json.video);
  const id = str(video.shortUUID) || str(video.uuid) || str(video.id);
  return { ok: true, id, url: id ? `${base}/w/${id}` : undefined };
}

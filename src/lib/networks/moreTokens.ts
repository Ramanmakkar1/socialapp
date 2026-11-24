// Portions adapted from Postiz (https://github.com/gitroomhq/postiz-app), AGPL-3.0:
// medium.provider.ts, lemmy.provider.ts and moltbook.provider.ts.
//
// Server only: networks connected with a token / API key (no OAuth app, no platform review).
//   - Medium: integration token, Markdown posts to the profile (public) or a publication (draft).
//   - Lemmy: instance + login once -> session JWT (the password is never stored); one channel = one
//     community; the first line is the post title.
//   - Moltbook: agent API key, posts to a submolt (default "general").
import { safeFetch } from "@/lib/netGuard";
import { NetworkAuthError, obj, redact, str, type Fetch, type PublishInput, type PublishOutcome } from "@/lib/networks/common";
import { call, failed, normalizeBaseUrl, type CallResult } from "@/lib/networks/http";
import type { SaveAccountInput } from "@/lib/networks/store";
import { splitTitle } from "@/lib/networks/tokenNetworks";

type Fields = Record<string, string>;

function loginError(r: CallResult, label: string, ...secrets: string[]): NetworkAuthError {
  const reason = r.status === 0 ? "instance_unreachable" : "invalid_token";
  const msg = r.ok ? `${label} didn't accept these details.` : redact(`${label} didn't accept these details (${r.status}): ${r.error}`, ...secrets);
  return new NetworkAuthError(reason, msg);
}

// ---- Medium -----------------------------------------------------------------------------------------

const MEDIUM = "https://api.medium.com/v1";
const mediumHeaders = (token: string) => ({ Authorization: `Bearer ${token}`, Accept: "application/json", "Accept-Charset": "utf-8" });

export async function connectMedium(f: Fields, fetchImpl: Fetch = safeFetch): Promise<SaveAccountInput> {
  const token = f.token.trim();
  const r = await call(`${MEDIUM}/me`, { method: "GET", headers: mediumHeaders(token) }, fetchImpl, 15_000);
  const me = r.ok ? obj(r.json.data) : {};
  if (!r.ok || !str(me.id)) throw loginError(r, "Medium", token);
  const publication = (f.publication ?? "").trim();
  return {
    // One channel per profile/publication pair, so a user can connect both.
    externalId: publication ? `${str(me.id)}:${publication}` : str(me.id),
    username: str(me.username) || str(me.name),
    tokens: { accessToken: token },
    scopes: ["integration_token"],
    meta: { userId: str(me.id), publication, url: str(me.url) },
  };
}

export async function publishToMedium(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? safeFetch;
  const token = input.account.accessToken;
  if (input.media.length > 0) return { ok: false, error: "Medium posts from Poskoo are text (Markdown) only. Remove the media or untick Medium." };
  const userId = str(input.account.meta.userId) || input.account.externalId.split(":")[0];
  const publication = str(input.account.meta.publication);
  const { title, body } = splitTitle(input.text, 100);
  const url = publication ? `${MEDIUM}/publications/${encodeURIComponent(publication)}/posts` : `${MEDIUM}/users/${encodeURIComponent(userId)}/posts`;
  const r = await call(
    url,
    {
      method: "POST",
      headers: { ...mediumHeaders(token), "Content-Type": "application/json" },
      // Publications only accept drafts from integrations (Postiz does the same).
      body: JSON.stringify({ title, contentFormat: "markdown", content: `# ${title}\n\n${body}`, publishStatus: publication ? "draft" : "public" }),
    },
    fetchImpl,
  );
  if (!r.ok) return failed("Medium", "post", r, token);
  const data = obj(r.json.data);
  return { ok: true, id: str(data.id), url: str(data.url) || undefined };
}

// ---- Lemmy ------------------------------------------------------------------------------------------

const lemmyAuth = (jwt: string) => ({ Authorization: `Bearer ${jwt}`, Accept: "application/json" });

/** "technology", "!technology@lemmy.world" or "technology@lemmy.world" -> the name Lemmy's API takes. */
export function lemmyCommunityName(raw: string): string {
  return raw.trim().replace(/^!/, "").replace(/^https?:\/\/[^/]+\/c\//i, "");
}

export async function connectLemmy(f: Fields, fetchImpl: Fetch = safeFetch): Promise<SaveAccountInput> {
  const base = normalizeBaseUrl(f.instance);
  if (!base) throw new NetworkAuthError("invalid_instance", "Enter your Lemmy instance, e.g. lemmy.world.");
  const password = f.password;
  const login = await call(
    `${base}/api/v3/user/login`,
    { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ username_or_email: f.username.trim(), password }) },
    fetchImpl,
    15_000,
  );
  const jwt = login.ok ? str(login.json.jwt) : "";
  if (!jwt) throw loginError(login, "Lemmy", password);
  const name = lemmyCommunityName(f.community);
  const c = await call(`${base}/api/v3/community?name=${encodeURIComponent(name)}`, { method: "GET", headers: lemmyAuth(jwt) }, fetchImpl, 15_000);
  const community = c.ok ? obj(obj(c.json.community_view).community) : {};
  if (!c.ok || !str(community.id)) {
    throw new NetworkAuthError("invalid_token", `Lemmy couldn't find the community “${name}” on ${base.replace(/^https?:\/\//, "")}.`);
  }
  const host = base.replace(/^https?:\/\//, "");
  return {
    externalId: `${f.username.trim().toLowerCase()}@${host}:${str(community.id)}`,
    username: `${f.username.trim()} → !${str(community.name)}`,
    // Only the session token is kept; the password is dropped here.
    tokens: { accessToken: jwt },
    scopes: ["session"],
    meta: { instance: base, communityId: Number(community.id), community: str(community.name), communityTitle: str(community.title) },
  };
}

export async function publishToLemmy(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? safeFetch;
  const jwt = input.account.accessToken;
  const base = str(input.account.meta.instance);
  const communityId = Number(input.account.meta.communityId);
  if (!base || !communityId) return { ok: false, error: "This Lemmy channel has no community stored. Reconnect it in Settings.", tokenDead: true };
  if (input.media.length > 0) return { ok: false, error: "Lemmy posts from Poskoo are text only. Remove the media or untick Lemmy." };
  const { title, body } = splitTitle(input.text, 200);
  const r = await call(
    `${base}/api/v3/post`,
    { method: "POST", headers: { ...lemmyAuth(jwt), "Content-Type": "application/json" }, body: JSON.stringify({ community_id: communityId, name: title, body, nsfw: false }) },
    fetchImpl,
  );
  if (!r.ok) return failed("Lemmy", "post", r, jwt);
  const id = str(obj(obj(r.json.post_view).post).id);
  return { ok: true, id, url: id ? `${base}/post/${id}` : undefined };
}

// ---- Moltbook ---------------------------------------------------------------------------------------

const MOLTBOOK = "https://www.moltbook.com/api/v1";

export async function connectMoltbook(f: Fields, fetchImpl: Fetch = safeFetch): Promise<SaveAccountInput> {
  const key = f.token.trim();
  const r = await call(`${MOLTBOOK}/agents/me`, { method: "GET", headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } }, fetchImpl, 15_000);
  const agent = r.ok ? obj(r.json.agent) : {};
  if (!r.ok || r.json.success === false || !(str(agent.name) || str(agent.id))) throw loginError(r, "Moltbook", key);
  const submolt = (f.submolt ?? "").trim().replace(/^m\//i, "") || "general";
  return {
    externalId: `${str(agent.id) || str(agent.name)}:${submolt}`,
    username: `${str(agent.name)} → m/${submolt}`,
    tokens: { accessToken: key },
    scopes: ["api_key"],
    meta: { agent: str(agent.name), submolt },
  };
}

export async function publishToMoltbook(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? safeFetch;
  const key = input.account.accessToken;
  if (input.media.length > 0) return { ok: false, error: "Moltbook posts from Poskoo are text only. Remove the media or untick Moltbook." };
  const { title, body } = splitTitle(input.text, 100);
  const r = await call(
    `${MOLTBOOK}/posts`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ submolt: str(input.account.meta.submolt) || "general", title, content: body }),
    },
    fetchImpl,
  );
  if (!r.ok) return failed("Moltbook", "post", r, key);
  if (r.json.success === false) return { ok: false, error: redact(`Moltbook post failed: ${str(r.json.error) || "refused"}`, key), status: 400 };
  const id = str(obj(r.json.post).id);
  return { ok: true, id, url: id ? `https://www.moltbook.com/post/${id}` : undefined };
}

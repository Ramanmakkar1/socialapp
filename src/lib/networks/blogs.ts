// Server only: blogs, forums and newsletters connected with an API key / application password (no
// app review): DEV (dev.to), Hashnode, Ghost, self-hosted WordPress, Discourse and Listmonk. The
// first line of the caption becomes the title (splitTitle). Images are uploaded to the site, never
// hot-linked: Poskoo deletes its copy once every target has published.
import { createHmac } from "node:crypto";
import { NetworkAuthError, obj, redact, str, type Fetch, type PublishInput, type PublishOutcome } from "@/lib/networks/common";
import { blobOf, call, downloadAll, errorText, failed, hostOf, normalizeBaseUrl, textToHtml, type CallResult } from "@/lib/networks/http";
import type { SaveAccountInput } from "@/lib/networks/store";
import { splitTitle } from "@/lib/networks/tokenNetworks";

type Fields = Record<string, string>;
const MB = 1024 * 1024;

function siteBase(input: string, what: string): string {
  const base = normalizeBaseUrl(input);
  if (!base) throw new NetworkAuthError("bad_instance", `Enter your ${what} address, e.g. example.com (https only).`);
  return base;
}

function loginError(r: CallResult, label: string, ...secrets: string[]): NetworkAuthError {
  if (r.status === 401 || r.status === 403) return new NetworkAuthError("bad_login", `${label} didn't accept those credentials.`);
  if (r.status === 0) return new NetworkAuthError("bad_instance", `We couldn't reach that ${label} site. Check the exact address (with or without www).`);
  return new NetworkAuthError("bad_login", redact(`${label}: ${r.ok ? "unexpected answer" : r.error}`, ...secrets));
}

// ---- DEV (dev.to / Forem) -------------------------------------------------------------------------

const DEVTO = "https://dev.to/api";
const devtoHeaders = (key: string) => ({ "api-key": key, Accept: "application/vnd.forem.api-v1+json" });

export async function connectDevto(f: Fields, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const key = f.token.trim();
  const r = await call(`${DEVTO}/users/me`, { method: "GET", headers: devtoHeaders(key) }, fetchImpl, 15_000);
  if (!r.ok || !str(r.json.id)) throw loginError(r, "DEV", key);
  return { externalId: str(r.json.id), username: str(r.json.username), tokens: { accessToken: key }, scopes: ["api_key"], meta: {} };
}

export async function publishToDevto(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const key = input.account.accessToken;
  if (input.media.length > 0) return { ok: false, error: "DEV posts from Poskoo are text (Markdown) only. Remove the media or untick DEV." };
  const { title, body } = splitTitle(input.text, 128);
  const r = await call(
    `${DEVTO}/articles`,
    { method: "POST", headers: { ...devtoHeaders(key), "Content-Type": "application/json" }, body: JSON.stringify({ article: { title, body_markdown: body, published: true } }) },
    fetchImpl,
  );
  if (!r.ok) return failed("DEV", "post", r, key);
  return { ok: true, id: str(r.json.id), url: str(r.json.url) || undefined };
}

// ---- Hashnode (GraphQL) ---------------------------------------------------------------------------

const HASHNODE = "https://gql.hashnode.com";

async function gql(token: string, query: string, variables: Record<string, unknown>, fetchImpl: Fetch): Promise<CallResult> {
  const r = await call(HASHNODE, { method: "POST", headers: { Authorization: token, "Content-Type": "application/json" }, body: JSON.stringify({ query, variables }) }, fetchImpl);
  if (!r.ok) return r;
  // GraphQL reports errors with HTTP 200.
  if (Array.isArray(r.json.errors) && r.json.errors.length > 0) {
    const code = str(obj(obj(r.json.errors[0]).extensions).code);
    return { ok: false, status: code === "UNAUTHENTICATED" ? 401 : 400, error: errorText(r.json, 400), body: r.body };
  }
  return { ...r, json: obj(r.json.data) };
}

export async function connectHashnode(f: Fields, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const token = f.token.trim();
  const r = await gql(token, "query { me { id username publications(first: 20) { edges { node { id title url } } } } }", {}, fetchImpl);
  const me = r.ok ? obj(r.json.me) : {};
  if (!r.ok || !str(me.id)) throw loginError(r, "Hashnode", token);
  const pubs = (Array.isArray(obj(me.publications).edges) ? (obj(me.publications).edges as unknown[]) : []).map((e) => obj(obj(e).node));
  const want = (f.blog ?? "").trim() ? hostOf(normalizeBaseUrl(f.blog) ?? f.blog) : "";
  const pub = want ? pubs.find((p) => hostOf(str(p.url)) === want) : pubs[0];
  if (!pub) throw new NetworkAuthError("bad_login", want ? "That blog isn't on this Hashnode account." : "This Hashnode account has no blog yet. Create one first.");
  return {
    externalId: str(pub.id),
    username: str(pub.title) || hostOf(str(pub.url)),
    tokens: { accessToken: token },
    scopes: ["personal_access_token"],
    meta: { publicationId: str(pub.id), blogUrl: str(pub.url), user: str(me.username) },
  };
}

export async function publishToHashnode(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  if (input.media.length > 0) return { ok: false, error: "Hashnode posts from Poskoo are text (Markdown) only. Remove the media or untick Hashnode." };
  const { title, body } = splitTitle(input.text);
  const r = await gql(
    token,
    "mutation PublishPost($input: PublishPostInput!) { publishPost(input: $input) { post { id url } } }",
    { input: { title, contentMarkdown: body, publicationId: str(input.account.meta.publicationId), tags: [] } },
    fetchImpl,
  );
  if (!r.ok) return failed("Hashnode", "post", r, token);
  const post = obj(obj(r.json.publishPost).post);
  return { ok: true, id: str(post.id), url: str(post.url) || undefined };
}

// ---- Ghost (Admin API key -> short-lived JWT) -----------------------------------------------------

/** HS256 JWT for the Ghost Admin API (5 minutes, audience /admin/). Throws on a malformed key. */
export function ghostJwt(adminKey: string, nowSec = Math.floor(Date.now() / 1000)): string {
  const [id, secret] = adminKey.split(":");
  if (!/^[a-f0-9]{24}$/i.test(id ?? "") || !/^[a-f0-9]{64}$/i.test(secret ?? "")) {
    throw new NetworkAuthError("bad_login", "That isn't a Ghost Admin API key (it looks like 24 characters, a colon, then 64).");
  }
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${enc({ alg: "HS256", typ: "JWT", kid: id })}.${enc({ iat: nowSec, exp: nowSec + 300, aud: "/admin/" })}`;
  return `${unsigned}.${createHmac("sha256", Buffer.from(secret, "hex")).update(unsigned).digest("base64url")}`;
}

const ghostHeaders = (key: string) => ({ Authorization: `Ghost ${ghostJwt(key)}`, "Accept-Version": "v5.0" });

export async function connectGhost(f: Fields, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const base = siteBase(f.instance, "Ghost site");
  const key = f.token.trim();
  const auth = await call(`${base}/ghost/api/admin/posts/?limit=1&fields=id`, { method: "GET", headers: ghostHeaders(key) }, fetchImpl, 15_000);
  if (!auth.ok) throw loginError(auth, "Ghost", key);
  const site = await call(`${base}/ghost/api/admin/site/`, { method: "GET", headers: ghostHeaders(key) }, fetchImpl, 15_000);
  const title = site.ok ? str(obj(site.json.site).title) : "";
  return { externalId: `${hostOf(base)}${new URL(base).pathname}`.replace(/\/$/, ""), username: title || hostOf(base), tokens: { accessToken: key }, scopes: ["admin_api_key"], meta: { base } };
}

export async function publishToGhost(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const key = input.account.accessToken;
  const base = str(input.account.meta.base);
  if (!base) return { ok: false, error: "This Ghost site has no address stored. Reconnect it in Settings.", tokenDead: true };
  if (input.media.some((m) => m.type === "video")) return { ok: false, error: "Ghost posts from Poskoo take images only." };
  let headers: Record<string, string>;
  try {
    headers = ghostHeaders(key);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Bad Ghost key", tokenDead: true };
  }
  const urls: string[] = [];
  if (input.media.length > 0) {
    const dl = await downloadAll(input.media, fetchImpl, 20 * MB);
    if (!dl.ok) return dl;
    for (const file of dl.files) {
      const form = new FormData();
      form.set("file", blobOf(file), file.filename);
      form.set("purpose", "image");
      const up = await call(`${base}/ghost/api/admin/images/upload/`, { method: "POST", headers, body: form }, fetchImpl, 5 * 60_000);
      if (!up.ok) return failed("Ghost", "image upload", up, key);
      const url = str(obj((up.json.images as unknown[] | undefined)?.[0]).url);
      if (url) urls.push(url);
    }
  }
  const { title, body } = splitTitle(input.text);
  const html = [textToHtml(body), ...urls.slice(1).map((u) => `<figure class="kg-card kg-image-card"><img src="${u}" alt=""></figure>`)].join("\n");
  const r = await call(
    `${base}/ghost/api/admin/posts/?source=html`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ posts: [{ title, html, status: "published", ...(urls[0] ? { feature_image: urls[0] } : {}) }] }),
    },
    fetchImpl,
  );
  if (!r.ok) return failed("Ghost", "post", r, key);
  const post = obj((r.json.posts as unknown[] | undefined)?.[0]);
  return { ok: true, id: str(post.id), url: str(post.url) || undefined };
}

// ---- WordPress (self-hosted, application password) ------------------------------------------------

/** REST URL: pretty permalinks (/wp-json/...) or the ?rest_route= fallback. */
function wpUrl(base: string, route: string, query = false): string {
  return query ? `${base}/?rest_route=${encodeURIComponent(route)}` : `${base}/wp-json${route}`;
}

export async function connectWordPress(f: Fields, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const base = siteBase(f.instance, "WordPress site");
  const user = f.username.trim();
  const pass = f.token.trim();
  const auth = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  let restQuery = false;
  let me = await call(`${wpUrl(base, "/wp/v2/users/me")}?context=edit`, { method: "GET", headers: { Authorization: auth } }, fetchImpl, 15_000);
  if (!me.ok && me.status === 404) {
    restQuery = true;
    me = await call(`${wpUrl(base, "/wp/v2/users/me", true)}&context=edit`, { method: "GET", headers: { Authorization: auth } }, fetchImpl, 15_000);
  }
  if (!me.ok || !str(me.json.id)) throw loginError(me, "WordPress", pass);
  const caps = obj(me.json.capabilities);
  if (Object.keys(caps).length > 0 && caps.publish_posts !== true) throw new NetworkAuthError("bad_login", "That WordPress user can't publish posts. Use an Author, Editor or Administrator.");
  const site = await call(restQuery ? wpUrl(base, "/", true) : `${base}/wp-json/`, { method: "GET" }, fetchImpl, 15_000);
  const name = site.ok ? str(site.json.name) : "";
  return {
    externalId: `${hostOf(base)}${new URL(base).pathname}#${str(me.json.id)}`,
    username: name || hostOf(base),
    tokens: { accessToken: pass },
    scopes: ["application_password"],
    meta: { base, user, restQuery },
  };
}

export async function publishToWordPress(input: PublishInput): Promise<PublishOutcome> {
  const pass = input.account.accessToken;
  const base = str(input.account.meta.base);
  const user = str(input.account.meta.user);
  const q = input.account.meta.restQuery === true;
  if (!base || !user) return { ok: false, error: "This WordPress site has no address stored. Reconnect it in Settings.", tokenDead: true };
  const auth = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  return wpPublish(input, (route) => wpUrl(base, route, q), auth, "WordPress", pass);
}

/**
 * WordPress REST v2 publish, shared by self-hosted sites (application password) and WordPress.com
 * (OAuth bearer token against public-api.wordpress.com/wp/v2/sites/<id>). Images are uploaded to
 * the media library; the first becomes the featured image.
 */
export async function wpPublish(input: PublishInput, api: (route: string) => string, auth: string, label: string, secret: string): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  if (input.media.some((m) => m.type === "video")) return { ok: false, error: `${label} posts from Poskoo take images only.` };
  const uploaded: { id: number; url: string }[] = [];
  if (input.media.length > 0) {
    const dl = await downloadAll(input.media, fetchImpl, 50 * MB);
    if (!dl.ok) return dl;
    for (const file of dl.files) {
      const up = await call(
        api("/wp/v2/media"),
        { method: "POST", headers: { Authorization: auth, "Content-Type": file.contentType, "Content-Disposition": `attachment; filename="${file.filename}"` }, body: new Uint8Array(file.bytes) },
        fetchImpl,
        5 * 60_000,
      );
      if (!up.ok) return failed(label, "image upload", up, secret);
      uploaded.push({ id: Number(up.json.id), url: str(up.json.source_url) });
    }
  }
  const { title, body } = splitTitle(input.text);
  const content = [textToHtml(body), ...uploaded.slice(1).map((u) => `<figure class="wp-block-image"><img src="${u.url}" alt=""></figure>`)].join("\n");
  const r = await call(
    api("/wp/v2/posts"),
    {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, status: "publish", ...(uploaded[0] ? { featured_media: uploaded[0].id } : {}) }),
    },
    fetchImpl,
  );
  if (!r.ok) return failed(label, "post", r, secret);
  return { ok: true, id: str(r.json.id), url: str(r.json.link) || undefined };
}

// ---- Discourse (topic per post) -------------------------------------------------------------------

const discourseHeaders = (key: string, user: string) => ({ "Api-Key": key, "Api-Username": user });

export async function connectDiscourse(f: Fields, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const base = siteBase(f.instance, "forum");
  const key = f.token.trim();
  const user = f.username.trim();
  const category = (f.category ?? "").trim();
  if (category && !/^\d{1,9}$/.test(category)) throw new NetworkAuthError("bad_login", "The category ID is a number (it's in the category's URL, e.g. /c/news/4).");
  const r = await call(`${base}/session/current.json`, { method: "GET", headers: { ...discourseHeaders(key, user), Accept: "application/json" } }, fetchImpl, 15_000);
  const current = r.ok ? obj(r.json.current_user) : {};
  if (!r.ok || !str(current.id)) throw loginError(r, "Discourse", key);
  const info = await call(`${base}/site/basic-info.json`, { method: "GET", headers: { Accept: "application/json" } }, fetchImpl, 15_000);
  const title = info.ok ? str(info.json.title) : "";
  return {
    externalId: `${hostOf(base)}#${str(current.id)}${category ? `#${category}` : ""}`,
    username: `${title || hostOf(base)} (@${str(current.username) || user})`,
    tokens: { accessToken: key },
    scopes: ["api_key"],
    meta: { base, user: str(current.username) || user, category: category ? Number(category) : null },
  };
}

export async function publishToDiscourse(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const key = input.account.accessToken;
  const base = str(input.account.meta.base);
  const user = str(input.account.meta.user);
  if (!base || !user) return { ok: false, error: "This Discourse forum has no address stored. Reconnect it in Settings.", tokenDead: true };
  if (input.media.some((m) => m.type === "video")) return { ok: false, error: "Discourse posts from Poskoo take images only." };
  const headers = { ...discourseHeaders(key, user), Accept: "application/json" };
  const images: string[] = [];
  if (input.media.length > 0) {
    const dl = await downloadAll(input.media, fetchImpl, 20 * MB);
    if (!dl.ok) return dl;
    for (const file of dl.files) {
      const form = new FormData();
      form.set("type", "composer");
      form.set("synchronous", "true");
      form.set("file", blobOf(file), file.filename);
      const up = await call(`${base}/uploads.json`, { method: "POST", headers, body: form }, fetchImpl, 5 * 60_000);
      if (!up.ok) return failed("Discourse", "upload", up, key);
      images.push(`![${file.filename}](${str(up.json.short_url) || str(up.json.url)})`);
    }
  }
  const { title, body } = splitTitle(input.text);
  const raw = [body, ...images].join("\n\n");
  const category = Number(input.account.meta.category) || undefined;
  const r = await call(
    `${base}/posts.json`,
    { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ title, raw, ...(category ? { category } : {}) }) },
    fetchImpl,
  );
  if (!r.ok) return failed("Discourse", "post", r, key);
  const topic = str(r.json.topic_id);
  const slug = str(r.json.topic_slug) || "-";
  return { ok: true, id: str(r.json.id), url: topic ? `${base}/t/${slug}/${topic}` : undefined };
}

// ---- Listmonk (campaign per post) -----------------------------------------------------------------

export function parseListIds(input: string): number[] {
  return [...new Set(input.split(/[\s,]+/).filter((s) => /^\d{1,9}$/.test(s)).map(Number))];
}

const listmonkHeaders = (user: string, token: string) => ({ Authorization: `token ${user}:${token}`, Accept: "application/json" });

export async function connectListmonk(f: Fields, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const base = siteBase(f.instance, "Listmonk");
  const user = f.username.trim();
  const token = f.token.trim();
  const lists = parseListIds(f.lists ?? "");
  if (lists.length === 0) throw new NetworkAuthError("bad_login", "Enter at least one list ID (Lists page in Listmonk, e.g. 1, 3).");
  const r = await call(`${base}/api/lists?per_page=all&minimal=true`, { method: "GET", headers: listmonkHeaders(user, token) }, fetchImpl, 15_000);
  if (!r.ok) throw loginError(r, "Listmonk", token);
  const data = r.json.data;
  const rows = (Array.isArray(data) ? data : Array.isArray(obj(data).results) ? (obj(data).results as unknown[]) : []).map(obj);
  const names = lists.map((id) => str(rows.find((row) => Number(row.id) === id)?.name));
  if (names.some((n) => !n)) throw new NetworkAuthError("bad_login", "One of those list IDs doesn't exist on this Listmonk server.");
  return {
    externalId: `${hostOf(base)}#${user}#${lists.join(",")}`,
    username: names.length === 1 ? names[0] : `${names.length} lists on ${hostOf(base)}`,
    tokens: { accessToken: token },
    scopes: ["api_token"],
    meta: { base, user, lists },
  };
}

export async function publishToListmonk(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const base = str(input.account.meta.base);
  const user = str(input.account.meta.user);
  const lists = Array.isArray(input.account.meta.lists) ? (input.account.meta.lists as unknown[]).map(Number).filter((n) => n > 0) : [];
  if (!base || !user || lists.length === 0) return { ok: false, error: "This Listmonk connection has no lists stored. Reconnect it in Settings.", tokenDead: true };
  if (input.media.length > 0) return { ok: false, error: "Listmonk campaigns from Poskoo are text (Markdown) only. Remove the media or untick Listmonk." };
  const headers = { ...listmonkHeaders(user, token), "Content-Type": "application/json" };
  const { title, body } = splitTitle(input.text, 200);
  const c = await call(
    `${base}/api/campaigns`,
    { method: "POST", headers, body: JSON.stringify({ name: title, subject: title, lists, type: "regular", content_type: "markdown", body }) },
    fetchImpl,
  );
  if (!c.ok) return failed("Listmonk", "campaign", c, token);
  const id = str(obj(c.json.data).id);
  const s = await call(`${base}/api/campaigns/${encodeURIComponent(id)}/status`, { method: "PUT", headers, body: JSON.stringify({ status: "running" }) }, fetchImpl);
  if (!s.ok) return { ok: false, error: redact(`Listmonk created campaign ${id} but couldn't start it: ${s.error}. Start it in Listmonk.`, token) };
  return { ok: true, id, url: `${base}/admin/campaigns/${id}` };
}

import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyForm, bytes, json, mockFetch, noSleep } from "../../test-utils/mockFetch.ts";
import type { NetAccount } from "./common.ts";
import { pkceS256 } from "./common.ts";
import {
  MASTODON_SCOPES,
  exchangeMastodonCode,
  fetchInstanceLimits,
  mastodonAuthorizeUrl,
  normalizeInstance,
  publishToMastodon,
  registerMastodonApp,
  verifyMastodonCredentials,
} from "./mastodon.ts";

const account: NetAccount = {
  id: "m1",
  platform: "mastodon",
  externalId: "mastodon.social:109",
  username: "brew@mastodon.social",
  accessToken: "masto-token-123",
  refreshToken: "",
  tokenExpiresAt: null,
  meta: { instance: "mastodon.social", maxChars: 500, maxMedia: 4 },
  secret: {},
};

test("instance input: handles, URLs and bare hosts; rejects local or odd hosts", () => {
  assert.equal(normalizeInstance("mastodon.social"), "mastodon.social");
  assert.equal(normalizeInstance("@me@Fosstodon.org"), "fosstodon.org");
  assert.equal(normalizeInstance("https://mastodon.social/@me"), "mastodon.social");
  assert.equal(normalizeInstance("localhost"), null);
  assert.equal(normalizeInstance("evil.local"), null);
  assert.equal(normalizeInstance("host:8080"), null);
  assert.equal(normalizeInstance(""), null);
});

test("app registration posts our redirect URI and scopes to /api/v1/apps", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /\/api\/v1\/apps/, reply: () => json({ client_id: "cid", client_secret: "csec" }) }]);
  const app = await registerMastodonApp("mastodon.social", fetchImpl);
  assert.equal(app.clientId, "cid");
  assert.equal(calls[0].url, "https://mastodon.social/api/v1/apps");
  const form = bodyForm(calls[0]);
  assert.equal(form.get("redirect_uris"), "https://poskoo.com/api/mastodon/callback");
  assert.equal(form.get("scopes"), MASTODON_SCOPES);
});

test("an unreachable server is reported in plain words", async () => {
  const { fetchImpl } = mockFetch([{ match: /apps/, reply: () => { throw new Error("ENOTFOUND"); } }]);
  await assert.rejects(registerMastodonApp("nope.example", fetchImpl), (e: Error & { reason?: string }) => e.reason === "instance_unreachable");
});

test("authorize URL carries a PKCE S256 challenge; the exchange sends the verifier", async () => {
  const url = new URL(mastodonAuthorizeUrl("mastodon.social", "cid", "st", "verifier-123"));
  assert.equal(url.origin, "https://mastodon.social");
  assert.equal(url.searchParams.get("code_challenge"), pkceS256("verifier-123"));
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  const { fetchImpl, calls } = mockFetch([{ match: /oauth\/token/, reply: () => json({ access_token: "tok", token_type: "Bearer" }) }]);
  const t = await exchangeMastodonCode("mastodon.social", { clientId: "cid", clientSecret: "csec" }, "code1", "verifier-123", fetchImpl);
  assert.equal(t.accessToken, "tok");
  assert.equal(bodyForm(calls[0]).get("code_verifier"), "verifier-123");
});

test("profile and instance limits (v2 instance, fallback defaults)", async () => {
  const { fetchImpl } = mockFetch([
    { match: /verify_credentials/, reply: () => json({ id: "109", username: "brew", acct: "brew", url: "https://mastodon.social/@brew", avatar: "a.png" }) },
    { match: /api\/v2\/instance/, reply: () => json({ configuration: { statuses: { max_characters: 1000, max_media_attachments: 4 } } }) },
  ]);
  assert.equal((await verifyMastodonCredentials("mastodon.social", "t", fetchImpl)).id, "109");
  assert.deepEqual(await fetchInstanceLimits("mastodon.social", fetchImpl), { maxChars: 1000, maxMedia: 4 });
  const none = mockFetch([{ match: /instance/, reply: () => json({}, 404) }]);
  assert.deepEqual(await fetchInstanceLimits("x.example", none.fetchImpl), { maxChars: 500, maxMedia: 4 });
});

test("publish: uploads media, waits for processing, posts with an Idempotency-Key", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn\.example\.com/, reply: () => bytes(500, "video/mp4") },
    { match: /POST https:\/\/mastodon\.social\/api\/v2\/media/, reply: () => json({ id: "77", url: null }, 202) },
    { match: /GET https:\/\/mastodon\.social\/api\/v1\/media\/77/, reply: (_c, n) => (n === 0 ? json({ id: "77", url: null }, 206) : json({ id: "77", url: "https://files/77.mp4" })) },
    { match: /api\/v1\/statuses/, reply: () => json({ id: "1101", url: "https://mastodon.social/@brew/1101" }) },
  ]);
  const r = await publishToMastodon({ account, text: "Hello fediverse", media: [{ type: "video", url: "https://cdn.example.com/v.mp4" }], options: {}, idempotencyKey: "target-1", fetchImpl, sleep: noSleep });
  assert.ok(r.ok);
  assert.equal(r.url, "https://mastodon.social/@brew/1101");
  const status = calls.find((c) => c.url.endsWith("/api/v1/statuses"))!;
  assert.equal(status.headers["idempotency-key"], "target-1");
  assert.equal(status.headers.authorization, "Bearer masto-token-123");
  const form = bodyForm(status);
  assert.equal(form.get("status"), "Hello fediverse");
  assert.deepEqual(form.getAll("media_ids[]"), ["77"]);
});

test("publish: a revoked token asks for a reconnect; too many attachments are refused", async () => {
  const { fetchImpl } = mockFetch([{ match: /statuses/, reply: () => json({ error: "The access token was revoked" }, 401) }]);
  const r = await publishToMastodon({ account, text: "x", media: [], options: {}, fetchImpl, sleep: noSleep });
  assert.equal(!r.ok && r.tokenDead, true);
  const many = Array.from({ length: 5 }, (_, i) => ({ type: "image" as const, url: `https://cdn.example.com/${i}.jpg` }));
  const r2 = await publishToMastodon({ account, text: "x", media: many, options: {} });
  assert.match(!r2.ok ? r2.error : "", /up to 4 attachments/);
});

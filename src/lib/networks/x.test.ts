import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyForm, bodyJson, bytes, json, mockFetch, noSleep } from "../../test-utils/mockFetch.ts";
import type { NetAccount } from "./common.ts";
import { pkceS256 } from "./common.ts";
import { exchangeXCode, fetchXProfile, publishToX, refreshXToken, xAuthorizeUrl } from "./x.ts";

process.env.X_CLIENT_ID = "x_client";
process.env.X_CLIENT_SECRET = "x_secret";

const account: NetAccount = {
  id: "x1",
  platform: "x",
  externalId: "123",
  username: "brewco",
  accessToken: "x-access",
  refreshToken: "x-refresh",
  tokenExpiresAt: null,
  meta: {},
  secret: {},
};

test("authorize URL: OAuth 2.0 PKCE with the five scopes", () => {
  const url = new URL(xAuthorizeUrl("st", "verifier-abc"));
  assert.equal(url.origin + url.pathname, "https://x.com/i/oauth2/authorize");
  assert.equal(url.searchParams.get("scope"), "tweet.read tweet.write users.read offline.access media.write");
  assert.equal(url.searchParams.get("code_challenge"), pkceS256("verifier-abc"));
  assert.equal(url.searchParams.get("redirect_uri"), "https://poskoo.com/api/x/callback");
});

test("code exchange (Basic auth + verifier), refresh and profile", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /oauth2\/token/, reply: () => json({ access_token: "a", refresh_token: "r2", expires_in: 7200 }) },
    { match: /users\/me/, reply: () => json({ data: { id: "123", username: "brewco", name: "Brew" } }) },
  ]);
  const t = await exchangeXCode("c", "verifier-abc", fetchImpl);
  assert.equal(t.refreshToken, "r2");
  assert.equal(calls[0].headers.authorization, `Basic ${Buffer.from("x_client:x_secret").toString("base64")}`);
  assert.equal(bodyForm(calls[0]).get("code_verifier"), "verifier-abc");
  await refreshXToken("x-refresh", fetchImpl);
  assert.equal(bodyForm(calls[1]).get("grant_type"), "refresh_token");
  assert.equal((await fetchXProfile("a", fetchImpl)).username, "brewco");
});

test("publish with an image: initialize / append / finalize, then POST /2/tweets with media_ids", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn\.example\.com/, reply: () => bytes(1200, "image/jpeg") },
    { match: /media\/upload\/initialize/, reply: () => json({ data: { id: "m1", media_key: "3_m1" } }) },
    { match: /media\/upload\/m1\/append/, reply: () => new Response(null, { status: 204 }) },
    { match: /media\/upload\/m1\/finalize/, reply: () => json({ data: { id: "m1" } }) },
    { match: /2\/tweets/, reply: () => json({ data: { id: "1855", text: "hi" } }, 201) },
  ]);
  const r = await publishToX({ account, text: "Hello X", media: [{ type: "image", url: "https://cdn.example.com/a.jpg" }], options: {}, fetchImpl, sleep: noSleep });
  assert.ok(r.ok);
  assert.equal(r.url, "https://x.com/brewco/status/1855");
  const init = bodyJson(calls.find((c) => c.url.endsWith("/initialize"))!);
  assert.deepEqual(init, { media_type: "image/jpeg", total_bytes: 1200, media_category: "tweet_image" });
  const append = calls.find((c) => c.url.endsWith("/append"))!;
  assert.ok(append.body instanceof FormData);
  assert.equal((append.body as FormData).get("segment_index"), "0");
  assert.deepEqual(bodyJson(calls.find((c) => c.url.endsWith("/2/tweets"))!), { text: "Hello X", media: { media_ids: ["m1"] } });
});

test("video processing is polled via STATUS until it succeeds", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn\.example\.com/, reply: () => bytes(100, "video/mp4") },
    { match: /initialize/, reply: () => json({ data: { id: "v1" } }) },
    { match: /append/, reply: () => new Response(null, { status: 204 }) },
    { match: /finalize/, reply: () => json({ data: { id: "v1", processing_info: { state: "pending", check_after_secs: 1 } } }) },
    { match: /command=STATUS/, reply: (_c, n) => json({ data: { processing_info: { state: n === 0 ? "in_progress" : "succeeded" } } }) },
    { match: /2\/tweets/, reply: () => json({ data: { id: "9" } }) },
  ]);
  const r = await publishToX({ account, text: "vid", media: [{ type: "video", url: "https://cdn.example.com/v.mp4" }], options: {}, fetchImpl, sleep: noSleep });
  assert.ok(r.ok);
  assert.equal(calls.filter((c) => c.url.includes("command=STATUS")).length, 2);
  assert.equal(bodyJson(calls.find((c) => c.url.endsWith("/initialize"))!).media_category, "tweet_video");
});

test("errors: 401 = reconnect, 402 = plan/credits message, too many media refused", async () => {
  const a = mockFetch([{ match: /2\/tweets/, reply: () => json({ title: "Unauthorized" }, 401) }]);
  const r1 = await publishToX({ account, text: "x", media: [], options: {}, fetchImpl: a.fetchImpl });
  assert.equal(!r1.ok && r1.tokenDead, true);
  const b = mockFetch([{ match: /2\/tweets/, reply: () => json({ title: "Payment Required", detail: "CreditsDepleted" }, 402) }]);
  const r2 = await publishToX({ account, text: "x", media: [], options: {}, fetchImpl: b.fetchImpl });
  assert.match(!r2.ok ? r2.error : "", /credits/);
  const five = Array.from({ length: 5 }, (_, i) => ({ type: "image" as const, url: `https://cdn.example.com/${i}.jpg` }));
  const r3 = await publishToX({ account, text: "x", media: five, options: {} });
  assert.equal(r3.ok, false);
});

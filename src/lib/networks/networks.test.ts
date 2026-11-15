import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../../test-utils/fakePool.ts";
import { json, mockFetch } from "../../test-utils/mockFetch.ts";
import { NetworkAuthError, openOAuthFlow, redact, sealOAuthFlow, type NetAccount } from "./common.ts";
import { publishNetworkTargets, type ClaimedNetworkRow } from "./publish.ts";
import { networkTargetError, normalizeNetOptions } from "./validate.ts";
import { checkCaption, xWeightedLength } from "../platforms.ts";

if (!process.env.TOKEN_ENCRYPTION_KEY) process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32).toString("base64");

const acct = (over: Partial<NetAccount> = {}): NetAccount => ({
  id: "acc-1",
  platform: "bluesky",
  externalId: "did:plc:1",
  username: "me.bsky.social",
  accessToken: "tok-1",
  refreshToken: "ref-1",
  tokenExpiresAt: null,
  meta: {},
  secret: {},
  ...over,
});

const row = (over: Partial<ClaimedNetworkRow> = {}): ClaimedNetworkRow => ({
  id: "t1",
  post_id: "p1",
  caption_override: null,
  caption: "Hello",
  media: [{ type: "image", url: "https://cdn.example.com/a.jpg" }],
  user_id: "u1",
  net_options: null,
  ...over,
});

function harness(rows: ClaimedNetworkRow[]) {
  const failed: { id: string; error: string }[] = [];
  const published: { id: string; ext: string }[] = [];
  const expired: string[] = [];
  const refreshed: string[] = [];
  let claimed = false; // the claim hands out the due rows once, then nothing is left
  return {
    failed,
    published,
    expired,
    refreshed,
    deps: {
      claim: async (_n: number, platform: string) => (platform === "bluesky" && !claimed ? ((claimed = true), rows) : []),
      markFailed: async (id: string, _p: string, error: string) => void failed.push({ id, error }),
      refreshPostStatus: async (p: string) => void refreshed.push(p),
      markPublished: async (id: string, ext: string) => void published.push({ id, ext }),
      markExpired: async (id: string) => void expired.push(id),
      holdMedia: async () => {},
    },
  };
}

test("publish loop: a successful post is marked published with its URL and the post status refreshed", async () => {
  const h = harness([row({ caption_override: "Custom" })]);
  let seenText = "";
  const r = await publishNetworkTargets(10, {
    ...h.deps,
    loadAccount: async () => acct(),
    ensureFresh: async (a) => a,
    publish: async (_p, input) => {
      seenText = input.text;
      assert.equal(input.idempotencyKey, "t1");
      assert.equal(input.media.length, 1);
      return { ok: true, id: "at://x", url: "https://bsky.app/profile/me/post/1" };
    },
  }, ["bluesky"]);
  assert.deepEqual(r, { published: 1, failed: 0 });
  assert.equal(seenText, "Custom");
  assert.deepEqual(h.published, [{ id: "t1", ext: "https://bsky.app/profile/me/post/1" }]);
  assert.deepEqual(h.refreshed, ["p1"]);
});

test("publish loop: no connected account fails with a connect message", async () => {
  const h = harness([row()]);
  const r = await publishNetworkTargets(10, { ...h.deps, loadAccount: async () => null }, ["bluesky"]);
  assert.equal(r.failed, 1);
  assert.match(h.failed[0].error, /No Bluesky account connected/);
});

test("publish loop: a dead refresh marks the account expired and asks for a reconnect", async () => {
  const h = harness([row()]);
  await publishNetworkTargets(10, {
    ...h.deps,
    loadAccount: async () => acct(),
    ensureFresh: async () => {
      throw new NetworkAuthError("refresh_failed", "expired", true);
    },
  }, ["bluesky"]);
  assert.deepEqual(h.expired, ["acc-1"]);
  assert.match(h.failed[0].error, /Reconnect Bluesky/);
});

test("publish loop: a tokenDead publish error expires the account; other errors keep it", async () => {
  const h = harness([row({ id: "t1" }), row({ id: "t2" })]);
  let n = 0;
  await publishNetworkTargets(10, {
    ...h.deps,
    loadAccount: async () => acct(),
    ensureFresh: async (a) => a,
    publish: async () => (n++ === 0 ? { ok: false, error: "401", tokenDead: true } : { ok: false, error: "Rate limited" }),
  }, ["bluesky"]);
  assert.deepEqual(h.expired, ["acc-1"]);
  assert.match(h.failed[0].error, /^Bluesky access expired/);
  assert.equal(h.failed[1].error, "Rate limited");
});

test("publish loop: a claim failure (e.g. migration not applied) skips that network only", async () => {
  const h = harness([]);
  const orig = console.error;
  console.error = () => {};
  try {
    const r = await publishNetworkTargets(10, { ...h.deps, claim: async () => { throw new Error("column net_options does not exist"); } }, ["bluesky", "x"]);
    assert.deepEqual(r, { published: 0, failed: 0 });
  } finally {
    console.error = orig;
  }
});

test("validate: per-network media rules apply when scheduling; drafts are lenient", () => {
  const img = (n: number) => Array.from({ length: n }, (_, i) => ({ type: "image" as const, url: `https://c/${i}.jpg` }));
  const vid = [{ type: "video" as const, url: "https://c/v.mp4" }];
  assert.match(networkTargetError("bluesky", vid, null, true) ?? "", /images only/);
  assert.match(networkTargetError("x", img(5), null, true) ?? "", /up to 4/);
  assert.equal(networkTargetError("x", vid, null, true), null);
  assert.match(networkTargetError("pinterest", img(1), {}, true) ?? "", /board/);
  assert.equal(networkTargetError("pinterest", img(1), {}, false), null);
  assert.match(networkTargetError("tiktok", vid, {}, true) ?? "", /Choose who can see/);
  assert.equal(networkTargetError("tiktok", vid, {}, false), null);
  assert.equal(networkTargetError("mastodon", img(4), null, true), null);
  assert.deepEqual(normalizeNetOptions("pinterest", { boardId: " b1 ", title: "T", link: "", extra: 1 }), { boardId: "b1", title: "T", link: "" });
  assert.equal(normalizeNetOptions("bluesky", { anything: true }), null);
  assert.equal(normalizeNetOptions("linkedin", { author: "urn:li:person:1" }), null);
});

test("caption limits: Bluesky counts graphemes, X weighs links and emoji, Mastodon uses the instance limit", () => {
  const family = "👨‍👩‍👧‍👦";
  assert.equal(checkCaption("bluesky", family.repeat(300)).errors.length, 0, "300 emoji graphemes fit");
  assert.equal(checkCaption("bluesky", "a".repeat(301)).errors.length, 1);
  assert.equal(xWeightedLength("hi https://example.com/a/very/long/path?x=1"), 3 + 23);
  assert.equal(xWeightedLength("😀"), 2);
  assert.equal(xWeightedLength("日本"), 4);
  assert.equal(checkCaption("x", "a".repeat(280)).errors.length, 0);
  assert.equal(checkCaption("x", "日".repeat(141)).errors.length, 1);
  assert.equal(checkCaption("mastodon", "a".repeat(600)).errors.length, 1);
  const big = checkCaption("mastodon", "a".repeat(600), 1000);
  assert.equal(big.errors.length, 0);
  assert.equal(big.max, 1000);
  assert.equal(checkCaption("linkedin", "a".repeat(3001)).errors.length, 1);
  assert.equal(checkCaption("tiktok", "a".repeat(2200)).errors.length, 0);
  assert.equal(checkCaption("pinterest", "a".repeat(501)).errors.length, 1);
});

test("OAuth flow cookie round-trips (state, verifier, extras) and rejects tampering", () => {
  const sealed = sealOAuthFlow({ state: "s1", verifier: "v1", extra: { instance: "mastodon.social" } });
  assert.deepEqual(openOAuthFlow(sealed), { state: "s1", verifier: "v1", extra: { instance: "mastodon.social" } });
  assert.equal(openOAuthFlow(`${sealed.slice(0, -4)}AAAA`), null);
  assert.equal(openOAuthFlow(undefined), null);
  assert.equal(redact("token abc123secret leaked", "abc123secret"), "token [redacted] leaked");
});

test("refreshUnderLock: re-reads the locked row, skips when already fresh, stores rotated tokens encrypted", async () => {
  const { encryptToken, decryptToken } = await import("../crypto.ts");
  const updates: unknown[][] = [];
  const stored = {
    id: "acc-1", platform: "x", external_id: "1", username: "me",
    access_token_enc: encryptToken("old-access"), refresh_token_enc: encryptToken("old-refresh"),
    token_expires_at: new Date(Date.now() - 1000), meta: {}, secret_enc: null,
  };
  const { pool } = createFakePool([
    { match: /for update/, reply: () => [stored] },
    { match: /^update socialapp\.social_accounts set access_token_enc/, reply: (params) => { updates.push(params); return []; } },
  ]);
  const restore = installFakePool(pool);
  try {
    const { refreshUnderLock } = await import("./store.ts");
    let refreshCalls = 0;
    const out = await refreshUnderLock("acc-1", () => true, async (a) => {
      refreshCalls += 1;
      assert.equal(a.refreshToken, "old-refresh");
      return { accessToken: "new-access", refreshToken: "new-refresh", expiresIn: 7200 };
    });
    assert.equal(refreshCalls, 1);
    assert.equal(out.accessToken, "new-access");
    assert.equal(decryptToken(String(updates[0][1])), "new-access");
    assert.equal(decryptToken(String(updates[0][2])), "new-refresh");
    assert.equal(updates[0][3], 7200);
    const skipped = await refreshUnderLock("acc-1", () => false, async () => {
      throw new Error("must not refresh");
    });
    assert.equal(skipped.accessToken, "old-access");
  } finally {
    restore();
  }
});

test("Bluesky adapter: an expired refresh JWT logs in again with the stored app password", async () => {
  const { NETWORKS } = await import("./registry.ts");
  const { fetchImpl, calls } = mockFetch([
    { match: /refreshSession/, reply: () => json({ error: "ExpiredToken" }, 400) },
    { match: /createSession/, reply: () => json({ did: "did:plc:1", handle: "me.bsky.social", accessJwt: "fresh-a", refreshJwt: "fresh-r" }) },
  ]);
  const t = await NETWORKS.bluesky.refresh!(acct({ secret: { appPassword: "abcd-efgh-ijkl-mnop" }, meta: { service: "https://pds.example" } }), fetchImpl);
  assert.equal(t.accessToken, "fresh-a");
  assert.equal(calls[1].url, "https://pds.example/xrpc/com.atproto.server.createSession");
});

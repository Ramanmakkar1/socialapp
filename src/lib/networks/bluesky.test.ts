import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyJson, bytes, json, mockFetch } from "../../test-utils/mockFetch.ts";
import type { NetAccount } from "./common.ts";
import {
  buildFacets,
  createBlueskySession,
  jwtExpiresIn,
  looksLikeAppPassword,
  normalizeHandle,
  normalizeService,
  publishToBluesky,
  refreshBlueskySession,
} from "./bluesky.ts";

const PDS = "https://morel.us-east.host.bsky.network";
const account: NetAccount = {
  id: "a1",
  platform: "bluesky",
  externalId: "did:plc:abc123",
  username: "brew.bsky.social",
  accessToken: "access-jwt-xyz",
  refreshToken: "refresh-jwt-xyz",
  tokenExpiresAt: null,
  meta: { service: PDS },
  secret: { appPassword: "abcd-efgh-ijkl-mnop" },
};

test("handles, app passwords and hosting providers are normalised", () => {
  assert.equal(normalizeHandle("@Brew.bsky.social"), "brew.bsky.social");
  assert.equal(normalizeHandle("brew"), "brew.bsky.social");
  assert.equal(normalizeHandle("https://bsky.app/profile/brew.com"), "brew.com");
  assert.equal(looksLikeAppPassword("abcd-efgh-ijkl-mnop"), true);
  assert.equal(looksLikeAppPassword("my main password"), false);
  assert.equal(normalizeService(""), "https://bsky.social");
  assert.equal(normalizeService("pds.example.com"), "https://pds.example.com");
  assert.equal(normalizeService("http://pds.example.com"), null);
});

test("createSession returns the account's own PDS from the DID document", async () => {
  const { fetchImpl, calls } = mockFetch([
    {
      match: /createSession/,
      reply: () =>
        json({
          did: "did:plc:abc123",
          handle: "brew.bsky.social",
          accessJwt: "a",
          refreshJwt: "r",
          didDoc: { service: [{ id: "#atproto_pds", type: "AtprotoPersonalDataServer", serviceEndpoint: PDS }] },
        }),
    },
  ]);
  const s = await createBlueskySession("brew.bsky.social", "abcd-efgh-ijkl-mnop", "https://bsky.social", fetchImpl);
  assert.equal(s.service, PDS);
  assert.equal(calls[0].url, "https://bsky.social/xrpc/com.atproto.server.createSession");
  assert.deepEqual(bodyJson(calls[0]), { identifier: "brew.bsky.social", password: "abcd-efgh-ijkl-mnop" });
});

test("a wrong app password gives a friendly error", async () => {
  const { fetchImpl } = mockFetch([{ match: /createSession/, reply: () => json({ error: "AuthenticationRequired", message: "Invalid identifier or password" }, 401) }]);
  await assert.rejects(createBlueskySession("x.bsky.social", "abcd-efgh-ijkl-mnop", undefined, fetchImpl), /did not accept that handle and app password/);
});

test("refreshSession uses the refresh JWT as bearer; an expired one is tokenDead", async () => {
  const ok = mockFetch([{ match: /refreshSession/, reply: () => json({ accessJwt: "new-a", refreshJwt: "new-r" }) }]);
  const t = await refreshBlueskySession(PDS, "refresh-jwt-xyz", ok.fetchImpl);
  assert.equal(t.accessToken, "new-a");
  assert.equal(t.refreshToken, "new-r");
  assert.equal(ok.calls[0].headers.authorization, "Bearer refresh-jwt-xyz");
  const dead = mockFetch([{ match: /refreshSession/, reply: () => json({ error: "ExpiredToken" }, 400) }]);
  await assert.rejects(refreshBlueskySession(PDS, "old", dead.fetchImpl), (e: Error & { tokenDead?: boolean }) => e.tokenDead === true);
});

test("jwtExpiresIn reads exp and refreshes 15 minutes early", () => {
  const now = Date.UTC(2026, 10, 11);
  const payload = Buffer.from(JSON.stringify({ exp: now / 1000 + 7200 })).toString("base64url");
  assert.equal(jwtExpiresIn(`h.${payload}.s`, now), 7200 - 900);
  assert.equal(jwtExpiresIn("not-a-jwt", now), 105 * 60);
});

test("facets use UTF-8 byte offsets for links, tags and resolved mentions", async () => {
  const text = "héllo https://poskoo.com #launch @friend.bsky.social";
  const facets = await buildFacets(text, async (h) => (h === "friend.bsky.social" ? "did:plc:friend" : null));
  const enc = Buffer.from(text, "utf8");
  const slice = (f: (typeof facets)[number]) => enc.subarray(f.index.byteStart, f.index.byteEnd).toString("utf8");
  assert.deepEqual(facets.map(slice), ["https://poskoo.com", "#launch", "@friend.bsky.social"]);
  assert.equal(facets[0].index.byteStart, 7, "é is two bytes");
  assert.equal(facets[2].features[0].did, "did:plc:friend");
});

test("publish: uploads images as blobs and creates the post on the user's PDS", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn\.example\.com/, reply: () => bytes(2048, "image/jpeg") },
    { match: /uploadBlob/, reply: () => json({ blob: { $type: "blob", ref: { $link: "bafy" }, mimeType: "image/jpeg", size: 2048 } }) },
    { match: /createRecord/, reply: () => json({ uri: "at://did:plc:abc123/app.bsky.feed.post/3kabc", cid: "c" }) },
  ]);
  const r = await publishToBluesky({ account, text: "New roast #coffee", media: [{ type: "image", url: "https://cdn.example.com/a.jpg" }], options: {}, fetchImpl });
  assert.ok(r.ok);
  assert.equal(r.url, "https://bsky.app/profile/brew.bsky.social/post/3kabc");
  const upload = calls.find((c) => c.url.includes("uploadBlob"))!;
  assert.equal(upload.url.startsWith(PDS), true);
  assert.equal(upload.headers["content-type"], "image/jpeg");
  const rec = bodyJson(calls.find((c) => c.url.includes("createRecord"))!);
  assert.equal(rec.repo, "did:plc:abc123");
  const record = rec.record as Record<string, unknown>;
  assert.equal(record.text, "New roast #coffee");
  assert.equal((record.embed as Record<string, unknown>).$type, "app.bsky.embed.images");
  assert.equal((record.facets as unknown[]).length, 1);
});

test("publish: a link without images becomes a link card with the page's Open Graph title", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /GET https:\/\/poskoo\.com\/blog/, reply: () => new Response('<html><head><meta property="og:title" content="Poskoo blog"><meta property="og:description" content="News"></head></html>', { headers: { "content-type": "text/html" } }) },
    { match: /createRecord/, reply: () => json({ uri: "at://did:plc:abc123/app.bsky.feed.post/3kdef" }) },
  ]);
  const r = await publishToBluesky({ account, text: "Read https://poskoo.com/blog", media: [], options: {}, fetchImpl });
  assert.ok(r.ok);
  const record = bodyJson(calls.find((c) => c.url.includes("createRecord"))!).record as Record<string, unknown>;
  assert.deepEqual(record.embed, { $type: "app.bsky.embed.external", external: { uri: "https://poskoo.com/blog", title: "Poskoo blog", description: "News" } });
});

test("publish: videos are refused clearly and an expired session asks for a reconnect", async () => {
  const v = await publishToBluesky({ account, text: "x", media: [{ type: "video", url: "https://cdn.example.com/a.mp4" }], options: {} });
  assert.equal(v.ok, false);
  const { fetchImpl } = mockFetch([{ match: /createRecord/, reply: () => json({ error: "ExpiredToken", message: "Token has expired" }, 400) }]);
  const r = await publishToBluesky({ account, text: "plain", media: [], options: {}, fetchImpl });
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.tokenDead, true);
});

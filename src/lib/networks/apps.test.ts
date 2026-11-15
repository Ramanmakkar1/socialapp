import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyJson, bytes, json, mockFetch } from "../../test-utils/mockFetch.ts";
import type { NetAccount, NetworkId } from "./common.ts";
import {
  connectFarcasterSigner,
  exchangeWpcomCode,
  isTumblrConfigured,
  oauth1Header,
  publishToFarcaster,
  publishToPlurk,
  publishToTumblr,
  publishToTwitch,
  publishToWpcom,
  tumblrAuthorizeUrl,
  tumblrContent,
  twitchAuthorizeUrl,
} from "./apps.ts";
import { channelStatuses } from "../channelStatus.ts";
import { checkCaption } from "../platforms.ts";

const acct = (platform: NetworkId, over: Partial<NetAccount> = {}): NetAccount => ({
  id: "a1",
  platform,
  externalId: "ext",
  username: null,
  accessToken: "secret-token-1",
  refreshToken: "",
  tokenExpiresAt: null,
  meta: {},
  secret: {},
  ...over,
});

function withEnv<T>(vars: Record<string, string>, run: () => T): T {
  const old = Object.fromEntries(Object.keys(vars).map((k) => [k, process.env[k]]));
  Object.assign(process.env, vars);
  try {
    return run();
  } finally {
    for (const [k, v] of Object.entries(old)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test("OAuth 1.0a HMAC-SHA1 signature matches the published Twitter example", () => {
  const header = oauth1Header(
    "https://api.twitter.com/1.1/statuses/update.json",
    { include_entities: "true", status: "Hello Ladies + Gentlemen, a signed OAuth request!" },
    {
      key: "xvz1evFS4wEEPTGEFPHBog",
      secret: "kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw",
      token: "370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
      tokenSecret: "LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE",
    },
    {},
    "kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
    "1318622958",
  );
  assert.match(header, /oauth_signature="hCtSmYh%2BiHYCEqBWrE7C7hYmtUk%3D"/);
});

test("app networks are off until their keys are set, and say so", () => {
  withEnv({ TUMBLR_CLIENT_ID: "", TUMBLR_CLIENT_SECRET: "" }, () => assert.equal(isTumblrConfigured(), false));
  const s = channelStatuses({ tumblr: false, twitch: true }, {});
  assert.equal(s.tumblr.pill, "Not available yet");
  assert.equal(s.twitch.state, "ready");
  assert.equal(s.farcaster.state, "soon");
  assert.equal(checkCaption("twitch", "x".repeat(501)).errors.length, 1);
  assert.equal(checkCaption("plurk", "x".repeat(360)).errors.length, 0);
});

test("authorize URLs carry the scopes and our callback", () => {
  withEnv({ TUMBLR_CLIENT_ID: "tc", TWITCH_CLIENT_ID: "wc" }, () => {
    const t = new URL(tumblrAuthorizeUrl("st"));
    assert.equal(t.searchParams.get("scope"), "basic write offline_access");
    assert.equal(t.searchParams.get("redirect_uri"), "https://poskoo.com/api/tumblr/callback");
    assert.equal(new URL(twitchAuthorizeUrl("st")).searchParams.get("scope"), "user:write:chat");
  });
});

test("Tumblr: NPF text blocks per paragraph, images uploaded as multipart parts", async () => {
  assert.deepEqual(tumblrContent("One\n\nTwo", ["image/png"]), [
    { type: "text", text: "One" },
    { type: "text", text: "Two" },
    { type: "image", media: [{ type: "image/png", identifier: "f0" }] },
  ]);
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn/, reply: () => bytes(10, "image/png") },
    { match: /blog\/myblog\/posts/, reply: () => json({ response: { id: 123, id_string: "123" } }, 201) },
  ]);
  const out = await publishToTumblr({ account: acct("tumblr", { meta: { blog: "myblog" } }), text: "Hi", media: [{ type: "image", url: "https://cdn.example.com/a.png" }], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "123", url: "https://www.tumblr.com/myblog/123" });
  const form = calls[1].body as FormData;
  assert.ok(form.get("f0") instanceof Blob);
  assert.equal(JSON.parse(await (form.get("json") as Blob).text()).state, "published");
});

test("WordPress.com: the token response names the site; posts go to /wp/v2/sites/<id>", async () => {
  const t = mockFetch([{ match: /oauth2\/token/, reply: () => json({ access_token: "wt", token_type: "bearer", blog_id: "77", blog_url: "https://me.wordpress.com" }) }]);
  const ex = await withEnv({ WPCOM_CLIENT_ID: "c", WPCOM_CLIENT_SECRET: "s" }, () => exchangeWpcomCode("code", t.fetchImpl));
  assert.equal(ex.blogId, "77");
  const { fetchImpl, calls } = mockFetch([{ match: /wp\/v2\/sites\/77\/posts/, reply: () => json({ id: 5, link: "https://me.wordpress.com/hello" }, 201) }]);
  const out = await publishToWpcom({ account: acct("wpcom", { accessToken: "wt", meta: { blogId: "77" } }), text: "Hello\nBody", media: [], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "5", url: "https://me.wordpress.com/hello" });
  assert.equal(calls[0].headers.authorization, "Bearer wt");
  assert.equal(bodyJson(calls[0]).title, "Hello");
});

test("Plurk: plurkAdd is OAuth-signed with the stored token secret; link uses base-36 id", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /plurkAdd/, reply: () => json({ plurk_id: 1295 }) }]);
  const out = await withEnv({ PLURK_APP_KEY: "k", PLURK_APP_SECRET: "s" }, () =>
    publishToPlurk({ account: acct("plurk", { accessToken: "tok", secret: { tokenSecret: "ts" } }), text: "hello plurk", media: [], options: {}, fetchImpl }),
  );
  assert.deepEqual(out, { ok: true, id: "1295", url: "https://www.plurk.com/p/zz" });
  assert.match(calls[0].headers.authorization, /^OAuth .*oauth_token="tok"/);
  assert.equal(new URLSearchParams(String(calls[0].body)).get("qualifier"), ":");
});

test("Twitch: a chat message to the user's own channel; a dropped message is a failure", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /helix\/chat\/messages/, reply: () => json({ data: [{ message_id: "", is_sent: false, drop_reason: { code: "msg_duplicate", message: "Duplicate message" } }] }) }]);
  const out = await publishToTwitch({ account: acct("twitch", { externalId: "9", meta: { login: "me" } }), text: "Live now!", media: [], options: {}, fetchImpl });
  assert.ok(!out.ok && /Duplicate message/.test(out.error));
  assert.deepEqual(bodyJson(calls[0]), { broadcaster_id: "9", sender_id: "9", message: "Live now!" });
});

test("Farcaster: the signer must be approved for that fid; casts check the 320-byte limit", async () => {
  const uuid = "0f8c5b2e-1111-4a3b-9c2d-123456789abc";
  const bad = mockFetch([{ match: /signer\?/, reply: () => json({ status: "approved", fid: 2 }) }]);
  await assert.rejects(connectFarcasterSigner(uuid, "1", bad.fetchImpl), /isn't approved/);
  const ok = mockFetch([
    { match: /signer\?/, reply: () => json({ status: "approved", fid: 1 }) },
    { match: /user\/bulk/, reply: () => json({ users: [{ username: "alice" }] }) },
  ]);
  const saved = await connectFarcasterSigner(uuid, "1", ok.fetchImpl);
  assert.equal(saved.username, "@alice");
  const big = await withEnv({ NEYNAR_API_KEY: "nk" }, () => publishToFarcaster({ account: acct("farcaster", { accessToken: uuid, meta: { username: "alice" } }), text: "é".repeat(200), media: [], options: {} }));
  assert.ok(!big.ok && /320 bytes/.test(big.error));
  const c = mockFetch([{ match: /farcaster\/cast/, reply: () => json({ success: true, cast: { hash: "0xabcdef1234567890" } }) }]);
  const out = await withEnv({ NEYNAR_API_KEY: "nk" }, () =>
    publishToFarcaster({ account: acct("farcaster", { accessToken: uuid, meta: { username: "alice" } }), text: "gm", media: [], options: {}, idempotencyKey: "t-1", fetchImpl: c.fetchImpl }),
  );
  assert.deepEqual(out, { ok: true, id: "0xabcdef1234567890", url: "https://farcaster.xyz/alice/0xabcdef12" });
  assert.equal(c.calls[0].headers["x-api-key"], "nk");
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyForm, bodyJson, bytes, json, mockFetch, noSleep } from "../../test-utils/mockFetch.ts";
import type { NetAccount } from "./common.ts";
import {
  TIKTOK_UNAUDITED_MESSAGE,
  buildTikTokPostInfo,
  exchangeTikTokCode,
  isOwnMediaUrl,
  parseTikTokOptions,
  publishToTikTok,
  queryCreatorInfo,
  refreshTikTokToken,
  tiktokAuthorizeUrl,
  tiktokChunkPlan,
  tiktokConsentText,
  tiktokOptionsError,
} from "./tiktok.ts";

process.env.TIKTOK_CLIENT_KEY = "ck_test";
process.env.TIKTOK_CLIENT_SECRET = "cs_secret_value";

const SITE = "https://poskoo.com";
const account: NetAccount = {
  id: "acc1",
  platform: "tiktok",
  externalId: "open-1",
  username: "brewco",
  accessToken: "act.tiktok-token",
  refreshToken: "rft.tiktok",
  tokenExpiresAt: null,
  meta: {},
  secret: {},
};

const creator = {
  data: {
    creator_nickname: "Brew Co",
    creator_username: "brewco",
    creator_avatar_url: "https://p16.tiktokcdn.com/a.jpg",
    privacy_level_options: ["PUBLIC_TO_EVERYONE", "SELF_ONLY"],
    comment_disabled: false,
    duet_disabled: true,
    stitch_disabled: false,
    max_video_post_duration_sec: 600,
  },
  error: { code: "ok", message: "", log_id: "l1" },
};

const okOpts = { mode: "direct", privacyLevel: "SELF_ONLY", allowComment: true, allowDuet: true, allowStitch: false };

test("authorize URL: web Login Kit v2 with the three scopes, our callback and state", () => {
  const url = new URL(tiktokAuthorizeUrl("st4te"));
  assert.equal(url.origin + url.pathname, "https://www.tiktok.com/v2/auth/authorize/");
  assert.equal(url.searchParams.get("client_key"), "ck_test");
  assert.equal(url.searchParams.get("scope"), "user.info.basic,video.publish,video.upload");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("redirect_uri"), `${SITE}/api/tiktok/callback`);
  assert.equal(url.searchParams.get("state"), "st4te");
});

test("code exchange posts the form to /v2/oauth/token/ and returns tokens + lifetimes", async () => {
  const { fetchImpl, calls } = mockFetch([
    {
      match: /oauth\/token/,
      reply: () => json({ access_token: "act.1", refresh_token: "rft.1", expires_in: 86400, refresh_expires_in: 31536000, open_id: "open-1", scope: "user.info.basic,video.publish" }),
    },
  ]);
  const r = await exchangeTikTokCode("the-code", fetchImpl);
  assert.equal(r.tokens.accessToken, "act.1");
  assert.equal(r.tokens.refreshExpiresIn, 31536000);
  assert.equal(r.openId, "open-1");
  const form = bodyForm(calls[0]);
  assert.equal(form.get("grant_type"), "authorization_code");
  assert.equal(form.get("client_key"), "ck_test");
  assert.equal(form.get("code"), "the-code");
});

test("a refused refresh (200 with error body) throws a tokenDead error without leaking the secret", async () => {
  const { fetchImpl } = mockFetch([{ match: /oauth\/token/, reply: () => json({ error: "invalid_grant", error_description: "bad cs_secret_value" }) }]);
  await assert.rejects(refreshTikTokToken("rft.old", fetchImpl), (err: Error & { tokenDead?: boolean }) => {
    assert.equal(err.tokenDead, true);
    assert.ok(!err.message.includes("cs_secret_value"));
    return true;
  });
});

test("creator_info is parsed into the composer's options", async () => {
  const { fetchImpl } = mockFetch([{ match: /creator_info/, reply: () => json(creator) }]);
  const r = await queryCreatorInfo("tok", fetchImpl);
  assert.ok(r.ok);
  assert.deepEqual(r.info.privacyLevelOptions, ["PUBLIC_TO_EVERYONE", "SELF_ONLY"]);
  assert.equal(r.info.duetDisabled, true);
  assert.equal(r.info.maxVideoPostDurationSec, 600);
});

test("options: no default privacy, disclosure needs a choice, branded content can't be private", () => {
  const media = [{ type: "video" as const, url: `${SITE}/api/media/u/v.mp4` }];
  assert.match(tiktokOptionsError(parseTikTokOptions({}), media) ?? "", /Choose who can see/);
  assert.equal(tiktokOptionsError(parseTikTokOptions(okOpts), media), null);
  assert.match(tiktokOptionsError(parseTikTokOptions({ ...okOpts, commercial: true }), media) ?? "", /Your brand/);
  assert.match(
    tiktokOptionsError(parseTikTokOptions({ ...okOpts, commercial: true, brandedContent: true }), media) ?? "",
    /can't be private/,
  );
  assert.equal(tiktokOptionsError(parseTikTokOptions({ mode: "inbox" }), media), null, "inbox drafts are finished in TikTok");
  assert.match(tiktokOptionsError(parseTikTokOptions(okOpts), []) ?? "", /video or at least one photo/);
  assert.equal(tiktokConsentText({ brandedContent: true }), "By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation.");
  assert.equal(tiktokConsentText({ brandedContent: false }), "By posting, you agree to TikTok's Music Usage Confirmation.");
});

test("post_info: interaction flags follow both the user's toggles and the creator's settings", () => {
  const info = { nickname: "", username: "", avatarUrl: null, privacyLevelOptions: [], commentDisabled: false, duetDisabled: true, stitchDisabled: false, maxVideoPostDurationSec: 0 };
  const p = buildTikTokPostInfo(parseTikTokOptions({ ...okOpts, commercial: true, yourBrand: true }), info, "hi", "video");
  assert.equal(p.disable_comment, false);
  assert.equal(p.disable_duet, true, "creator turned duet off");
  assert.equal(p.disable_stitch, true, "user left stitch off");
  assert.equal(p.brand_organic_toggle, true);
  assert.equal(p.brand_content_toggle, false);
});

test("chunk plan: up to 64 MB is one chunk, larger files use 10 MB chunks with the remainder in the last", () => {
  assert.deepEqual(tiktokChunkPlan(3_000_000), { chunkSize: 3_000_000, count: 1 });
  assert.deepEqual(tiktokChunkPlan(64 * 1024 * 1024), { chunkSize: 64 * 1024 * 1024, count: 1 });
  assert.deepEqual(tiktokChunkPlan(105 * 1024 * 1024), { chunkSize: 10 * 1024 * 1024, count: 10 });
  assert.equal(isOwnMediaUrl(`${SITE}/api/media/u/a.mp4?exp=1&sig=x`), true);
  assert.equal(isOwnMediaUrl("https://cdn.example.com/a.mp4"), false);
});

test("direct post of our own video uses PULL_FROM_URL and polls until PUBLISH_COMPLETE", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /creator_info/, reply: () => json(creator) },
    { match: /video\/init/, reply: () => json({ data: { publish_id: "p_1" }, error: { code: "ok" } }) },
    {
      match: /status\/fetch/,
      reply: (_c, n) =>
        n === 0
          ? json({ data: { status: "PROCESSING_DOWNLOAD" }, error: { code: "ok" } })
          : // int64 id, written as raw JSON: a JS number would lose the last digits.
            new Response('{"data":{"status":"PUBLISH_COMPLETE","publicaly_available_post_id":[7300000000000000001]},"error":{"code":"ok"}}', { status: 200 }),
    },
  ]);
  const r = await publishToTikTok({ account, text: "Fresh beans #coffee", media: [{ type: "video", url: `${SITE}/api/media/u/v.mp4?exp=9&sig=s` }], options: okOpts, fetchImpl, sleep: noSleep });
  assert.ok(r.ok);
  assert.equal(r.url, "https://www.tiktok.com/@brewco/video/7300000000000000001");
  const init = bodyJson(calls.find((c) => c.url.includes("video/init"))!);
  assert.deepEqual(init.source_info, { source: "PULL_FROM_URL", video_url: `${SITE}/api/media/u/v.mp4?exp=9&sig=s` });
  assert.equal((init.post_info as Record<string, unknown>).privacy_level, "SELF_ONLY");
  assert.equal((init.post_info as Record<string, unknown>).title, "Fresh beans #coffee");
  assert.equal(calls[1].headers.authorization, "Bearer act.tiktok-token");
});

test("unverified media domain falls back to FILE_UPLOAD with Content-Range chunks", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /creator_info/, reply: () => json(creator) },
    {
      match: /video\/init/,
      reply: (_c, n) =>
        n === 0
          ? json({ error: { code: "url_ownership_unverified", message: "verify" } }, 403)
          : json({ data: { publish_id: "p_2", upload_url: "https://open-upload.tiktokapis.com/upload/?id=1" }, error: { code: "ok" } }),
    },
    { match: /\/api\/media\//, reply: () => bytes(1000, "video/mp4") },
    { match: /open-upload/, reply: () => new Response(null, { status: 201 }) },
    { match: /status\/fetch/, reply: () => json({ data: { status: "PUBLISH_COMPLETE", publicaly_available_post_id: [] }, error: { code: "ok" } }) },
  ]);
  const r = await publishToTikTok({ account, text: "x", media: [{ type: "video", url: `${SITE}/api/media/u/v.mp4` }], options: okOpts, fetchImpl, sleep: noSleep });
  assert.ok(r.ok);
  assert.equal(r.id, "p_2");
  const second = bodyJson(calls.filter((c) => c.url.includes("video/init"))[1]);
  assert.deepEqual(second.source_info, { source: "FILE_UPLOAD", video_size: 1000, chunk_size: 1000, total_chunk_count: 1 });
  const put = calls.find((c) => c.method === "PUT")!;
  assert.equal(put.headers["content-range"], "bytes 0-999/1000");
  assert.equal(put.headers["content-type"], "video/mp4");
});

test("an unaudited app gets the clear SELF_ONLY / private-account message", async () => {
  const { fetchImpl } = mockFetch([
    { match: /creator_info/, reply: () => json(creator) },
    { match: /video\/init/, reply: () => json({ error: { code: "unaudited_client_can_only_post_to_private_accounts", message: "x" } }, 403) },
  ]);
  const r = await publishToTikTok({ account, text: "x", media: [{ type: "video", url: `${SITE}/api/media/u/v.mp4` }], options: okOpts, fetchImpl, sleep: noSleep });
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.error, TIKTOK_UNAUDITED_MESSAGE);
});

test("a privacy option the creator no longer offers is refused before uploading", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /creator_info/, reply: () => json(creator) }]);
  const r = await publishToTikTok({ account, text: "x", media: [{ type: "video", url: `${SITE}/api/media/u/v.mp4` }], options: { ...okOpts, privacyLevel: "FOLLOWER_OF_CREATOR" }, fetchImpl, sleep: noSleep });
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /visibility is no longer available/);
  assert.equal(calls.length, 1);
});

test("an invalid token marks the account for reconnect", async () => {
  const { fetchImpl } = mockFetch([{ match: /creator_info/, reply: () => json({ error: { code: "access_token_invalid", message: "" } }, 401) }]);
  const r = await publishToTikTok({ account, text: "x", media: [{ type: "video", url: `${SITE}/api/media/u/v.mp4` }], options: okOpts, fetchImpl, sleep: noSleep });
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.tokenDead, true);
});

test("photo posts use content/init with PULL_FROM_URL and need our own media URLs", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /creator_info/, reply: () => json(creator) },
    { match: /content\/init/, reply: () => json({ data: { publish_id: "p_3" }, error: { code: "ok" } }) },
    { match: /status\/fetch/, reply: () => json({ data: { status: "PUBLISH_COMPLETE" }, error: { code: "ok" } }) },
  ]);
  const photos = [
    { type: "image" as const, url: `${SITE}/api/media/u/1.jpg` },
    { type: "image" as const, url: `${SITE}/api/media/u/2.jpg` },
  ];
  const r = await publishToTikTok({ account, text: "Title line\nmore text", media: photos, options: okOpts, fetchImpl, sleep: noSleep });
  assert.ok(r.ok);
  const body = bodyJson(calls.find((c) => c.url.includes("content/init"))!);
  assert.equal(body.media_type, "PHOTO");
  assert.equal(body.post_mode, "DIRECT_POST");
  assert.equal((body.post_info as Record<string, unknown>).title, "Title line");
  assert.deepEqual((body.source_info as Record<string, unknown>).photo_images, photos.map((p) => p.url));

  const linked = await publishToTikTok({ account, text: "x", media: [{ type: "image", url: "https://cdn.example.com/1.jpg" }], options: okOpts, fetchImpl, sleep: noSleep });
  assert.equal(linked.ok, false);
});

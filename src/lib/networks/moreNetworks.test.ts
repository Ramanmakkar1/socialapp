// Networks ported from Postiz on 2026-11-24: request shapes, connect results and error handling.
import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyForm, bodyJson, bytes, json, mockFetch } from "../../test-utils/mockFetch.ts";
import type { NetAccount, NetworkId } from "./common.ts";
import { connectLemmy, connectMedium, connectMoltbook, lemmyCommunityName, publishToLemmy, publishToMedium, publishToMoltbook } from "./moreTokens.ts";
import {
  cleanSubreddit,
  isRedditConfigured,
  publishToDribbble,
  publishToKick,
  publishToReddit,
  publishToTikTokBusiness,
  publishToVk,
  publishToWhop,
  redditAuthorizeUrl,
  vkAuthorizeUrl,
} from "./moreApps.ts";
import { destOptionsError, parseDestOptions } from "./options.ts";
import { networkTargetError } from "./validate.ts";
import { classifyPublishError } from "../publishErrors.ts";
import { channelStatuses } from "../channelStatus.ts";

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

// ---- Medium -----------------------------------------------------------------------------------------

test("Medium: connect reads /me; publish posts Markdown publicly to the profile", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /GET https:\/\/api\.medium\.com\/v1\/me$/, reply: () => json({ data: { id: "u1", username: "maya" } }) },
    { match: /POST https:\/\/api\.medium\.com\/v1\/users\/u1\/posts$/, reply: () => json({ data: { id: "p1", url: "https://medium.com/@maya/p1" } }, 201) },
  ]);
  const saved = await connectMedium({ token: "tok-123456", publication: "" }, fetchImpl);
  assert.equal(saved.externalId, "u1");
  assert.equal(saved.username, "maya");
  const out = await publishToMedium({ account: acct("medium", { accessToken: "tok-123456", meta: saved.meta ?? {} }), text: "My title\n\nBody text", media: [], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "p1", url: "https://medium.com/@maya/p1" });
  const body = bodyJson(calls[1]);
  assert.equal(body.title, "My title");
  assert.equal(body.contentFormat, "markdown");
  assert.equal(body.publishStatus, "public");
  assert.equal(calls[1].headers.authorization, "Bearer tok-123456");
});

test("Medium: a publication channel posts drafts to the publication", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /publications\/pub9\/posts$/, reply: () => json({ data: { id: "p2", url: "u" } }) }]);
  const out = await publishToMedium({ account: acct("medium", { meta: { userId: "u1", publication: "pub9" } }), text: "T\nB", media: [], options: {}, fetchImpl });
  assert.equal(out.ok, true);
  assert.equal(bodyJson(calls[0]).publishStatus, "draft");
});

test("Medium: a rejected token is a clear connect error that never echoes the token", async () => {
  const { fetchImpl } = mockFetch([{ match: /\/v1\/me$/, reply: () => json({ errors: [{ message: "Token was invalid." }] }, 401) }]);
  await assert.rejects(connectMedium({ token: "tok-SECRET-99", publication: "" }, fetchImpl), (err: Error) => !err.message.includes("tok-SECRET-99"));
});

// ---- Lemmy ------------------------------------------------------------------------------------------

test("Lemmy: connect logs in once, resolves the community and keeps only the JWT (never the password)", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /POST https:\/\/lemmy\.world\/api\/v3\/user\/login$/, reply: () => json({ jwt: "jwt-abc" }) },
    { match: /GET https:\/\/lemmy\.world\/api\/v3\/community\?name=technology$/, reply: () => json({ community_view: { community: { id: 42, name: "technology", title: "Tech" } } }) },
  ]);
  const saved = await connectLemmy({ instance: "lemmy.world", username: "Maya", password: "hunter2-password", community: "!technology@lemmy.world".replace("@lemmy.world", "") }, fetchImpl);
  assert.equal(saved.tokens.accessToken, "jwt-abc");
  assert.equal(saved.meta?.communityId, 42);
  assert.ok(!JSON.stringify(saved).includes("hunter2-password"), "password must not be stored");
  assert.equal(calls[1].headers.authorization, "Bearer jwt-abc");
});

test("Lemmy: community names accept !name, name@instance and full URLs", () => {
  assert.equal(lemmyCommunityName("!memes"), "memes");
  assert.equal(lemmyCommunityName("https://lemmy.world/c/technology"), "technology");
  assert.equal(lemmyCommunityName("technology@lemmy.world"), "technology@lemmy.world");
});

test("Lemmy: publish sends title (first line) and body to the stored community", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /POST https:\/\/lemmy\.world\/api\/v3\/post$/, reply: () => json({ post_view: { post: { id: 7 } } }) }]);
  const out = await publishToLemmy({ account: acct("lemmy", { accessToken: "jwt-abc", meta: { instance: "https://lemmy.world", communityId: 42 } }), text: "Title here\n\nBody", media: [], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "7", url: "https://lemmy.world/post/7" });
  assert.deepEqual(bodyJson(calls[0]), { community_id: 42, name: "Title here", body: "Body", nsfw: false });
});

// ---- Moltbook ---------------------------------------------------------------------------------------

test("Moltbook: connect reads the agent; publish posts to the chosen submolt", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /GET https:\/\/www\.moltbook\.com\/api\/v1\/agents\/me$/, reply: () => json({ success: true, agent: { id: "ag1", name: "poskoo-bot" } }) },
    { match: /POST https:\/\/www\.moltbook\.com\/api\/v1\/posts$/, reply: () => json({ success: true, post: { id: 99 } }) },
  ]);
  const saved = await connectMoltbook({ token: "moltbook_key_1", submolt: "m/agents" }, fetchImpl);
  assert.equal(saved.meta?.submolt, "agents");
  const out = await publishToMoltbook({ account: acct("moltbook", { accessToken: "moltbook_key_1", meta: saved.meta ?? {} }), text: "Hello agents\nfrom Poskoo", media: [], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "99", url: "https://www.moltbook.com/post/99" });
  assert.deepEqual(bodyJson(calls[1]), { submolt: "agents", title: "Hello agents", content: "from Poskoo" });
});

// ---- Reddit -----------------------------------------------------------------------------------------

test("Reddit: env-gated; authorize asks for a permanent token with identity/submit/read", () => {
  withEnv({ REDDIT_CLIENT_ID: "", REDDIT_CLIENT_SECRET: "" }, () => assert.equal(isRedditConfigured(), false));
  withEnv({ REDDIT_CLIENT_ID: "cid", REDDIT_CLIENT_SECRET: "sec" }, () => {
    assert.equal(isRedditConfigured(), true);
    const u = new URL(redditAuthorizeUrl("st8"));
    assert.equal(u.searchParams.get("duration"), "permanent");
    assert.equal(u.searchParams.get("scope"), "identity submit read");
    assert.match(u.searchParams.get("redirect_uri") ?? "", /\/api\/reddit\/callback$/);
  });
});

test("Reddit: self post to the subreddit from the composer option, with a User-Agent", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /POST https:\/\/oauth\.reddit\.com\/api\/submit$/, reply: () => json({ json: { errors: [], data: { name: "t3_abc", url: "https://www.reddit.com/r/marketing/comments/abc/x/" } } }) }]);
  const out = await publishToReddit({ account: acct("reddit"), text: "Launch day!\n\nWe shipped it.", media: [], options: { dest: "r/Marketing" }, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "t3_abc", url: "https://www.reddit.com/r/marketing/comments/abc/x/" });
  const form = bodyForm(calls[0]);
  assert.equal(form.get("sr"), "marketing");
  assert.equal(form.get("kind"), "self");
  assert.equal(form.get("title"), "Launch day!");
  assert.equal(form.get("text"), "We shipped it.");
  assert.match(calls[0].headers["user-agent"] ?? "", /poskoo/);
});

test("Reddit: errors arrive as HTTP 200 + json.errors; RATELIMIT becomes a rate_limit retry", async () => {
  const { fetchImpl } = mockFetch([{ match: /api\/submit$/, reply: () => json({ json: { errors: [["RATELIMIT", "you are doing that too much. try again in 9 minutes.", "ratelimit"]] } }) }]);
  const out = await publishToReddit({ account: acct("reddit"), text: "T", media: [], options: { dest: "marketing" }, fetchImpl });
  assert.equal(out.ok, false);
  if (out.ok) return;
  assert.equal(out.status, 429);
  assert.equal(classifyPublishError("reddit", out.error, { status: out.status }).kind, "rate_limit");
});

test("Reddit: subreddit cleaning and the composer rule", () => {
  assert.equal(cleanSubreddit("https://www.reddit.com/r/SaaS/"), "saas");
  assert.equal(cleanSubreddit("/r/marketing"), "marketing");
  assert.equal(destOptionsError("reddit", parseDestOptions({})), "Add the subreddit for Reddit.");
  assert.match(destOptionsError("reddit", parseDestOptions({ dest: "not a sub!" })) ?? "", /doesn't look like a subreddit/);
  assert.equal(destOptionsError("reddit", parseDestOptions({ dest: "r/marketing" })), null);
  // Scheduling without a subreddit is refused; a draft without one is fine.
  assert.match(networkTargetError("reddit", [], {}, true) ?? "", /subreddit/);
  assert.equal(networkTargetError("reddit", [], {}, false), null);
});

// ---- Dribbble ---------------------------------------------------------------------------------------

test("Dribbble: one image required; the shot id comes from the Location header", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /GET https:\/\/media\.example\.com\/a\.png$/, reply: () => bytes(1200, "image/png") },
    { match: /POST https:\/\/api\.dribbble\.com\/v2\/shots$/, reply: () => new Response(null, { status: 202, headers: { location: "https://api.dribbble.com/v2/shots/12345" } }) },
  ]);
  const none = await publishToDribbble({ account: acct("dribbble"), text: "Shot", media: [], options: {}, fetchImpl });
  assert.equal(none.ok, false);
  const out = await publishToDribbble({ account: acct("dribbble"), text: "New logo\nDetails", media: [{ type: "image", url: "https://media.example.com/a.png" }], options: {}, fetchImpl });
  assert.equal(out.ok, true);
  if (!out.ok) return;
  assert.equal(out.id, "12345");
  assert.equal(out.url, "https://dribbble.com/shots/12345");
  const fd = calls[1].body as FormData;
  assert.equal(fd.get("title"), "New logo");
  assert.equal(fd.get("description"), "Details");
});

// ---- VK ---------------------------------------------------------------------------------------------

test("VK: authorize uses VK ID with PKCE S256 and the wall scope", () => {
  withEnv({ VK_CLIENT_ID: "vk1" }, () => {
    const u = new URL(vkAuthorizeUrl("st", "verifier-verifier-verifier-verifier-1234"));
    assert.equal(u.origin, "https://id.vk.ru");
    assert.equal(u.searchParams.get("code_challenge_method"), "S256");
    assert.match(u.searchParams.get("scope") ?? "", /\bwall\b/);
  });
});

test("VK: wall.post errors come as HTTP 200 + error_code; code 5 means the token is dead", async () => {
  const { fetchImpl } = mockFetch([{ match: /wall\.post/, reply: () => json({ error: { error_code: 5, error_msg: "User authorization failed" } }) }]);
  const out = await publishToVk({ account: acct("vk", { externalId: "777" }), text: "hi", media: [], options: {}, fetchImpl });
  assert.equal(out.ok, false);
  if (out.ok) return;
  assert.equal(out.tokenDead, true);
  assert.ok(!out.error.includes("secret-token-1"));
});

test("VK: a successful wall post links to the wall entry", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /POST https:\/\/api\.vk\.ru\/method\/wall\.post/, reply: () => json({ response: { post_id: 55 } }) }]);
  const out = await publishToVk({ account: acct("vk", { externalId: "777" }), text: "Привет", media: [], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "55", url: "https://vk.com/wall777_55" });
  assert.equal(bodyForm(calls[0]).get("message"), "Привет");
});

// ---- Kick / Whop / TikTok Business ------------------------------------------------------------------

test("Kick: a chat message to your own channel, capped at 500 characters", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /POST https:\/\/api\.kick\.com\/public\/v1\/chat$/, reply: () => json({ data: { is_sent: true, message_id: "m1" } }) }]);
  const out = await publishToKick({ account: acct("kick", { externalId: "321", username: "maya" }), text: "x".repeat(700), media: [], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "m1", url: "https://kick.com/maya" });
  const body = bodyJson(calls[0]);
  assert.equal(body.broadcaster_user_id, 321);
  assert.equal(String(body.content).length, 500);
});

test("Whop: posts to the composer's forum, else the channel's default forum", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /POST https:\/\/api\.whop\.com\/api\/v1\/forum_posts$/, reply: () => json({ id: "post_1" }) }]);
  const viaDefault = await publishToWhop({ account: acct("whop", { meta: { defaultExperience: "exp_default" } }), text: "Hi\nall", media: [], options: {}, fetchImpl });
  assert.equal(viaDefault.ok, true);
  assert.equal(bodyJson(calls[0]).experience_id, "exp_default");
  await publishToWhop({ account: acct("whop", { meta: { defaultExperience: "exp_default" } }), text: "Hi", media: [], options: { dest: "exp_other" }, fetchImpl });
  assert.equal(bodyJson(calls[1]).experience_id, "exp_other");
  const missing = await publishToWhop({ account: acct("whop"), text: "Hi", media: [], options: {}, fetchImpl });
  assert.equal(missing.ok, false);
});

test("TikTok Business: photo vs video bodies, and a non-zero code is a failure", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /\/business\/photo\/publish\/$/, reply: () => json({ code: 0, data: { share_id: "s1" } }) },
    { match: /\/business\/video\/publish\/$/, reply: () => json({ code: 40105, message: "access_token_invalid" }) },
  ]);
  const photo = await publishToTikTokBusiness({ account: acct("tiktok_business", { externalId: "biz1" }), text: "cap", media: [{ type: "image", url: "https://m/a.jpg" }, { type: "image", url: "https://m/b.jpg" }], options: {}, fetchImpl });
  assert.equal(photo.ok, true);
  const pb = bodyJson(calls[0]);
  assert.equal(pb.business_id, "biz1");
  assert.deepEqual(pb.photo_images, ["https://m/a.jpg", "https://m/b.jpg"]);
  assert.equal(calls[0].headers["access-token"], "secret-token-1");
  const video = await publishToTikTokBusiness({ account: acct("tiktok_business", { externalId: "biz1" }), text: "cap", media: [{ type: "video", url: "https://m/v.mp4" }], options: {}, fetchImpl });
  assert.equal(video.ok, false);
  if (video.ok) return;
  assert.equal(video.tokenDead, true);
  assert.equal(classifyPublishError("tiktok_business", video.error, { status: video.status }).kind, "refresh_token");
});

// ---- Status + classification ------------------------------------------------------------------------

test("New app networks stay off until their keys are set; MeWe / TikTok Business wait for approval", () => {
  const s = channelStatuses({ reddit: false, mewe: false, tiktok_business: false, kick: true }, {});
  assert.equal(s.reddit.state, "soon");
  assert.equal(s.mewe.state, "awaiting");
  assert.equal(s.tiktok_business.state, "awaiting");
  assert.equal(s.kick.state, "ready");
});

test("Lemmy and Whop known errors classify like Postiz", () => {
  assert.equal(classifyPublishError("lemmy", "Lemmy post failed: rate_limit_error").kind, "rate_limit");
  assert.equal(classifyPublishError("lemmy", "Lemmy post failed: not_logged_in").kind, "refresh_token");
  assert.equal(classifyPublishError("lemmy", "Lemmy post failed: couldnt_find_community").kind, "bad_body");
  assert.equal(classifyPublishError("whop", "Whop post failed: insufficient_scope").kind, "reconnect");
  assert.equal(classifyPublishError("reddit", "Reddit refused the post to r/x: SUBREDDIT_NOEXIST: that subreddit doesn't exist").kind, "bad_body");
});

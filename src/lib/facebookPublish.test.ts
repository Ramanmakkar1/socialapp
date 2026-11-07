import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FB_PUBLISH_SCOPE,
  canPublishToFacebook,
  planFacebookPost,
  publishToFacebookPage,
} from "./facebookPublish.ts";

const TOKEN = "EAAG-test-page-token";
const FB = "https://graph.facebook.com/v23.0";

type Call = { url: string; body: URLSearchParams };

function makeFetch(results: Array<Response | Error>) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    const body =
      init?.body instanceof URLSearchParams ? init.body : new URLSearchParams(String(init?.body ?? ""));
    calls.push({ url: String(url), body });
    const next = results[calls.length - 1];
    if (next instanceof Error) throw next;
    return next as Response;
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

test("canPublishToFacebook: only facebook_login with pages_manage_posts", () => {
  assert.equal(canPublishToFacebook([FB_PUBLISH_SCOPE], "facebook_login"), true);
  assert.equal(canPublishToFacebook(["pages_show_list"], "facebook_login"), false);
  assert.equal(canPublishToFacebook([FB_PUBLISH_SCOPE], "instagram_login"), false);
  assert.equal(canPublishToFacebook(null, "facebook_login"), false);
  assert.equal(canPublishToFacebook(undefined, undefined), false);
});

test("planFacebookPost: text and empty caption", () => {
  assert.deepEqual(planFacebookPost("hello", []), { kind: "text", images: [], video: null });
  assert.deepEqual(planFacebookPost("  ", null), { error: "Write a caption or add media." });
});

test("planFacebookPost: one image is a photo, 3 images an album", () => {
  assert.deepEqual(
    planFacebookPost("hi", [{ type: "image", url: "a.jpg" }]),
    { kind: "photo", images: ["a.jpg"], video: null }
  );
  assert.deepEqual(
    planFacebookPost("hi", [
      { type: "image", url: "a.jpg" },
      { type: "image", url: "b.jpg" },
      { type: "image", url: "c.jpg" },
    ]),
    { kind: "album", images: ["a.jpg", "b.jpg", "c.jpg"], video: null }
  );
});

test("planFacebookPost: 11 images is an error", () => {
  assert.deepEqual(
    planFacebookPost("hi", Array.from({ length: 11 }, (_, i) => ({ type: "image", url: `p${i}.jpg` }))),
    { error: "Facebook allows up to 10 photos per post." }
  );
});

test("planFacebookPost: images and a video mixed is an error", () => {
  assert.deepEqual(
    planFacebookPost("hi", [
      { type: "image", url: "a.jpg" },
      { type: "video", url: "v.mp4" },
    ]),
    { error: "Facebook posts can have photos or one video, not both." }
  );
});

test("planFacebookPost: junk items are ignored, only the first video counts", () => {
  assert.deepEqual(
    planFacebookPost("hi", ["junk", null, 42, { type: "image" }, { type: "image", url: "a.jpg" }]),
    { kind: "photo", images: ["a.jpg"], video: null }
  );
  assert.deepEqual(
    planFacebookPost("hi", [
      { type: "video", url: "v.mp4" },
      { type: "video", url: "v2.mp4" },
    ]),
    { kind: "video", images: [], video: "v.mp4" }
  );
});

test("publishToFacebookPage: text post hits /feed with the caption", async () => {
  const { calls, fetchImpl } = makeFetch([json({ post: "111_222" })]);
  const out = await publishToFacebookPage("111", TOKEN, "hello world", [], fetchImpl);
  assert.deepEqual(out, { ok: true, postId: "111_222" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${FB}/111/feed`);
  assert.equal(calls[0].body.get("message"), "hello world");
  assert.equal(calls[0].body.get("access_token"), TOKEN);
});

test("publishToFacebookPage: photo hits /photos and returns post_id", async () => {
  const { calls, fetchImpl } = makeFetch([json({ post_id: "333_444", id: "555" })]);
  const out = await publishToFacebookPage(
    "111",
    TOKEN,
    "pic",
    [{ type: "image", url: "https://cdn.example/a.jpg" }],
    fetchImpl
  );
  assert.deepEqual(out, { ok: true, postId: "333_444" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${FB}/111/photos`);
  assert.equal(calls[0].body.get("url"), "https://cdn.example/a.jpg");
  assert.equal(calls[0].body.get("caption"), "pic");
  assert.equal(calls[0].body.get("published"), "true");
});

test("publishToFacebookPage: album uploads unpublished photos, then one /feed with attached_media", async () => {
  const { calls, fetchImpl } = makeFetch([json({ id: "p1" }), json({ id: "p2" }), json({ post: "111_999" })]);
  const out = await publishToFacebookPage(
    "111",
    TOKEN,
    "album",
    [{ type: "image", url: "a.jpg" }, { type: "image", url: "b.jpg" }],
    fetchImpl
  );
  assert.deepEqual(out, { ok: true, postId: "111_999" });
  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, `${FB}/111/photos`);
  assert.equal(calls[0].body.get("url"), "a.jpg");
  assert.equal(calls[0].body.get("published"), "false");
  assert.equal(calls[1].body.get("url"), "b.jpg");
  assert.equal(calls[2].url, `${FB}/111/feed`);
  assert.equal(calls[2].body.get("message"), "album");
  assert.equal(calls[2].body.get("attached_media[0]"), JSON.stringify({ media_fbid: "p1" }));
  assert.equal(calls[2].body.get("attached_media[1]"), JSON.stringify({ media_fbid: "p2" }));
});

test("publishToFacebookPage: video hits /videos with file_url", async () => {
  const { calls, fetchImpl } = makeFetch([json({ id: "vid-1" })]);
  const out = await publishToFacebookPage(
    "111",
    TOKEN,
    "clip",
    [{ type: "video", url: "https://cdn.example/v.mp4" }],
    fetchImpl
  );
  assert.deepEqual(out, { ok: true, postId: "vid-1" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${FB}/111/videos`);
  assert.equal(calls[0].body.get("file_url"), "https://cdn.example/v.mp4");
  assert.equal(calls[0].body.get("description"), "clip");
});

test("publishToFacebookPage: Graph error 190 is a dead token and the token is stripped", async () => {
  const { fetchImpl } = makeFetch([
    json({ error: { message: `Invalid OAuth access token ${TOKEN}`, code: 190 } }, 400),
  ]);
  const out = await publishToFacebookPage("111", TOKEN, "hello", [], fetchImpl);
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.tokenDead, true);
    assert.ok(!out.error.includes(TOKEN));
    assert.ok(out.error.includes("[token]"));
  }
});

test("publishToFacebookPage: HTTP 401 is a dead token, other errors are not", async () => {
  const { fetchImpl: f401 } = makeFetch([json({ error: { message: "bad token" } }, 401)]);
  const out401 = await publishToFacebookPage("111", TOKEN, "hello", [], f401);
  assert.equal(out401.ok, false);
  if (!out401.ok) assert.equal(out401.tokenDead, true);

  const { fetchImpl: f4 } = makeFetch([json({ error: { message: "Rate limit exceeded", code: 4 } }, 400)]);
  const out4 = await publishToFacebookPage("111", TOKEN, "hello", [], f4);
  assert.equal(out4.ok, false);
  if (!out4.ok) assert.equal(out4.tokenDead, false);
});

test("publishToFacebookPage: network failure -> ok:false, not tokenDead", async () => {
  const { fetchImpl } = makeFetch([new Error("ECONNRESET")]);
  const out = await publishToFacebookPage("111", TOKEN, "hello", [], fetchImpl);
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.tokenDead, false);
    assert.ok(out.error.startsWith("Could not reach Facebook:"));
  }
});

test("publishToFacebookPage: plan error returns without calling fetch", async () => {
  const { calls, fetchImpl } = makeFetch([]);
  const out = await publishToFacebookPage("111", TOKEN, "  ", [], fetchImpl);
  assert.deepEqual(out, { ok: false, error: "Write a caption or add media.", tokenDead: false });
  assert.equal(calls.length, 0);
});

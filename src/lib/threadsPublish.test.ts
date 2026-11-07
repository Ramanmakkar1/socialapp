import assert from "node:assert/strict";
import { test } from "node:test";
import {
  THREADS_GRAPH,
  buildThreadsContainerParams,
  publishToThreads,
} from "./threadsPublish.ts";

const TOKEN = "EAAH-test-threads-token";
const USER = "17841400000000001";

type Call = { url: string; body: URLSearchParams | null };

function makeFetch(results: Array<Response | Error>) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    const body =
      init?.body instanceof URLSearchParams
        ? init.body
        : init?.body
          ? new URLSearchParams(String(init.body))
          : null;
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

const noSleep = async () => {};

test("buildThreadsContainerParams: text, image and video params", () => {
  const text = buildThreadsContainerParams({ text: "  hello threads  " });
  assert.equal(text.get("media_type"), "TEXT");
  assert.equal(text.get("text"), "hello threads");
  assert.equal(text.get("image_url"), null);
  assert.equal(text.get("video_url"), null);

  const image = buildThreadsContainerParams({ text: "pic", imageUrl: "https://cdn.example/a.jpg" });
  assert.equal(image.get("media_type"), "IMAGE");
  assert.equal(image.get("image_url"), "https://cdn.example/a.jpg");

  const video = buildThreadsContainerParams({ text: "clip", videoUrl: "https://cdn.example/v.mp4" });
  assert.equal(video.get("media_type"), "VIDEO");
  assert.equal(video.get("video_url"), "https://cdn.example/v.mp4");
});

test("buildThreadsContainerParams: text over 500 characters throws", () => {
  assert.throws(() => buildThreadsContainerParams({ text: "x".repeat(501) }), /over the 500 limit/);
});

test("buildThreadsContainerParams: image and video together throw", () => {
  assert.throws(
    () => buildThreadsContainerParams({ text: "hi", imageUrl: "a.jpg", videoUrl: "v.mp4" }),
    /not both/
  );
});

test("publishToThreads: text post creates a container, waits, then publishes", async () => {
  const { calls, fetchImpl } = makeFetch([json({ id: "creation-1" }), json({ id: "thread-123" })]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "  hello threads  ",
    fetchImpl,
    sleep: noSleep,
  });
  assert.deepEqual(out, { ok: true, id: "thread-123" });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, `${THREADS_GRAPH}/${USER}/threads`);
  assert.equal(calls[0].body?.get("media_type"), "TEXT");
  assert.equal(calls[0].body?.get("text"), "hello threads");
  assert.equal(calls[0].body?.get("access_token"), TOKEN);
  assert.equal(calls[1].url, `${THREADS_GRAPH}/${USER}/threads_publish`);
  assert.equal(calls[1].body?.get("creation_id"), "creation-1");
  assert.equal(calls[1].body?.get("access_token"), TOKEN);
});

test("publishToThreads: image post sends media_type IMAGE with image_url", async () => {
  const { calls, fetchImpl } = makeFetch([json({ id: "creation-2" }), json({ id: "thread-456" })]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "pic",
    imageUrl: "https://cdn.example/a.jpg",
    fetchImpl,
    sleep: noSleep,
  });
  assert.deepEqual(out, { ok: true, id: "thread-456" });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].body?.get("media_type"), "IMAGE");
  assert.equal(calls[0].body?.get("image_url"), "https://cdn.example/a.jpg");
});

test("publishToThreads: video polls until FINISHED, then publishes", async () => {
  const { calls, fetchImpl } = makeFetch([
    json({ id: "creation-3" }),
    json({ status: "IN_PROGRESS" }),
    json({ status: "IN_PROGRESS" }),
    json({ status: "FINISHED" }),
    json({ id: "thread-789" }),
  ]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "clip",
    videoUrl: "https://cdn.example/v.mp4",
    fetchImpl,
    sleep: noSleep,
  });
  assert.deepEqual(out, { ok: true, id: "thread-789" });
  assert.equal(calls.length, 5);
  assert.equal(calls[0].body?.get("media_type"), "VIDEO");
  assert.equal(calls[0].body?.get("video_url"), "https://cdn.example/v.mp4");
  assert.equal(
    calls[1].url,
    `${THREADS_GRAPH}/creation-3?fields=status,error_message&access_token=${encodeURIComponent(TOKEN)}`
  );
});

test("publishToThreads: video status ERROR fails and is not retryable", async () => {
  const { fetchImpl } = makeFetch([
    json({ id: "creation-4" }),
    json({ status: "ERROR", error_message: "bad codec" }),
  ]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "clip",
    videoUrl: "https://cdn.example/v.mp4",
    fetchImpl,
    sleep: noSleep,
  });
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.retryable, false);
    assert.match(out.error, /ERROR/);
  }
});

test("publishToThreads: video still processing after all poll attempts is retryable", async () => {
  const { calls, fetchImpl } = makeFetch([
    json({ id: "creation-5" }),
    json({ status: "IN_PROGRESS" }),
    json({ status: "IN_PROGRESS" }),
  ]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "clip",
    videoUrl: "https://cdn.example/v.mp4",
    fetchImpl,
    sleep: noSleep,
    pollAttempts: 2,
  });
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.retryable, true);
    assert.match(out.error, /still processing/);
  }
  assert.equal(calls.length, 3);
});

test("publishToThreads: HTTP 429 is retryable", async () => {
  const { fetchImpl } = makeFetch([json({ error: { message: "Rate limit exceeded", code: 4 } }, 429)]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "hi",
    fetchImpl,
    sleep: noSleep,
  });
  assert.equal(out.ok, false);
  if (!out.ok) assert.equal(out.retryable, true);
});

test("publishToThreads: HTTP 5xx is retryable", async () => {
  const { fetchImpl } = makeFetch([json({ error: { message: "internal error" } }, 502)]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "hi",
    fetchImpl,
    sleep: noSleep,
  });
  assert.equal(out.ok, false);
  if (!out.ok) assert.equal(out.retryable, true);
});

test("publishToThreads: Graph code 190 is a dead token with the reconnect message", async () => {
  const { fetchImpl } = makeFetch([
    json({ error: { message: `Invalid OAuth access token ${TOKEN}`, code: 190 } }, 400),
  ]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "hi",
    fetchImpl,
    sleep: noSleep,
  });
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.retryable, false);
    assert.equal(out.error, "Threads connection expired, reconnect Threads in Settings");
    assert.ok(!out.error.includes(TOKEN));
  }
});

test("publishToThreads: Graph code 10/200 is a permission problem, not retryable", async () => {
  const { fetchImpl: f10 } = makeFetch([json({ error: { message: "requires permission", code: 10 } }, 400)]);
  const out10 = await publishToThreads({ threadsUserId: USER, accessToken: TOKEN, text: "hi", fetchImpl: f10, sleep: noSleep });
  assert.equal(out10.ok, false);
  if (!out10.ok) {
    assert.equal(out10.retryable, false);
    assert.match(out10.error, /permission/);
  }
  const { fetchImpl: f200 } = makeFetch([json({ error: { message: "requires permission", code: 200 } }, 400)]);
  const out200 = await publishToThreads({ threadsUserId: USER, accessToken: TOKEN, text: "hi", fetchImpl: f200, sleep: noSleep });
  assert.equal(out200.ok, false);
  if (!out200.ok) assert.equal(out200.retryable, false);
});

test("publishToThreads: network failure is retryable", async () => {
  const { fetchImpl } = makeFetch([new Error("ECONNRESET")]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "hi",
    fetchImpl,
    sleep: noSleep,
  });
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.retryable, true);
    assert.ok(out.error.startsWith("Could not reach Threads:"));
  }
});

test("publishToThreads: the token never appears in any error string", async () => {
  const { fetchImpl } = makeFetch([new Error(`socket reset with token ${TOKEN} in the wind`)]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "hi",
    fetchImpl,
    sleep: noSleep,
  });
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.ok(!out.error.includes(TOKEN));
    assert.ok(out.error.includes("[token]"));
  }
});

test("publishToThreads: text over 500 characters fails without calling fetch", async () => {
  const { calls, fetchImpl } = makeFetch([]);
  const out = await publishToThreads({
    threadsUserId: USER,
    accessToken: TOKEN,
    text: "x".repeat(501),
    fetchImpl,
    sleep: noSleep,
  });
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.retryable, false);
    assert.match(out.error, /over the 500 limit/);
  }
  assert.equal(calls.length, 0);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { encryptToken } from "./crypto.ts";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";
import { parseYtMetadata } from "./publisher.ts";

process.env.TOKEN_ENCRYPTION_KEY ||= Buffer.alloc(32, 3).toString("base64");

type Post = { id: string; user_id: string; status: string; scheduled_at: number; updated_at: number; media: unknown };
type Target = {
  id: string;
  post_id: string;
  platform: string;
  status: string;
  error: string | null;
  yt_metadata?: unknown;
  external_post_id?: string | null;
  caption_override?: string | null;
};
type Channel = { id: string; user_id: string; channel_id: string; refresh_token_enc: string; status: string };

const MIN = 60_000;
const VIDEO_URL = "https://cdn.example.com/video.mp4";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SESSION_BASE = "https://www.googleapis.com/upload/youtube/v3/videos";

// In-memory emulation of the publisher's SQL for the YouTube track.
function ytDb(posts: Post[], targets: Target[], channels: Channel[] = []) {
  const postOf = (id: string) => posts.find((p) => p.id === id)!;
  const refresh = (postId: string) => {
    const p = postOf(postId);
    if (!p) return;
    const ts = targets.filter((t) => t.post_id === postId);
    if (ts.some((t) => t.status === "failed")) p.status = "failed";
    else if (!ts.some((t) => t.status === "pending" || t.status === "publishing")) p.status = "published";
    else if (!ts.some((t) => t.status === "publishing")) p.status = "scheduled";
    p.updated_at = Date.now();
  };
  const handlers: FakeHandler[] = [
    { match: /update socialapp\.post_targets t set status='failed'.*t\.status='publishing'/, reply: () => [] },
    { match: /update socialapp\.scheduled_posts p set status = case/, reply: (params) => { refresh(String(params[0])); return []; } },
    {
      match: /select p\.id from socialapp\.scheduled_posts p .*for update of p skip locked/,
      reply: (params) =>
        posts
          .filter(
            (p) =>
              p.status === "scheduled" &&
              p.scheduled_at <= Date.now() &&
              targets.some((t) => t.post_id === p.id && t.platform === String(params[1]) && t.status === "pending"),
          )
          .map((p) => ({ id: p.id })),
    },
    {
      match: /update socialapp\.scheduled_posts set status='publishing'/,
      reply: (params) => {
        for (const id of params[0] as string[]) {
          const p = postOf(id);
          if (p.status === "scheduled") { p.status = "publishing"; p.updated_at = Date.now(); }
        }
        return [];
      },
    },
    {
      match: /update socialapp\.post_targets t set status='publishing'/,
      reply: (params) => {
        const ids = params[0] as string[];
        const platform = String(params[1]);
        return targets
          .filter((t) => ids.includes(t.post_id) && t.platform === platform && t.status === "pending")
          .map((t) => {
            t.status = "publishing";
            const p = postOf(t.post_id);
            return {
              id: t.id,
              post_id: t.post_id,
              caption_override: t.caption_override ?? null,
              caption: "hi",
              media: p.media,
              user_id: p.user_id,
              ig_format: "feed",
              first_comment: null,
              yt_metadata: t.yt_metadata ?? null,
            };
          });
      },
    },
    {
      match: /update socialapp\.youtube_channels set status='disconnected'/,
      reply: (params) => {
        const c = channels.find((x) => x.id === String(params[0]));
        if (c) c.status = "disconnected";
        return [];
      },
    },
    {
      match: /from socialapp\.youtube_channels/,
      reply: (params) => channels.filter((c) => c.user_id === String(params[0]) && c.status === "active"),
    },
    {
      match: /update socialapp\.post_targets set status='failed', error=\$2/,
      reply: (params) => {
        const t = targets.find((x) => x.id === params[0]);
        if (t) { t.status = "failed"; t.error = String(params[1]); t.external_post_id = null; }
        return [];
      },
    },
    {
      match: /update socialapp\.post_targets set status='published', external_post_id=\$2/,
      reply: (params) => {
        const t = targets.find((x) => x.id === params[0]);
        if (t) { t.status = "published"; t.external_post_id = String(params[1]); t.error = null; }
        return [];
      },
    },
  ];
  return handlers;
}

type FetchConfig = {
  token?: { status: number; body?: Record<string, unknown> };
  video?: { status: number; bytes?: Uint8Array };
  // One entry per resumable-session start (in call order).
  sessionStart?: Array<{ status: number; location?: string; body?: string }>;
  // One entry per session PUT (in call order).
  sessionPut?: Array<{ status: number; body?: string }>;
};

function makeYouTubeFetch(cfg: FetchConfig) {
  let startCalls = 0;
  let putCalls = 0;
  const putUrls: string[] = [];
  const startBodies: string[] = [];
  const fetchMock = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === TOKEN_URL) {
      const t = cfg.token ?? { status: 200, body: { access_token: "yt-access" } };
      return new Response(JSON.stringify(t.body ?? {}), { status: t.status });
    }
    if (url === VIDEO_URL) {
      const v = cfg.video ?? { status: 200, bytes: new Uint8Array([1, 2, 3]) };
      return new Response(new Uint8Array(v.bytes ?? new Uint8Array()), { status: v.status });
    }
    if (url.startsWith(SESSION_BASE + "?")) {
      const list = cfg.sessionStart ?? [{ status: 200, location: `${SESSION_BASE}/session${startCalls + 1}` }];
      const s = list[Math.min(startCalls, list.length - 1)];
      startCalls += 1;
      if (init?.body) startBodies.push(String(init.body));
      return new Response(s.body ?? "", { status: s.status, headers: s.location ? { location: s.location } : {} });
    }
    // A session PUT goes to the Location header value (SESSION_BASE/sessionN).
    putUrls.push(url);
    const list = cfg.sessionPut ?? [{ status: 200, body: JSON.stringify({ id: "video123" }) }];
    const p = list[Math.min(putCalls, list.length - 1)];
    putCalls += 1;
    return new Response(p.body ?? "", { status: p.status });
  }) as typeof fetch;
  return {
    fetch: fetchMock,
    getPutUrls: () => putUrls,
    getStartBodies: () => startBodies,
    getStartCalls: () => startCalls,
  };
}

function ytFixture(overrides: { media?: unknown; yt_metadata?: unknown } = {}) {
  const posts: Post[] = [
    {
      id: "yt-due",
      user_id: "u1",
      status: "scheduled",
      scheduled_at: Date.now() - MIN,
      updated_at: Date.now() - 10 * MIN,
      media: overrides.media ?? [{ type: "video", url: VIDEO_URL }],
    },
  ];
  const targets: Target[] = [
    {
      id: "t-yt",
      post_id: "yt-due",
      platform: "youtube",
      status: "pending",
      error: null,
      yt_metadata: overrides.yt_metadata ?? { title: "My Video", tags: ["a", "b"], privacy: "public", shorts: false },
    },
  ];
  const channels: Channel[] = [
    { id: "ch1", user_id: "u1", channel_id: "UC1", refresh_token_enc: encryptToken("yt-refresh"), status: "active" },
  ];
  return { posts, targets, channels };
}

test("youtube: a due target with a connected channel uploads and records the watch URL", async () => {
  const { posts, targets, channels } = ytFixture();
  const { pool } = createFakePool(ytDb(posts, targets, channels));
  const restore = installFakePool(pool);
  const yt = makeYouTubeFetch({});
  const realFetch = globalThis.fetch;
  globalThis.fetch = yt.fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.published, 1);
    assert.equal(result.failed, 0);
    assert.equal(targets[0].status, "published");
    assert.equal(targets[0].external_post_id, "https://www.youtube.com/watch?v=video123");
    assert.equal(posts[0].status, "published");
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

test("youtube: an expired session is discarded and a fresh session is created (never reused)", async () => {
  const { posts, targets, channels } = ytFixture();
  const { pool } = createFakePool(ytDb(posts, targets, channels));
  const restore = installFakePool(pool);
  // First session (session1) is rejected with 410; the retry must start session2 and use it.
  const yt = makeYouTubeFetch({
    sessionStart: [
      { status: 200, location: `${SESSION_BASE}/session1` },
      { status: 200, location: `${SESSION_BASE}/session2` },
    ],
    sessionPut: [
      { status: 410, body: JSON.stringify({ error: { message: "Session expired" } }) },
      { status: 200, body: JSON.stringify({ id: "video456" }) },
    ],
  });
  const realFetch = globalThis.fetch;
  globalThis.fetch = yt.fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.published, 1);
    assert.equal(targets[0].status, "published");
    assert.equal(targets[0].external_post_id, "https://www.youtube.com/watch?v=video456");
    assert.equal(posts[0].status, "published");
    // Two distinct sessions were created; the dead session1 was not reused for the second PUT.
    assert.equal(yt.getStartCalls(), 2);
    assert.deepEqual(yt.getPutUrls(), [`${SESSION_BASE}/session1`, `${SESSION_BASE}/session2`]);
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

test("youtube: a due target with no connected channel fails cleanly with a clear message", async () => {
  const { posts, targets } = ytFixture();
  const { pool } = createFakePool(ytDb(posts, targets, []));
  const restore = installFakePool(pool);
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.failed, 1);
    assert.equal(result.published, 0);
    assert.equal(targets[0].status, "failed");
    assert.match(targets[0].error ?? "", /No YouTube channel connected/);
    assert.equal(posts[0].status, "failed");
  } finally {
    restore();
  }
});

test("youtube: a dead refresh token marks the channel disconnected and fails the target", async () => {
  const { posts, targets, channels } = ytFixture();
  const { pool } = createFakePool(ytDb(posts, targets, channels));
  const restore = installFakePool(pool);
  const yt = makeYouTubeFetch({ token: { status: 401, body: { error: "invalid_grant" } } });
  const realFetch = globalThis.fetch;
  globalThis.fetch = yt.fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.failed, 1);
    assert.equal(channels[0].status, "disconnected");
    assert.equal(targets[0].status, "failed");
    assert.match(targets[0].error ?? "", /YouTube access expired/);
    assert.equal(posts[0].status, "failed");
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

test("youtube: a 403 quotaExceeded keeps the channel connected (post stays queued)", async () => {
  const { posts, targets, channels } = ytFixture();
  const { pool } = createFakePool(ytDb(posts, targets, channels));
  const restore = installFakePool(pool);
  const yt = makeYouTubeFetch({
    sessionStart: [
      {
        status: 403,
        body: JSON.stringify({
          error: { code: 403, message: "Quota exceeded for quota metric 'Uploads'.", errors: [{ reason: "quotaExceeded" }] },
        }),
      },
    ],
  });
  const realFetch = globalThis.fetch;
  globalThis.fetch = yt.fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.failed, 1);
    assert.equal(channels[0].status, "active");
    assert.equal(targets[0].status, "failed");
    assert.match(targets[0].error ?? "", /Quota exceeded/);
    assert.doesNotMatch(targets[0].error ?? "", /Reconnect YouTube/);
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

test("youtube: a 403 with an auth reason disconnects the channel", async () => {
  const { posts, targets, channels } = ytFixture();
  const { pool } = createFakePool(ytDb(posts, targets, channels));
  const restore = installFakePool(pool);
  const yt = makeYouTubeFetch({
    sessionStart: [
      {
        status: 403,
        body: JSON.stringify({
          error: { code: 403, message: "Insufficient permissions for the requested scope.", errors: [{ reason: "insufficientPermissions" }] },
        }),
      },
    ],
  });
  const realFetch = globalThis.fetch;
  globalThis.fetch = yt.fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.failed, 1);
    assert.equal(channels[0].status, "disconnected");
    assert.equal(targets[0].status, "failed");
    assert.match(targets[0].error ?? "", /Reconnect YouTube/);
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

test("youtube: a due target without a video link fails with a clear message", async () => {
  const { posts, targets, channels } = ytFixture({ media: [{ type: "image", url: "https://cdn.example.com/a.jpg" }] });
  const { pool } = createFakePool(ytDb(posts, targets, channels));
  const restore = installFakePool(pool);
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.failed, 1);
    assert.equal(result.published, 0);
    assert.equal(targets[0].status, "failed");
    assert.match(targets[0].error ?? "", /video link/);
    assert.equal(posts[0].status, "failed");
  } finally {
    restore();
  }
});

test("youtube: the Shorts hint appends #Short to the description sent to YouTube", async () => {
  const { posts, targets, channels } = ytFixture({
    yt_metadata: { title: "Short", tags: [], privacy: "public", shorts: true },
  });
  const { pool } = createFakePool(ytDb(posts, targets, channels));
  const restore = installFakePool(pool);
  const yt = makeYouTubeFetch({});
  const realFetch = globalThis.fetch;
  globalThis.fetch = yt.fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    await publishDuePosts();
    const body = yt.getStartBodies()[0];
    assert.ok(body, "a session-start body was sent");
    assert.match(body, /#Short/);
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

test("parseYtMetadata: parses a JSON string, an object, and falls back to defaults", () => {
  assert.deepEqual(parseYtMetadata(null), { title: "", description: "", tags: [], privacy: "public", shorts: false });
  assert.deepEqual(parseYtMetadata("not-json"), { title: "", description: "", tags: [], privacy: "public", shorts: false });
  assert.deepEqual(
    parseYtMetadata({ title: "T", tags: ["x", "y"], privacy: "unlisted", shorts: true }),
    { title: "T", description: "", tags: ["x", "y"], privacy: "unlisted", shorts: true },
  );
  const fromString = parseYtMetadata(JSON.stringify({ title: "S", privacy: "private" }));
  assert.equal(fromString.title, "S");
  assert.equal(fromString.privacy, "private");
  // Title is capped at 100 chars.
  assert.equal(parseYtMetadata({ title: "x".repeat(150) }).title.length, 100);
});

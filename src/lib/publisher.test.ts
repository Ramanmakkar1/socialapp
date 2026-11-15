import assert from "node:assert/strict";
import { test } from "node:test";
import { encryptToken } from "./crypto.ts";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";

type Post = { id: string; user_id: string; status: string; scheduled_at: number; updated_at: number };
type Target = { id: string; post_id: string; platform: string; status: string; error: string | null };
type Account = { id: string; external_id: string; access_token_enc: string; status: string };

const MIN = 60_000;

// In-memory emulation of the publisher's SQL (claim, recovery, status refresh).
function publisherDb(posts: Post[], targets: Target[], accounts: Account[] = []) {
  const postOf = (id: string) => posts.find((p) => p.id === id)!;
  const refresh = (postId: string) => {
    const p = postOf(postId);
    if (!p) return;
    const ts = targets.filter((t) => t.post_id === postId);
    if (ts.some((t) => t.status === "publishing")) return void (p.updated_at = Date.now());
    if (ts.some((t) => t.status === "pending")) p.status = "scheduled";
    else if (ts.some((t) => t.status === "failed")) p.status = "failed";
    else if (ts.some((t) => t.status === "reminded")) p.status = "publishing";
    else p.status = "published";
    p.updated_at = Date.now();
  };
  const handlers: FakeHandler[] = [
    {
      // stuck-claim recovery
      match: /update socialapp\.post_targets t set status='failed'.*t\.status='publishing'/,
      reply: (params) => {
        const staleMs = Number(params[1]);
        const out: { post_id: string }[] = [];
        for (const t of targets) {
          const p = postOf(t.post_id);
          if (t.status !== "publishing") continue;
          const stale =
            (p.status === "publishing" && p.updated_at < Date.now() - staleMs) ||
            (p.status === "scheduled" && p.scheduled_at < Date.now() - staleMs);
          if (stale) {
            t.status = "failed";
            t.error = String(params[0]);
            out.push({ post_id: t.post_id });
          }
        }
        return out;
      },
    },
    { match: /update socialapp\.scheduled_posts p set status = case/, reply: (params) => { refresh(String(params[0])); return []; } },
    {
      match: /select p\.id from socialapp\.scheduled_posts p .*for update of p skip locked/,
      reply: (params) =>
        posts
          .filter((p) => p.status === "scheduled" && p.scheduled_at <= Date.now() &&
            targets.some((t) => t.post_id === p.id && t.platform === String(params[1]) && t.status === "pending"))
          .slice(0, Number(params[0]))
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
            return { id: t.id, post_id: t.post_id, caption_override: null, caption: "hi", media: [], user_id: p.user_id, ig_format: "feed", first_comment: null };
          });
      },
    },
    {
      match: /update socialapp\.social_accounts set status='expired'/,
      reply: (params) => {
        const a = accounts.find((x) => x.id === String(params[0]));
        if (a) a.status = "expired";
        return [];
      },
    },
    {
      match: /from socialapp\.social_accounts/,
      reply: (_params, sql) => (sql.includes("platform='threads'") ? accounts : []),
    },
    {
      match: /update socialapp\.post_targets set status='failed', error=\$2/,
      reply: (params) => {
        const t = targets.find((x) => x.id === params[0]);
        if (t) { t.status = "failed"; t.error = String(params[1]); }
        return [];
      },
    },
    {
      match: /update socialapp\.post_targets set status='published'/,
      reply: (params) => {
        const t = targets.find((x) => x.id === params[0]);
        if (t) { t.status = "published"; t.error = null; }
        return [];
      },
    },
  ];
  return handlers;
}

test("publisher: a claim left in 'publishing' by an interrupted run is recovered as failed with a clear reason", async () => {
  const posts: Post[] = [
    { id: "stuck", user_id: "u1", status: "publishing", scheduled_at: Date.now() - 60 * MIN, updated_at: Date.now() - 45 * MIN },
    { id: "legacy", user_id: "u1", status: "scheduled", scheduled_at: Date.now() - 90 * MIN, updated_at: Date.now() - 90 * MIN },
    { id: "inflight", user_id: "u1", status: "publishing", scheduled_at: Date.now() - 3 * MIN, updated_at: Date.now() - 2 * MIN },
  ];
  const targets: Target[] = [
    { id: "t-stuck", post_id: "stuck", platform: "instagram", status: "publishing", error: null },
    { id: "t-legacy", post_id: "legacy", platform: "instagram", status: "publishing", error: null },
    { id: "t-inflight", post_id: "inflight", platform: "instagram", status: "publishing", error: null },
  ];
  const { pool } = createFakePool(publisherDb(posts, targets));
  const restore = installFakePool(pool);
  const previousError = console.error;
  console.error = () => {};
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.recovered, 2);
    assert.equal(targets[0].status, "failed");
    assert.match(targets[0].error ?? "", /interrupted/i);
    assert.match(targets[0].error ?? "", /Retry/);
    assert.equal(posts[0].status, "failed");
    assert.equal(targets[1].status, "failed");
    assert.equal(posts[1].status, "failed");
    // A run that is still inside the time limit is left alone.
    assert.equal(targets[2].status, "publishing");
    assert.equal(posts[2].status, "publishing");
  } finally {
    console.error = previousError;
    restore();
  }
});

test("publisher: claiming a due post marks the post itself 'publishing' before any Instagram call", async () => {
  const posts: Post[] = [
    { id: "due", user_id: "u1", status: "scheduled", scheduled_at: Date.now() - MIN, updated_at: Date.now() - 10 * MIN },
  ];
  const targets: Target[] = [{ id: "t-due", post_id: "due", platform: "instagram", status: "pending", error: null }];
  const { pool, calls } = createFakePool(publisherDb(posts, targets));
  const restore = installFakePool(pool);
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    await publishDuePosts();
    const claimPost = calls.findIndex((c) => /update socialapp\.scheduled_posts set status='publishing'/.test(c.sql));
    const claimTarget = calls.findIndex((c) => /update socialapp\.post_targets t set status='publishing'/.test(c.sql));
    assert.ok(claimPost >= 0, "post row is claimed");
    assert.ok(claimPost < claimTarget, "post is claimed together with (before) its targets");
    assert.equal(calls[claimPost].client, calls[claimTarget].client, "claim runs in one transaction");
    // No connected account in this fixture, so it fails cleanly instead of staying stuck.
    assert.equal(targets[0].status, "failed");
    assert.equal(posts[0].status, "failed");
  } finally {
    restore();
  }
});

test("publisher: a due Facebook target with no facebook_login account fails cleanly, no throw", async () => {
  const posts: Post[] = [
    { id: "fb-due", user_id: "u1", status: "scheduled", scheduled_at: Date.now() - MIN, updated_at: Date.now() - 10 * MIN },
  ];
  const targets: Target[] = [{ id: "t-fb", post_id: "fb-due", platform: "facebook", status: "pending", error: null }];
  const { pool } = createFakePool(publisherDb(posts, targets));
  const restore = installFakePool(pool);
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.failed, 1);
    assert.equal(result.published, 0);
    assert.equal(targets[0].status, "failed");
    assert.match(targets[0].error ?? "", /No Facebook Page connected/);
    assert.equal(posts[0].status, "failed");
  } finally {
    restore();
  }
});

test("publisher: a due Threads target with an active account is published", async () => {
  const posts: Post[] = [
    { id: "th-due", user_id: "u1", status: "scheduled", scheduled_at: Date.now() - MIN, updated_at: Date.now() - 10 * MIN },
  ];
  const targets: Target[] = [{ id: "t-th", post_id: "th-due", platform: "threads", status: "pending", error: null }];
  const accounts: Account[] = [];
  const { pool } = createFakePool(publisherDb(posts, targets, accounts));
  const restore = installFakePool(pool);
  accounts.push({ id: "acc-th", external_id: "12345", access_token_enc: encryptToken("th-token"), status: "active" });
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    if (String(url).endsWith("/threads")) return new Response(JSON.stringify({ id: "container-1" }));
    return new Response(JSON.stringify({ id: "thread-post-1" }));
  }) as typeof fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.published, 1);
    assert.equal(result.failed, 0);
    assert.equal(targets[0].status, "published");
    assert.equal(posts[0].status, "published");
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

test("publisher: a due Threads target with no Threads account fails with a clear message", async () => {
  const posts: Post[] = [
    { id: "th-none", user_id: "u1", status: "scheduled", scheduled_at: Date.now() - MIN, updated_at: Date.now() - 10 * MIN },
  ];
  const targets: Target[] = [{ id: "t-th-none", post_id: "th-none", platform: "threads", status: "pending", error: null }];
  const { pool } = createFakePool(publisherDb(posts, targets));
  const restore = installFakePool(pool);
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.failed, 1);
    assert.equal(result.published, 0);
    assert.equal(targets[0].status, "failed");
    assert.match(targets[0].error ?? "", /No Threads account connected/);
    assert.equal(posts[0].status, "failed");
  } finally {
    restore();
  }
});

test("publisher: a dead Threads token marks the account expired and fails the target", async () => {
  const posts: Post[] = [
    { id: "th-dead", user_id: "u1", status: "scheduled", scheduled_at: Date.now() - MIN, updated_at: Date.now() - 10 * MIN },
  ];
  const targets: Target[] = [{ id: "t-th-dead", post_id: "th-dead", platform: "threads", status: "pending", error: null }];
  const accounts: Account[] = [];
  const { pool } = createFakePool(publisherDb(posts, targets, accounts));
  const restore = installFakePool(pool);
  accounts.push({ id: "acc-dead", external_id: "999", access_token_enc: encryptToken("dead-token"), status: "active" });
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ error: { message: "Invalid OAuth access token", code: 190 } }), { status: 400 })) as typeof fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.failed, 1);
    assert.equal(accounts[0].status, "expired");
    assert.equal(targets[0].status, "failed");
    assert.match(targets[0].error ?? "", /Threads access expired or was removed/);
    assert.equal(posts[0].status, "failed");
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

test("publisher: a failed Instagram target does not strand the post's other networks", async () => {
  const posts: Post[] = [
    { id: "multi", user_id: "u1", status: "scheduled", scheduled_at: Date.now() - MIN, updated_at: Date.now() - 10 * MIN },
  ];
  const targets: Target[] = [
    { id: "t-multi-ig", post_id: "multi", platform: "instagram", status: "pending", error: null },
    { id: "t-multi-th", post_id: "multi", platform: "threads", status: "pending", error: null },
  ];
  const accounts: Account[] = [];
  const { pool, calls } = createFakePool(publisherDb(posts, targets, accounts));
  const restore = installFakePool(pool);
  // Threads only: the Instagram target has no connected account and fails first.
  accounts.push({ id: "acc-th", external_id: "12345", access_token_enc: encryptToken("th-token"), status: "active" });
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    if (String(url).endsWith("/threads")) return new Response(JSON.stringify({ id: "container-1" }));
    return new Response(JSON.stringify({ id: "thread-post-1" }));
  }) as typeof fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(targets[0].status, "failed");
    assert.equal(targets[1].status, "published", "Threads still publishes after Instagram failed");
    assert.equal(result.published, 1);
    assert.equal(result.failed, 1);
    // Once nothing is left to publish, the post shows as failed so the owner can Retry Instagram.
    assert.equal(posts[0].status, "failed");
    // The real status SQL (emulated above) must rank pending/publishing targets before failed ones.
    const statusSql = calls.find((c) => /update socialapp\.scheduled_posts p set status = case/.test(c.sql))?.sql ?? "";
    assert.ok(statusSql.indexOf("status='pending'") >= 0 && statusSql.indexOf("status='pending'") < statusSql.indexOf("status='failed'"));
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

test("publisher: due posts are claimed one at a time, so none waits claimed behind a long run", async () => {
  const posts: Post[] = [
    { id: "p1", user_id: "u1", status: "scheduled", scheduled_at: Date.now() - 2 * MIN, updated_at: Date.now() - 10 * MIN },
    { id: "p2", user_id: "u1", status: "scheduled", scheduled_at: Date.now() - MIN, updated_at: Date.now() - 10 * MIN },
  ];
  const targets: Target[] = [
    { id: "t1", post_id: "p1", platform: "threads", status: "pending", error: null },
    { id: "t2", post_id: "p2", platform: "threads", status: "pending", error: null },
  ];
  const accounts: Account[] = [];
  const { pool } = createFakePool(publisherDb(posts, targets, accounts));
  const restore = installFakePool(pool);
  accounts.push({ id: "acc-th", external_id: "12345", access_token_enc: encryptToken("th-token"), status: "active" });
  const claimedWhilePublishing: number[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    claimedWhilePublishing.push(targets.filter((t) => t.status === "publishing").length);
    if (String(url).endsWith("/threads")) return new Response(JSON.stringify({ id: "container-1" }));
    return new Response(JSON.stringify({ id: "thread-post-1" }));
  }) as typeof fetch;
  try {
    const { publishDuePosts } = await import("./publisher.ts");
    const result = await publishDuePosts();
    assert.equal(result.published, 2);
    assert.deepEqual([...new Set(claimedWhilePublishing)], [1], "only the post being published is claimed");
    assert.deepEqual(posts.map((p) => p.status), ["published", "published"]);
  } finally {
    globalThis.fetch = realFetch;
    restore();
  }
});

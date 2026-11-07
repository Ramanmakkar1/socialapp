import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";

type Post = { id: string; user_id: string; status: string; scheduled_at: number; updated_at: number };
type Target = { id: string; post_id: string; platform: string; status: string; error: string | null };

const MIN = 60_000;

// In-memory emulation of the publisher's SQL (claim, recovery, status refresh).
function publisherDb(posts: Post[], targets: Target[]) {
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
    { match: /from socialapp\.social_accounts/, reply: () => [] },
    {
      match: /update socialapp\.post_targets set status='failed', error=\$2/,
      reply: (params) => {
        const t = targets.find((x) => x.id === params[0]);
        if (t) { t.status = "failed"; t.error = String(params[1]); }
        return [];
      },
    },
    { match: /update socialapp\.post_targets t set status='failed', error='Threads/, reply: () => [] },
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

// retryFailedPost: the shared retry path (calendar Retry + admin Retry).
import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";
import { retryFailedPost } from "./postRetry.ts";

const POST = "7b494478-a7c8-4871-a22e-55af6d313158";
const USER = "3230f748-f38f-46ea-b7f0-1e11e21b1487";

function handlers(opts: { scheduledThisMonth?: number; postUpdated?: boolean; targetsUpdated?: number }): FakeHandler[] {
  return [
    { match: /select email from socialapp.users/, reply: () => [] },
    { match: /from socialapp.billing_subscriptions/, reply: () => [] },
    { match: /select count\(\*\)::int as n from socialapp.scheduled_posts/, reply: () => [{ n: opts.scheduledThisMonth ?? 0 }] },
    { match: /^update scheduled_posts/, reply: () => (opts.postUpdated === false ? [] : [{ id: POST }]) },
    { match: /^update post_targets/, reply: () => Array.from({ length: opts.targetsUpdated ?? 1 }, (_, i) => ({ id: String(i) })) },
  ];
}

test("retryFailedPost requeues the post and its failed targets in one transaction, for that owner only", async () => {
  const fake = createFakePool(handlers({}));
  const restore = installFakePool(fake.pool);
  try {
    assert.deepEqual(await retryFailedPost(POST, USER), { ok: true });
    const tx = fake.calls.filter((c) => c.client !== "pool").map((c) => c.sql.split(" ")[0]);
    assert.deepEqual(tx, ["begin", "update", "update", "commit"]);
    const upd = fake.calls.find((c) => c.sql.startsWith("update scheduled_posts"))!;
    assert.deepEqual(upd.params, [POST, USER]);
    assert.match(upd.sql, /status='failed'/);
  } finally {
    restore();
  }
});

test("retryFailedPost rolls back when the post is not this user's failed post", async () => {
  const fake = createFakePool(handlers({ postUpdated: false }));
  const restore = installFakePool(fake.pool);
  try {
    assert.deepEqual(await retryFailedPost(POST, USER), { ok: false, error: "Post not found." });
    assert.ok(fake.calls.some((c) => c.sql === "rollback"));
    assert.ok(!fake.calls.some((c) => c.sql.startsWith("update post_targets")));
  } finally {
    restore();
  }
});

test("retryFailedPost rolls back when no target was failed", async () => {
  const fake = createFakePool(handlers({ targetsUpdated: 0 }));
  const restore = installFakePool(fake.pool);
  try {
    assert.deepEqual(await retryFailedPost(POST, USER), { ok: false, error: "Could not retry post." });
    assert.ok(fake.calls.some((c) => c.sql === "rollback"));
    assert.ok(!fake.calls.some((c) => c.sql === "commit"));
  } finally {
    restore();
  }
});

test("retryFailedPost keeps the owner's monthly plan limit (Free: 10)", async () => {
  const fake = createFakePool(handlers({ scheduledThisMonth: 10 }));
  const restore = installFakePool(fake.pool);
  try {
    const res = await retryFailedPost(POST, USER);
    assert.equal(res.ok, false);
    assert.match(res.ok ? "" : res.error, /10 scheduled posts per month/);
    assert.ok(!fake.calls.some((c) => c.sql.startsWith("update")));
  } finally {
    restore();
  }
});

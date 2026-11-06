import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";

type Post = { id: string; user_id: string; status: string; scheduled_at: Date | null };
type Target = { post_id: string; status: string };

const ID = "11111111-1111-4111-8111-111111111111";

// Emulates the guarded delete / reschedule statements against an in-memory row set.
function db(posts: Post[], targets: Target[]): FakeHandler[] {
  const targetBusy = (postId: string, statuses: string[]) =>
    targets.some((t) => t.post_id === postId && statuses.includes(t.status));
  return [
    {
      match: /^delete from socialapp\.scheduled_posts p/,
      reply: (params) => {
        const i = posts.findIndex((p) => p.id === params[0] && p.user_id === params[1] &&
          ["draft", "scheduled", "failed"].includes(p.status) && !targetBusy(p.id, ["publishing", "published"]));
        if (i < 0) return [];
        const [p] = posts.splice(i, 1);
        return [{ id: p.id }];
      },
    },
    {
      match: /^select p\.status, p\.scheduled_at/,
      reply: (params) => posts
        .filter((p) => p.id === params[0] && p.user_id === params[1])
        .map((p) => ({
          status: p.status,
          scheduled_at: p.scheduled_at,
          publishing: targetBusy(p.id, ["publishing"]),
          published: targetBusy(p.id, ["published"]),
          started: targets.some((t) => t.post_id === p.id && t.status !== "pending"),
        })),
    },
    {
      match: /^update socialapp\.scheduled_posts p set scheduled_at=\$3/,
      reply: (params) => {
        const p = posts.find((x) => x.id === params[0] && x.user_id === params[1]);
        const same = (p?.scheduled_at?.toISOString() ?? null) === (params[3] ?? null);
        if (!p || !["scheduled", "draft"].includes(p.status) || !same ||
            targets.some((t) => t.post_id === p.id && t.status !== "pending")) return [];
        p.scheduled_at = new Date(String(params[2]));
        return [{ id: p.id }];
      },
    },
    { match: /count\(\*\)::int as n from socialapp\.scheduled_posts/, reply: () => [{ n: 0 }] },
  ];
}

async function withDb<T>(posts: Post[], targets: Target[], run: () => Promise<T>): Promise<T> {
  const { pool } = createFakePool(db(posts, targets));
  const restore = installFakePool(pool);
  try {
    return await run();
  } finally {
    restore();
  }
}

test("delete: a post the publisher has claimed cannot be deleted", async () => {
  const { deletePostForUser } = await import("./postMutations.ts");
  // New claim: the post row itself is 'publishing'.
  const posts: Post[] = [{ id: ID, user_id: "u1", status: "publishing", scheduled_at: new Date() }];
  const result = await withDb(posts, [{ post_id: ID, status: "publishing" }], () => deletePostForUser(ID, "u1"));
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.error, /being published/);
  assert.equal(posts.length, 1);
});

test("delete: a 'scheduled' post whose target is mid-publish (older claim) is not deleted", async () => {
  const { deletePostForUser } = await import("./postMutations.ts");
  const posts: Post[] = [{ id: ID, user_id: "u1", status: "scheduled", scheduled_at: new Date() }];
  const result = await withDb(posts, [{ post_id: ID, status: "publishing" }], () => deletePostForUser(ID, "u1"));
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.error, /being published/);
  assert.equal(posts.length, 1);
});

test("delete: drafts, scheduled and failed posts still delete; missing posts say so", async () => {
  const { deletePostForUser } = await import("./postMutations.ts");
  for (const status of ["draft", "scheduled", "failed"]) {
    const posts: Post[] = [{ id: ID, user_id: "u1", status, scheduled_at: null }];
    const result = await withDb(posts, [{ post_id: ID, status: status === "failed" ? "failed" : "pending" }], () => deletePostForUser(ID, "u1"));
    assert.deepEqual(result, { ok: true }, status);
    assert.equal(posts.length, 0, status);
  }
  const missing = await withDb([], [], () => deletePostForUser(ID, "u1"));
  assert.equal(missing.ok, false);
  assert.match(missing.ok ? "" : missing.error, /not found/i);
  const notMine = await withDb([{ id: ID, user_id: "u2", status: "draft", scheduled_at: null }], [], () => deletePostForUser(ID, "u1"));
  assert.equal(notMine.ok, false);
});

test("reschedule: blocked once the publisher has claimed the post or publishing state changed", async () => {
  const { reschedulePostForUser } = await import("./postMutations.ts");
  const future = new Date(Date.now() + 3 * 86_400_000);
  const dateKey = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);

  const claimed: Post[] = [{ id: ID, user_id: "u1", status: "publishing", scheduled_at: future }];
  const r1 = await withDb(claimed, [{ post_id: ID, status: "publishing" }], () => reschedulePostForUser(ID, "u1", dateKey));
  assert.equal(r1.ok, false);
  assert.match(r1.ok ? "" : r1.error, /being published/);
  assert.equal(claimed[0].scheduled_at, future);

  const legacy: Post[] = [{ id: ID, user_id: "u1", status: "scheduled", scheduled_at: future }];
  const r2 = await withDb(legacy, [{ post_id: ID, status: "publishing" }], () => reschedulePostForUser(ID, "u1", dateKey));
  assert.equal(r2.ok, false);
  assert.equal(legacy[0].scheduled_at, future);

  const published: Post[] = [{ id: ID, user_id: "u1", status: "published", scheduled_at: future }];
  const r3 = await withDb(published, [{ post_id: ID, status: "published" }], () => reschedulePostForUser(ID, "u1", dateKey));
  assert.equal(r3.ok, false);
  assert.match(r3.ok ? "" : r3.error, /already published/);
});

test("reschedule: a scheduled post moves to the new day and keeps its time of day", async () => {
  const { reschedulePostForUser } = await import("./postMutations.ts");
  const at = new Date(Date.now() + 3 * 86_400_000);
  at.setUTCHours(14, 30, 0, 0);
  const target = new Date(at.getTime() + 2 * 86_400_000);
  const posts: Post[] = [{ id: ID, user_id: "u1", status: "scheduled", scheduled_at: at }];
  const result = await withDb(posts, [{ post_id: ID, status: "pending" }], () =>
    reschedulePostForUser(ID, "u1", target.toISOString().slice(0, 10)));
  assert.deepEqual(result, { ok: true });
  assert.equal(posts[0].scheduled_at?.toISOString(), target.toISOString());
});

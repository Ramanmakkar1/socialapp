// Admin → Posts list: filters become bound parameters (never SQL text), paging is LIMIT n+1.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { ADMIN_NETWORKS, listAdminPosts } from "./adminPosts.ts";

test("listAdminPosts binds user, status and network filters, and pages", async () => {
  const fake = createFakePool([{ match: /from socialapp.scheduled_posts p/, reply: () => Array.from({ length: 11 }, (_, i) => ({ id: String(i), targets: [] })) }]);
  const restore = installFakePool(fake.pool);
  try {
    const res = await listAdminPosts({ status: "failed", network: "youtube", page: 3, pageSize: 10 });
    assert.equal(res.rows.length, 10);
    assert.equal(res.hasNext, true);
    assert.deepEqual(fake.calls[0].params, [null, "failed", "youtube", 11, 20]);

    await listAdminPosts({ userId: "u1", status: "", network: "", page: 1 });
    assert.deepEqual(fake.calls[1].params, ["u1", null, null, 26, 0]);
  } finally {
    restore();
  }
});

test("ADMIN_NETWORKS covers the core platforms and the newer networks", () => {
  for (const id of ["instagram", "facebook", "threads", "youtube", "tiktok", "bluesky", "x"]) assert.ok(ADMIN_NETWORKS.includes(id), id);
});

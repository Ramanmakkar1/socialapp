// AI limits: per-minute burst (in memory) and the monthly per-user quota (DB, atomic insert).
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { resetRateLimits } from "./rateLimit.ts";
import { AI_REQUESTS_PER_MINUTE, AI_REQUESTS_PER_MONTH, consumeAiRequest } from "./aiQuota.ts";

beforeEach(() => resetRateLimits());

function quotaDb(used: { n: number }) {
  return createFakePool([
    {
      match: /^insert into socialapp\.ai_requests/,
      reply: (p) => {
        if (used.n >= (p[3] as number)) return [];
        used.n += 1;
        return [{ id: String(used.n) }];
      },
    },
  ]);
}

test("monthly quota: allowed below the limit, refused with a friendly message at the limit", async () => {
  const used = { n: AI_REQUESTS_PER_MONTH - 1 };
  const { pool, calls } = quotaDb(used);
  const restore = installFakePool(pool);
  try {
    const now = new Date("2026-11-20T10:00:00Z");
    assert.deepEqual(await consumeAiRequest("u-1", "caption_ideas", now), { ok: true });
    assert.equal(calls[0].params[2], "2026-11-01T00:00:00.000Z", "counts from the start of the UTC month");
    const second = await consumeAiRequest("u-1", "caption_ideas", now);
    assert.equal(second.ok, false);
    assert.match(second.ok ? "" : second.error, /all 300 AI suggestions for this month/);
  } finally {
    restore();
  }
});

test("per-minute burst limit per user, independent between users", async () => {
  const { pool } = quotaDb({ n: 0 });
  const restore = installFakePool(pool);
  try {
    const now = new Date("2026-11-20T10:00:00Z");
    for (let i = 0; i < AI_REQUESTS_PER_MINUTE; i++) assert.equal((await consumeAiRequest("u-2", "dm_ideas", now)).ok, true);
    const blocked = await consumeAiRequest("u-2", "dm_ideas", now);
    assert.equal(blocked.ok, false);
    assert.match(blocked.ok ? "" : blocked.error, /wait \d+ seconds?/);
    assert.equal((await consumeAiRequest("u-3", "dm_ideas", now)).ok, true);
    assert.equal((await consumeAiRequest("u-2", "dm_ideas", new Date(now.getTime() + 61_000))).ok, true);
  } finally {
    restore();
  }
});

test("missing ai_requests table (migration pending) does not block AI", async () => {
  const { pool } = createFakePool([
    { match: /ai_requests/, reply: () => { throw Object.assign(new Error("relation does not exist"), { code: "42P01" }); } },
  ]);
  const restore = installFakePool(pool);
  try {
    assert.deepEqual(await consumeAiRequest("u-4", "caption_ideas"), { ok: true });
  } finally {
    restore();
  }
});

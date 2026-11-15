// Admin → Automations: failure classification, the daily series and the rules list query.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { dailySeries, failureKind, getQueueHealth, listAdminRules } from "./adminAutomations.ts";
import { MAX_ATTEMPTS } from "./sendPolicy.ts";

test("failureKind: skipped, fatal (not retried) and gave up after retries", () => {
  assert.equal(failureKind("skipped", 0), "skipped");
  assert.equal(failureKind("failed", 1), "fatal");
  assert.equal(failureKind("failed", MAX_ATTEMPTS - 1), "fatal");
  assert.equal(failureKind("failed", MAX_ATTEMPTS), "gave_up");
});

test("dailySeries fills missing UTC days with 0, oldest first", () => {
  const now = new Date("2026-11-15T23:30:00Z");
  const s = dailySeries(new Map([["2026-11-15", 4], ["2026-11-13", 2], ["2026-10-01", 9]]), 3, now);
  assert.deepEqual(s, [2, 0, 4]);
});

test("listAdminRules pages rules and counts sends only for the page's rule ids", async () => {
  const rules = Array.from({ length: 26 }, (_, i) => ({ id: `r${i}`, name: `Rule ${i}` }));
  const fake = createFakePool([
    { match: /from socialapp.dm_rules r/, reply: () => rules },
    { match: /from socialapp.dm_queue where status = 'sent'/, reply: () => [{ rule_id: "r1", n: 7 }] },
  ]);
  const restore = installFakePool(fake.pool);
  try {
    const res = await listAdminRules({ status: "active", page: 1 });
    assert.equal(res.rows.length, 25);
    assert.equal(res.hasNext, true);
    assert.deepEqual(fake.calls[0].params, ["active", 26, 0]);
    assert.equal((fake.calls[1].params[0] as string[]).length, 25);
    assert.equal(res.rows[1].sent_30d, 7);
    assert.equal(res.rows[0].sent_30d, 0);
  } finally {
    restore();
  }
});

test("getQueueHealth totals failures by kind", async () => {
  const fake = createFakePool([
    { match: /where status = 'pending'/, reply: () => [{ due: 2, later: 1, retrying: 1, oldest_due: null }] },
    {
      match: /status in \('failed', 'skipped'\)/,
      reply: () => [
        { status: "failed", gave_up: false, reason: "HTTP 403", n: 3, last: new Date() },
        { status: "failed", gave_up: true, reason: "timeout", n: 2, last: new Date() },
        { status: "skipped", gave_up: false, reason: "rule paused", n: 1, last: new Date() },
      ],
    },
  ]);
  const restore = installFakePool(fake.pool);
  try {
    const h = await getQueueHealth();
    assert.deepEqual(h.totals, { fatal: 3, gave_up: 2, skipped: 1 });
    assert.equal(h.pendingDue, 2);
    assert.deepEqual(h.reasons.map((r) => r.kind), ["fatal", "gave_up", "skipped"]);
  } finally {
    restore();
  }
});

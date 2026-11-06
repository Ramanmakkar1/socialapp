import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { PLANS } from "./plans.ts";
import { PLAN_LIMITS, scheduledPostLimitError, utcMonthRange, type PlanName } from "./planLimits.ts";

function numberIn(items: { text: string }[], pattern: RegExp): number | null {
  for (const item of items) {
    const m = item.text.match(pattern);
    if (m) return Number(m[1].replace(/,/g, ""));
  }
  return null;
}

test("enforced limits match the plan cards shown on /pricing", () => {
  for (const plan of PLANS) {
    const limits = PLAN_LIMITS[plan.name as PlanName];
    assert.ok(limits, plan.name);
    assert.equal(numberIn(plan.items, /^([\d,]+) social accounts/), limits.socialAccounts, plan.name);
    assert.equal(numberIn(plan.items, /^([\d,]+) auto-DMs \/ month/), limits.autoDmsPerMonth, plan.name);
    const scheduled = numberIn(plan.items, /^([\d,]+) scheduled posts \/ month/);
    assert.equal(scheduled, limits.scheduledPostsPerMonth, plan.name);
  }
});

test("utcMonthRange covers the whole UTC month", () => {
  const { start, end } = utcMonthRange(new Date("2026-12-31T23:59:59Z"));
  assert.equal(start.toISOString(), "2026-12-01T00:00:00.000Z");
  assert.equal(end.toISOString(), "2027-01-01T00:00:00.000Z");
});

test("the 11th scheduled post in a month is refused on the server; other months and the same post are fine", async () => {
  let counted = 10;
  const seen: unknown[][] = [];
  const { pool } = createFakePool([
    {
      match: /^select count\(\*\)::int as n from socialapp\.scheduled_posts/,
      reply: (params) => {
        seen.push(params);
        return [{ n: counted }];
      },
    },
  ]);
  const restore = installFakePool(pool);
  try {
    const at = new Date("2026-12-15T10:00:00Z");
    assert.match((await scheduledPostLimitError("u1", at)) ?? "", /10 scheduled posts per month/);
    assert.deepEqual(seen[0], ["u1", "2026-12-01T00:00:00.000Z", "2027-01-01T00:00:00.000Z", null]);
    counted = 9;
    assert.equal(await scheduledPostLimitError("u1", at, "11111111-1111-4111-8111-111111111111"), null);
    assert.equal(seen[1][3], "11111111-1111-4111-8111-111111111111");
  } finally {
    restore();
  }
});

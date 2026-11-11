import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { PLANS } from "./plans.ts";
import { PLAN_LIMITS, autoDmLimitWithBonus, monthlyAutoDmLimit, scheduledPostLimitError, utcMonthRange, type PlanName } from "./planLimits.ts";

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

test("referral bonus adds to the monthly auto-DM limit (500 per qualified referral)", () => {
  assert.equal(autoDmLimitWithBonus("Free", 0), 500);
  assert.equal(autoDmLimitWithBonus("Free", 500), 1000);
  assert.equal(autoDmLimitWithBonus("Free", 1500), 2000);
  assert.equal(autoDmLimitWithBonus("Pro", 500), 3_000);
  assert.equal(autoDmLimitWithBonus("Free", -10), 500);
  assert.equal(autoDmLimitWithBonus("Free", Number.NaN), 500);
});

test("monthlyAutoDmLimit reads the qualified bonus; a read error falls back to the plan limit", async () => {
  const { pool } = createFakePool([
    { match: /^select coalesce\(sum\(bonus_dms\), 0\)::int as n from socialapp\.referrals/, reply: (p) => (p[0] === "u1" ? [{ n: 1000 }] : [{ n: 0 }]) },
  ]);
  let restore = installFakePool(pool);
  try {
    assert.deepEqual(await monthlyAutoDmLimit("u1"), { plan: "Free", limit: 1500, bonus: 1000 });
    assert.deepEqual(await monthlyAutoDmLimit("u2"), { plan: "Free", limit: 500, bonus: 0 });
  } finally {
    restore();
  }
  const broken = createFakePool([]);
  restore = installFakePool(broken.pool);
  const prev = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(await monthlyAutoDmLimit("u1"), { plan: "Free", limit: 500, bonus: 0 });
  } finally {
    console.error = prev;
    restore();
  }
});

test("connected-account limit: reconnect always works, a new account only below the plan limit", async () => {
  const { accountConnectAllowed } = await import("./planLimits.ts");
  assert.equal(accountConnectAllowed({ alreadyConnected: false, connectedCount: 1, limit: 2 }), true);
  assert.equal(accountConnectAllowed({ alreadyConnected: false, connectedCount: 2, limit: 2 }), false);
  assert.equal(accountConnectAllowed({ alreadyConnected: true, connectedCount: 2, limit: 2 }), true);
  assert.equal(accountConnectAllowed({ alreadyConnected: true, connectedCount: 9, limit: 2 }), true);
});

test("accountLimitError counts social accounts + YouTube channels (not disconnected) against the Free limit of 2", async () => {
  const { accountLimitError } = await import("./planLimits.ts");
  let reply = { social: 1, youtube: 1, already: false };
  const { pool, calls } = createFakePool([{ match: /from socialapp\.social_accounts where user_id=\$1 and status <> 'disconnected'/, reply: () => [reply] }]);
  const restore = installFakePool(pool);
  try {
    const msg = await accountLimitError("u-1", { kind: "social", platform: "threads", externalId: "t-9" });
    assert.match(msg ?? "", /Free plan includes 2 connected accounts/);
    assert.deepEqual(calls[0].params, ["u-1", "social", "threads", "t-9"]);
    reply = { social: 2, youtube: 0, already: true };
    assert.equal(await accountLimitError("u-1", { kind: "social", platform: "instagram", externalId: "ig-1" }), null, "reconnect is allowed");
    reply = { social: 1, youtube: 0, already: false };
    assert.equal(await accountLimitError("u-1", { kind: "youtube", channelId: "UC1" }), null);
    // planForUser also reads billing_subscriptions (no row here = Free): only look at the account counts.
    const counts = calls.filter((c) => /from socialapp\.social_accounts/.test(c.sql));
    assert.deepEqual(counts[2].params, ["u-1", "youtube", null, "UC1"]);
  } finally {
    restore();
  }
});

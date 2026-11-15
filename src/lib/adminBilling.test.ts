// Admin → Billing: MRR and status counts from the grouped billing_subscriptions rows.
import assert from "node:assert/strict";
import { test } from "node:test";
import { earnsRevenue, monthlyCents, summarizeSubscriptions, type SubscriptionGroup } from "./adminBilling.ts";

const g = (over: Partial<SubscriptionGroup>): SubscriptionGroup => ({ plan: "Pro", billing_interval: "month", status: "active", in_grace: false, started: true, n: 1, ...over });

test("monthlyCents uses the plan prices; yearly counts as a twelfth", () => {
  assert.equal(monthlyCents("Pro", "month"), 1700);
  assert.equal(monthlyCents("Agency", "month"), 3500);
  assert.equal(monthlyCents("Pro", "year"), 1400);
  assert.equal(monthlyCents("Agency", "year"), 2900);
});

test("earnsRevenue: active, or past_due inside the grace period", () => {
  assert.equal(earnsRevenue({ status: "active", in_grace: false }), true);
  assert.equal(earnsRevenue({ status: "past_due", in_grace: true }), true);
  assert.equal(earnsRevenue({ status: "past_due", in_grace: false }), false);
  assert.equal(earnsRevenue({ status: "trialing", in_grace: false }), false);
  assert.equal(earnsRevenue({ status: "canceled", in_grace: false }), false);
});

test("summarizeSubscriptions adds up MRR, paying, trials, failures and abandoned checkouts", () => {
  const s = summarizeSubscriptions([
    g({ n: 3 }),
    g({ plan: "Agency", billing_interval: "year", n: 2 }),
    g({ status: "past_due", in_grace: true, n: 1 }),
    g({ status: "past_due", in_grace: false, n: 1 }),
    g({ status: "trialing", n: 4 }),
    g({ status: "canceled", n: 5 }),
    g({ status: "incomplete", n: 1 }),
    g({ plan: null, billing_interval: null, status: null, started: false, n: 2 }),
  ]);
  assert.equal(s.mrrCents, 4 * 1700 + 2 * 2900);
  assert.equal(s.paying, 6);
  assert.equal(s.trialing, 4);
  assert.equal(s.pastDue, 2);
  assert.equal(s.canceled, 5);
  assert.equal(s.abandoned, 3);
  assert.deepEqual(s.byPlan.map((p) => [p.plan, p.interval, p.paying, p.mrrCents]), [
    ["Pro", "month", 4, 6800],
    ["Agency", "year", 2, 5800],
  ]);
  assert.equal(s.byStatus.find((r) => r.status === "checkout not completed")?.n, 2);
  assert.equal(s.byStatus.find((r) => r.status === "past_due")?.n, 2);
});

test("summarizeSubscriptions on no rows is all zeros", () => {
  const s = summarizeSubscriptions([]);
  assert.equal(s.mrrCents, 0);
  assert.deepEqual(s.byPlan, []);
});

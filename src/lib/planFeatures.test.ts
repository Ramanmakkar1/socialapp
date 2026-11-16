// Server-side plan gating for AI, email capture in DMs and click + lead analytics (src/lib/planFeatures.ts).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createFakePool, installFakePool, type FakeCall } from "../test-utils/fakePool.ts";
import { PLANS } from "./plans.ts";
import { PLAN_FEATURES, planFeatureGatingEnabled, planHasFeature, requirePlanFeature, type PlanFeature } from "./planFeatures.ts";

const LIVE_BILLING = {
  STRIPE_SECRET_KEY: "sk_live_x",
  DATABASE_URL: "postgres://x",
  STRIPE_BILLING_WEBHOOK_SECRET: "whsec_x",
  STRIPE_BILLING_LIVE_PRICES: "1",
};

let restorePool: (() => void) | null = null;
const previousGating = process.env.PLAN_FEATURE_GATING;
afterEach(() => {
  restorePool?.();
  restorePool = null;
  if (previousGating === undefined) delete process.env.PLAN_FEATURE_GATING;
  else process.env.PLAN_FEATURE_GATING = previousGating;
});

/** Fake DB: one user on `plan` (null = no subscription), not an admin. */
function userOnPlan(plan: "Pro" | "Agency" | null, extra: { match: RegExp; reply: (p: unknown[]) => unknown[] }[] = []): FakeCall[] {
  const { pool, calls } = createFakePool([
    { match: /^select email from socialapp\.users/, reply: () => [{ email: "someone@example.com" }] },
    {
      match: /^select plan, status, past_due_since from socialapp\.billing_subscriptions/,
      reply: () => (plan ? [{ plan, status: "active", past_due_since: null }] : []),
    },
    ...extra,
  ]);
  restorePool = installFakePool(pool);
  return calls;
}

test("gating is off while paid plans are not on sale, on once billing is live; PLAN_FEATURE_GATING overrides", () => {
  assert.equal(planFeatureGatingEnabled({}), false);
  assert.equal(planFeatureGatingEnabled({ STRIPE_SECRET_KEY: "sk_test_x", DATABASE_URL: "x" }), false);
  assert.equal(planFeatureGatingEnabled(LIVE_BILLING), true);
  assert.equal(planFeatureGatingEnabled({ ...LIVE_BILLING, PLAN_FEATURE_GATING: "off" }), false);
  assert.equal(planFeatureGatingEnabled({ PLAN_FEATURE_GATING: "on" }), true);
});

test("while gating is off nobody is blocked and the plan is not even read", async () => {
  const calls = userOnPlan(null);
  for (const f of Object.keys(PLAN_FEATURES) as PlanFeature[]) {
    assert.deepEqual(await requirePlanFeature("user-1", f, {}), { ok: true });
  }
  assert.equal(calls.length, 0);
});

test("with gating on: Free is refused with an upgrade hint, Pro and Agency are allowed", async () => {
  userOnPlan(null);
  const free = await requirePlanFeature("user-1", "ai", LIVE_BILLING);
  assert.equal(free.ok, false);
  assert.ok(!free.ok && free.plan === "Free");
  assert.match(!free.ok ? free.error : "", /Pro and Agency plans\. Need more\? Upgrade to Pro/);
  restorePool?.();
  userOnPlan("Pro");
  assert.deepEqual(await requirePlanFeature("user-1", "email_capture", LIVE_BILLING), { ok: true });
  restorePool?.();
  userOnPlan("Agency");
  assert.deepEqual(await requirePlanFeature("user-1", "click_lead_analytics", LIVE_BILLING), { ok: true });
});

test("feature map matches the plan cards (Free has none of them, Pro and Agency list all)", () => {
  const copy: Record<PlanFeature, RegExp> = { ai: /^AI captions/, email_capture: /^Email capture in DMs$/, click_lead_analytics: /^Click \+ lead analytics$/ };
  for (const plan of PLANS) {
    for (const [feature, re] of Object.entries(copy) as [PlanFeature, RegExp][]) {
      const onCard = plan.items.some((i) => re.test(i.text));
      assert.equal(planHasFeature(plan.name as "Free" | "Pro" | "Agency", feature), onCard, `${plan.name} / ${feature}`);
    }
  }
});

test("AI: consumeAiRequest refuses a Free user before recording anything when gating is on", async () => {
  process.env.PLAN_FEATURE_GATING = "on";
  const calls = userOnPlan(null, [{ match: /^insert into socialapp\.ai_requests/, reply: () => [{ id: "r1" }] }]);
  const { consumeAiRequest } = await import("./aiQuota.ts");
  const r = await consumeAiRequest("user-gated-ai", "caption_ideas");
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /AI captions, campaign drafts and DM message ideas are part of the Pro and Agency plans/);
  assert.ok(!calls.some((c) => c.sql.startsWith("insert into socialapp.ai_requests")));
});

test("AI: a Pro user goes on to the normal quota", async () => {
  process.env.PLAN_FEATURE_GATING = "on";
  const calls = userOnPlan("Pro", [{ match: /^insert into socialapp\.ai_requests/, reply: () => [{ id: "r1" }] }]);
  const { consumeAiRequest } = await import("./aiQuota.ts");
  assert.deepEqual(await consumeAiRequest("user-pro-ai", "dm_ideas"), { ok: true });
  assert.ok(calls.some((c) => c.sql.startsWith("insert into socialapp.ai_requests")));
});

const ruleInput = {
  name: "Guide",
  keywords: ["guide"],
  matchType: "contains" as const,
  dmText: "Here is the guide",
  linkUrl: "https://example.com/guide",
  emailGate: true,
  followGate: false,
  triggers: ["comment" as const],
  socialAccountId: null,
  publicReply: "",
};

test("email capture: a Free user cannot create an email-gated rule (Auto-DM page and MCP share this path)", async () => {
  process.env.PLAN_FEATURE_GATING = "on";
  const calls = userOnPlan(null, [{ match: /^insert into socialapp\.dm_rules/, reply: () => [{ id: "rule-1" }] }]);
  const { createDmRuleForUser } = await import("./dmRuleCreate.ts");
  const r = await createDmRuleForUser("user-1", ruleInput);
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.errors[0] : "", /Email capture in DMs is part of the Pro and Agency plans/);
  assert.ok(!calls.some((c) => c.sql.startsWith("insert into socialapp.dm_rules")));
});

test("email capture: rules without an email gate, and Pro users, are not affected", async () => {
  process.env.PLAN_FEATURE_GATING = "on";
  const { emailCapturePlanError } = await import("./dmRuleCreate.ts");
  userOnPlan(null);
  assert.equal(await emailCapturePlanError("user-1", { emailGate: false }), null);
  restorePool?.();
  userOnPlan("Pro");
  assert.equal(await emailCapturePlanError("user-1", { emailGate: true }), null);
});

test("analytics: click and lead numbers are hidden for Free when gating is on, kept for Pro", async () => {
  process.env.PLAN_FEATURE_GATING = "on";
  const row = { id: "r1", name: "Guide", status: "active", dmsSent: 9, dmsFailed: 1, leads: 4, clicks: 7, uniqueClicks: 5 };
  const day = { day: "2026-11-15", dms: 3, leads: 2 };
  const extra = [
    { match: /^select r\.id, r\.name, r\.status/, reply: () => [row] },
    { match: /^with days as/, reply: () => [day] },
  ];
  const { getRuleStats, getDailyActivity } = await import("./stats.ts");
  userOnPlan(null, extra);
  assert.deepEqual(await getRuleStats("user-1"), [{ ...row, leads: 0, clicks: 0, uniqueClicks: 0 }]);
  assert.deepEqual(await getDailyActivity("user-1"), [{ ...day, leads: 0 }]);
  restorePool?.();
  userOnPlan("Pro", extra);
  assert.deepEqual(await getRuleStats("user-1"), [row]);
  assert.deepEqual(await getDailyActivity("user-1"), [day]);
});

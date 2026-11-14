import assert from "node:assert/strict";
import { test } from "node:test";
import { allFeatureReadiness, featureReadiness, featureStatus, isFeatureReady, planReadiness, reminderChannelStatus, stripeMode } from "./featureReadiness.ts";
import { PLANS, cancelAnswer, plansFor, plansNote, softwareOffers } from "./plans.ts";

const LIVE = {
  DATABASE_URL: "postgres://x",
  STRIPE_SECRET_KEY: "sk_live_abc",
  STRIPE_WEBHOOK_SECRET: "whsec_1",
  STRIPE_BILLING_WEBHOOK_SECRET: "whsec_2",
  STRIPE_BILLING_LIVE_PRICES: "1",
  SMTP_HOST: "smtp.example.com",
  ANTHROPIC_API_KEY: "key",
  AI_REPLIES_ENABLED: "true",
};

test("stripeMode reads the key prefix only", () => {
  assert.equal(stripeMode("sk_live_123"), "live");
  assert.equal(stripeMode("rk_live_123"), "live");
  assert.equal(stripeMode("sk_test_123"), "test");
  assert.equal(stripeMode("rk_test_123"), "test");
  assert.equal(stripeMode(""), "none");
  assert.equal(stripeMode(undefined), "none");
  assert.equal(stripeMode("pk_live_123"), "none");
});

test("empty env: everything is not switched on (safe default)", () => {
  const all = allFeatureReadiness({});
  for (const r of Object.values(all)) {
    assert.equal(r.ready, false, r.id);
    assert.equal(r.source, "config");
    assert.ok(r.missing.length > 0);
  }
});

test("fully configured live env: everything is ready", () => {
  for (const r of Object.values(allFeatureReadiness(LIVE))) assert.equal(r.ready, true, r.id);
});

test("Stripe test key keeps billing and card payments off", () => {
  const env = { ...LIVE, STRIPE_SECRET_KEY: "sk_test_abc" };
  assert.equal(isFeatureReady("billing", env), false);
  assert.equal(isFeatureReady("card_payments", env), false);
  assert.match(featureReadiness("billing", env).missing.join(" "), /live key/);
  // Other features don't care.
  assert.equal(isFeatureReady("email", env), true);
});

test("billing needs its webhook secret and the live-prices confirmation", () => {
  assert.deepEqual(featureReadiness("billing", { ...LIVE, STRIPE_BILLING_WEBHOOK_SECRET: "" }).missing, ["STRIPE_BILLING_WEBHOOK_SECRET"]);
  assert.deepEqual(featureReadiness("billing", { ...LIVE, STRIPE_BILLING_LIVE_PRICES: "" }).missing, ["STRIPE_BILLING_LIVE_PRICES=1"]);
  // Card payments don't need the billing pieces, but do need the Connect webhook.
  assert.equal(isFeatureReady("card_payments", { ...LIVE, STRIPE_BILLING_LIVE_PRICES: "" }), true);
  assert.deepEqual(featureReadiness("card_payments", { ...LIVE, STRIPE_WEBHOOK_SECRET: " " }).missing, ["STRIPE_WEBHOOK_SECRET"]);
});

test("email needs SMTP_HOST; AI replies also need the owner's switch", () => {
  assert.equal(isFeatureReady("email", { SMTP_HOST: "  " }), false);
  assert.equal(isFeatureReady("email", { SMTP_HOST: "smtp.x" }), true);
  assert.equal(isFeatureReady("ai", { ANTHROPIC_API_KEY: "k" }), true);
  assert.equal(isFeatureReady("ai_replies", { ANTHROPIC_API_KEY: "k" }), false);
  assert.equal(isFeatureReady("ai_replies", { ANTHROPIC_API_KEY: "k", AI_REPLIES_ENABLED: "1" }), true);
  assert.equal(isFeatureReady("ai_replies", { AI_REPLIES_ENABLED: "1" }), false);
});

test("FEATURE_FORCE_READY skips launch requirements but never the hard ones", () => {
  const local = { DATABASE_URL: "postgres://x", STRIPE_SECRET_KEY: "sk_test_abc" };
  assert.equal(isFeatureReady("billing", local), false);
  const forced = featureReadiness("billing", { ...local, FEATURE_FORCE_READY: "billing, email" });
  assert.equal(forced.ready, true);
  assert.equal(forced.source, "forced_ready");
  assert.ok(forced.missing.length > 0, "still reports what production needs");
  assert.equal(isFeatureReady("card_payments", { ...local, FEATURE_FORCE_READY: "billing" }), false);
  assert.equal(isFeatureReady("card_payments", { ...local, FEATURE_FORCE_READY: "ALL" }), true);
  // No SMTP_HOST: forcing can't make e-mail work.
  assert.equal(isFeatureReady("email", { FEATURE_FORCE_READY: "email" }), false);
  assert.equal(isFeatureReady("ai_replies", { ANTHROPIC_API_KEY: "k", FEATURE_FORCE_READY: "ai_replies" }), true);
});

test("FEATURE_FORCE_SOON turns a ready feature off and wins over FORCE_READY", () => {
  assert.equal(isFeatureReady("email", { ...LIVE, FEATURE_FORCE_SOON: "email" }), false);
  assert.equal(featureReadiness("email", { ...LIVE, FEATURE_FORCE_SOON: "email" }).source, "forced_soon");
  assert.equal(isFeatureReady("billing", { ...LIVE, FEATURE_FORCE_SOON: "all", FEATURE_FORCE_READY: "all" }), false);
  assert.equal(isFeatureReady("ai", { ...LIVE, FEATURE_FORCE_SOON: "email" }), true);
});

test("missing never contains secret values", () => {
  const r = featureReadiness("billing", { STRIPE_SECRET_KEY: "sk_test_SECRETVALUE", DATABASE_URL: "postgres://pw@h" });
  assert.ok(!r.missing.join(" ").includes("SECRETVALUE"));
  assert.ok(!r.missing.join(" ").includes("pw@h"));
});

test("statuses use the ChannelStatus shape", () => {
  const soon = featureStatus("billing", {});
  assert.equal(soon.state, "soon");
  assert.equal(soon.pill, "Not switched on yet");
  assert.match(soon.title, /launching soon/);
  assert.equal(featureStatus("email", LIVE).state, "ready");
  const remind = reminderChannelStatus("Facebook Group", {});
  assert.equal(remind.state, "soon");
  assert.match(remind.title, /Facebook Group reminders need e-mail sending/);
  assert.equal(reminderChannelStatus("Facebook Group", { SMTP_HOST: "smtp.x" }).state, "ready");
});

test("pricing cards: paid plans say not switched on and point to the Free sign-up", () => {
  const r = planReadiness({});
  assert.deepEqual(r, { paidPlans: false, ai: false });
  const plans = plansFor(r);
  const free = plans.find((p) => p.name === "Free")!;
  assert.equal(free.ctaHref, "/signup");
  assert.ok(!free.comingSoon);
  for (const p of plans.filter((x) => x.name !== "Free")) {
    assert.equal(p.comingSoon, true);
    assert.equal(p.ctaHref, "/signup");
    assert.equal(p.yearlyHref, undefined);
    assert.ok(p.items.some((i) => /^AI /.test(i.text) && i.soon));
    assert.ok(!p.ctaHref.startsWith("/upgrade"));
  }
  assert.match(plansNote(r), /launching soon/);
  assert.match(cancelAnswer(r), /launching soon/);
  assert.deepEqual(softwareOffers(r).map((o) => o.name), ["Free"]);
  // Source list untouched.
  assert.ok(PLANS.find((p) => p.name === "Pro")!.ctaHref.startsWith("/upgrade"));
});

test("pricing cards when live: unchanged checkout links", () => {
  const r = planReadiness(LIVE);
  assert.deepEqual(r, { paidPlans: true, ai: true });
  const plans = plansFor(r);
  assert.equal(plans.find((p) => p.name === "Pro")!.ctaHref, "/upgrade?plan=pro&interval=month");
  assert.ok(plans.every((p) => !p.comingSoon && p.items.every((i) => !i.soon)));
  assert.equal(softwareOffers(r).length, PLANS.length);
});

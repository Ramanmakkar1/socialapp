import assert from "node:assert/strict";
import { test } from "node:test";
import { ACCOUNT_CREATE_API_VERSION, accountCreateParams, accountStatusFromV2 } from "./stripeConnect.ts";

test("v2 merchant capability status maps to charges/payouts enabled", () => {
  assert.deepEqual(accountStatusFromV2({}), { charges_enabled: false, payouts_enabled: false, details_submitted: true });
  assert.deepEqual(
    accountStatusFromV2({
      configuration: { merchant: { capabilities: { card_payments: { status: "restricted" }, stripe_balance: { payouts: { status: "restricted" } } } } },
      requirements: { entries: [{}] },
    }),
    { charges_enabled: false, payouts_enabled: false, details_submitted: false },
  );
  assert.deepEqual(
    accountStatusFromV2({
      configuration: { merchant: { capabilities: { card_payments: { status: "active" }, stripe_balance: { payouts: { status: "pending" } } } } },
    }),
    { charges_enabled: true, payouts_enabled: false, details_submitted: true },
  );
  assert.deepEqual(
    accountStatusFromV2({
      configuration: { merchant: { capabilities: { card_payments: { status: "active" }, stripe_balance: { payouts: { status: "active" } } } } },
    }),
    { charges_enabled: true, payouts_enabled: true, details_submitted: true },
  );
});

test("connected accounts are Managed Risk + direct charges: Stripe collects fees and losses, merchant card_payments", () => {
  const params = accountCreateParams({ id: "u1", email: "c@example.com", name: null }, "CA");
  assert.deepEqual(params.defaults?.responsibilities, { fees_collector: "stripe", losses_collector: "stripe" });
  assert.deepEqual(params.configuration, { merchant: { capabilities: { card_payments: { requested: true } } } });
  assert.equal(params.dashboard, "express");
  assert.equal(params.identity?.country, "ca");
  assert.equal(params.display_name, "c@example.com");
  // Express Dashboard + Stripe as losses collector needs a preview API version for creation.
  assert.match(ACCOUNT_CREATE_API_VERSION, /\.preview$/);
});

test("UPI routing knows exactly the Stripe Connect countries", async () => {
  const { CONNECT_COUNTRIES } = await import("./stripeConnect.ts");
  const { STRIPE_COUNTRY_CODES, payoutRoute } = await import("./upi.ts");
  assert.deepEqual([...STRIPE_COUNTRY_CODES].sort(), CONNECT_COUNTRIES.map((c) => c.code).sort());
  for (const c of CONNECT_COUNTRIES) assert.equal(payoutRoute(c.code), "stripe");
  assert.ok(!CONNECT_COUNTRIES.some((c) => c.code === "IN"));
});

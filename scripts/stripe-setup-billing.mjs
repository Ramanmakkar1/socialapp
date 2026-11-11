#!/usr/bin/env node
// Creates (or checks) Poskoo's subscription catalog and Customer Portal configuration on the
// PLATFORM Stripe account. Idempotent: run it again any time; it only creates what is missing.
//
//   node --env-file=.env.local scripts/stripe-setup-billing.mjs            # sandbox / test key
//   STRIPE_SECRET_KEY=sk_live_... SITE_URL=https://poskoo.com \
//     node scripts/stripe-setup-billing.mjs --live                          # production (explicit)
//
// Products: poskoo_pro, poskoo_agency (fixed ids). Prices are found by lookup_key
// (poskoo_pro_monthly, poskoo_pro_yearly, poskoo_agency_monthly, poskoo_agency_yearly); a price whose
// amount changed is replaced by a new price that takes over the lookup key (transfer_lookup_key).
// The portal configuration is tagged metadata.poskoo = poskoo_billing_portal_v1 (the app finds it by that tag).
import Stripe from "stripe";

const LIVE_FLAG = process.argv.includes("--live");
const DRY = process.argv.includes("--dry-run");
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set");
  process.exit(1);
}
const isLiveKey = /^(sk|rk)_live_/.test(key);
if (isLiveKey && !LIVE_FLAG) {
  console.error("This is a LIVE key. Re-run with --live if you really mean production.");
  process.exit(1);
}
if (!isLiveKey && LIVE_FLAG) {
  console.error("--live was given but the key is not a live key.");
  process.exit(1);
}
const site = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://poskoo.com").replace(/\/+$/, "");
const publicSite = /^https:\/\//.test(site) && !/localhost|127\.0\.0\.1/.test(site) ? site : "https://poskoo.com";

const stripe = new Stripe(key, { appInfo: { name: "Poskoo billing setup" }, maxNetworkRetries: 2 });
const PORTAL_TAG = "poskoo_billing_portal_v1";

// Owner-approved prices (src/lib/billingState.ts PLAN_PRICES), USD cents.
const PLANS = [
  {
    product: "poskoo_pro",
    name: "Poskoo Pro",
    plan: "Pro",
    description: "5 social accounts, unlimited scheduling, 2,500 auto-DMs a month, AI ideas, 20 bio links.",
    prices: [
      { lookup_key: "poskoo_pro_monthly", interval: "month", amount: 1700, nickname: "Pro monthly" },
      { lookup_key: "poskoo_pro_yearly", interval: "year", amount: 16800, nickname: "Pro yearly ($14/mo)" },
    ],
  },
  {
    product: "poskoo_agency",
    name: "Poskoo Agency",
    plan: "Agency",
    description: "25 social accounts, unlimited scheduling, 10,000 auto-DMs a month, priority support.",
    prices: [
      { lookup_key: "poskoo_agency_monthly", interval: "month", amount: 3500, nickname: "Agency monthly" },
      { lookup_key: "poskoo_agency_yearly", interval: "year", amount: 34800, nickname: "Agency yearly ($29/mo)" },
    ],
  },
];

function log(...a) {
  console.log(...a);
}

async function ensureProduct(p) {
  try {
    const existing = await stripe.products.retrieve(p.product);
    if (!existing.active || existing.metadata?.poskoo_plan !== p.plan) {
      if (!DRY) await stripe.products.update(p.product, { active: true, metadata: { poskoo_plan: p.plan } });
      log(`  product ${p.product}: re-activated / metadata fixed`);
    } else {
      log(`  product ${p.product}: ok`);
    }
    return existing.id;
  } catch (err) {
    if (err?.code !== "resource_missing") throw err;
    if (DRY) {
      log(`  product ${p.product}: would create`);
      return p.product;
    }
    const created = await stripe.products.create({
      id: p.product,
      name: p.name,
      description: p.description,
      metadata: { poskoo_plan: p.plan },
    });
    log(`  product ${p.product}: created`);
    return created.id;
  }
}

async function ensurePrice(productId, plan, price) {
  const found = await stripe.prices.list({ lookup_keys: [price.lookup_key], active: true, limit: 1 });
  const current = found.data[0];
  const matches =
    current &&
    current.unit_amount === price.amount &&
    current.currency === "usd" &&
    current.recurring?.interval === price.interval &&
    current.recurring?.interval_count === 1 &&
    (typeof current.product === "string" ? current.product : current.product.id) === productId;
  if (matches) {
    log(`  price ${price.lookup_key}: ok (${current.id})`);
    return current.id;
  }
  if (DRY) {
    log(`  price ${price.lookup_key}: would ${current ? "replace" : "create"}`);
    return current?.id ?? null;
  }
  const created = await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: price.amount,
    recurring: { interval: price.interval, interval_count: 1 },
    lookup_key: price.lookup_key,
    transfer_lookup_key: Boolean(current),
    nickname: price.nickname,
    metadata: { poskoo_plan: plan, poskoo_interval: price.interval },
  });
  if (current) {
    await stripe.prices.update(current.id, { active: false });
    log(`  price ${price.lookup_key}: replaced ${current.id} -> ${created.id} (old price archived; existing subscribers keep it until they switch)`);
  } else {
    log(`  price ${price.lookup_key}: created (${created.id})`);
  }
  return created.id;
}

async function ensurePortal(productPrices) {
  const params = {
    business_profile: {
      headline: "Poskoo: manage your plan",
      privacy_policy_url: `${publicSite}/privacy`,
      terms_of_service_url: `${publicSite}/terms`,
    },
    default_return_url: `${site}/app/settings/billing?portal=1`,
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "address", "name", "tax_id"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        proration_behavior: "none",
        cancellation_reason: { enabled: true, options: ["too_expensive", "missing_features", "switched_service", "unused", "other"] },
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price", "promotion_code"],
        // Upgrades are charged right away (prorated); downgrades and yearly->monthly wait for the period end.
        proration_behavior: "always_invoice",
        products: productPrices.map((p) => ({ product: p.product, prices: p.prices })),
        schedule_at_period_end: { conditions: [{ type: "decreasing_item_amount" }, { type: "shortening_interval" }] },
      },
    },
    metadata: { poskoo: PORTAL_TAG },
  };
  let existing = null;
  for await (const c of stripe.billingPortal.configurations.list({ limit: 100 })) {
    if (c.metadata?.poskoo === PORTAL_TAG) {
      existing = c;
      break;
    }
  }
  if (DRY) {
    log(`  portal configuration: would ${existing ? `update ${existing.id}` : "create"}`);
    return existing?.id ?? null;
  }
  if (existing) {
    const updated = await stripe.billingPortal.configurations.update(existing.id, { ...params, active: true });
    log(`  portal configuration: updated (${updated.id})`);
    return updated.id;
  }
  const created = await stripe.billingPortal.configurations.create(params);
  log(`  portal configuration: created (${created.id})`);
  return created.id;
}

const account = await stripe.accounts.retrieve();
log(`Stripe account ${account.id} (${account.settings?.dashboard?.display_name ?? account.business_profile?.name ?? "unnamed"}), ${isLiveKey ? "LIVE" : "test/sandbox"} mode${DRY ? ", dry run" : ""}`);
log(`Site URL for portal return: ${site}`);

const productPrices = [];
for (const p of PLANS) {
  log(`${p.plan}:`);
  const productId = await ensureProduct(p);
  const ids = [];
  for (const price of p.prices) ids.push(await ensurePrice(productId, p.plan, price));
  productPrices.push({ product: productId, prices: ids.filter(Boolean) });
}
log("Customer Portal:");
const portalId = await ensurePortal(productPrices);

log("\nSummary (JSON):");
log(JSON.stringify({ account: account.id, livemode: isLiveKey, products: productPrices, portal_configuration: portalId }, null, 2));

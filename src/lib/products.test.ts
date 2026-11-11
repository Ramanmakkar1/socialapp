import assert from "node:assert/strict";
import { test } from "node:test";
import { checkoutSessionParams, newSlug, slugBase } from "./products.ts";

const product = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  slug: "my-ebook-abc234",
  title: "My Ebook",
  description: "A guide",
  price_cents: 1999,
  currency: "usd",
  cover_url: "https://cdn.example.com/c.png",
};

test("checkout is a direct charge (no transfer_data / on_behalf_of) with a 3% application fee", () => {
  const params = checkoutSessionParams(product, 300);
  assert.equal(params.mode, "payment");
  assert.equal(params.payment_intent_data?.transfer_data, undefined);
  assert.equal(params.payment_intent_data?.on_behalf_of, undefined);
  assert.equal(params.payment_intent_data?.application_fee_amount, 60);
  assert.equal(params.line_items?.[0]?.price_data?.unit_amount, 1999);
  assert.equal(params.line_items?.[0]?.price_data?.currency, "usd");
  assert.deepEqual(params.metadata, {
    poskoo_product_id: product.id,
    poskoo_seller_user_id: product.user_id,
    poskoo_fee_cents: "60",
  });
  assert.match(String(params.success_url), /\/p\/my-ebook-abc234\/success\?session_id=\{CHECKOUT_SESSION_ID\}$/);
  assert.equal("payment_method_types" in params, false);
});

test("the fee follows the configured basis points", () => {
  assert.equal(checkoutSessionParams(product, 500).payment_intent_data?.application_fee_amount, 100);
  assert.equal(checkoutSessionParams({ ...product, price_cents: 50 }, 300).payment_intent_data?.application_fee_amount, 2);
});

test("slugs are url-safe, readable and unique-ish", () => {
  assert.equal(slugBase("Café Presets: Vol. 2!"), "cafe-presets-vol-2");
  assert.equal(slugBase("🔥"), "product");
  const a = newSlug("My Ebook");
  assert.match(a, /^my-ebook-[a-z0-9]{6}$/);
  assert.notEqual(a, newSlug("My Ebook"));
  assert.match(newSlug("x".repeat(200)), /^[a-z0-9][a-z0-9-]{2,80}$/);
});

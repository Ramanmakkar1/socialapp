import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_PLATFORM_FEE_BPS, formatMoney, parsePriceToCents, platformFeeBps, platformFeeCents } from "./money.ts";

test("platform fee is 3% by default, rounded half up, in minor units", () => {
  assert.equal(DEFAULT_PLATFORM_FEE_BPS, 300);
  assert.equal(platformFeeCents(1000, 300), 30);
  assert.equal(platformFeeCents(1999, 300), 60); // 59.97 -> 60
  assert.equal(platformFeeCents(1950, 300), 59); // 58.5 -> 59 (half up)
  assert.equal(platformFeeCents(50, 300), 2); // 1.5 -> 2
  assert.equal(platformFeeCents(99_999_999, 300), 3_000_000);
});

test("platform fee never exceeds the amount and is 0 for nothing", () => {
  assert.equal(platformFeeCents(0, 300), 0);
  assert.equal(platformFeeCents(-5, 300), 0);
  assert.equal(platformFeeCents(100, 10_000), 100);
  assert.equal(platformFeeCents(100, 0), 0);
});

test("PLATFORM_FEE_BPS env override is validated (0..10000 integer) else default", () => {
  assert.equal(platformFeeBps(undefined), 300);
  assert.equal(platformFeeBps(""), 300);
  assert.equal(platformFeeBps("500"), 500);
  assert.equal(platformFeeBps("0"), 0);
  assert.equal(platformFeeBps("12.5"), 300);
  assert.equal(platformFeeBps("-1"), 300);
  assert.equal(platformFeeBps("10001"), 300);
  assert.equal(platformFeeBps("abc"), 300);
  const previous = process.env.PLATFORM_FEE_BPS;
  process.env.PLATFORM_FEE_BPS = "250";
  try {
    assert.equal(platformFeeCents(10_000), 250);
  } finally {
    if (previous === undefined) delete process.env.PLATFORM_FEE_BPS;
    else process.env.PLATFORM_FEE_BPS = previous;
  }
});

test("prices parse to cents without floating point", () => {
  assert.equal(parsePriceToCents("19.99"), 1999);
  assert.equal(parsePriceToCents("19.9"), 1990);
  assert.equal(parsePriceToCents("19"), 1900);
  assert.equal(parsePriceToCents(" 1,299.00 "), 129900);
  assert.equal(parsePriceToCents("0.29"), 29);
  assert.equal(parsePriceToCents("19.999"), null);
  assert.equal(parsePriceToCents("-1"), null);
  assert.equal(parsePriceToCents("1e3"), null);
  assert.equal(parsePriceToCents(""), null);
});

test("formatMoney shows the currency", () => {
  assert.equal(formatMoney(1999, "usd"), "$19.99");
  assert.match(formatMoney(500, "eur"), /€5\.00/);
});

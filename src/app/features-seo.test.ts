import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BRAND } from "@/lib/brand";

// The features page imports next/font and CSS modules, so it cannot be
// imported in a node:test process. Read the source and lock the JSON-LD
// expressions against the canonical origin instead.
const pageSource = readFileSync("src/app/features/page.tsx", "utf8");

test("features page exposes a SoftwareApplication node on the canonical origin", () => {
  assert.ok(
    pageSource.includes('"@type": "SoftwareApplication"'),
    "features page must include a SoftwareApplication JSON-LD node",
  );
  assert.ok(
    pageSource.includes('"@id": BRAND.canonicalUrl + "#app"'),
    "SoftwareApplication @id must be BRAND.canonicalUrl + '#app'",
  );
  assert.ok(
    pageSource.includes("url: BRAND.canonicalUrl + \"/features\""),
    "SoftwareApplication url must be the canonical /features URL",
  );
  assert.equal(BRAND.canonicalUrl.startsWith("https://"), true);
  assert.equal(BRAND.canonicalUrl.endsWith("/"), false, "canonical origin must have no trailing slash");
  assert.ok(!BRAND.canonicalUrl.includes("splitforms.com"), "schema must not point at the staging host");
});

test("features SoftwareApplication reuses the brand facts and readiness helpers", () => {
  assert.ok(pageSource.includes("name: BRAND.name"), "app name must come from BRAND.name");
  assert.ok(pageSource.includes("description: BRAND.description"), "app description must come from BRAND.description");
  assert.ok(pageSource.includes('operatingSystem: "Web"'), "app operatingSystem must be Web");
  assert.ok(pageSource.includes('applicationCategory: "BusinessApplication"'), "app category must be BusinessApplication");
  assert.ok(
    pageSource.includes("offers: softwareOffers({ paidPlans, ai: false })"),
    "offers must use the product readiness/pricing helper, not invented prices",
  );
  assert.ok(!pageSource.includes("aggregateRating"), "no invented ratings");
  assert.ok(!/["']@type["']:\s*["']Review["']/.test(pageSource), "no invented reviews");
});

test("features page renders readable, encoding-safe punctuation", () => {
  assert.ok(
    pageSource.includes("Schedule &middot; Auto-DM &middot; AI captions &middot; Free tools"),
    "ALL-IN-ONE pill separators must use readable middle-dot entities",
  );
  assert.equal(
    pageSource.includes('aria-hidden="true">&rarr;</span>'),
    true,
    "CTA arrows must use the &rarr; entity",
  );
  assert.equal(pageSource.includes("\uFFFD"), false, "features copy must not contain replacement characters");
  assert.equal(pageSource.includes("\u00B7"), false, "features copy must not contain raw middle-dot characters");
  assert.equal(pageSource.includes("\u2192"), false, "features copy must not contain raw arrow characters");
  assert.equal((pageSource.match(/<h1[\s>]/g) ?? []).length, 1, "features page must have exactly one H1");
});

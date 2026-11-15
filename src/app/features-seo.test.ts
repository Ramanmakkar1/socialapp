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
    pageSource.includes('url: canonicalUrlForPath("/features")'),
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

const sliceBetween = (start: string, end: string) => {
  const from = pageSource.indexOf(start);
  assert.notEqual(from, -1, `missing start marker: ${start}`);
  const to = pageSource.indexOf(end, from + start.length);
  assert.notEqual(to, -1, `missing end marker: ${end}`);
  return pageSource.slice(from, to + end.length);
};

// Every user-visible surface must be free of replacement characters, raw
// middle dots/arrows and double-escaped or mojibake punctuation.
const assertReadable = (text: string, surface: string) => {
  assert.equal(text.includes("\uFFFD"), false, `${surface} must not contain replacement characters`);
  assert.equal(text.includes("\u00B7"), false, `${surface} must not contain raw middle-dot characters`);
  assert.equal(text.includes("\u2192"), false, `${surface} must not contain raw arrow characters`);
  assert.equal(/â€|Ã¢|Ã©|Ã¨/.test(text), false, `${surface} must not contain mojibake`);
  assert.equal(text.includes("&amp;"), false, `${surface} must not contain double-escaped entities`);
};

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

test("hero copy uses readable separators and CTA arrows", () => {
  const hero = sliceBetween('<header className="hero">', "</header>");
  assertReadable(hero, "hero");
  assert.ok(hero.includes("Schedule &middot; Auto-DM &middot; AI captions &middot; Free tools"));
  assert.ok(hero.includes("Start free <span aria-hidden=\"true\">&rarr;</span>"));
  assert.ok(hero.includes("View pricing"));
});

test("feature descriptions use readable punctuation", () => {
  const descriptions = sliceBetween("const schedulerBullets = [", "const faqs = [");
  assertReadable(descriptions, "feature descriptions");
  for (const sentence of [
    "Plan feed posts, reels, carousels and stories on a week or month calendar.",
    "Send your link automatically to everyone who comments a keyword.",
    "Get caption ideas with hashtags from a short topic, then edit and schedule.",
    "Count characters, build hashtag sets and generate captions.",
    "Lead magnets: hand out a free file or link once someone gives their email in the DM.",
  ]) {
    assert.ok(descriptions.includes(sentence), `feature description missing readable text: ${sentence}`);
  }
});

test("FAQ answers use readable punctuation", () => {
  const faqBlock = sliceBetween("const faqs = [", "const jsonLd =");
  assertReadable(faqBlock, "FAQ answers");
  for (const answer of [
    "Poskoo is one app for scheduling social posts and turning Instagram comments into automatic DMs.",
    "You can schedule and auto-publish to Instagram, Facebook Pages, Threads and YouTube from one queue.",
    "You set a keyword such as GUIDE or LINK, and when someone comments it, Poskoo sends them your message in a DM, usually within a minute.",
    "No. The Free plan is $0 and needs no credit card, so you can connect an account and schedule your first post without paying.",
  ]) {
    assert.ok(faqBlock.includes(answer), `FAQ answer missing readable text: ${answer}`);
  }
});

test("pricing links use readable labels", () => {
  const pricingLinks = [...pageSource.matchAll(/<Link[^>]*href="\/pricing"[^>]*>([\s\S]*?)<\/Link>/g)].map(
    (match) => match[1],
  );
  assert.ok(pricingLinks.length >= 2, "features page must keep its pricing links");
  for (const label of pricingLinks) {
    assertReadable(label, "pricing link label");
    assert.ok(label.trim().length > 0, "pricing link label must not be empty");
  }
  assert.ok(pricingLinks.some((label) => label.includes("View pricing")));
  assert.ok(pricingLinks.some((label) => label.includes("See Poskoo pricing and plans")));
});

test("CTA labels use readable punctuation", () => {
  const ctaLabels = [...pageSource.matchAll(/<Link className="btn[^"]*"[^>]*>([\s\S]*?)<\/Link>/g)].map(
    (match) => match[1],
  );
  assert.ok(ctaLabels.length >= 4, "features page must keep its CTA buttons");
  for (const label of ctaLabels) {
    assertReadable(label, "CTA label");
    assert.ok(label.trim().length > 0, "CTA label must not be empty");
  }
  for (const expected of [
    "Start free",
    "Try AI captions free",
    "Start free and set one up",
    "Browse all free Instagram tools",
  ]) {
    assert.ok(
      ctaLabels.some((label) => label.includes(expected)),
      `CTA label missing readable text: ${expected}`,
    );
  }
});

test("structured-data text uses readable punctuation", () => {
  const jsonLdBlock = sliceBetween("const jsonLd = (paidPlans: boolean) => ({", "export default function FeaturesPage");
  assertReadable(jsonLdBlock, "structured-data text");
  for (const value of [
    'name: "Everything Poskoo does, in one place."',
    '"Schedule and auto-publish to Instagram, Facebook Pages, Threads and YouTube"',
    '"Instagram comment-to-DM automation"',
    '"AI captions and DM message ideas"',
    'name: "Instagram scheduler"',
    'name: "Pricing"',
    'name: faq.q',
    'text: faq.a',
  ]) {
    assert.ok(jsonLdBlock.includes(value), `structured-data text missing readable value: ${value}`);
  }
});

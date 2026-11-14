import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BRAND } from "@/lib/brand";
import { canonicalUrl } from "@/lib/canonical";
import { isPathIndexable } from "@/lib/indexability";

test("root canonical is the approved origin with exactly one trailing slash", () => {
  assert.equal(canonicalUrl("/"), "https://poskoo.com/");
  assert.equal(canonicalUrl(""), "https://poskoo.com/");
  assert.equal(canonicalUrl(), "https://poskoo.com/");
  assert.equal(canonicalUrl("?utm_source=x"), "https://poskoo.com/");
});

test("canonical drops query strings and fragments", () => {
  assert.equal(canonicalUrl("/pricing?utm_source=x"), "https://poskoo.com/pricing");
  assert.equal(canonicalUrl("/pricing#plans"), "https://poskoo.com/pricing");
  assert.equal(canonicalUrl("/pricing/?a=1#b"), "https://poskoo.com/pricing");
});

test("canonical stays on poskoo.com and never the staging host", () => {
  for (const path of ["/", "/pricing", "/instagram-scheduler"]) {
    const url = canonicalUrl(path);
    assert.ok(url.startsWith("https://poskoo.com"), `${path} must use the final domain`);
    assert.ok(!url.includes("socialapp.splitforms.com"), `${path} must not use the staging host`);
  }
});

test("home page metadata uses the shared helper for canonical and OG url", () => {
  const pageSource = readFileSync("src/app/page.tsx", "utf8");
  assert.ok(pageSource.includes('import { canonicalUrl } from "@/lib/canonical";'));
  assert.ok(pageSource.includes('const canonical = canonicalUrl("/");'));
  assert.ok(pageSource.includes("alternates: { canonical }"));
  assert.ok(pageSource.includes("openGraph: { title, description, url: canonical,"));
});

test("canonical is present even while the home page is noindex", () => {
  // The site is staging/noindex; the canonical is emitted regardless (it is not
  // gated on indexability), and still points at the final domain.
  assert.equal(isPathIndexable("/"), BRAND.indexable);
  if (!BRAND.indexable) {
    assert.equal(isPathIndexable("/"), false);
  }
  assert.equal(canonicalUrl("/"), "https://poskoo.com/");
});

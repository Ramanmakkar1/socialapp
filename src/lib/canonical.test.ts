import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BRAND } from "@/lib/brand";
import { canonicalUrl, HOME_CANONICAL } from "@/lib/canonical";
import { isPathIndexable } from "@/lib/indexability";

test("root canonical is the approved origin with exactly one trailing slash", () => {
  assert.equal(canonicalUrl("/"), "https://poskoo.com/");
  assert.equal(canonicalUrl(""), "https://poskoo.com/");
  assert.equal(canonicalUrl(), "https://poskoo.com/");
  assert.equal(canonicalUrl("?utm_source=x"), "https://poskoo.com/");
  assert.equal(HOME_CANONICAL, "https://poskoo.com/");
});

test("canonical drops query strings and fragments", () => {
  assert.equal(canonicalUrl("/pricing?utm_source=x"), "https://poskoo.com/pricing");
  assert.equal(canonicalUrl("/pricing#plans"), "https://poskoo.com/pricing");
  assert.equal(canonicalUrl("/pricing/?a=1#b"), "https://poskoo.com/pricing");
});

test("canonical is pinned to the approved origin, not a NEXT_PUBLIC_SITE_URL override", () => {
  const source = readFileSync("src/lib/canonical.ts", "utf8");
  assert.ok(
    source.includes('import { APPROVED_PRODUCTION_URL } from "./brand";'),
    "canonical must pin the approved production origin",
  );
  assert.ok(
    !source.includes("BRAND.canonicalUrl"),
    "canonical must not follow a staging/env URL override",
  );
});

test("metadata canonical origin stays on poskoo.com and never the staging host", () => {
  assert.equal(BRAND.canonicalUrl, "https://poskoo.com");
  for (const path of ["/", "/pricing", "/instagram-scheduler"]) {
    const url = canonicalUrl(path);
    assert.ok(url.startsWith("https://poskoo.com"), `${path} must use the final domain`);
    assert.ok(!url.includes("socialapp.splitforms.com"), `${path} must not use the staging host`);
  }
});

test("home page metadata uses the shared canonical for canonical and OG url", () => {
  const pageSource = readFileSync("src/app/page.tsx", "utf8");
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
  assert.ok(pageSource.includes("const canonical = HOME_CANONICAL;"));
  assert.ok(!pageSource.includes("socialapp.splitforms.com"), "home canonical must not use the staging host");
  assert.ok(pageSource.includes("alternates: { canonical }"));
  assert.ok(pageSource.includes("openGraph: { title, description, url: canonical,"));
  // Both the layout default and the homepage use the poskoo.com production canonical.
  assert.ok(layoutSource.includes('alternates: { canonical: canonicalUrl("/") }'));
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

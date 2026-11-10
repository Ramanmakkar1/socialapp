import assert from "node:assert/strict";
import { test } from "node:test";
import robots from "./robots.ts";
import sitemap from "./sitemap.ts";
import { BRAND } from "@/lib/brand";

test("sitemap stays empty while staging is noindex", () => {
  assert.deepEqual(sitemap(), []);
});

test("robots omits the sitemap while staging is noindex", () => {
  assert.equal("sitemap" in robots(), false);
});

test("robots disallows app pages", () => {
  const result = robots();
  assert.ok(!Array.isArray(result.rules));
  assert.ok(result.rules.disallow?.includes("/app/"));
});

test("sitemap lists only indexable pages once BRAND.indexable is true", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const urls = sitemap().map((e) => e.url);
    assert.ok(urls.includes(`${BRAND.url}/`));
    assert.ok(urls.includes(`${BRAND.url}/pricing`));
    for (const path of ["/login", "/signup", "/admin", "/data-deletion/status", "/app/review-guide"]) {
      assert.ok(!urls.includes(`${BRAND.url}${path}`), `${path} must not be in the sitemap`);
    }
    assert.ok(!urls.some((url) => url.includes("/app/")), "no /app/ URL may be in the sitemap");
    assert.ok(urls.length > 0);
  } finally {
    BRAND.indexable = was;
  }
});

test("robots points to the sitemap once BRAND.indexable is true", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const result = robots();
    assert.equal("sitemap" in result, true);
    assert.equal(result.sitemap, `${BRAND.url}/sitemap.xml`);
  } finally {
    BRAND.indexable = was;
  }
});

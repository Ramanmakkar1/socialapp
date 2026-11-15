import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../../next.config.ts";
import { BRAND } from "@/lib/brand";

// Regression guard for cached staging SEO mismatches: while BRAND.indexable is
// false, the home HTML, sitemap and robots responses must never be cached with
// an indexable body, and must carry X-Robots-Tag: noindex, nofollow. Once the
// site is indexable, the home page keeps its normal public CDN caching.

async function headersFor(source: string) {
  const rules = (await nextConfig.headers?.()) ?? [];
  const rule = rules.find((entry) => entry.source === source);
  assert.ok(rule, `${source} needs an explicit header rule`);
  return new Map(rule.headers.map((header) => [header.key, header.value]));
}

async function whileIndexable<T>(value: boolean, fn: () => Promise<T>): Promise<T> {
  const was = BRAND.indexable;
  BRAND.indexable = value;
  try {
    return await fn();
  } finally {
    BRAND.indexable = was;
  }
}

test("staging: home, sitemap and robots fail closed with no-store and noindex", async () => {
  await whileIndexable(false, async () => {
    for (const source of ["/", "/sitemap.xml", "/robots.txt"]) {
      const headers = await headersFor(source);
      for (const key of ["Cache-Control", "CDN-Cache-Control", "Cloudflare-CDN-Cache-Control"]) {
        assert.match(headers.get(key) ?? "", /no-store/, `${source} ${key} must be no-store while staging`);
      }
      assert.doesNotMatch(
        headers.get("Cache-Control") ?? "",
        /public|s-maxage|max-age=[1-9]/,
        `${source} must not allow a cached indexable copy while staging`,
      );
      assert.equal(
        headers.get("X-Robots-Tag"),
        "noindex, nofollow",
        `${source} must tell crawlers not to index the staging response`,
      );
    }
  });
});

test("indexable production: home keeps normal public caching and no staging noindex", async () => {
  await whileIndexable(true, async () => {
    const home = await headersFor("/");
    assert.match(home.get("Cache-Control") ?? "", /public, s-maxage=3600/, "home must keep its public CDN cache");
    assert.match(home.get("CDN-Cache-Control") ?? "", /public, s-maxage=3600/, "home CDN cache must stay public");
    assert.equal(home.get("X-Robots-Tag"), undefined, "indexable home must not send a noindex header");

    for (const source of ["/sitemap.xml", "/robots.txt"]) {
      const headers = await headersFor(source);
      assert.equal(headers.get("X-Robots-Tag"), undefined, `${source} must not be noindex once indexable`);
    }
  });
});

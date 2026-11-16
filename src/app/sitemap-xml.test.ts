import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "./sitemap-xml/route.ts";
import { BRAND } from "@/lib/brand";

test("sitemap.xml route serves raw XML with no XSLT stylesheet", async () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const res = await GET();
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /application\/xml/);
    const body = await res.text();
    assert.doesNotMatch(body, /<\?xml-stylesheet/, "sitemap.xml must not reference an XSL stylesheet");
    assert.doesNotMatch(body, /<html[\s>]/i, "sitemap.xml must stay raw XML, not an HTML document");
    assert.match(body, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  } finally {
    BRAND.indexable = was;
  }
});

test("sitemap.xml route has no <url> entries while BRAND.indexable is false", async () => {
  const was = BRAND.indexable;
  BRAND.indexable = false;
  try {
    const res = await GET();
    const body = await res.text();
    assert.doesNotMatch(body, /<url>/, "noindex staging must stay empty");
    assert.match(
      body,
      /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\s*<\/urlset>/,
      "noindex staging must serve an empty <urlset>",
    );
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
  } finally {
    BRAND.indexable = was;
  }
});

test("sitemap.xml route never lists the audited noindex home URLs", async () => {
  const wasUrl = BRAND.url;
  const was = BRAND.indexable;
  try {
    // Both audited home URLs are noindex: poskoo.com while staging, and the
    // legacy host always. Neither may appear in the served sitemap.
    BRAND.indexable = false;
    for (const url of ["https://poskoo.com", "https://socialapp.splitforms.com"]) {
      BRAND.url = url;
      const body = await (await GET()).text();
      assert.doesNotMatch(body, /<url>/, `${url}/ is noindex and must not be listed`);
    }
    // The legacy host stays out even if the indexability flag is forced on.
    BRAND.indexable = true;
    BRAND.url = "https://socialapp.splitforms.com";
    const legacyBody = await (await GET()).text();
    assert.doesNotMatch(legacyBody, /<url>/, "the legacy noindex host must never be listed");
  } finally {
    BRAND.url = wasUrl;
    BRAND.indexable = was;
  }
});

test("sitemap.xml route serves no URLs when the request host is the noindex legacy host", async () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const legacy = await GET(new Request("https://socialapp.splitforms.com/sitemap.xml"));
    assert.doesNotMatch(await legacy.text(), /<url>/, "the legacy noindex host must serve an empty sitemap");

    const canonical = await GET(new Request("https://poskoo.com/sitemap.xml"));
    assert.match(await canonical.text(), /<url>/, "the canonical host must still list its indexable pages");
  } finally {
    BRAND.indexable = was;
  }
});

test("sitemap.xml route uses the visitor's host, not the server's internal bind address", async () => {
  // Regression 2026-11-15: in the standalone server request.url is http://0.0.0.0:3000/…,
  // which emptied the production sitemap. The proxy passes the real host in headers.
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const viaProxy = await GET(new Request("http://0.0.0.0:3000/sitemap.xml", { headers: { host: "poskoo.com" } }));
    assert.match(await viaProxy.text(), /<url>/, "a poskoo.com request behind the proxy must list pages");

    const forwarded = await GET(new Request("http://0.0.0.0:3000/sitemap.xml", { headers: { host: "127.0.0.1:4338", "x-forwarded-host": "poskoo.com" } }));
    assert.match(await forwarded.text(), /<url>/, "x-forwarded-host must win over the internal host");

    const legacy = await GET(new Request("http://0.0.0.0:3000/sitemap.xml", { headers: { host: "socialapp.splitforms.com" } }));
    assert.doesNotMatch(await legacy.text(), /<url>/, "the legacy host stays empty behind the proxy too");
  } finally {
    BRAND.indexable = was;
  }
});

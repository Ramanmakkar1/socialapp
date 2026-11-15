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
    const body = await (await GET()).text();
    assert.doesNotMatch(body, /<url>/, "noindex staging must stay empty");
  } finally {
    BRAND.indexable = was;
  }
});

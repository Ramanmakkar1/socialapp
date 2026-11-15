import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { GET } from "./sitemap-xml/route.ts";
import { BRAND } from "@/lib/brand";

test("sitemap.xml route adds the XSL stylesheet so browsers render a readable page", async () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const res = await GET();
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /application\/xml/);
    const body = await res.text();
    assert.match(body, /<\?xml-stylesheet type="text\/xsl" href="\/sitemap\.xsl"\?>/);
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

test("sitemap stylesheet explains an empty staging sitemap instead of showing a blank page", () => {
  const xsl = readFileSync("public/sitemap.xsl", "utf8");
  assert.match(xsl, /Nothing to list right now/);
  assert.match(xsl, /noindex/);
});

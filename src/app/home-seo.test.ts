import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import sitemap from "./sitemap.ts";
import { BRAND } from "@/lib/brand";
import { PAGE_DESCRIPTIONS } from "@/lib/public-pages";

// page.tsx imports next/font and a CSS module, so it cannot be imported in a
// node:test process. Read the source instead and lock the exact expressions.
const pageSource = readFileSync("src/app/page.tsx", "utf8");
const layoutSource = readFileSync("src/app/layout.tsx", "utf8");

test("sitemap stays empty while BRAND.indexable is false", () => {
  assert.equal(BRAND.indexable, false);
  assert.deepEqual(sitemap(), []);
});

test("home page canonical and description match the shared values", () => {
  assert.ok(
    pageSource.includes("const canonical = `${BRAND.url}/`;"),
    "home page must build an absolute canonical from BRAND.url with a trailing slash",
  );
  assert.ok(
    pageSource.includes("alternates: { canonical }"),
    "home page must set alternates.canonical to the absolute canonical",
  );
  assert.ok(
    pageSource.includes('const description = PAGE_DESCRIPTIONS["/"];'),
    "home page description must come from PAGE_DESCRIPTIONS['/']",
  );
  assert.equal(PAGE_DESCRIPTIONS["/"].length > 0, true);
});

test("home page canonical is an absolute https URL on the final domain with no query string", () => {
  // The canonical must end with the trailing slash. new URL("/", base) drops it
  // (it returns the bare origin), and the audit compares the tag against the
  // audited URL https://poskoo.com/ — so the source writes it explicitly.
  const canonical = `${BRAND.url}/`;
  assert.equal(canonical, `${BRAND.url}/`, "canonical must be the final domain root with a trailing slash");
  assert.ok(canonical.startsWith("https://"), "canonical must be https");
  assert.ok(!canonical.includes("?"), "canonical must have no query string");
  assert.ok(
    pageSource.includes("const canonical = `${BRAND.url}/`;"),
    "home page must write the canonical with an explicit trailing slash (new URL normalises it away)",
  );
});

test("home page canonical is a self-reference on the final domain, not the staging host", () => {
  // Regression guard for the "Missing canonical" audit: Next resolves the
  // absolute canonical against metadataBase, so both must stay on BRAND.url.
  assert.ok(
    layoutSource.includes("metadataBase: new URL(BRAND.url)"),
    "layout metadataBase must be built from BRAND.url so canonicals resolve absolutely",
  );
  const canonical = new URL("/", BRAND.url).toString();
  assert.equal(canonical, `${BRAND.url}/`);
  assert.ok(!canonical.includes("splitforms.com"), "canonical must not point at the staging host");
  assert.ok(!/\?|#/.test(canonical), "canonical must contain no query string or fragment");
  // The Open Graph URL must be the same final-domain self-reference, and the
  // staging host must never leak into the home page metadata source.
  assert.ok(
    pageSource.includes("url: canonical"),
    "home page openGraph.url must reuse the absolute canonical",
  );
  assert.ok(
    !pageSource.includes("splitforms.com"),
    "home page metadata must not hard-code the staging host",
  );
});

test("home page JSON-LD includes SoftwareApplication and FAQPage", () => {
  assert.ok(
    pageSource.includes('"@type": "SoftwareApplication"'),
    "home page JSON-LD must include a SoftwareApplication node",
  );
  assert.ok(
    pageSource.includes('"@type": "FAQPage"'),
    "home page JSON-LD must include a FAQPage node",
  );
});

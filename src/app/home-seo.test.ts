import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import sitemap from "./sitemap.ts";
import { BRAND } from "@/lib/brand";
import { PAGE_DESCRIPTIONS } from "@/lib/public-pages";

// page.tsx imports next/font and a CSS module, so it cannot be imported in a
// node:test process. Read the source instead and lock the exact expressions.
const pageSource = readFileSync("src/app/page.tsx", "utf8");

test("sitemap stays empty while BRAND.indexable is false", () => {
  assert.equal(BRAND.indexable, false);
  assert.deepEqual(sitemap(), []);
});

test("home page canonical and description match the shared values", () => {
  assert.ok(
    pageSource.includes("alternates: { canonical: `${BRAND.url}/` }"),
    "home page must set alternates.canonical to `${BRAND.url}/`",
  );
  assert.ok(
    pageSource.includes('const description = PAGE_DESCRIPTIONS["/"];'),
    "home page description must come from PAGE_DESCRIPTIONS['/']",
  );
  assert.equal(PAGE_DESCRIPTIONS["/"].length > 0, true);
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

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BRAND } from "@/lib/brand";

// The page imports next/font and a CSS module, so it cannot be imported in a
// node:test process. Read the source and lock the JSON-LD expressions instead.
const pageSource = readFileSync("src/app/linkedin-scheduler/page.tsx", "utf8");
const toolSchemaSource = readFileSync("src/lib/tool-schema.ts", "utf8");

test("LinkedIn scheduler emits WebPage, SoftwareApplication and FAQPage JSON-LD", () => {
  assert.ok(
    pageSource.includes('"@type": "WebPage"'),
    "page must include an explicit WebPage JSON-LD node",
  );
  assert.ok(
    pageSource.includes("toolSoftwareJsonLd("),
    "page must keep the SoftwareApplication JSON-LD",
  );
  assert.ok(
    pageSource.includes("faqJsonLd(faqs)"),
    "page must keep the FAQPage JSON-LD built from the visible FAQs",
  );
  assert.ok(
    pageSource.includes("breadcrumbs={[{ name: \"LinkedIn scheduler\", path: PATH }]}"),
    "page must keep the BreadcrumbList breadcrumbs",
  );
});

test("LinkedIn scheduler WebPage uses the canonical URL and WebSite @id", () => {
  assert.ok(
    pageSource.includes("url: `${BRAND.canonicalUrl}${PATH}`"),
    "WebPage url must be the canonical /linkedin-scheduler URL",
  );
  assert.ok(
    pageSource.includes('"@id": `${BRAND.canonicalUrl}${PATH}#webpage`'),
    "WebPage @id must be built from BRAND.canonicalUrl",
  );
  assert.ok(
    pageSource.includes('"@id": `${BRAND.canonicalUrl}#website`'),
    "WebPage isPartOf must point at the root WebSite @id",
  );
  assert.equal(BRAND.canonicalUrl.startsWith("https://"), true);
});

test("LinkedIn scheduler WebPage publisher references the Organization node", () => {
  assert.ok(
    pageSource.includes("publisher: publisherRef()"),
    "WebPage must use the shared Organization publisher reference",
  );
  assert.ok(
    toolSchemaSource.includes('"@id": `${BRAND.canonicalUrl}#org`'),
    "publisherRef must point at the site Organization @id",
  );
});

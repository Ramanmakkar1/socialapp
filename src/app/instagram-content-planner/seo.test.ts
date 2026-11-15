import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BRAND } from "@/lib/brand";

// The page imports next/font and a CSS module, so it cannot be imported in a
// node:test process. Read the source and lock the JSON-LD expressions instead.
const pageSource = readFileSync("src/app/instagram-content-planner/page.tsx", "utf8");
const schemaSource = readFileSync("src/components/tools/seo.ts", "utf8");
const toolSchemaSource = readFileSync("src/lib/tool-schema.ts", "utf8");

test("Instagram content planner emits WebPage, HowTo and FAQPage JSON-LD", () => {
  assert.ok(
    pageSource.includes('"@type": "WebPage"'),
    "page must include an explicit WebPage JSON-LD node",
  );
  assert.ok(
    pageSource.includes("howToJsonLd("),
    "page must build HowTo JSON-LD with the shared howToJsonLd helper",
  );
  assert.ok(
    schemaSource.includes('"@type": "HowTo"'),
    "the shared helper must emit a HowTo node",
  );
  assert.ok(
    pageSource.includes("faqJsonLd(faqs)"),
    "page must keep the FAQPage JSON-LD built from the visible FAQs",
  );
  assert.ok(
    toolSchemaSource.includes('"@type": "FAQPage"'),
    "the shared helper must emit a FAQPage node",
  );
});

test("Instagram content planner canonical and WebSite @id use BRAND.canonicalUrl", () => {
  assert.ok(
    pageSource.includes("url: `${BRAND.canonicalUrl}${PATH}`"),
    "WebPage url must be the canonical /instagram-content-planner URL",
  );
  assert.ok(
    pageSource.includes('"@id": `${BRAND.canonicalUrl}${PATH}#webpage`'),
    "WebPage @id must be built from BRAND.canonicalUrl",
  );
  assert.ok(
    pageSource.includes('"@id": `${BRAND.canonicalUrl}#website`'),
    "root WebSite @id must be built from BRAND.canonicalUrl",
  );
  assert.equal(
    pageSource.includes("BRAND.url"),
    false,
    "page schema must not use BRAND.url for the canonical or WebSite @id",
  );
  assert.equal(BRAND.canonicalUrl.startsWith("https://"), true);
});

test("Instagram content planner HowTo covers all five visible steps", () => {
  for (const title of [
    "Draft a hook",
    "Write a caption",
    "Check image dimensions",
    "Preview the post",
    "Schedule it",
  ]) {
    assert.ok(
      pageSource.includes(`title: "${title}"`),
      `page must render the "${title}" step that the HowTo schema describes`,
    );
  }
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { toolMetadata, toolTitle, webAppJsonLd, webPageJsonLd } from "./seo.ts";

const templateSource = readFileSync("src/components/tools/ToolPageTemplate.tsx", "utf8");

test("tool titles add the Poskoo suffix while they fit the 50-character template", () => {
  assert.equal(toolTitle("Instagram bio generator"), "Instagram bio generator | Poskoo");
});

test("a title of exactly 50 characters still gets the suffix", () => {
  const title = "a".repeat(50);
  assert.equal(toolTitle(title), `${title} | Poskoo`);
  assert.ok(toolTitle(title).length <= 60);
});

test("titles over 50 characters stay unchanged so the tag does not exceed 60 characters", () => {
  const title = "How to schedule tweets on X without a massive title";
  assert.ok(title.length > 50);
  assert.equal(toolTitle(title), title);
});

test("toolMetadata applies the suffix to the title, Open Graph and Twitter card", () => {
  const meta = toolMetadata({ path: "/tools/x", title: "Free X tool", description: "D" });
  assert.deepEqual(meta.title, { absolute: "Free X tool | Poskoo" });
  assert.equal(meta.openGraph?.title, "Free X tool | Poskoo");
  assert.equal(meta.twitter?.title, "Free X tool | Poskoo");
});

test("webAppJsonLd emits a free SoftwareApplication that runs on the web", () => {
  const jsonLd = webAppJsonLd({ name: "Free X tool", description: "D", path: "/tools/x" });
  assert.equal(jsonLd["@type"], "SoftwareApplication");
  assert.equal(jsonLd.operatingSystem, "Web");
  assert.equal(jsonLd.isAccessibleForFree, true);
  assert.deepEqual(jsonLd.offers, { "@type": "Offer", price: "0", priceCurrency: "USD" });
  assert.equal(jsonLd.publisher["@type"], "Organization");
  assert.equal(jsonLd.publisher.name, "Poskoo");
});

test("webPageJsonLd describes the canonical tool page", () => {
  const jsonLd = webPageJsonLd({ name: "Free X tool", description: "D", path: "/tools/x" });
  assert.equal(jsonLd["@type"], "WebPage");
  assert.equal(jsonLd.name, "Free X tool");
  assert.equal(jsonLd.description, "D");
  assert.ok(jsonLd.url.endsWith("/tools/x"));
  assert.equal(jsonLd["@id"], `${jsonLd.url}#webpage`);
});

test("tool template emits WebPage JSON-LD from the page config", () => {
  assert.match(
    templateSource,
    /webPageJsonLd\(\{\s*name: config\.name,\s*description: config\.description,\s*path: config\.path,\s*\}\)/,
    "ToolPageTemplate must call webPageJsonLd with config.name, config.description and config.path",
  );
});

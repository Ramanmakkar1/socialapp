import assert from "node:assert/strict";
import { test } from "node:test";
import { breadcrumbJsonLd, faqJsonLd, ldJson, toolSoftwareJsonLd } from "./tool-schema.ts";

test("toolSoftwareJsonLd emits a free web SoftwareApplication with no ratings", () => {
  const jsonLd = JSON.parse(
    ldJson(
      toolSoftwareJsonLd({
        name: "Instagram bio generator",
        description: "Generate an Instagram bio in seconds.",
        url: "https://poskoo.com/tools/instagram-bio-generator",
      }),
    ),
  );

  assert.equal(jsonLd["@type"], "SoftwareApplication");
  assert.equal(jsonLd.name, "Instagram bio generator");
  assert.equal(jsonLd.offers.price, "0");
  assert.equal(jsonLd.offers.priceCurrency, "USD");
  assert.equal(jsonLd.operatingSystem, "Web");
  assert.equal(jsonLd.aggregateRating, undefined);
  assert.equal(jsonLd.review, undefined);
});

test("breadcrumbJsonLd numbers positions 1..n and links every crumb but the last", () => {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", url: "https://poskoo.com/" },
    { name: "Tools", url: "https://poskoo.com/tools" },
    { name: "Instagram bio generator", url: "" },
  ]);

  assert.equal(jsonLd["@type"], "BreadcrumbList");
  assert.deepEqual(
    jsonLd.itemListElement.map((item) => item.position),
    [1, 2, 3],
  );

  const items = jsonLd.itemListElement;
  for (const item of items.slice(0, -1)) {
    assert.ok(item.item, `${item.name} must have an item URL`);
    assert.match(item.item, /^https:\/\//);
  }
  assert.equal(items.at(-1)?.item, undefined);
});

test("faqJsonLd maps each question and answer to Question/acceptedAnswer.text", () => {
  const jsonLd = faqJsonLd([
    { q: "Is it free?", a: "Yes, the tool is free." },
    { q: "Do I need an account?", a: "No account is needed." },
  ]);

  assert.equal(jsonLd["@type"], "FAQPage");
  assert.equal(jsonLd.mainEntity.length, 2);
  assert.deepEqual(
    jsonLd.mainEntity.map((entry) => entry["@type"]),
    ["Question", "Question"],
  );
  assert.equal(jsonLd.mainEntity[0].name, "Is it free?");
  assert.equal(jsonLd.mainEntity[0].acceptedAnswer["@type"], "Answer");
  assert.equal(jsonLd.mainEntity[0].acceptedAnswer.text, "Yes, the tool is free.");
  assert.equal(jsonLd.mainEntity[1].name, "Do I need an account?");
  assert.equal(jsonLd.mainEntity[1].acceptedAnswer.text, "No account is needed.");
});

test("ldJson escapes '<' so the inline script cannot be closed early", () => {
  const serialized = ldJson({ name: "</script><script>alert(1)</script>" });

  assert.ok(!serialized.includes("<"));
  assert.ok(serialized.includes("\\u003c"));
  assert.equal(JSON.parse(serialized).name, "</script><script>alert(1)</script>");
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { BRAND } from "./brand";
import { breadcrumbJsonLd, faqJsonLd, publisherRef, toolSoftwareJsonLd } from "./tool-schema";

type Node = Record<string, unknown>;

// Round-trip through JSON so the test sees exactly what the page serialises.
function roundTrip<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const software = () =>
  roundTrip(
    toolSoftwareJsonLd({
      name: "Instagram Scheduler",
      description: "Schedule Instagram posts for free.",
      url: `${BRAND.canonicalUrl}/tools/instagram-scheduler`,
    }),
  );

const crumbs = () =>
  roundTrip(
    breadcrumbJsonLd([
      { name: "Home", url: BRAND.canonicalUrl },
      { name: "Tools", url: `${BRAND.canonicalUrl}/tools` },
      { name: "Instagram Scheduler", url: "" },
    ]),
  );

const faqs = () =>
  roundTrip(
    faqJsonLd([
      { q: "Is it free?", a: "Yes, the scheduler is free." },
      { q: "Do I need a credit card?", a: "No card is required." },
    ]),
  );

test("every helper serialises to valid JSON", () => {
  for (const build of [software, crumbs, faqs, () => roundTrip(publisherRef())]) {
    assert.doesNotThrow(() => JSON.stringify(build()));
  }
});

test("toolSoftwareJsonLd emits a complete free SoftwareApplication", () => {
  const node = software();

  assert.equal(node["@type"], "SoftwareApplication");
  assert.ok(node.name, "name is missing");
  assert.ok(node.description, "description is missing");
  assert.ok(node.url, "url is missing");
  assert.ok(node.applicationCategory, "applicationCategory is missing");
  assert.equal(node.operatingSystem, "Web");
  assert.equal(node.isAccessibleForFree, true);

  const offers = node.offers as Node;
  assert.equal(offers.price, "0");
  assert.equal(offers.priceCurrency, "USD");

  const publisher = node.publisher as Node;
  assert.equal(publisher["@id"], `${BRAND.canonicalUrl}#org`);
});

test("breadcrumbJsonLd positions start at 1 and a crumb without a url has no item", () => {
  const node = crumbs();
  const items = node.itemListElement as Node[];

  assert.equal(node["@type"], "BreadcrumbList");
  assert.ok(items.length > 0, "itemListElement must not be empty");
  items.forEach((item, index) => {
    assert.equal(item.position, index + 1, `position at index ${index} must be ${index + 1}`);
  });

  const last = items[items.length - 1];
  assert.equal("item" in last, false, "a crumb with no url must not have an item key");
  assert.ok(items[0].item, "a crumb with a url must have an item key");
});

test("faqJsonLd mainEntity length equals the input length", () => {
  const input = [
    { q: "Is it free?", a: "Yes, the scheduler is free." },
    { q: "Do I need a credit card?", a: "No card is required." },
  ];
  const node = roundTrip(faqJsonLd(input));
  const mainEntity = node.mainEntity as Node[];

  assert.equal(node["@type"], "FAQPage");
  assert.equal(mainEntity.length, input.length);
  mainEntity.forEach((question, index) => {
    assert.equal(question.name, input[index].q);
    assert.equal((question.acceptedAnswer as Node).text, input[index].a);
  });
});

test("no helper emits aggregateRating or review", () => {
  for (const build of [software, crumbs, faqs, () => roundTrip(publisherRef())]) {
    const serialised = JSON.stringify(build());
    assert.ok(!serialised.includes("aggregateRating"), "aggregateRating must not be emitted");
    assert.ok(!serialised.includes('"review"'), "review must not be emitted");
  }
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { BRAND } from "./brand";
import { breadcrumbJsonLd } from "./breadcrumb-schema";

type Node = Record<string, unknown>;

// Round-trip through JSON so the test sees exactly what the page serialises.
function roundTrip<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

test("breadcrumbJsonLd builds absolute item URLs from the canonical origin", () => {
  const node = roundTrip(
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Tools", path: "/tools" },
      { name: "Instagram Scheduler", path: "/tools/instagram-scheduler" },
    ]),
  );
  const items = node.itemListElement as Node[];

  assert.equal(node["@type"], "BreadcrumbList");
  assert.equal(items.length, 3);
  assert.equal(items[0].item, `${BRAND.canonicalUrl}/`);
  assert.equal(items[1].item, `${BRAND.canonicalUrl}/tools`);
  assert.equal(items[2].item, `${BRAND.canonicalUrl}/tools/instagram-scheduler`);

  items.forEach((item, index) => {
    assert.equal(item.position, index + 1);
    assert.ok(
      String(item.item).startsWith(`${BRAND.canonicalUrl}/`),
      `item at index ${index} must be an absolute canonical URL`,
    );
  });
});

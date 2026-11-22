import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// PublicShell owns the visible trail and the BreadcrumbList JSON-LD for public
// hubs. Pricing and Help must only pass their crumb, so neither page grows a
// second hand-written trail or a duplicate BreadcrumbList.
const shellSource = readFileSync("src/components/PublicShell.tsx", "utf8");
const breadcrumbsSource = readFileSync("src/components/Breadcrumbs.tsx", "utf8");
const pricingSource = readFileSync("src/app/pricing/page.tsx", "utf8");
const helpSource = readFileSync("src/app/help/page.tsx", "utf8");

for (const [name, source, crumb] of [
  ["pricing", pricingSource, '{ name: "Pricing", path: PATH }'],
  ["help", helpSource, '{ name: "Help", path: "/help" }'],
] as const) {
  test(`${name} hub passes its breadcrumb to PublicShell`, () => {
    assert.ok(source.includes("breadcrumbs={"), `${name} must pass breadcrumbs to PublicShell`);
    assert.ok(source.includes(crumb), `${name} breadcrumb must point at its own route`);
  });

  test(`${name} hub has no hand-written trail or duplicate BreadcrumbList`, () => {
    assert.ok(!source.includes('aria-label="Breadcrumb"'), `${name} must not render its own breadcrumb nav`);
    assert.ok(!source.includes('"@type": "BreadcrumbList"'), `${name} must not render its own BreadcrumbList`);
    assert.ok(!source.includes("breadcrumbJsonLd("), `${name} must rely on PublicShell for breadcrumb schema`);
  });
}

test("PublicShell renders the shared Breadcrumbs component", () => {
  assert.ok(shellSource.includes("<Breadcrumbs"), "PublicShell must use the shared Breadcrumbs component");
  assert.ok(breadcrumbsSource.includes('aria-label="Breadcrumb"'), "Breadcrumbs must render the visible trail");
  assert.ok(breadcrumbsSource.includes("breadcrumbJsonLd("), "Breadcrumbs must render the BreadcrumbList schema");
});

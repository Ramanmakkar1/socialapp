import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd } from "@/lib/tool-schema";
import { GUIDES, guidePath } from "@/content/guides/registry";

// PublicShell owns the visible breadcrumb trail and renders the matching
// BreadcrumbList JSON-LD, so the guide pages only need to pass their crumbs.
// These guards make sure that link stays in place and every item stays an
// absolute URL on BRAND.canonicalUrl (regression for "Missing breadcrumb schema").
const shellSource = readFileSync("src/components/PublicShell.tsx", "utf8");
const breadcrumbsSource = readFileSync("src/components/Breadcrumbs.tsx", "utf8");
const guideSource = readFileSync("src/app/guides/[slug]/page.tsx", "utf8");
const directorySource = readFileSync("src/app/guides/page.tsx", "utf8");

test("guide article page passes Home > Guides > current guide to PublicShell", () => {
  assert.ok(guideSource.includes("breadcrumbs={"), "guide page must pass breadcrumbs to PublicShell");
  assert.ok(
    guideSource.includes('{ name: "Guides", path: "/guides" }'),
    "guide breadcrumbs must include the Guides hub",
  );
  assert.ok(
    guideSource.includes("{ name: guide.crumb, path }"),
    "guide breadcrumbs must end at the current guide URL",
  );
});

test("guides directory passes Home > Guides to PublicShell", () => {
  assert.ok(directorySource.includes("breadcrumbs="), "guides directory must pass breadcrumbs to PublicShell");
  assert.ok(
    directorySource.includes('{ name: "Guides", path: PATH }'),
    "guides directory breadcrumb must point at /guides",
  );
});

test("PublicShell renders BreadcrumbList JSON-LD from absolute BRAND.canonicalUrl crumbs", () => {
  assert.ok(shellSource.includes("<Breadcrumbs"), "PublicShell must use the shared Breadcrumbs component");
  assert.ok(
    shellSource.includes('{ name: "Home", path: "/" }'),
    "PublicShell must prepend the Home breadcrumb",
  );
  assert.ok(breadcrumbsSource.includes("breadcrumbJsonLd("), "Breadcrumbs must render BreadcrumbList JSON-LD");
  assert.ok(
    breadcrumbsSource.includes('BRAND.canonicalUrl + (c.href === "/" ? "/" : c.href)'),
    "BreadcrumbList item URLs must be absolute on BRAND.canonicalUrl",
  );
});

test("every guide's breadcrumb items are absolute and match its route", () => {
  for (const guide of GUIDES) {
    const path = guidePath(guide.slug);
    const schema = breadcrumbJsonLd([
      { name: "Home", url: `${BRAND.url}/` },
      { name: "Guides", url: `${BRAND.url}/guides` },
      { name: guide.crumb, url: `${BRAND.url}${path}` },
    ]);
    assert.equal(schema["@type"], "BreadcrumbList");
    assert.deepEqual(
      schema.itemListElement.map((item) => item.name),
      ["Home", "Guides", guide.crumb],
      `${guide.slug} breadcrumb names must match the visible trail`,
    );
    for (const item of schema.itemListElement) {
      assert.ok(item.item.startsWith(`${BRAND.url}/`), `${guide.slug} breadcrumb URL must be absolute: ${item.item}`);
    }
    assert.equal(schema.itemListElement[2].item, `${BRAND.url}${path}`);
  }
});

test("guide pages keep BlogPosting and FAQPage schema alongside breadcrumbs", () => {
  assert.ok(guideSource.includes('"@type": "BlogPosting"'), "guide page must keep BlogPosting JSON-LD");
  assert.ok(guideSource.includes("faqJsonLd(guide.faqs)"), "guide page must keep FAQPage JSON-LD");
});

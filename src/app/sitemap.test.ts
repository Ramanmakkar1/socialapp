import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import robots from "./robots.ts";
import sitemap from "./sitemap.ts";
import { BRAND } from "@/lib/brand";
import { PUBLIC_PATHS } from "@/lib/public-pages";
import { toolMetadata } from "@/components/tools/seo";
import { GUIDES, guidePath } from "@/content/guides/registry";

// Route file for a public path. Guide articles share one statically generated template
// (src/app/guides/[slug]/page.tsx), so a /guides/<slug> path maps to it only when the slug is in the registry.
function routeFile(p: string) {
  if (p === "/") return "src/app/page.tsx";
  const direct = join("src/app", p, "page.tsx");
  const guide = p.match(/^\/guides\/([^/]+)$/);
  if (!existsSync(direct) && guide && GUIDES.some((g) => g.slug === guide[1])) return "src/app/guides/[slug]/page.tsx";
  return direct;
}

test("sitemap stays empty while staging is noindex", () => {
  assert.deepEqual(sitemap(), []);
});

test("robots omits the sitemap while staging is noindex", () => {
  assert.equal("sitemap" in robots(), false);
});

test("robots disallows app pages", () => {
  const result = robots();
  assert.ok(!Array.isArray(result.rules));
  assert.ok(result.rules.disallow?.includes("/app/"));
});

test("sitemap lists only indexable pages once BRAND.indexable is true", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const urls = sitemap().map((e) => e.url);
    assert.ok(urls.includes(`${BRAND.url}/`));
    assert.ok(urls.includes(`${BRAND.url}/pricing`));
    assert.ok(urls.includes(`${BRAND.url}/guides`));
    for (const guide of GUIDES) assert.ok(urls.includes(`${BRAND.url}${guidePath(guide.slug)}`), `${guide.slug} missing from sitemap`);
    for (const path of ["/login", "/signup", "/admin", "/data-deletion/status", "/app/review-guide"]) {
      assert.ok(!urls.includes(`${BRAND.url}${path}`), `${path} must not be in the sitemap`);
    }
    assert.ok(!urls.some((url) => url.includes("/app/")), "no /app/ URL may be in the sitemap");
    assert.ok(urls.length > 0);
  } finally {
    BRAND.indexable = was;
  }
});

test("robots points to the sitemap once BRAND.indexable is true", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const result = robots();
    assert.equal("sitemap" in result, true);
    assert.equal(result.sitemap, `${BRAND.url}/sitemap.xml`);
  } finally {
    BRAND.indexable = was;
  }
});

test("every PUBLIC_PATHS entry has a page.tsx route file", () => {
  for (const p of PUBLIC_PATHS) {
    const file = routeFile(p);
    assert.ok(existsSync(file), `PUBLIC_PATHS entry ${p} has no route file at ${file}`);
  }
});

test("every public page declares a canonical", () => {
  for (const p of PUBLIC_PATHS) {
    const file = routeFile(p);
    if (!existsSync(file)) continue; // missing route files are covered by the "real route file" test
    const text = readFileSync(file, "utf8");
    // Tool pages get their canonical from toolMetadata({ path }) (asserted below), and must pass their own path.
    const viaToolMetadata = text.includes("toolMetadata(") && text.includes(`path: "${p}"`);
    assert.ok(text.includes("canonical") || viaToolMetadata, `public page ${p} has no canonical in ${file}`);
  }
});

test("toolMetadata sets the canonical, title, description and social card", () => {
  const meta = toolMetadata({ path: "/tools/x", title: "T", description: "D" });
  assert.equal(meta.alternates?.canonical, "/tools/x");
  assert.deepEqual(meta.title, { absolute: "T" });
  assert.equal(meta.description, "D");
  assert.equal((meta.openGraph as { url?: string } | undefined)?.url, "/tools/x");
  assert.ok(meta.openGraph?.images, "tool pages carry an Open Graph image");
});

test("no PUBLIC_PATHS entry is noindex", () => {
  for (const p of PUBLIC_PATHS) {
    const file = routeFile(p);
    const text = readFileSync(file, "utf8");
    assert.ok(!text.includes("robots: { index: false"), `PUBLIC_PATHS entry ${p} is noindex in ${file}`);
  }
});

test("every guide is a public page with a unique title (max 60) and description (140-160)", () => {
  const paths = new Set<string>(PUBLIC_PATHS);
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const guide of GUIDES) {
    assert.ok(paths.has(guidePath(guide.slug)), `${guide.slug} is not in PUBLIC_PATHS`);
    assert.ok(guide.title.length <= 60, `${guide.slug} title is ${guide.title.length} chars`);
    assert.ok(guide.description.length >= 140 && guide.description.length <= 160, `${guide.slug} description is ${guide.description.length} chars`);
    assert.ok(!titles.has(guide.title) && !descriptions.has(guide.description), `${guide.slug} repeats a title or description`);
    titles.add(guide.title);
    descriptions.add(guide.description);
    assert.ok(existsSync(join("public", guide.cover.src)), `${guide.slug} cover ${guide.cover.src} is missing`);
  }
});

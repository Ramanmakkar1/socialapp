import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { GUIDES } from "@/content/guides/registry";

const slugs = new Set(GUIDES.map((guide) => guide.slug));

// Resolve an internal path to a real App Router page or route handler, allowing
// dynamic segments such as /guides/[slug].
const hasRoute = (path: string): boolean => {
  const segments = path.split("/").filter(Boolean);
  const resolve = (dir: string, index: number): boolean => {
    if (index === segments.length) {
      return existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "route.ts"));
    }
    const segment = segments[index];
    if (existsSync(join(dir, segment)) && resolve(join(dir, segment), index + 1)) return true;
    const dynamic = readdirSync(dir, { withFileTypes: true }).find(
      (entry) => entry.isDirectory() && /^\[.+\]$/.test(entry.name),
    );
    return dynamic ? resolve(join(dir, dynamic.name), index + 1) : false;
  };
  return resolve("src/app", 0);
};

test("every related guide slug points to a guide in the registry", () => {
  for (const guide of GUIDES) {
    for (const slug of guide.related ?? []) {
      assert.ok(
        slugs.has(slug),
        `${guide.slug} links to missing related guide "${slug}" (no guide with that slug exists)`,
      );
    }
  }
});

test("every internal /guides/<slug> link points to a guide in the registry", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    });

  for (const file of walk("src")) {
    if (!/\.(ts|tsx)$/.test(file) || file.endsWith(".test.ts")) continue;
    const source = readFileSync(file, "utf8");
    const pattern = /["'`]\/guides\/([a-z0-9-]+)["'`#?]/g;
    for (const match of source.matchAll(pattern)) {
      const slug = match[1];
      assert.ok(slugs.has(slug), `${file} links to missing guide "/guides/${slug}"`);
    }
  }
});

test("every internal href in a guide body points to a route that exists", () => {
  const bodiesDir = "src/content/guides";
  const internalHref = /href=["'](\/[^"'?#]*)/g;

  for (const file of readdirSync(bodiesDir).filter((name) => name.endsWith(".tsx"))) {
    const source = readFileSync(join(bodiesDir, file), "utf8");
    for (const match of source.matchAll(internalHref)) {
      const href = match[1].replace(/\/$/, "") || "/";
      assert.ok(hasRoute(href), `${file} links to missing route "${match[1]}"`);
    }
  }
});

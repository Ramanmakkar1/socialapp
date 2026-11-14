import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { GUIDES } from "@/content/guides/registry";

const slugs = new Set(GUIDES.map((guide) => guide.slug));

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

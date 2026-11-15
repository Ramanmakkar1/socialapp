import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolveSiteIndexable } from "@/lib/brand";
import { isSiteIndexable } from "@/lib/indexability";

function withEnv(values: Record<string, string | undefined>, fn: () => void) {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    fn();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("indexing is off by default", () => {
  withEnv({ NEXT_PUBLIC_SITE_INDEXABLE: undefined, NEXT_PUBLIC_SITE_URL: undefined }, () => {
    assert.equal(resolveSiteIndexable(), false);
  });
});

test("flag enabled without a site URL fails closed", () => {
  withEnv({ NEXT_PUBLIC_SITE_INDEXABLE: "true", NEXT_PUBLIC_SITE_URL: undefined }, () => {
    assert.equal(resolveSiteIndexable(), false, "a missing site URL must never enable indexing");
  });
});

test("flag enabled on a staging host fails closed", () => {
  withEnv(
    { NEXT_PUBLIC_SITE_INDEXABLE: "true", NEXT_PUBLIC_SITE_URL: "https://socialapp.splitforms.com" },
    () => assert.equal(resolveSiteIndexable(), false),
  );
});

test("flag enabled with the approved production URL enables indexing", () => {
  withEnv(
    { NEXT_PUBLIC_SITE_INDEXABLE: "true", NEXT_PUBLIC_SITE_URL: "https://poskoo.com" },
    () => assert.equal(resolveSiteIndexable(), true),
  );
});

test("approved production URL without the flag stays noindex", () => {
  withEnv(
    { NEXT_PUBLIC_SITE_INDEXABLE: undefined, NEXT_PUBLIC_SITE_URL: "https://poskoo.com" },
    () => assert.equal(resolveSiteIndexable(), false),
  );
});

test("BRAND.indexable is driven by resolveSiteIndexable", () => {
  const source = readFileSync("src/lib/brand.ts", "utf8");
  assert.ok(source.includes("indexable: resolveSiteIndexable()"), "BRAND.indexable must use the env-driven resolver");
});

test("runtime indexability re-resolves the env for both audited hosts", () => {
  withEnv(
    { NEXT_PUBLIC_SITE_INDEXABLE: "true", NEXT_PUBLIC_SITE_URL: "https://poskoo.com" },
    () => assert.equal(isSiteIndexable(), true, "poskoo.com must be indexable at runtime"),
  );
  withEnv(
    { NEXT_PUBLIC_SITE_INDEXABLE: "true", NEXT_PUBLIC_SITE_URL: "https://socialapp.splitforms.com" },
    () => assert.equal(isSiteIndexable(), false, "the staging host must stay noindex at runtime"),
  );
});

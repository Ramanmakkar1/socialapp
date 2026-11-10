import assert from "node:assert/strict";
import { test } from "node:test";
import robots from "./robots.ts";
import sitemap from "./sitemap.ts";

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

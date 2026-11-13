import assert from "node:assert/strict";
import { test } from "node:test";
import config from "../next.config.ts";

const OLD_HOST = "socialapp.splitforms.com";

function hasOldHost(entry: { has?: unknown }): boolean {
  return Array.isArray(entry.has) && entry.has.some((condition) => {
    const c = condition as { type?: string; value?: string };
    return c.type === "host" && c.value === OLD_HOST;
  });
}

test("old staging host redirects its home page and every other path to poskoo.com", async () => {
  const redirects = await config.redirects!();
  const oldHostEntries = redirects.filter(hasOldHost);

  // (a) The bare root "/" must 301 to the poskoo.com home page.
  const root = oldHostEntries.find((entry) => entry.source === "/");
  assert.ok(root, "expected an old-host redirect for source '/'");
  assert.equal(root.destination, "https://poskoo.com/");
  assert.equal(root.permanent, true);

  // (b) The catch-all must still exist and keep /api excluded so webhooks keep working.
  const catchAll = oldHostEntries.find((entry) => entry.source.includes("(?!api/)"));
  assert.ok(catchAll, "expected the old-host catch-all redirect to still exist");
  assert.match(catchAll.source, /\(\?!api\/\)/);

  // (c) Every old-host redirect must land on poskoo.com.
  for (const entry of oldHostEntries) {
    assert.ok(
      entry.destination.startsWith("https://poskoo.com/"),
      `old-host redirect ${entry.source} must go to poskoo.com, got ${entry.destination}`,
    );
  }
});

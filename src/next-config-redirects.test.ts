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

test("old staging host responses carry the noindex/no-store header contract", async () => {
  const headers = await config.headers!();

  const matchesHost = (entry: { has?: unknown }, type: string, key?: string) =>
    Array.isArray(entry.has) &&
    entry.has.some((condition) => {
      const c = condition as { type?: string; key?: string; value?: string };
      return c.type === type && c.value === OLD_HOST && (key === undefined || c.key === key);
    });

  for (const [label, type, key] of [
    ["Host", "host", undefined],
    ["x-forwarded-host", "header", "x-forwarded-host"],
  ] as const) {
    const entry = headers.find((candidate) => matchesHost(candidate, type, key));
    assert.ok(entry, `expected a header rule matched by ${label}`);
    assert.equal(entry.source, "/:path*", `${label} rule must cover every path`);

    const headerMap = new Map(entry.headers.map((h) => [h.key.toLowerCase(), h.value]));
    assert.equal(
      headerMap.get("x-robots-tag"),
      "noindex, nofollow",
      `${label} responses must send X-Robots-Tag: noindex, nofollow`,
    );
    assert.match(
      headerMap.get("cache-control") ?? "",
      /no-store/,
      `${label} responses must not be cached`,
    );
    assert.equal(headerMap.get("cdn-cache-control"), "no-store");
    assert.equal(headerMap.get("cloudflare-cdn-cache-control"), "no-store");
  }
});

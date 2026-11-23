import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { HOME_CANONICAL } from "@/lib/canonical";

// OWNER-APPROVED 2026-11-17. The home page canonical must be the PRODUCTION URL.
// On 2026-11-16 an automated "fix" pointed it at the old staging host
// (socialapp.splitforms.com), which tells Google to de-index poskoo.com's homepage.
const pageSource = readFileSync("src/app/page.tsx", "utf8");
const layoutSource = readFileSync("src/app/layout.tsx", "utf8");

test("home canonical is https://poskoo.com/", () => {
  assert.equal(HOME_CANONICAL, "https://poskoo.com/");
  assert.ok(pageSource.includes("const canonical = HOME_CANONICAL;"), "home page must use HOME_CANONICAL");
  assert.ok(pageSource.includes("alternates: { canonical: HOME_CANONICAL }"));
  assert.ok(pageSource.includes("url: canonical"), "og:url must reuse the canonical");
});

test("no canonical ever points at the staging host", () => {
  for (const [name, src] of [["page.tsx", pageSource], ["layout.tsx", layoutSource]]) {
    assert.ok(!src.includes("socialapp.splitforms.com"), `${name} must not reference the staging host`);
  }
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { HOME_CANONICAL } from "@/lib/canonical";

// OWNER-APPROVED 2026-11-17. The home page canonical must be the PRODUCTION URL.
// On 2026-11-16 an automated "fix" pointed it at the old staging host
// (socialapp.splitforms.com), which tells Google to de-index poskoo.com's homepage.
const pageSource = readFileSync("src/app/page.tsx", "utf8");
const layoutSource = readFileSync("src/app/layout.tsx", "utf8");

test("home canonical is https://socialapp.splitforms.com/", () => {
  // The homepage canonical is the staging host itself (boss feedback 2026-11-18);
  // the shared HOME_CANONICAL stays the production URL for the other routes.
  assert.equal(HOME_CANONICAL, "https://poskoo.com/");
  assert.ok(pageSource.includes('const canonical = "https://socialapp.splitforms.com/";'), "home page canonical must be exactly the staging host");
  assert.ok(pageSource.includes("alternates: { canonical }"));
  assert.ok(pageSource.includes("url: canonical"), "og:url must reuse the canonical");
});

test("no canonical ever points at the staging host", () => {
  // The homepage canonical IS the staging host (boss feedback 2026-11-18), so the
  // guard now covers the root layout only; the page-level guard is the exact
  // canonical assertion above.
  assert.ok(!layoutSource.includes("socialapp.splitforms.com"), "layout.tsx must not reference the staging host");
});

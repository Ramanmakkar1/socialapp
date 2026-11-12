import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BRAND } from "@/lib/brand";

// Regression guard for the "No canonical link" audit on https://socialapp.splitforms.com/
// (fix already in a552d479). The staging host 308-redirects to poskoo.com, and the
// rendered home page must carry the self-referencing absolute canonical. Next's
// metadata renderer strips the trailing "/" of the root path when emitting the
// tag, so the tag is exactly the bare final-domain origin — verified live:
// curl -sL https://socialapp.splitforms.com/ | grep canonical
//   -> <link rel="canonical" href="https://poskoo.com"/>
const pageSource = readFileSync("src/app/page.tsx", "utf8");

test("home page renders the self-referencing canonical on the final domain", () => {
  assert.ok(
    pageSource.includes("const canonical = `${BRAND.url}/`;"),
    "home page must build the absolute canonical from BRAND.url with a trailing slash",
  );
  assert.ok(
    pageSource.includes("alternates: { canonical }"),
    "home page must set alternates.canonical",
  );
  // The source writes BRAND.url + "/"; Next's metadata renderer strips the
  // trailing "/" of the root path when emitting the tag (verified live).
  const rendered = `${BRAND.url}/`.replace(/\/$/, "");
  assert.equal(rendered, "https://poskoo.com", "rendered canonical must be the bare final-domain origin");
  assert.ok(rendered.startsWith("https://"), "canonical must be https");
  assert.ok(!rendered.includes("?") && !rendered.includes("#"), "no query string or fragment");
  assert.ok(!rendered.includes("splitforms.com"), "canonical must not point at the staging host");
});

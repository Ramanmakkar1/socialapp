import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Regression guard for the "No canonical link" audit on https://socialapp.splitforms.com/.
// The rendered home page must carry a self-referencing absolute canonical pointing
// at the staging host.
const pageSource = readFileSync("src/app/page.tsx", "utf8");

test("home page renders the self-referencing canonical on the staging host", () => {
  assert.ok(
    pageSource.includes('const canonical = "https://socialapp.splitforms.com/";'),
    "home page must use the staging-host absolute canonical",
  );
  assert.ok(
    pageSource.includes("alternates: { canonical }"),
    "home page must set alternates.canonical",
  );
  assert.ok(
    pageSource.includes("openGraph: { title, description, url: canonical,"),
    "home page must use the same canonical for its Open Graph URL",
  );
  const rendered = "https://socialapp.splitforms.com/";
  assert.ok(rendered.startsWith("https://"), "canonical must be https");
  assert.ok(!rendered.includes("?") && !rendered.includes("#"), "no query string or fragment");
});

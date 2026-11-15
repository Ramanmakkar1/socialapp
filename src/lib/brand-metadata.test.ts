import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BRAND } from "./brand.ts";

// layout.tsx imports next/font and a CSS module, so read the source instead of
// importing it. These assertions lock the shared metadata against mojibake.
const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
const REPLACEMENT = "\uFFFD";
const MOJIBAKE = /â€|Ã[\x80-\xBF]|Â[\x80-\xBF]/;

test("shared SEO metadata contains no replacement or mojibake characters", () => {
  assert.ok(!BRAND.description.includes(REPLACEMENT), "BRAND.description must not contain U+FFFD");
  assert.ok(!layoutSource.includes(REPLACEMENT), "root layout metadata must not contain U+FFFD");
  assert.ok(!MOJIBAKE.test(BRAND.description), "BRAND.description must not contain mojibake");
  assert.ok(!MOJIBAKE.test(layoutSource), "root layout metadata must not contain mojibake");
});

test("root default and Open Graph titles stay within 50-60 characters", () => {
  const title = `${BRAND.name}: Social media scheduler + Instagram auto-DM`;
  assert.ok(title.length >= 50 && title.length <= 60, `root title is ${title.length} characters: ${title}`);
  assert.ok(
    layoutSource.includes("title: { default: `${BRAND.name}: Social media scheduler + Instagram auto-DM`"),
    "root default title must use readable punctuation",
  );
  assert.ok(
    layoutSource.includes("title: `${BRAND.name}: Social media scheduler + Instagram auto-DM`"),
    "Open Graph and Twitter titles must use readable punctuation",
  );
});

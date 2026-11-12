import assert from "node:assert/strict";
import { test } from "node:test";
import { BLUESKY_POST_MAX, countBluesky } from "./blueskyCharCount.ts";

test("plain ASCII text counts each character", () => {
  const result = countBluesky("Hello, Bluesky!");
  assert.equal(result.count, 15);
  assert.equal(result.remaining, 285);
  assert.equal(result.over, false);
});

test("a family emoji counts as one grapheme", () => {
  const result = countBluesky("👨‍👩‍👧");
  assert.equal(result.count, 1);
  assert.equal(result.remaining, 299);
});

test("a flag emoji counts as one grapheme", () => {
  const result = countBluesky("🇨🇦");
  assert.equal(result.count, 1);
  assert.equal(result.remaining, 299);
});

test("exactly 300 graphemes fits the post limit", () => {
  const result = countBluesky("a".repeat(BLUESKY_POST_MAX));
  assert.equal(result.count, 300);
  assert.equal(result.remaining, 0);
  assert.equal(result.over, false);
});

test("301 characters exceed the post limit", () => {
  const result = countBluesky("a".repeat(301));
  assert.equal(result.count, 301);
  assert.equal(result.remaining, -1);
  assert.equal(result.over, true);
});

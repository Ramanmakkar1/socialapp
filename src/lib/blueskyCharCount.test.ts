import { expect, test } from "vitest";
import { BLUESKY_POST_MAX, countBluesky } from "./blueskyCharCount.ts";

test("plain ASCII text counts each character", () => {
  const result = countBluesky("Hello, Bluesky!");
  expect(result.count).toBe(15);
  expect(result.remaining).toBe(285);
  expect(result.over).toBe(false);
});

test("a family emoji counts as one grapheme", () => {
  const result = countBluesky("👨‍👩‍👧");
  expect(result.count).toBe(1);
  expect(result.remaining).toBe(299);
});

test("a flag emoji counts as one grapheme", () => {
  const result = countBluesky("🇨🇦");
  expect(result.count).toBe(1);
  expect(result.remaining).toBe(299);
});

test("exactly 300 graphemes fits the post limit", () => {
  const result = countBluesky("a".repeat(BLUESKY_POST_MAX));
  expect(result.count).toBe(300);
  expect(result.remaining).toBe(0);
  expect(result.over).toBe(false);
});

test("301 characters exceed the post limit", () => {
  const result = countBluesky("a".repeat(301));
  expect(result.count).toBe(301);
  expect(result.remaining).toBe(-1);
  expect(result.over).toBe(true);
});

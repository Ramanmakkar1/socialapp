import { expect, test } from "vitest";
import { MASTODON_DEFAULT_MAX, countMastodon } from "./mastodonCharCount.ts";

test("a long URL counts as 23 characters", () => {
  const result = countMastodon("https://example.com/a/very/long/path?with=query&more=values");
  expect(result.count).toBe(23);
  expect(result.links).toBe(1);
  expect(result.remaining).toBe(MASTODON_DEFAULT_MAX - 23);
});

test("a remote mention counts only the username", () => {
  const result = countMastodon("@alice@mastodon.social");
  expect(result.count).toBe(6);
  expect(result.mentions).toBe(1);
});

test("501 plain characters are over the limit", () => {
  const result = countMastodon("a".repeat(501));
  expect(result.count).toBe(501);
  expect(result.remaining).toBe(-1);
  expect(result.over).toBe(true);
});

test("a custom max of 1000 works", () => {
  const result = countMastodon("a".repeat(900), 1000);
  expect(result.count).toBe(900);
  expect(result.remaining).toBe(100);
  expect(result.over).toBe(false);
});

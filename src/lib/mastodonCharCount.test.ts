import assert from "node:assert/strict";
import { test } from "node:test";
import { MASTODON_DEFAULT_MAX, countMastodon } from "./mastodonCharCount.ts";

test("a long URL counts as 23 characters", () => {
  const result = countMastodon("https://example.com/a/very/long/path?with=query&more=values");
  assert.equal(result.count, 23);
  assert.equal(result.links, 1);
  assert.equal(result.remaining, MASTODON_DEFAULT_MAX - 23);
});

test("a remote mention counts only the username", () => {
  const result = countMastodon("@alice@mastodon.social");
  assert.equal(result.count, 6);
  assert.equal(result.mentions, 1);
});

test("501 plain characters are over the limit", () => {
  const result = countMastodon("a".repeat(501));
  assert.equal(result.count, 501);
  assert.equal(result.remaining, -1);
  assert.equal(result.over, true);
});

test("a custom max of 1000 works", () => {
  const result = countMastodon("a".repeat(900), 1000);
  assert.equal(result.count, 900);
  assert.equal(result.remaining, 100);
  assert.equal(result.over, false);
});

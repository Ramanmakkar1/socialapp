import assert from "node:assert/strict";
import { test } from "node:test";
import { countThreads, THREADS_LIMITS, THREADS_LINK_LIMIT } from "./threadsCharCount.ts";

test("empty text has no characters, words, lines, hashtags or links", () => {
  const result = countThreads("");
  assert.equal(result.chars, 0);
  assert.equal(result.words, 0);
  assert.equal(result.lines, 0);
  assert.equal(result.hashtags, 0);
  assert.equal(result.links, 0);
  assert.equal(result.remaining, THREADS_LIMITS.post);
  assert.equal(result.over, false);
  assert.equal(result.tooManyLinks, false);
});

test("an emoji counts as one code point", () => {
  const result = countThreads("😀");
  assert.equal(result.chars, 1);
  assert.equal(result.words, 1);
  assert.equal(result.remaining, 499);
});

test("exactly 500 characters fits the post limit", () => {
  const result = countThreads("a".repeat(500));
  assert.equal(result.chars, 500);
  assert.equal(result.remaining, 0);
  assert.equal(result.over, false);
});

test("501 characters exceed the post limit", () => {
  const result = countThreads("a".repeat(501));
  assert.equal(result.chars, 501);
  assert.equal(result.remaining, -1);
  assert.equal(result.over, true);
});

test("hashtags with letters, numbers and underscores are counted", () => {
  const result = countThreads("#Threads #成长 #post_1 #!");
  assert.equal(result.hashtags, 3);
});

test("a post with six links is flagged as having too many", () => {
  const text = Array.from({ length: 6 }, (_, index) => `https://example.com/${index}`).join(" ");
  const result = countThreads(text);
  assert.equal(result.links, 6);
  assert.equal(THREADS_LINK_LIMIT, 5);
  assert.equal(result.tooManyLinks, true);
});

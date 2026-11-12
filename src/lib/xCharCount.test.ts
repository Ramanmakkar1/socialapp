import assert from "node:assert/strict";
import { test } from "node:test";
import { countX, X_LIMIT } from "./xCharCount.ts";

test("ASCII text counts one per character", () => {
  const result = countX("hello");
  assert.equal(result.weighted, 5);
  assert.equal(result.remaining, X_LIMIT - 5);
  assert.equal(result.overBy, 0);
});

test("full and bare URLs count as 23 regardless of length", () => {
  for (const url of ["https://example.com/a/very/long/path?x=1", "http://x.co", "example.com/path"]) {
    const result = countX(url);
    assert.equal(result.weighted, 23, url);
    assert.equal(result.urls, 1, url);
  }
});

test("an emoji grapheme counts as 2", () => {
  assert.equal(countX("😀").weighted, 2);
});

test("CJK characters count as 2 each", () => {
  assert.equal(countX("日本").weighted, 4);
});

test("280 ASCII characters fit exactly", () => {
  const result = countX("a".repeat(280));
  assert.equal(result.weighted, 280);
  assert.equal(result.remaining, 0);
  assert.equal(result.overBy, 0);
});

test("281 ASCII characters are 1 over", () => {
  const result = countX("a".repeat(281));
  assert.equal(result.weighted, 281);
  assert.equal(result.remaining, -1);
  assert.equal(result.overBy, 1);
});

test("hashtags and mentions are counted at word boundaries", () => {
  const result = countX("Hello #launch_2026 and @poskoo");
  assert.equal(result.hashtags, 1);
  assert.equal(result.mentions, 1);
});

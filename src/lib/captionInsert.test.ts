import assert from "node:assert/strict";
import { test } from "node:test";
import { COMPOSER_EMOJI, insertAtCursor } from "./captionInsert.ts";

test("insertAtCursor puts text at the caret and replaces a selection", () => {
  assert.deepEqual(insertAtCursor("Hello world", 5, 5, "🔥"), { text: "Hello🔥 world", caret: 7 });
  assert.deepEqual(insertAtCursor("Hello world", 6, 11, "there"), { text: "Hello there", caret: 11 });
  assert.deepEqual(insertAtCursor("", 0, 0, "✨"), { text: "✨", caret: 1 });
});

test("a hashtag gets a space when it would stick to the previous word; positions are clamped", () => {
  assert.deepEqual(insertAtCursor("Launch day", 10, 10, "#"), { text: "Launch day #", caret: 12 });
  assert.deepEqual(insertAtCursor("Launch day ", 11, 11, "#"), { text: "Launch day #", caret: 12 });
  assert.deepEqual(insertAtCursor("abc", 99, 99, "!"), { text: "abc!", caret: 4 });
});

test("the curated emoji set is small and unique", () => {
  assert.ok(COMPOSER_EMOJI.length >= 30 && COMPOSER_EMOJI.length <= 60);
  assert.equal(new Set(COMPOSER_EMOJI).size, COMPOSER_EMOJI.length);
});

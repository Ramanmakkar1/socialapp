import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_KEYWORD_CHIPS, parseKeywordChips } from "./keywordChips.ts";

test("keyword chips split on commas and newlines, trim, and ignore duplicates", () => {
  assert.deepEqual(parseKeywordChips(" link, info\nPRICE，guide, Link, ,shop "), [
    "link",
    "info",
    "PRICE",
    "guide",
    "shop",
  ]);
});

test("keyword chips preserve multi-word phrases and stop at twenty", () => {
  assert.deepEqual(parseKeywordChips("free guide, pricing please"), ["free guide", "pricing please"]);
  const chips = parseKeywordChips(Array.from({ length: 25 }, (_, i) => `word${i + 1}`).join(","));
  assert.equal(chips.length, MAX_KEYWORD_CHIPS);
  assert.equal(chips.at(-1), "word20");
  assert.deepEqual(parseKeywordChips("one,two", 1), ["one"]);
});

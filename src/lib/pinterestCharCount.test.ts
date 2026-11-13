import assert from "node:assert/strict";
import { test } from "node:test";
import { countPinterest, PINTEREST_LIMITS } from "./pinterestCharCount.ts";

test("a 100-character Pin title fits and a 101-character title is over", () => {
  const fits = countPinterest("a".repeat(100), "title");
  assert.equal(fits.count, 100);
  assert.equal(fits.remaining, 0);
  assert.equal(fits.over, false);

  const over = countPinterest("a".repeat(101), "title");
  assert.equal(over.count, 101);
  assert.equal(over.remaining, -1);
  assert.equal(over.over, true);
  assert.equal(PINTEREST_LIMITS.title.max, 100);
});

test("a 500-character description fits and a 501-character description is over", () => {
  const fits = countPinterest("a".repeat(500), "description");
  assert.equal(fits.count, 500);
  assert.equal(fits.remaining, 0);
  assert.equal(fits.over, false);

  const over = countPinterest("a".repeat(501), "description");
  assert.equal(over.count, 501);
  assert.equal(over.remaining, -1);
  assert.equal(over.over, true);
  assert.equal(PINTEREST_LIMITS.description.max, 500);
});

test("alt text and board name use their own limits", () => {
  const alt = countPinterest("a".repeat(500), "altText");
  assert.equal(alt.over, false);
  assert.equal(countPinterest("a".repeat(501), "altText").over, true);

  const board = countPinterest("a".repeat(50), "boardName");
  assert.equal(board.over, false);
  assert.equal(countPinterest("a".repeat(51), "boardName").over, true);
});

test("the title preview is cut at 40 characters with an ellipsis", () => {
  const result = countPinterest("a".repeat(60), "title");
  assert.equal(result.truncatedPreview, "a".repeat(40) + "…");
  assert.equal(Array.from(result.truncatedPreview).length, PINTEREST_LIMITS.title.shown + 1);
});

test("the description preview is cut at 50 characters with an ellipsis", () => {
  const result = countPinterest("a".repeat(80), "description");
  assert.equal(result.truncatedPreview, "a".repeat(50) + "…");
  assert.equal(Array.from(result.truncatedPreview).length, PINTEREST_LIMITS.description.shown + 1);
});

test("short text has no ellipsis in the preview", () => {
  assert.equal(countPinterest("Quick dinner ideas", "title").truncatedPreview, "Quick dinner ideas");
  assert.equal(countPinterest("a".repeat(40), "title").truncatedPreview, "a".repeat(40));
});

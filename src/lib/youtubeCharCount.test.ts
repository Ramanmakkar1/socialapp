import assert from "node:assert/strict";
import { test } from "node:test";
import { countTags, countYouTube, hasInvalidTitleChars, YT_LIMITS } from "./youtubeCharCount.ts";

test("a 100-character title fits and a 101-character title is over", () => {
  const fits = countYouTube("a".repeat(100), "title");
  assert.equal(fits.chars, 100);
  assert.equal(fits.remaining, 0);
  assert.equal(fits.over, false);

  const over = countYouTube("a".repeat(101), "title");
  assert.equal(over.chars, 101);
  assert.equal(over.remaining, -1);
  assert.equal(over.over, true);
  assert.equal(YT_LIMITS.title, 100);
});

test("a title containing an angle bracket is invalid", () => {
  assert.equal(hasInvalidTitleChars("A <great> video"), true);
  assert.equal(hasInvalidTitleChars("A great video"), false);
});

test("multi-word tags and commas count toward the tag limit", () => {
  const result = countTags("a b,cd");
  assert.deepEqual(result.tags, ["a b", "cd"]);
  assert.equal(result.total, 8);
  assert.equal(result.over, false);
});

test("the description preview is cut at 157 characters", () => {
  const result = countYouTube("a".repeat(200), "description");
  assert.equal(result.visiblePreview, "a".repeat(157));
  assert.equal(Array.from(result.visiblePreview).length, YT_LIMITS.descriptionVisible);
});

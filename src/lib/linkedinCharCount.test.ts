import assert from "node:assert/strict";
import { test } from "node:test";
import { countLinkedIn, LINKEDIN_LIMITS } from "./linkedinCharCount.ts";

test("empty text has no characters, words or lines", () => {
  const result = countLinkedIn("");
  assert.equal(result.chars, 0);
  assert.equal(result.words, 0);
  assert.equal(result.lines, 0);
  assert.equal(result.seeMoreCut, 0);
  assert.equal(result.overLimit.post, false);
});

test("an emoji counts as one code point", () => {
  const result = countLinkedIn("😀");
  assert.equal(result.chars, 1);
  assert.equal(result.words, 1);
});

test("3,001 characters exceed every applicable limit", () => {
  const result = countLinkedIn("a".repeat(3001));
  assert.equal(result.chars, 3001);
  assert.equal(result.overLimit.post, true);
  assert.equal(LINKEDIN_LIMITS.post, 3000);
});

test("the feed preview cuts at the end of the third line", () => {
  const result = countLinkedIn("one\ntwo\nthree\nfour");
  assert.equal(result.lines, 4);
  assert.equal(result.seeMoreCut, "one\ntwo\nthree".length);
});

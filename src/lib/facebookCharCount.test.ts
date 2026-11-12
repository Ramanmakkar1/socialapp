import assert from "node:assert/strict";
import { test } from "node:test";
import { countFacebook, FB_LIMITS } from "./facebookCharCount.ts";

test("empty text has no characters, words or lines", () => {
  const result = countFacebook("", "post");
  assert.equal(result.chars, 0);
  assert.equal(result.words, 0);
  assert.equal(result.lines, 0);
  assert.equal(result.remaining, FB_LIMITS.post);
  assert.equal(result.over, false);
  assert.equal(result.preview, "");
});

test("a Page bio fits at 255 characters and is over at 256", () => {
  const fits = countFacebook("a".repeat(255), "pageBio");
  assert.equal(fits.remaining, 0);
  assert.equal(fits.over, false);

  const over = countFacebook("a".repeat(256), "pageBio");
  assert.equal(over.remaining, -1);
  assert.equal(over.over, true);
  assert.equal(FB_LIMITS.pageBio, 255);
});

test("the post preview cuts at 477 characters", () => {
  const result = countFacebook("a".repeat(500), "post");
  assert.equal(result.preview, "a".repeat(FB_LIMITS.seeMore));
  assert.equal(result.chars, 500);
});

test("the post preview cuts at the end of the fifth line", () => {
  const text = "one\ntwo\nthree\nfour\nfive\nsix";
  const result = countFacebook(text, "post");
  assert.equal(result.lines, 6);
  assert.equal(result.preview, "one\ntwo\nthree\nfour\nfive");
});

test("an emoji counts as one character", () => {
  const result = countFacebook("😀", "post");
  assert.equal(result.chars, 1);
  assert.equal(result.words, 1);
  assert.equal(result.preview, "😀");
});

test("ad primary text previews the first 125 characters", () => {
  const result = countFacebook("a".repeat(126), "ad");
  assert.equal(result.preview, "a".repeat(FB_LIMITS.adPrimaryVisible));
  assert.equal(result.remaining, -1);
  assert.equal(result.over, true);
});

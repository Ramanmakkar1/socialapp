import assert from "node:assert/strict";
import { test } from "node:test";
import { countTikTokCaption, TIKTOK_CAPTION_LIMIT, TIKTOK_PREVIEW_CHARS } from "./tiktokCaptionCount.ts";

test("empty text has no characters, hashtags or mentions", () => {
  assert.deepEqual(countTikTokCaption(""), {
    chars: 0,
    hashtags: [],
    mentions: [],
    remaining: TIKTOK_CAPTION_LIMIT,
    over: false,
    preview: "",
  });
});

test("an emoji counts as one code point", () => {
  const result = countTikTokCaption("Hi 😀");
  assert.equal(result.chars, 4);
  assert.equal(result.remaining, TIKTOK_CAPTION_LIMIT - 4);
  assert.equal(result.preview, "Hi 😀");
});

test("hashtags are extracted once in their original order", () => {
  const result = countTikTokCaption("#Travel #food #Travel #café_2026 #travel");
  assert.deepEqual(result.hashtags, ["#Travel", "#food", "#café_2026", "#travel"]);
});

test("mentions are extracted without duplicates", () => {
  const result = countTikTokCaption("Thanks @poskoo and @creator_2, especially @poskoo");
  assert.deepEqual(result.mentions, ["@poskoo", "@creator_2"]);
});

test("captions over 4,000 characters are flagged", () => {
  const result = countTikTokCaption("a".repeat(TIKTOK_CAPTION_LIMIT + 1));
  assert.equal(result.chars, 4001);
  assert.equal(result.remaining, -1);
  assert.equal(result.over, true);
  assert.equal(Array.from(result.preview).length, TIKTOK_PREVIEW_CHARS);
});

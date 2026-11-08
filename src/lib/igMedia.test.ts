import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMediaList, relativeDay } from "./igMedia";

test("parseMediaList: reels use the thumbnail, images use media_url, bad items are skipped", () => {
  const items = parseMediaList({
    data: [
      { id: "1", caption: "Reel!", media_type: "VIDEO", media_product_type: "REELS", media_url: "https://v/1.mp4", thumbnail_url: "https://t/1.jpg", like_count: 5, comments_count: 2, timestamp: "2026-11-08T10:00:00+0000", permalink: "https://instagram.com/p/1" },
      { id: "2", media_type: "IMAGE", media_url: "https://i/2.jpg", like_count: 0 },
      { caption: "no id" },
      { id: "3", media_type: "CAROUSEL_ALBUM", media_url: "https://i/3.jpg" },
    ],
  });
  assert.equal(items.length, 3);
  assert.equal(items[0].isReel, true);
  assert.equal(items[0].imageUrl, "https://t/1.jpg");
  assert.equal(items[0].likes, 5);
  assert.equal(items[0].comments, 2);
  assert.equal(items[1].caption, "");
  assert.equal(items[1].isReel, false);
  assert.equal(items[1].imageUrl, "https://i/2.jpg");
  assert.equal(items[1].comments, null);
  assert.equal(items[2].mediaType, "CAROUSEL_ALBUM");
});

test("parseMediaList: non-list input gives an empty list", () => {
  assert.deepEqual(parseMediaList(null), []);
  assert.deepEqual(parseMediaList({ data: "x" }), []);
});

test("relativeDay: today, yesterday, then a short date", () => {
  const now = new Date("2026-11-08T18:00:00Z");
  assert.equal(relativeDay("2026-11-08T09:00:00Z", now, "UTC"), "Today");
  assert.equal(relativeDay("2026-11-07T09:00:00Z", now, "UTC"), "Yesterday");
  assert.equal(relativeDay("2026-11-01T09:00:00Z", now, "UTC"), "Nov 1");
  assert.equal(relativeDay(null, now, "UTC"), "");
  assert.equal(relativeDay("nope", now, "UTC"), "");
});

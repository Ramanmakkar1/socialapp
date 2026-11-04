import assert from "node:assert/strict";
import { test } from "node:test";
import { cropRect, IG_FORMATS, STORY_SAFE_ZONE_PX } from "./igSizes.ts";

test("cropRect square on wider source crops sides", () => {
  const r = cropRect(2000, 1000, 1);
  assert.equal(r.w, 1000);
  assert.equal(r.h, 1000);
  assert.equal(r.x, 500);
  assert.equal(r.y, 0);
});

test("cropRect square on taller source crops top and bottom", () => {
  const r = cropRect(1000, 2000, 1);
  assert.equal(r.w, 1000);
  assert.equal(r.h, 1000);
  assert.equal(r.x, 0);
  assert.equal(r.y, 500);
});

test("cropRect 4:5 on square source crops left and right", () => {
  const ratio = 1080 / 1350;
  const r = cropRect(1080, 1080, ratio);
  assert.ok(Math.abs(r.w / r.h - ratio) < 1e-6);
  assert.equal(r.h, 1080);
  assert.equal(r.x, 108);
});

test("cropRect 9:16 on landscape photo", () => {
  const ratio = 1080 / 1920;
  const r = cropRect(4032, 3024, ratio);
  assert.ok(Math.abs(r.w / r.h - ratio) < 1e-4);
  assert.equal(r.y, 0);
});

test("cropRect handles zero dimensions", () => {
  assert.deepEqual(cropRect(0, 100, 1), { x: 0, y: 0, w: 0, h: 100 });
});

test("IG_FORMATS includes expected ids and story safe zone constant", () => {
  const ids = IG_FORMATS.map((f) => f.id);
  assert.ok(ids.includes("feed-square"));
  assert.ok(ids.includes("feed-tall"));
  assert.ok(ids.includes("story-reel"));
  assert.equal(STORY_SAFE_ZONE_PX, 250);
});

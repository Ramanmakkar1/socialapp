import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  STORY_W,
  STORY_H,
  STORY_SAFE_ZONES,
  STORY_CLEAR_ZONE,
  maxCharsFor,
  wrapText,
  textBox,
  storyPhotoFit,
  rectsOverlap,
  toPixels,
} from './storyLayout.ts';
import { SAFE_ZONES } from './safeZones.ts';

test('STORY_W and STORY_H come from FRAME_W / FRAME_H (1080x1920)', () => {
  assert.equal(STORY_W, 1080);
  assert.equal(STORY_H, 1920);
});

test('STORY_SAFE_ZONES is the story zones from safeZones, not a copy', () => {
  assert.equal(STORY_SAFE_ZONES, SAFE_ZONES.story);
  assert.equal(STORY_SAFE_ZONES.length, 2);
  assert.equal(STORY_SAFE_ZONES[0].id, "top");
  assert.equal(STORY_SAFE_ZONES[1].id, "bottom");
});

test('the story top zone is 250 px and the bottom zone starts at 1670 px', () => {
  assert.deepEqual(toPixels(STORY_SAFE_ZONES[0]), { x: 0, y: 0, w: 1080, h: 250 });
  assert.deepEqual(toPixels(STORY_SAFE_ZONES[1]), { x: 0, y: 1670, w: 1080, h: 250 });
});

test('the clear zone is the middle 1420 px of the frame', () => {
  assert.deepEqual(STORY_CLEAR_ZONE, { x: 0, y: 250, w: 1080, h: 1420 });
});

test('rectsOverlap is re-exported from safeZones: touching edges do not count', () => {
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 }), false);
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 }), true);
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 20, w: 10, h: 10 }), false);
});

test('toPixels is re-exported from safeZones, default and custom frames', () => {
  assert.deepEqual(toPixels({ x: 0, y: 87, w: 100, h: 13 }), { x: 0, y: 1670, w: 1080, h: 250 });
  assert.deepEqual(toPixels({ x: 0, y: 0, w: 50, h: 50 }, 540, 960), { x: 0, y: 0, w: 270, h: 480 });
});

test('maxCharsFor never drops below 8 and shrinks as the text grows', () => {
  assert.equal(maxCharsFor(64), 24);
  assert.equal(maxCharsFor(120), 12);
  assert.equal(maxCharsFor(300), 8);
});

test('wrapText wraps whole words within maxChars', () => {
  assert.deepEqual(wrapText("a b c d", 3, 4), ["a b", "c d"]);
});

test('wrapText hard-breaks words longer than maxChars', () => {
  assert.deepEqual(wrapText("extraordinary", 4, 4), ["extr", "aord", "inar", "y"]);
});

test('wrapText caps at maxLines and puts an ellipsis on the cut last line', () => {
  assert.deepEqual(wrapText("one two three four five six", 6, 3), ["one", "two", "three…"]);
});

test('textBox wraps text and centres the box vertically in the target', () => {
  const { lines, box } = textBox("hello world", 40, STORY_CLEAR_ZONE);
  assert.deepEqual(lines, ["hello world"]);
  assert.equal(box.x, 0);
  assert.equal(box.w, 1080);
  assert.equal(box.y, 917); // 250 + round(710 - 43)
  assert.equal(box.h, 86); // 46 + 40
});

test('textBox wraps long text across lines within the 4-line cap', () => {
  const { lines } = textBox("one two three four five six seven eight nine ten", 120, STORY_CLEAR_ZONE);
  assert.equal(lines.length, 4);
  assert.equal(lines[3], "seven eight…");
});

test('textBox with empty text yields a padding-only box centred in the target', () => {
  const { lines, box } = textBox("", 40, STORY_CLEAR_ZONE);
  assert.deepEqual(lines, []);
  assert.equal(box.x, 0);
  assert.equal(box.w, 1080);
  assert.equal(box.h, 40); // 0.5 * 40 * 2
  assert.equal(box.y, 940); // 250 + round(710 - 20)
});

test('storyPhotoFit reuses reelCover coverFit to cover the frame', () => {
  const f = storyPhotoFit(1080, 1080);
  assert.equal(f.dw, 1920);
  assert.equal(f.dh, 1920);
  assert.equal(f.dy, 0);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SAFE_ZONES, isRectSafe, rectsOverlap, toPixels } from './safeZones.ts';

test('a centered title box is safe for Reels and Story', () => {
  const title = { x: 10, y: 30, w: 70, h: 20 };
  assert.equal(isRectSafe(title, SAFE_ZONES.reels), true);
  assert.equal(isRectSafe(title, SAFE_ZONES.story), true);
});

test('text at the very top is unsafe in both modes', () => {
  const top = { x: 10, y: 2, w: 60, h: 6 };
  assert.equal(isRectSafe(top, SAFE_ZONES.reels), false);
  assert.equal(isRectSafe(top, SAFE_ZONES.story), false);
});

test('the right edge is only blocked in Reels (action buttons)', () => {
  const rightEdge = { x: 86, y: 40, w: 10, h: 10 };
  assert.equal(isRectSafe(rightEdge, SAFE_ZONES.reels), false);
  assert.equal(isRectSafe(rightEdge, SAFE_ZONES.story), true);
});

test('the lower third is blocked by the Reels caption but fine for Story above the reply bar', () => {
  const lower = { x: 10, y: 70, w: 60, h: 10 };
  assert.equal(isRectSafe(lower, SAFE_ZONES.reels), false);
  assert.equal(isRectSafe(lower, SAFE_ZONES.story), true);
});

test('out-of-frame or empty rects are never safe', () => {
  assert.equal(isRectSafe({ x: -1, y: 30, w: 10, h: 10 }, []), false);
  assert.equal(isRectSafe({ x: 95, y: 30, w: 10, h: 10 }, []), false);
  assert.equal(isRectSafe({ x: 10, y: 30, w: 0, h: 10 }, []), false);
});

test('touching edges do not count as overlap', () => {
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 }), false);
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 9, y: 9, w: 10, h: 10 }), true);
});

test('zones convert to 1080x1920 pixels', () => {
  assert.deepEqual(toPixels({ x: 0, y: 87, w: 100, h: 13 }), { x: 0, y: 1670, w: 1080, h: 250 });
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { engagementRate } from './engagementRate.ts';

test('100 likes + 20 comments with base 1000 gives 12', () => {
  assert.equal(engagementRate({ likes: 100, comments: 20, base: 1000 }), 12);
});

test('saves and shares are added', () => {
  assert.equal(engagementRate({ likes: 100, comments: 20, saves: 10, shares: 5, base: 1000 }), 13.5);
});

test('base 0 gives null', () => {
  assert.equal(engagementRate({ likes: 1, comments: 1, base: 0 }), null);
});

test('negative value gives null', () => {
  assert.equal(engagementRate({ likes: -1, comments: 20, base: 1000 }), null);
});

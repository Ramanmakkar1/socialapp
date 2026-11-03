import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  PLATFORM_LIMITS,
  analyzeCaption,
  countChars,
  extractHashtags,
  extractMentions,
  foldCaption,
} from './captionLimits.ts';

test('emoji count as one character each', () => {
  assert.equal(countChars('hi 👋'), 4);
  assert.equal(countChars('👍🏽'), 1); // skin tone modifier
  assert.equal(countChars('👨‍👩‍👧'), 1); // ZWJ family
  assert.equal(countChars('🇨🇦'), 1); // flag
  assert.equal(countChars(''), 0);
});

test('hashtags: real tags only, no #123-only or mid-word matches', () => {
  assert.deepEqual(extractHashtags('Sunset #travel #Toronto2026 #123 #_x'), ['#travel', '#Toronto2026', '#_x']);
  assert.deepEqual(extractHashtags('#first line\n#second'), ['#first', '#second']);
  assert.deepEqual(extractHashtags('abc#notatag and # alone'), []);
  assert.deepEqual(extractHashtags('#café #日本'), ['#café', '#日本']);
});

test('mentions: handles only, no emails', () => {
  assert.deepEqual(extractMentions('Thanks @jane.doe and @shop_ca! mail me@site.com'), ['@jane.doe', '@shop_ca']);
  assert.deepEqual(extractMentions('end with dot @name.'), ['@name']);
});

test('fold cuts at foldAt characters', () => {
  const text = 'a'.repeat(200);
  const r = foldCaption(text, 125);
  assert.equal(r.folded, true);
  assert.equal(countChars(r.preview), 125);
  assert.deepEqual(foldCaption('short', 125), { preview: 'short', folded: false });
  assert.deepEqual(foldCaption(text, null), { preview: text, folded: false });
});

test('fold cuts earlier at the second line break', () => {
  const r = foldCaption('line one\nline two\nline three', 125);
  assert.equal(r.folded, true);
  assert.equal(r.preview, 'line one\nline two');
});

test('fold never splits an emoji', () => {
  const r = foldCaption('👍🏽'.repeat(130), 125);
  assert.equal(r.preview, '👍🏽'.repeat(125));
});

test('over-limit flags for Instagram', () => {
  const ig = PLATFORM_LIMITS.instagram;
  assert.equal(analyzeCaption('a'.repeat(2200), 'instagram').overBy, 0);
  assert.equal(analyzeCaption('a'.repeat(2205), 'instagram').overBy, 5);
  const tags = Array.from({ length: 32 }, (_, i) => `#tag${i}`).join(' ');
  assert.equal(analyzeCaption(tags, 'instagram').overHashtags, 32 - (ig.hashtags ?? 0));
  const ats = Array.from({ length: 21 }, (_, i) => `@user${i}`).join(' ');
  assert.equal(analyzeCaption(ats, 'instagram').overMentions, 21 - (ig.mentions ?? 0));
});

test('Threads 500 limit and no limit on Facebook', () => {
  assert.equal(analyzeCaption('a'.repeat(501), 'threads').overBy, 1);
  const fb = analyzeCaption('a'.repeat(5000), 'facebook');
  assert.equal(fb.overBy, 0);
  assert.equal(fb.folded, false);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countMentions, filterEntries, parseComments, pickWinners } from './commentPicker.ts';

test('parses @user: comment, user comment and plain lines, skipping empty lines', () => {
  const entries = parseComments('@Anna_K: I want to win!\n\n  bob.smith count me in  \r\n🎉 love this\n@carl\n');
  assert.deepEqual(
    entries.map((e) => [e.username, e.text]),
    [
      ['anna_k', 'I want to win!'],
      ['bob.smith', 'count me in'],
      [null, '🎉 love this'],
      ['carl', ''],
    ],
  );
});

test('keyword filter is case-insensitive and matches whole words', () => {
  const entries = parseComments('@a: I want to WIN\n@b: nice post\n@c: win win\n@d: winning');
  assert.deepEqual(
    filterEntries(entries, { keyword: 'win' }).map((e) => e.username),
    ['a', 'c'],
  );
});

test('dedupe keeps the first comment per username', () => {
  const entries = parseComments('@a: win 1\n@b: win\n@A: win 2\na win 3');
  assert.deepEqual(
    filterEntries(entries, { dedupe: true }).map((e) => e.text),
    ['win 1', 'win'],
  );
  assert.equal(filterEntries(entries).length, 4);
});

test('minimum mentions counts @tags in the comment text only', () => {
  assert.equal(countMentions('hi @x and @y_2'), 2);
  const entries = parseComments('@a: @x @y\n@b: @x\n@c: no tags');
  assert.deepEqual(
    filterEntries(entries, { minMentions: 2 }).map((e) => e.username),
    ['a'],
  );
});

test('a deterministic rng gives the expected winners', () => {
  // rng() = 0 swaps each item with the first: [a,b,c,d] -> [b,c,d,a]
  assert.deepEqual(pickWinners(['a', 'b', 'c', 'd'], 2, () => 0), ['b', 'c']);
  // rng() close to 1 keeps the order unchanged
  assert.deepEqual(pickWinners(['a', 'b', 'c', 'd'], 3, () => 0.9999), ['a', 'b', 'c']);
});

test('winners are unique and never more than the entries', () => {
  const winners = pickWinners(['a', 'b', 'c'], 10);
  assert.equal(winners.length, 3);
  assert.equal(new Set(winners).size, 3);
  assert.deepEqual(pickWinners(['a'], 0), []);
});

test('does not mutate the input array', () => {
  const input = ['a', 'b', 'c'];
  pickWinners(input, 2, () => 0);
  assert.deepEqual(input, ['a', 'b', 'c']);
});

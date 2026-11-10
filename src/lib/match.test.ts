import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractComments, matchComment, normalize, type MatchableRule } from './match';

const rule = (id: string, keywords: string[], extra: Partial<MatchableRule> = {}): MatchableRule => ({
  id,
  keywords,
  match_type: 'contains',
  status: 'active',
  ...extra,
});

test('normalize lowercases, strips accents, mentions and punctuation', () => {
  assert.equal(normalize('  @brand @other.one Café   PRICE?!  '), 'cafe price');
});

test('contains match is case and punctuation insensitive', () => {
  const r = rule('a', ['Link']);
  const m = matchComment('Send me the LINK!!', [r]);
  assert.deepEqual(m, { rule: r, keyword: 'link' });
  assert.ok(matchComment('price, please', [rule('b', ['price'])]));
});

test("'link' does not match 'linkedin'", () => {
  assert.equal(matchComment('Is this on LinkedIn?', [rule('a', ['link'])]), null);
});

test('contains matches whole phrases', () => {
  assert.ok(matchComment('Can I get the free guide?', [rule('a', ['free guide'])]));
  assert.equal(matchComment('free, then a guide', [rule('a', ['free guide'])]), null);
});

test('exact vs contains', () => {
  const exact = rule('e', ['link'], { match_type: 'exact' });
  assert.ok(matchComment('LINK!', [exact]));
  assert.equal(matchComment('send the link', [exact]), null);
  assert.ok(matchComment('send the link', [rule('c', ['link'])]));
});

test('paused rules are skipped and empty keywords ignored', () => {
  const paused = rule('p', ['link'], { status: 'paused' });
  assert.equal(matchComment('link', [paused]), null);
  assert.equal(matchComment('hello', [rule('x', ['', '  ', '!!'])]), null);
});

test('the any-comment sentinel matches arbitrary words', () => {
  const any = rule('any', ['*']);
  assert.equal(matchComment('anything at all', [any])?.rule.id, 'any');
  assert.equal(matchComment('anything at all', [{ ...any, status: 'paused' }]), null);
});

test('first matching rule wins', () => {
  const first = rule('1', ['price']);
  const second = rule('2', ['link']);
  const m = matchComment('link and price please', [first, second]);
  assert.equal(m?.rule.id, '1');
  assert.equal(m?.keyword, 'price');
});

const payload = {
  object: 'instagram',
  entry: [
    {
      id: 'acct1',
      time: 1700000000,
      changes: [
        {
          field: 'comments',
          value: { id: 'c1', text: 'LINK please', from: { id: 'u1', username: 'jane' }, media: { id: 'm1' } },
        },
        { field: 'mentions', value: { id: 'c2', text: 'hi', from: { id: 'u2' } } },
        { field: 'comments', value: { id: 'c3', text: 'Thanks!', from: { id: 'acct1', username: 'brand' } } },
        { field: 'comments', value: { id: 'c4', from: { id: 'u3' } } },
        { field: 'comments', value: { id: 'c5', text: 'no media', from: { id: 'u4' } } },
      ],
    },
  ],
};

test('extractComments parses a valid payload', () => {
  const events = extractComments(payload);
  assert.deepEqual(events, [
    { accountId: 'acct1', commentId: 'c1', mediaId: 'm1', fromId: 'u1', fromUsername: 'jane', text: 'LINK please' },
    { accountId: 'acct1', commentId: 'c5', mediaId: null, fromId: 'u4', fromUsername: null, text: 'no media' },
  ]);
});

test('extractComments skips the account commenting on itself', () => {
  const events = extractComments(payload);
  assert.ok(!events.some((e) => e.commentId === 'c3'));
});

test('extractComments returns [] for garbage input', () => {
  for (const input of [null, undefined, {}, { entry: 'x' }, { entry: [null, 1, { changes: 'x' }] }, 'str', 42]) {
    assert.deepEqual(extractComments(input), []);
  }
});

test('emoji keywords match emoji comments (variation selectors and skin tones ignored)', () => {
  const rules: MatchableRule[] = [
    { id: 'fire', keywords: ['🔥'], match_type: 'contains', status: 'active' },
    { id: 'heart', keywords: ['❤️'], match_type: 'exact', status: 'active' },
  ];
  assert.equal(matchComment('🔥🔥🔥', rules)?.rule.id, 'fire');
  assert.equal(matchComment('love this🔥', rules)?.rule.id, 'fire');
  assert.equal(matchComment('❤', rules)?.rule.id, 'heart');
  assert.equal(matchComment('❤️', rules)?.rule.id, 'heart');
  assert.equal(matchComment('nice', rules), null);
  const thumbs: MatchableRule[] = [{ id: 'ok', keywords: ['👍'], match_type: 'contains', status: 'active' }];
  assert.equal(matchComment('👍🏽 yes', thumbs)?.rule.id, 'ok');
});

test('emoji next to words still lets the word keyword match; punctuation and case are ignored', () => {
  const rules: MatchableRule[] = [{ id: 'link', keywords: ['LINK'], match_type: 'contains', status: 'active' }];
  assert.equal(matchComment('link🔥', rules)?.rule.id, 'link');
  assert.equal(matchComment('Link!!!', rules)?.rule.id, 'link');
  assert.equal(matchComment('@brand link please', rules)?.rule.id, 'link');
  assert.equal(matchComment('linked', rules), null);
});

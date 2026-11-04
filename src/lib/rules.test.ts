import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRule, type DmRule } from './rules';

function makeRule(dmMessage: string): DmRule {
  return {
    id: 'test-rule',
    name: 'Test rule',
    keywords: ['hello'],
    matchMode: 'contains',
    triggers: ['comment'],
    replyPublicly: false,
    publicReplies: [],
    dmMessage,
    askEmail: false,
    requireFollow: false,
    active: true,
  };
}

test('rejects an empty DM message', () => {
  assert.deepEqual(validateRule(makeRule('')), ['DM message is required.']);
});

test('rejects a whitespace-only DM message', () => {
  assert.deepEqual(validateRule(makeRule(' \n\t ')), ['DM message is required.']);
});

test('accepts a valid DM message without trimming its original text', () => {
  const rule = makeRule('  Thanks for commenting!  ');

  assert.deepEqual(validateRule(rule), []);
  assert.equal(rule.dmMessage, '  Thanks for commenting!  ');
});

test('accepts HTTPS destinations and an empty optional link without changing them', () => {
  for (const linkUrl of ['', 'https://example.com', 'https://example.com/path?source=instagram#offer']) {
    const rule = { ...makeRule('Hello'), linkUrl };
    assert.deepEqual(validateRule(rule), [], linkUrl);
    assert.equal(rule.linkUrl, linkUrl);
  }
});

test('requires a link for email and follow gates', () => {
  for (const gate of ['askEmail', 'requireFollow'] as const) {
    for (const linkUrl of [undefined, '', '  ']) {
      assert.deepEqual(validateRule({ ...makeRule('Hello'), [gate]: true, linkUrl }), [
        'Link URL is required when asking for email or requiring a follow.',
      ]);
    }
  }
});

test('rejects malformed, insecure, and credential-bearing destinations', () => {
  for (const linkUrl of ['https://', 'https://exa mple.com', 'https://[invalid]', 'http://example.com', 'https://user@example.com', 'https://user:password@example.com']) {
    assert.deepEqual(validateRule({ ...makeRule('Hello'), linkUrl }), [
      'Enter a valid HTTPS link without a username or password.',
    ], linkUrl);
  }
});

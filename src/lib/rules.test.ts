import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRule, type DmRule } from './rules';
import { buildCommentDmMessage } from './commentMessage';
import { BRAND } from './brand';

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

const gateLengthError = 'Shorten the DM message to leave room for usernames and gate instructions within the 1000-character limit.';

for (const [name, askEmail, requireFollow] of [
  ['email-only', true, false],
  ['follow-only', false, true],
  ['combined', true, true],
] as const) {
  const gatedRule = (dmMessage: string): DmRule => ({
    ...makeRule(dmMessage), askEmail, requireFollow, linkUrl: 'https://example.com',
  });
  const render = (rule: DmRule) => buildCommentDmMessage({
    dmText: rule.dmMessage, fromUsername: 'u'.repeat(30), linkUrl: rule.linkUrl!,
    emailGate: rule.askEmail, followGate: rule.requireFollow,
  });

  test(`${name} gate rejects a generated DM over the limit without truncating`, () => {
    const rule = gatedRule('a'.repeat(950));
    const message = render(rule);
    assert.ok(message.length > 1000);
    assert.deepEqual(validateRule(rule), [gateLengthError]);
    assert.equal(render(rule), message);
    assert.equal(rule.dmMessage.length, 950);
  });

  test(`${name} gate accepts exactly 1000 rendered characters and rejects 1001`, () => {
    const overhead = render(gatedRule('')).length;
    const rule = gatedRule('a'.repeat(1000 - overhead));
    assert.equal(render(rule).length, 1000);
    assert.deepEqual(validateRule(rule), []);
    assert.deepEqual(validateRule({ ...rule, dmMessage: rule.dmMessage + 'a' }), [gateLengthError]);
  });

  test(`${name} gate reserves 30 characters for every repeated username token`, () => {
    const template = '{{username}} {{username}} {{link}}';
    const overhead = render(gatedRule(template)).length;
    const rule = gatedRule(template + 'a'.repeat(1000 - overhead));
    assert.equal(render(rule).length, 1000);
    assert.deepEqual(validateRule(rule), []);
    assert.deepEqual(validateRule({ ...rule, dmMessage: rule.dmMessage + 'a' }), [gateLengthError]);
  });
}

const ungatedLengthError = 'Shorten the DM message to leave room for usernames and links within the 1000-character limit.';
const trackedUrl = `${BRAND.url}/l/${'a'.repeat(16)}`;

function ungatedRender(dmText: string, linkUrl: string | null, resolvedLink?: string | null): string {
  return buildCommentDmMessage({
    dmText,
    fromUsername: 'u'.repeat(30),
    linkUrl,
    emailGate: false,
    followGate: false,
    resolvedLink,
  });
}

test('ungated rule reserves 30 characters for every repeated username token', () => {
  const template = '{{username}} {{username}}';
  const overhead = ungatedRender(template, null).length;
  const rule = makeRule(template + 'a'.repeat(1000 - overhead));
  assert.equal(ungatedRender(rule.dmMessage, null).length, 1000);
  assert.deepEqual(validateRule(rule), []);
  assert.deepEqual(validateRule({ ...rule, dmMessage: rule.dmMessage + 'a' }), [ungatedLengthError]);
});

test('ungated rule rejects an appended link that pushes the message over the limit', () => {
  const linkUrl = 'https://example.com';
  const overhead = ungatedRender('', linkUrl, trackedUrl).length;
  const rule = { ...makeRule('a'.repeat(1000 - overhead)), linkUrl };
  assert.equal(ungatedRender(rule.dmMessage, linkUrl, trackedUrl).length, 1000);
  assert.deepEqual(validateRule(rule), []);
  assert.deepEqual(validateRule({ ...rule, dmMessage: rule.dmMessage + 'a' }), [ungatedLengthError]);
});

test('ungated rule rejects repeated link tokens that push the message over the limit', () => {
  const linkUrl = 'https://example.com/offer';
  const template = '{{link}} {{link}}';
  const overhead = ungatedRender(template, linkUrl, trackedUrl).length;
  const rule = { ...makeRule(template + 'a'.repeat(1000 - overhead)), linkUrl };
  assert.equal(ungatedRender(rule.dmMessage, linkUrl, trackedUrl).length, 1000);
  assert.deepEqual(validateRule(rule), []);
  assert.deepEqual(validateRule({ ...rule, dmMessage: rule.dmMessage + 'a' }), [ungatedLengthError]);
});

test('ungated rule rejects a tracked URL longer than the destination even when the raw link fits', () => {
  const linkUrl = 'https://example.com';
  const rawOverhead = ungatedRender('', linkUrl).length;
  const rule = { ...makeRule('a'.repeat(1000 - rawOverhead)), linkUrl };
  assert.equal(ungatedRender(rule.dmMessage, linkUrl).length, 1000);
  assert.ok(ungatedRender(rule.dmMessage, linkUrl, trackedUrl).length > 1000);
  assert.deepEqual(validateRule(rule), [ungatedLengthError]);
});

test('ungated rule accepts exactly 1000 rendered characters and rejects 1001', () => {
  const template = '{{username}}';
  const overhead = ungatedRender(template, null).length;
  const rule = makeRule(template + 'a'.repeat(1000 - overhead));
  assert.equal(ungatedRender(rule.dmMessage, null).length, 1000);
  assert.deepEqual(validateRule(rule), []);
  assert.deepEqual(validateRule({ ...rule, dmMessage: rule.dmMessage + 'a' }), [ungatedLengthError]);
});

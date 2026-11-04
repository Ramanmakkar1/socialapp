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

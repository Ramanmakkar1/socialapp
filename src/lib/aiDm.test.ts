import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDmIdeas } from './ai';

test('parses valid JSON wrapped in prose', () => {
  const text =
    'Here are your DMs:\n["Hi {{username}}! Grab {{link}}", "Hey {{username}}, check {{link}} out", "Hello {{username}}! {{link}} is for you"]\nHope these help!';
  assert.deepEqual(parseDmIdeas(text, true), [
    'Hi {{username}}! Grab {{link}}',
    'Hey {{username}}, check {{link}} out',
    'Hello {{username}}! {{link}} is for you',
  ]);
});

test('invalid JSON gives []', () => {
  assert.deepEqual(parseDmIdeas('no json here at all', false), []);
  assert.deepEqual(parseDmIdeas('["broken",', false), []);
});

test('non-string items are dropped', () => {
  const text = '["good {{link}}", 42, null, {"a": 1}, ""]';
  assert.deepEqual(parseDmIdeas(text, false), ['good {{link}}']);
});

test('idea without {{link}} is dropped when requireLink=true and kept when false', () => {
  const text = '["no link here", "with {{link}}"]';
  assert.deepEqual(parseDmIdeas(text, true), ['with {{link}}']);
  assert.deepEqual(parseDmIdeas(text, false), ['no link here', 'with {{link}}']);
});

test('returns at most 3 ideas', () => {
  const text = '["a {{link}}", "b {{link}}", "c {{link}}", "d {{link}}"]';
  assert.deepEqual(parseDmIdeas(text, true), ['a {{link}}', 'b {{link}}', 'c {{link}}']);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_AI_REPLIES_PER_DAY,
  shouldAiReply,
  buildAiReplyPrompt,
  parseAiReply,
  type AiReplySettings,
  type ChatTurn,
} from './aiReply';

const settings: AiReplySettings = {
  enabled: true,
  instructions: null,
  bookingLink: null,
  brandVoice: null,
};

const recentInbound = () => new Date(Date.now() - 60_000);

test('shouldAiReply: happy path', () => {
  assert.equal(
    shouldAiReply({
      settings,
      text: 'I would like to book a session',
      lastInboundAt: recentInbound(),
      aiRepliesLast24h: 0,
      hasPendingGate: false,
    }),
    true
  );
});

test('shouldAiReply: disabled settings', () => {
  assert.equal(
    shouldAiReply({
      settings: { ...settings, enabled: false },
      text: 'hi',
      lastInboundAt: recentInbound(),
      aiRepliesLast24h: 0,
      hasPendingGate: false,
    }),
    false
  );
});

test('shouldAiReply: empty text', () => {
  assert.equal(
    shouldAiReply({
      settings,
      text: '   ',
      lastInboundAt: recentInbound(),
      aiRepliesLast24h: 0,
      hasPendingGate: false,
    }),
    false
  );
});

test('shouldAiReply: pending email/follow gate', () => {
  assert.equal(
    shouldAiReply({
      settings,
      text: 'hi',
      lastInboundAt: recentInbound(),
      aiRepliesLast24h: 0,
      hasPendingGate: true,
    }),
    false
  );
});

test('shouldAiReply: 5 AI replies already in the last 24 h', () => {
  assert.equal(
    shouldAiReply({
      settings,
      text: 'hi',
      lastInboundAt: recentInbound(),
      aiRepliesLast24h: MAX_AI_REPLIES_PER_DAY,
      hasPendingGate: false,
    }),
    false
  );
});

test('shouldAiReply: last inbound 25 h ago', () => {
  assert.equal(
    shouldAiReply({
      settings,
      text: 'hi',
      lastInboundAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      aiRepliesLast24h: 0,
      hasPendingGate: false,
    }),
    false
  );
});

test('buildAiReplyPrompt: booking link / instructions / brand voice only when set', () => {
  const plain = buildAiReplyPrompt(settings, [{ direction: 'in', text: 'hi' }]);
  assert.ok(!plain.system.includes('Booking link:'));
  assert.ok(!plain.system.includes('Business instructions:'));
  assert.ok(!plain.system.includes('Brand voice:'));

  const full = buildAiReplyPrompt(
    {
      enabled: true,
      instructions: 'We are a yoga studio in Leeds',
      bookingLink: 'https://poskoo.com/book',
      brandVoice: 'warm and calm',
    },
    [{ direction: 'in', text: 'hi' }]
  );
  assert.ok(full.system.includes('Business instructions: We are a yoga studio in Leeds'));
  assert.ok(full.system.includes('Booking link: https://poskoo.com/book'));
  assert.ok(full.system.includes('Brand voice: warm and calm'));
});

test('buildAiReplyPrompt: keeps 10 turns max and starts with a user turn', () => {
  const history: ChatTurn[] = [];
  for (let i = 0; i < 12; i++) {
    history.push({ direction: 'in', text: `in ${i}` });
    history.push({ direction: 'out', text: `out ${i}` });
  }
  const { messages } = buildAiReplyPrompt(settings, history);
  assert.equal(messages.length, 10);
  assert.equal(messages[0].role, 'user');
  assert.equal(messages[0].content, 'in 7');

  const leading = buildAiReplyPrompt(settings, [
    { direction: 'out', text: 'old bot message' },
    { direction: 'in', text: 'hello' },
  ]);
  assert.equal(leading.messages.length, 1);
  assert.equal(leading.messages[0].role, 'user');
  assert.equal(leading.messages[0].content, 'hello');
});

test('buildAiReplyPrompt: merges consecutive same-role turns', () => {
  const { messages } = buildAiReplyPrompt(settings, [
    { direction: 'in', text: 'a' },
    { direction: 'in', text: 'b' },
    { direction: 'out', text: 'c' },
  ]);
  assert.deepEqual(messages, [
    { role: 'user', content: 'a\nb' },
    { role: 'assistant', content: 'c' },
  ]);
});

test('parseAiReply: trims and strips surrounding quotes', () => {
  assert.equal(parseAiReply('  "Hi there!"  '), 'Hi there!');
  assert.equal(parseAiReply("  'Hi there'  "), 'Hi there');
});

test('parseAiReply: null for whitespace and empty quotes', () => {
  assert.equal(parseAiReply('   '), null);
  assert.equal(parseAiReply('""'), null);
});

test('parseAiReply: cuts a 1500-char reply to at most 1000 at the last space', () => {
  const long = ('word '.repeat(300)).trimEnd(); // 1499 chars
  assert.equal(long.length, 1499);
  const out = parseAiReply(long);
  assert.ok(out !== null);
  assert.ok(out.length <= 1000);
  assert.ok(!out.endsWith(' '));
  assert.ok(long.startsWith(out));
});

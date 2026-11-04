import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  HOURLY_LIMIT_PER_ACCOUNT,
  MAX_ATTEMPTS,
  classifyMetaError,
  isTokenError,
  messagingWindowError,
  nextAttemptDelayMs,
  remainingBudget,
} from './sendPolicy.ts';

test('messaging windows: 24 h for DMs, 7 days for comment private replies', () => {
  const now = Date.parse('2026-11-04T12:00:00Z');
  const hours = (h: number) => new Date(now - h * 3_600_000);
  assert.equal(messagingWindowError({ comment_id: null, created_at: hours(23) }, now), null);
  assert.match(messagingWindowError({ comment_id: null, created_at: hours(25) }, now) ?? '', /24-hour/);
  assert.equal(messagingWindowError({ comment_id: 'c1', created_at: hours(25) }, now), null);
  assert.match(messagingWindowError({ comment_id: 'c1', created_at: hours(24 * 7 + 1) }, now) ?? '', /7-day/);
  assert.equal(messagingWindowError({ comment_id: null, created_at: null }, now), null);
});

test('token errors: 401 and OAuth code 190', () => {
  assert.equal(isTokenError(401, null), true);
  assert.equal(isTokenError(400, { error: { code: 190 } }), true);
  assert.equal(isTokenError(400, { error: { code: 100 } }), false);
});

test('429 and Meta throttling codes are rate_limited', () => {
  assert.equal(classifyMetaError(429, null), 'rate_limited');
  for (const code of [4, 17, 32, 613]) {
    assert.equal(classifyMetaError(400, { error: { code } }), 'rate_limited');
  }
});

test('5xx and network errors are retried', () => {
  assert.equal(classifyMetaError(500, { error: { code: 2 } }), 'retry');
  assert.equal(classifyMetaError(503, 'Service Unavailable'), 'retry');
  assert.equal(classifyMetaError(0, null), 'retry');
});

test('user cannot be messaged or window closed is fatal', () => {
  for (const code of [10, 100, 551]) {
    assert.equal(classifyMetaError(400, { error: { code } }), 'fatal');
  }
});

test('backoff grows exponentially without jitter', () => {
  const mid = () => 0.5;
  assert.equal(nextAttemptDelayMs(0, mid), 30_000);
  assert.equal(nextAttemptDelayMs(1, mid), 60_000);
  assert.equal(nextAttemptDelayMs(2, mid), 120_000);
  assert.equal(nextAttemptDelayMs(3, mid), 240_000);
});

test('backoff jitter stays within 10 percent', () => {
  assert.equal(nextAttemptDelayMs(1, () => 0), 54_000);
  assert.equal(nextAttemptDelayMs(1, () => 1), 66_000);
});

test('backoff is capped at one hour', () => {
  for (const r of [0, 0.5, 1]) {
    assert.ok(nextAttemptDelayMs(20, () => r) <= 3_600_000);
  }
  assert.equal(nextAttemptDelayMs(20, () => 0.5), 3_600_000);
  assert.equal(nextAttemptDelayMs(20, () => 0), 3_240_000);
});

test('budget counts down and never goes below 0', () => {
  assert.equal(remainingBudget(0), HOURLY_LIMIT_PER_ACCOUNT);
  assert.equal(remainingBudget(170), HOURLY_LIMIT_PER_ACCOUNT - 170);
  assert.equal(remainingBudget(HOURLY_LIMIT_PER_ACCOUNT), 0);
  assert.equal(remainingBudget(500), 0);
  assert.ok(HOURLY_LIMIT_PER_ACCOUNT < 200);
  assert.equal(MAX_ATTEMPTS, 5);
});

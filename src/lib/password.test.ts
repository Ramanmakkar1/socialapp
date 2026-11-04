import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, validateSignup, normalizeEmail, hashToken } from './password';

test('hash then verify is true', async () => {
  const stored = await hashPassword('correct horse');
  assert.match(stored, /^scrypt\$16384\$8\$1\$[^$]+\$[^$]+$/);
  assert.equal(await verifyPassword('correct horse', stored), true);
});

test('wrong password is false', async () => {
  const stored = await hashPassword('correct horse');
  assert.equal(await verifyPassword('wrong horse', stored), false);
});

test('garbage stored string is false and does not throw', async () => {
  assert.equal(await verifyPassword('anything', 'garbage'), false);
  assert.equal(await verifyPassword('anything', ''), false);
  assert.equal(await verifyPassword('anything', 'scrypt$x$8$1$abc$def'), false);
});

test('validateSignup rejects bad email and short password', () => {
  assert.ok(validateSignup({ email: 'bad', password: 'longenough' }).length > 0);
  assert.ok(validateSignup({ email: 'a@b.co', password: '1234567' }).length > 0);
  assert.deepEqual(validateSignup({ email: 'a@b.co', password: '12345678' }), []);
});

test('normalizeEmail trims and lowercases', () => {
  assert.equal(normalizeEmail(' A@B.co '), 'a@b.co');
});

test('hashToken is sha256 hex', () => {
  assert.match(hashToken('abc'), /^[0-9a-f]{64}$/);
});

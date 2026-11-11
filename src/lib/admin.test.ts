// Admin allow-list + audit: built-ins, ADMIN_EMAILS parsing, the requireAdmin decision,
// and the best-effort audit insert.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { adminAudit, adminDecision, adminEmails, BUILTIN_ADMINS, isAdminEmail } from "./admin.ts";

const savedEnv = process.env.ADMIN_EMAILS;
afterEach(() => {
  if (savedEnv === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = savedEnv;
});

test("built-in admins are always allowed", () => {
  delete process.env.ADMIN_EMAILS;
  const list = adminEmails();
  for (const email of BUILTIN_ADMINS) {
    assert.ok(list.includes(email), `missing builtin ${email}`);
  }
  assert.equal(isAdminEmail("townmedialabs@gmail.com"), true);
  assert.equal(isAdminEmail("raman@townmedialabs.ca"), true);
});

test("ADMIN_EMAILS adds admins, trimmed and case-insensitive", () => {
  process.env.ADMIN_EMAILS = "  Boss@Example.com , ops@poskoo.com ,";
  const list = adminEmails();
  assert.ok(list.includes("boss@example.com"));
  assert.ok(list.includes("ops@poskoo.com"));
  assert.equal(isAdminEmail("BOSS@example.com"), true);
  assert.equal(isAdminEmail("ops@poskoo.com"), true);
});

test("non-admins and empty emails are rejected", () => {
  process.env.ADMIN_EMAILS = "boss@example.com";
  assert.equal(isAdminEmail("random@user.com"), false);
  assert.equal(isAdminEmail("boss@example.co"), false);
  assert.equal(isAdminEmail(null), false);
  assert.equal(isAdminEmail(undefined), false);
  assert.equal(isAdminEmail("   "), false);
});

test("adminDecision: guest / non_admin / admin (allow-listed AND verified through Google)", () => {
  delete process.env.ADMIN_EMAILS;
  assert.equal(adminDecision(null), "guest");
  assert.equal(adminDecision({ id: "1", email: "random@user.com", name: null, emailVerified: true }), "non_admin");
  assert.equal(adminDecision({ id: "2", email: "TownMediaLabs@gmail.com", name: null, emailVerified: true }), "admin");
});

test("an allow-listed email from a password sign-up (never verified) is NOT an admin", () => {
  delete process.env.ADMIN_EMAILS;
  assert.equal(adminDecision({ id: "3", email: "townmedialabs@gmail.com", name: null }), "non_admin");
  assert.equal(adminDecision({ id: "3", email: "townmedialabs@gmail.com", name: null, emailVerified: false }), "non_admin");
});

test("adminAudit inserts a row with the target and details", async () => {
  const { pool, calls } = createFakePool([
    { match: /insert into socialapp\.admin_audit/, reply: () => [] },
  ]);
  const restore = installFakePool(pool);
  try {
    await adminAudit({ id: "a", email: "boss@example.com", name: null }, "suspend_user", {
      userId: "u-1",
      email: "user@example.com",
      details: { plan: "pro" },
    });
    const insert = calls.find((c) => /insert into socialapp\.admin_audit/.test(c.sql));
    assert.ok(insert, "no insert recorded");
    assert.deepEqual(insert!.params, ["boss@example.com", "suspend_user", "u-1", "user@example.com", '{"plan":"pro"}']);
  } finally {
    restore();
  }
});

test("adminAudit is a no-op when the DB is not configured", async () => {
  const { pool } = createFakePool([]);
  const restore = installFakePool(pool);
  // Point the pool at a handler that throws if anything is queried.
  (pool as unknown as { query: (s: string) => Promise<unknown> }).query = async () => {
    throw new Error("should not query");
  };
  const savedUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    await adminAudit({ id: "a", email: "boss@example.com", name: null }, "noop");
  } finally {
    restore();
    if (savedUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedUrl;
  }
});

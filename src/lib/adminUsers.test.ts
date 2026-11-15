// Admin → Users: effective plan rules and the list query's parameters.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { effectivePlan, listAdminUsers } from "./adminUsers.ts";

const NOW = new Date("2026-11-15T12:00:00Z");

test("effectivePlan: verified admins get Agency, an unverified admin address does not", () => {
  assert.deepEqual(effectivePlan({ email: "townmedialabs@gmail.com", verified: true, plan: null, status: null, past_due_since: null }, NOW), { plan: "Agency", viaAdmin: true });
  assert.deepEqual(effectivePlan({ email: "townmedialabs@gmail.com", verified: false, plan: null, status: null, past_due_since: null }, NOW), { plan: "Free", viaAdmin: false });
});

test("effectivePlan follows the billing row (active, grace, expired grace, abandoned checkout)", () => {
  const u = { email: "a@example.com", verified: true };
  assert.equal(effectivePlan({ ...u, plan: "Pro", status: "active", past_due_since: null }, NOW).plan, "Pro");
  assert.equal(effectivePlan({ ...u, plan: "Agency", status: "past_due", past_due_since: "2026-11-13T00:00:00Z" }, NOW).plan, "Agency");
  assert.equal(effectivePlan({ ...u, plan: "Agency", status: "past_due", past_due_since: "2026-11-01T00:00:00Z" }, NOW).plan, "Free");
  assert.equal(effectivePlan({ ...u, plan: null, status: null, past_due_since: null }, NOW).plan, "Free");
});

test("listAdminUsers passes the escaped search, LIMIT n+1, offset and the UTC month", async () => {
  const fake = createFakePool([
    {
      match: /with page as/,
      reply: () => Array.from({ length: 26 }, (_, i) => ({ id: String(i) })),
    },
  ]);
  const restore = installFakePool(fake.pool);
  try {
    const res = await listAdminUsers({ q: "@shop_1", page: 2, now: NOW });
    assert.equal(res.rows.length, 25);
    assert.equal(res.hasNext, true);
    const [pattern, limit, offset, start, end] = fake.calls[0].params;
    assert.equal(pattern, "%shop\\_1%");
    assert.equal(limit, 26);
    assert.equal(offset, 25);
    assert.equal(start, "2026-11-01T00:00:00.000Z");
    assert.equal(end, "2026-12-01T00:00:00.000Z");

    await listAdminUsers({ q: "", page: 1, now: NOW });
    assert.equal(fake.calls[1].params[0], null);
  } finally {
    restore();
  }
});

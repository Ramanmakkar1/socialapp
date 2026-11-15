// Admin → Audit log: filters are bound parameters; details are shown on one capped line.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { auditFilterOptions, detailsText, listAudit } from "./adminAuditLog.ts";

test("listAudit binds action, admin and a target email pattern", async () => {
  const fake = createFakePool([{ match: /from socialapp.admin_audit/, reply: () => [] }]);
  const restore = installFakePool(fake.pool);
  try {
    await listAudit({ action: "post.retry", admin: "raman@townmedialabs.ca", target: "shop_", page: 2 });
    assert.deepEqual(fake.calls[0].params, ["post.retry", "raman@townmedialabs.ca", "%shop\\_%", 26, 25]);
    await listAudit({ action: "", admin: "", target: "", page: 1 });
    assert.deepEqual(fake.calls[1].params, [null, null, null, 26, 0]);
  } finally {
    restore();
  }
});

test("auditFilterOptions merges known actions with the table's", async () => {
  const fake = createFakePool([
    { match: /distinct action/, reply: () => [{ action: "legacy.thing" }, { action: "post.retry" }] },
    { match: /distinct admin_email/, reply: () => [{ admin_email: "a@example.com" }] },
  ]);
  const restore = installFakePool(fake.pool);
  try {
    const o = await auditFilterOptions();
    assert.ok(o.actions.includes("legacy.thing"));
    assert.ok(o.actions.includes("ai_key.save"));
    assert.equal(o.actions.filter((a) => a === "post.retry").length, 1);
    assert.deepEqual(o.admins, ["a@example.com"]);
  } finally {
    restore();
  }
});

test("detailsText", () => {
  assert.equal(detailsText(null), "");
  assert.equal(detailsText({}), "");
  assert.equal(detailsText({ hint: "abcd" }), '{"hint":"abcd"}');
  assert.equal(detailsText({ x: "y".repeat(500) }, 20).length, 20);
});

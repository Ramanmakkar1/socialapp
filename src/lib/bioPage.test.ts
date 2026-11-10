import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import {
  planBioLinkChanges,
  saveBioPage,
  validateHandle,
  type BioLinkRow,
} from "./bioPage.ts";

const existing: BioLinkRow[] = [
  { id: "l1", label: "Shop", url: "https://shop.example", sort_order: 0, short_code: "abc123", clicks: 7 },
  { id: "l2", label: "Newsletter", url: "https://news.example", sort_order: 1, short_code: "def456", clicks: 3 },
];

test("editing a link keeps its short code and click count", () => {
  const plan = planBioLinkChanges(existing, [
    { id: "l1", label: "Shop the drop", url: "https://shop.example/new" },
    { id: "l2", label: "Newsletter", url: "https://news.example" },
  ]);
  assert.equal(plan.updates.length, 2);
  assert.equal(plan.inserts.length, 0);
  assert.deepEqual(plan.deletes, []);
  assert.equal(plan.updates[0].shortCode, "abc123");
  assert.equal(plan.updates[0].clicks, 7);
  assert.equal(plan.updates[0].url, "https://shop.example/new");
  assert.equal(plan.updates[1].shortCode, "def456");
});

test("removed links are deleted and new links are inserted", () => {
  const plan = planBioLinkChanges(existing, [
    { id: "l2", label: "Newsletter", url: "https://news.example" },
    { label: "Book a call", url: "https://cal.example" },
  ]);
  assert.deepEqual(plan.deletes, ["l1"]);
  assert.equal(plan.updates.length, 1);
  assert.equal(plan.inserts.length, 1);
  assert.equal(plan.inserts[0].label, "Book a call");
  assert.equal(plan.inserts[0].sortOrder, 1);
});

test("an unknown link id is treated as a new link, never as another user's link", () => {
  const plan = planBioLinkChanges(existing, [{ id: "not-mine", label: "New", url: "https://new.example" }]);
  assert.equal(plan.updates.length, 0);
  assert.equal(plan.inserts.length, 1);
  assert.deepEqual(plan.deletes, ["l1", "l2"]);
});

test("handle validation rejects reserved and malformed handles", () => {
  assert.equal(validateHandle("@Raman"), null);
  assert.match(validateHandle("app") ?? "", /reserved/);
  assert.match(validateHandle("a") ?? "", /at least 3/);
  assert.match(validateHandle("bad handle") ?? "", /lowercase letters/);
});

test("saveBioPage updates the destination without resetting clicks", async () => {
  const { pool, calls } = createFakePool([
    { match: /^insert into socialapp\.bio_pages/, reply: () => [{ id: "page1" }] },
    { match: /^select l\.id, l\.label/, reply: () => existing },
    { match: /^update socialapp\.bio_links set label/, reply: () => [] },
    { match: /^update socialapp\.short_links set target_url/, reply: () => [] },
    { match: /^insert into socialapp\.short_links/, reply: () => [] },
    { match: /^insert into socialapp\.bio_links/, reply: () => [] },
    { match: /^delete from socialapp\.bio_links/, reply: () => [] },
    { match: /^delete from socialapp\.short_links/, reply: () => [] },
  ]);
  const restore = installFakePool(pool);
  try {
    await saveBioPage("u1", {
      handle: "@raman",
      displayName: "Raman",
      bio: "Founder",
      links: [
        { id: "l1", label: "Shop the drop", url: "https://shop.example/new" },
        { id: "l2", label: "Newsletter", url: "https://news.example" },
      ],
    });
  } finally {
    restore();
  }

  const sql = calls.map((c) => c.sql);
  assert.ok(sql.some((s) => /^update socialapp\.short_links set target_url/.test(s)));
  assert.ok(!sql.some((s) => /clicks\s*=\s*0/i.test(s)), "click counters must never be reset");
  assert.ok(!sql.some((s) => /^delete from socialapp\.short_links/.test(s)), "kept links must keep their short link");
  const targetUpdate = calls.find((c) => /^update socialapp\.short_links set target_url/.test(c.sql));
  assert.deepEqual(targetUpdate?.params, ["abc123", "https://shop.example/new"]);
});

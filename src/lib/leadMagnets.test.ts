import assert from "node:assert/strict";
import { test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { createDmWorld, rule, sentPrompt, type WContact } from "../test-utils/dmWorld.ts";
import { readDeliveryFields, readRuleIds } from "./digitalDelivery.ts";
import { leadMagnetTag } from "./leadMagnets.ts";

const ACCOUNT = { id: "account-1", user_id: "owner", external_id: "ig-acct", status: "active", access_token_enc: "x", dm_cooldown_until: null };
const MAGNET_URL = "https://files.example.com/guide.pdf";
const lead = (extra: Partial<WContact> = {}): WContact => ({
  id: "contact-lead", user_id: "owner", social_account_id: "account-1", external_id: "lead",
  username: "lead", email: null, phone: null, source_rule_id: "rule-a", ...extra,
});
const reply = (text: string, mid = "m1") => ({ accountExternalId: "ig-acct", senderId: "lead", text, mid });

async function inWorld(world: ReturnType<typeof createDmWorld>, run: () => Promise<void>) {
  const { pool } = createFakePool(world.handlers);
  const restore = installFakePool(pool);
  const prev = console.error;
  console.error = () => {};
  try {
    await run();
  } finally {
    console.error = prev;
    restore();
  }
}

test("email gate collects an email: the DM sends the lead magnet link once and the lead is tagged", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    // Attaching a magnet copies its delivery URL into the rule's link (saveLeadMagnet).
    rules: [rule({ id: "rule-a", email_gate: true, link_url: MAGNET_URL })],
    contacts: [lead()],
    queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000)],
    magnets: [{ id: "magnet-1", user_id: "owner", title: "Free guide", rule_ids: ["rule-a"] }],
  });
  await inWorld(world, async () => {
    await processMessageEvents([reply("sure, me@example.com")]);
    const gated = world.queue.filter((q) => q.kind === "gated_link");
    assert.equal(gated.length, 1);
    // Tracked short link for the magnet's URL (click tracking via /l/<code>).
    assert.match(gated[0].message, /^Thanks! Here.s your link: https:\/\/.+\/l\/coderulea$/);
    assert.deepEqual(world.deliveries, [{ lead_magnet_id: "magnet-1", rule_id: "rule-a", contact_id: "contact-lead" }]);
    assert.deepEqual(world.contactTags.get("contact-lead"), [leadMagnetTag("Free guide")]);
    // A repeated reply delivers nothing new.
    await processMessageEvents([reply("me@example.com again", "m2")]);
    assert.equal(world.queue.filter((q) => q.kind === "gated_link").length, 1);
    assert.equal(world.deliveries.length, 1);
  });
});

test("no email yet: nothing is delivered; rules without a magnet record no delivery", async () => {
  const { processMessageEvents } = await import("./messages.ts");
  const waiting = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-a", email_gate: true, link_url: MAGNET_URL })],
    contacts: [lead()],
    queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000)],
    magnets: [{ id: "magnet-1", user_id: "owner", title: "Free guide", rule_ids: ["rule-a"] }],
  });
  await inWorld(waiting, async () => {
    await processMessageEvents([reply("what is this?")]);
    assert.equal(waiting.deliveries.length, 0);
    assert.equal(waiting.queue.filter((q) => q.kind === "gated_link").length, 0);
  });
  const plain = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-a", email_gate: true })],
    contacts: [lead()],
    queue: [sentPrompt("p1", "contact-lead", "rule-a", 1000)],
  });
  await inWorld(plain, async () => {
    await processMessageEvents([reply("me@example.com")]);
    assert.equal(plain.queue.filter((q) => q.kind === "gated_link").length, 1);
    assert.equal(plain.deliveries.length, 0);
  });
});

test("a returning lead with a known email gets the magnet straight from the comment reply and is recorded", async () => {
  const { processCommentEvents } = await import("./comments.ts");
  const world = createDmWorld({
    accounts: [{ ...ACCOUNT }],
    rules: [rule({ id: "rule-a", email_gate: true, link_url: MAGNET_URL })],
    contacts: [lead({ external_id: "fan", email: "fan@example.com" })],
    magnets: [{ id: "magnet-1", user_id: "owner", title: "Free guide", rule_ids: ["rule-a"] }],
  });
  await inWorld(world, async () => {
    await processCommentEvents([{ accountExternalId: "ig-acct", commentId: "c1", text: "link", fromId: "fan", fromUsername: "fan", mediaId: "m1" }]);
    assert.equal(world.queue[0]?.kind, "comment_link");
    assert.deepEqual(world.deliveries.map((d) => d.lead_magnet_id), ["magnet-1"]);
  });
});

test("lead magnet form validation: title and a public https delivery link are required", () => {
  const form = new FormData();
  form.set("title", "  ");
  form.set("delivery_type", "file");
  form.set("delivery_url", "http://insecure.example.com/a.pdf");
  form.set("cover_url", "javascript:alert(1)");
  const { errors } = readDeliveryFields(form);
  assert.deepEqual(errors, ["Add a title.", "Cover image URL must be a public https:// link.", "Download URL must be a public https:// link."]);
  const ok = new FormData();
  ok.set("title", "Guide");
  ok.set("delivery_url", "https://example.com/g");
  assert.deepEqual(readDeliveryFields(ok).errors, []);
  assert.equal(readDeliveryFields(ok).values.deliveryType, "link");
  const rules = new FormData();
  rules.append("rule_ids", "11111111-1111-4111-8111-111111111111");
  rules.append("rule_ids", "11111111-1111-4111-8111-111111111111");
  rules.append("rule_ids", "x' or 1=1");
  assert.deepEqual(readRuleIds(rules), ["11111111-1111-4111-8111-111111111111"]);
});

test("editing a rule's link away from its magnet URL detaches the magnet; an unchanged link keeps it", async () => {
  const rules = [
    { id: "rule-moved", user_id: "owner", lead_magnet_id: "mag-1", link_url: "https://example.com/other" },
    { id: "rule-same", user_id: "owner", lead_magnet_id: "mag-1", link_url: MAGNET_URL },
  ];
  const magnets = [{ id: "mag-1", delivery_url: MAGNET_URL }];
  const { pool } = createFakePool([
    {
      match: /^update socialapp\.dm_rules r set lead_magnet_id = null/,
      reply: (p) => {
        const r = rules.find((x) => x.id === p[0] && x.user_id === p[1]);
        const m = magnets.find((x) => x.id === r?.lead_magnet_id);
        if (!r || !m || r.link_url === m.delivery_url) return [];
        r.lead_magnet_id = null as unknown as string;
        return [{ id: r.id }];
      },
    },
  ]);
  const restore = installFakePool(pool);
  try {
    const { detachMagnetIfLinkChanged } = await import("./leadMagnets.ts");
    assert.equal(await detachMagnetIfLinkChanged("owner", "rule-moved"), true);
    assert.equal(await detachMagnetIfLinkChanged("owner", "rule-same"), false);
    assert.equal(await detachMagnetIfLinkChanged("someone-else", "rule-same"), false);
  } finally {
    restore();
  }
  assert.equal(rules[0].lead_magnet_id, null);
  assert.equal(rules[1].lead_magnet_id, "mag-1");
});

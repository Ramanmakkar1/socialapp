import assert from "node:assert/strict";
import { test } from "node:test";
import type pg from "pg";
import {
  extractEmail,
  extractMessageEvents,
  extractPhone,
} from "./messageParse.ts";

test("extractMessageEvents on valid payload returns 1 event", () => {
  const body = {
    object: "instagram",
    entry: [
      {
        id: "17841400000000000",
        messaging: [
          {
            sender: { id: "123456789" },
            recipient: { id: "17841400000000000" },
            timestamp: 1234567890,
            message: { mid: "m_mid", text: "my email is a@b.com" },
          },
        ],
      },
    ],
  };
  const events = extractMessageEvents(body);
  assert.equal(events.length, 1);
  assert.equal(events[0].accountExternalId, "17841400000000000");
  assert.equal(events[0].senderId, "123456789");
  assert.equal(events[0].text, "my email is a@b.com");
  assert.equal(events[0].mid, "m_mid");
});

test("extractMessageEvents skips is_echo messages", () => {
  const body = {
    entry: [
      {
        id: "acc1",
        messaging: [
          {
            sender: { id: "user1" },
            message: { text: "echo", is_echo: true },
          },
        ],
      },
    ],
  };
  assert.deepEqual(extractMessageEvents(body), []);
});

test("extractMessageEvents skips payload without text", () => {
  const body = {
    entry: [
      {
        id: "acc1",
        messaging: [
          {
            sender: { id: "user1" },
            message: { mid: "m1" },
          },
        ],
      },
    ],
  };
  assert.deepEqual(extractMessageEvents(body), []);
});

test("extractMessageEvents malformed input returns []", () => {
  assert.deepEqual(extractMessageEvents(null), []);
  assert.deepEqual(extractMessageEvents({}), []);
  assert.deepEqual(extractMessageEvents({ entry: "x" }), []);
});

test("extractEmail finds and normalizes email", () => {
  assert.equal(
    extractEmail("my mail is John.Doe@Example.com."),
    "john.doe@example.com",
  );
  assert.equal(extractEmail("hi"), null);
});

test("extractPhone finds normalized phone", () => {
  assert.equal(extractPhone("call +1 (416) 555-0199"), "+14165550199");
  assert.equal(extractPhone("order 12"), null);
});

test("follow verification preserves retries and gated-link deduplication", async (t) => {
  const { processMessageEvents } = await import("./messages.ts");
  const { encryptToken } = await import("./crypto.ts");
  for (const scenario of ["missing token", "null verification", "non-follower"] as const) {
    await t.test(scenario, async () => {
      const previousPool = globalThis.__socialappPool;
      const previousUrl = process.env.DATABASE_URL;
      const previousKey = process.env.TOKEN_ENCRYPTION_KEY;
      const previousFetch = globalThis.fetch;
      const previousError = console.error;
      const queued: { contact: unknown; kind: string; message: unknown }[] = [];
      const updated: unknown[] = [];
      const verified: string[] = [];
      let recovered = false;
      process.env.DATABASE_URL = "mock";
      process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32).toString("base64");
      const token = encryptToken("test-token");
      const query = async (sql: string, params: unknown[] = []) => {
        if (sql.includes("select id, user_id")) {
          return { rows: [{ id: params[0], user_id: "owner" }] };
        }
        if (sql.includes("select access_token_enc")) {
          return { rows: [{ access_token_enc:
            scenario === "missing token" && !recovered && params[0] === "account"
              ? null : token }] };
        }
        if (sql.includes("from socialapp.contacts c")) {
          return { rows: [{ id: params[1], email: "lead@example.com",
            source_rule_id: "rule", link_url: "https://example.com/lead",
            email_gate: true, follow_gate: true }] };
        }
        if (sql.startsWith("insert into socialapp.contacts")) {
          updated.push(params[1]);
          return { rows: [{ id: params[1] }] };
        }
        if (sql.includes("insert into socialapp.short_links")) {
          return { rows: [{ code: "abc123" }] };
        }
        if (sql.includes("select 1 as ok")) {
          return { rows: queued.filter((row) => row.contact === params[0] && row.kind === "gated_link") };
        }
        if (sql.includes("select count(*)")) {
          return { rows: [{ n: queued.filter((row) => row.contact === params[0] && row.kind === "follow_nudge").length }] };
        }
        if (sql.includes("insert into socialapp.dm_queue")) {
          queued.push({ contact: params[3], message: params[5],
            kind: sql.includes("'gated_link'") ? "gated_link" : "follow_nudge" });
          return { rows: [] };
        }
        assert.ok(["begin", "commit", "rollback"].includes(sql) || sql.includes("pg_advisory_xact_lock"), sql);
        return { rows: [] };
      };
      globalThis.__socialappPool = {
        query,
        connect: async () => ({ query, release: () => {} }),
      } as unknown as pg.Pool;
      globalThis.fetch = async (input) => {
        const sender = new URL(String(input)).pathname.split("/").pop()!;
        verified.push(sender);
        const following = sender === "healthy" || recovered ? true
          : scenario === "non-follower" ? false : null;
        return Response.json({ is_user_follow_business: following });
      };
      console.error = () => {};
      const event = { accountExternalId: "account", senderId: "lead", text: "done", mid: "m1" };
      try {
        if (scenario === "non-follower") {
          assert.equal(await processMessageEvents([event]), 1);
          assert.deepEqual(queued.map((row) => row.kind), ["follow_nudge"]);
          assert.deepEqual(verified, ["lead"]);
        } else {
          await assert.rejects(processMessageEvents([
            event,
            { ...event, accountExternalId: "healthy-account", senderId: "healthy", mid: "m2" },
          ]), /message event processing incomplete/);
          assert.deepEqual(updated, ["lead", "healthy"]);
          assert.deepEqual(queued.map((row) => [row.contact, row.kind]), [["healthy", "gated_link"]]);
          assert.deepEqual(verified, scenario === "missing token" ? ["healthy"] : ["lead", "healthy"]);
          recovered = true;
          assert.equal(await processMessageEvents([event]), 1);
          assert.equal(await processMessageEvents([event]), 1);
          const links = queued.filter((row) => row.contact === "lead");
          assert.equal(links.length, 1);
          assert.equal(links[0].kind, "gated_link");
          assert.match(String(links[0].message), /^Thanks! Here's your link: .*\/l\/abc123$/);
        }
      } finally {
        globalThis.__socialappPool = previousPool;
        globalThis.fetch = previousFetch;
        console.error = previousError;
        if (previousUrl === undefined) delete process.env.DATABASE_URL;
        else process.env.DATABASE_URL = previousUrl;
        if (previousKey === undefined) delete process.env.TOKEN_ENCRYPTION_KEY;
        else process.env.TOKEN_ENCRYPTION_KEY = previousKey;
      }
    });
  }
});

test("processMessageEvents blocks ineligible rule context but keeps capture", async (t) => {
  const { processMessageEvents } = await import("./messages.ts");
  type RuleJoin = {
    link_url: string | null;
    email_gate: boolean | null;
    follow_gate: boolean | null;
  };
  const ineligible: { name: string; rule: RuleJoin; text: string }[] = [
    {
      name: "paused rule",
      rule: { link_url: null, email_gate: null, follow_gate: null },
      text: "done",
    },
    {
      name: "contact on another account",
      rule: { link_url: null, email_gate: null, follow_gate: null },
      text: "done",
    },
    {
      name: "rule scoped to another account",
      rule: { link_url: null, email_gate: null, follow_gate: null },
      text: "done",
    },
  ];
  for (const scenario of ineligible) {
    await t.test(scenario.name, async () => {
      const previousPool = globalThis.__socialappPool;
      const previousUrl = process.env.DATABASE_URL;
      const previousFetch = globalThis.fetch;
      const queued: unknown[] = [];
      const verified: string[] = [];
      process.env.DATABASE_URL = "mock";
      const query = async (sql: string, params: unknown[] = []) => {
        if (sql.includes("select id, user_id")) {
          return { rows: [{ id: "account-1", user_id: "owner" }] };
        }
        if (sql.includes("from socialapp.contacts c")) {
          return {
            rows: [
              {
                id: "contact-1",
                email: "lead@example.com",
                source_rule_id: "rule-1",
                ...scenario.rule,
              },
            ],
          };
        }
        if (sql.startsWith("insert into socialapp.contacts")) {
          return { rows: [{ id: "contact-1" }] };
        }
        if (sql.includes("insert into socialapp.dm_queue")) {
          queued.push(params);
          return { rows: [] };
        }
        assert.ok(
          ["begin", "commit", "rollback"].includes(sql) ||
            sql.includes("pg_advisory_xact_lock"),
          sql,
        );
        return { rows: [] };
      };
      globalThis.__socialappPool = {
        query,
        connect: async () => ({ query, release: () => {} }),
      } as unknown as pg.Pool;
      globalThis.fetch = async (input) => {
        verified.push(new URL(String(input)).pathname.split("/").pop()!);
        return Response.json({ is_user_follow_business: true });
      };
      try {
        assert.equal(
          await processMessageEvents([
            {
              accountExternalId: "account-1",
              senderId: "lead",
              text: scenario.text,
              mid: "m1",
            },
          ]),
          0,
        );
        assert.deepEqual(queued, []);
        assert.deepEqual(verified, []);
        assert.equal(
          await processMessageEvents([
            {
              accountExternalId: "account-1",
              senderId: "lead",
              text: "reach me at new@example.com",
              mid: "m2",
            },
          ]),
          1,
        );
        assert.deepEqual(queued, []);
        assert.deepEqual(verified, []);
      } finally {
        globalThis.__socialappPool = previousPool;
        globalThis.fetch = previousFetch;
        if (previousUrl === undefined) delete process.env.DATABASE_URL;
        else process.env.DATABASE_URL = previousUrl;
      }
    });
  }
});

test("processMessageEvents eligible rules keep gating and dedupe", async (t) => {
  const { processMessageEvents } = await import("./messages.ts");
  const { encryptToken } = await import("./crypto.ts");
  for (const label of ["all accounts", "matching account"] as const) {
    await t.test(label, async () => {
      const previousPool = globalThis.__socialappPool;
      const previousUrl = process.env.DATABASE_URL;
      const previousKey = process.env.TOKEN_ENCRYPTION_KEY;
      const previousFetch = globalThis.fetch;
      process.env.DATABASE_URL = "mock";
      process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32).toString("base64");
      const token = encryptToken("test-token");
      const queued: { kind: string; contact: unknown }[] = [];
      const query = async (sql: string, params: unknown[] = []) => {
        if (sql.includes("select id, user_id")) {
          return { rows: [{ id: "account-1", user_id: "owner" }] };
        }
        if (sql.includes("select access_token_enc")) {
          return { rows: [{ access_token_enc: token }] };
        }
        if (sql.includes("from socialapp.contacts c")) {
          assert.equal(params[2], "account-1");
          return {
            rows: [
              {
                id: "contact-1",
                email: "lead@example.com",
                source_rule_id: "rule-1",
                link_url: "https://example.com/lead",
                email_gate: true,
                follow_gate: true,
              },
            ],
          };
        }
        if (sql.startsWith("insert into socialapp.contacts")) {
          return { rows: [{ id: "contact-1" }] };
        }
        if (sql.includes("insert into socialapp.short_links")) {
          return { rows: [{ code: "abc123" }] };
        }
        if (sql.includes("select count(*)")) {
          return {
            rows: [
              {
                n: queued.filter(
                  (row) => row.kind === "follow_nudge" && row.contact === params[0],
                ).length,
              },
            ],
          };
        }
        if (sql.includes("insert into socialapp.dm_queue")) {
          const kind = sql.includes("'gated_link'") ? "gated_link" : "follow_nudge";
          if (kind === "gated_link") {
            const dup = queued.some((row) => row.kind === "gated_link");
            if (dup) return { rows: [] };
          }
          queued.push({ kind, contact: params[3] });
          return { rows: [] };
        }
        assert.ok(
          ["begin", "commit", "rollback"].includes(sql) ||
            sql.includes("pg_advisory_xact_lock"),
          sql,
        );
        return { rows: [] };
      };
      globalThis.__socialappPool = {
        query,
        connect: async () => ({ query, release: () => {} }),
      } as unknown as pg.Pool;
      globalThis.fetch = async () =>
        Response.json({ is_user_follow_business: true });
      const event = {
        accountExternalId: "account-1",
        senderId: "lead",
        text: "done",
        mid: "m1",
      };
      try {
        assert.equal(await processMessageEvents([event]), 1);
        assert.equal(await processMessageEvents([event]), 1);
        assert.deepEqual(
          queued.filter((row) => row.kind === "gated_link").length,
          1,
        );
      } finally {
        globalThis.__socialappPool = previousPool;
        globalThis.fetch = previousFetch;
        if (previousUrl === undefined) delete process.env.DATABASE_URL;
        else process.env.DATABASE_URL = previousUrl;
        if (previousKey === undefined) delete process.env.TOKEN_ENCRYPTION_KEY;
        else process.env.TOKEN_ENCRYPTION_KEY = previousKey;
      }
    });
  }
});


test("inbound contact details upsert without unsolicited automation", async (t) => {
  const { processMessageEvents } = await import("./messages.ts");
  for (const text of ["Email First@Example.com", "Call +1 (416) 555-0199"]) {
    await t.test(text, async () => {
      const previousPool = globalThis.__socialappPool;
      const previousUrl = process.env.DATABASE_URL;
      type Contact = {
        id: string; user_id: string; social_account_id: string;
        platform: string; external_id: string; email: string | null;
        phone: string | null; source_rule_id: string | null;
        name: string | null; tags: string[]; last_seen_at: number;
      };
      const contacts = new Map<string, Contact>();
      let writes = 0;
      let queued = 0;
      process.env.DATABASE_URL = "mock";
      const query = async (sql: string, params: unknown[] = []) => {
        if (sql.includes("select id, user_id")) {
          const id = String(params[0]);
          return { rows: [{ id, user_id: id === "other-account" ? "other-owner" : "owner" }] };
        }
        const key = JSON.stringify([params[0], "instagram", params[1]]);
        if (sql.includes("from socialapp.contacts c")) {
          assert.match(sql, /c.user_id = \$1.*c.platform = 'instagram'.*c.external_id = \$2/);
          const contact = contacts.get(key);
          // No rule, or an existing rule ineligible on the receiving account.
          return { rows: contact ? [{ ...contact, link_url: null,
            email_gate: null, follow_gate: null }] : [] };
        }
        if (sql.startsWith("insert into socialapp.contacts")) {
          assert.match(sql, /\(user_id, social_account_id, platform, external_id, email, phone\)/);
          assert.match(sql, /values \(\$1, \$5, 'instagram', \$2, \$3, \$4\)/);
          assert.match(sql, /on conflict \(user_id, platform, external_id\) do update/);
          assert.match(sql, /returning id/);
          const updates = sql.split("do update")[1].split("returning")[0].trim();
          assert.equal(updates.replace(/\s+/g, " "),
            "set email = coalesce(excluded.email, socialapp.contacts.email), " +
            "phone = coalesce(excluded.phone, socialapp.contacts.phone), last_seen_at = now()");
          writes++;
          const contact = contacts.get(key) ?? {
            id: `contact-${contacts.size}`, user_id: String(params[0]),
            social_account_id: String(params[4]), platform: "instagram",
            external_id: String(params[1]), email: null, phone: null,
            source_rule_id: null, name: null, tags: [], last_seen_at: 0,
          };
          contact.email = params[2] as string | null ?? contact.email;
          contact.phone = params[3] as string | null ?? contact.phone;
          contact.last_seen_at = writes;
          contacts.set(key, contact);
          return { rows: [{ id: contact.id }] };
        }
        if (sql.includes("insert into socialapp.dm_queue")) queued++;
        assert.fail(`Unexpected database operation: ${sql}`);
      };
      globalThis.__socialappPool = {
        query,
        connect: async () => assert.fail("No outbound queue transaction expected"),
      } as unknown as pg.Pool;
      const event = { accountExternalId: "account", senderId: "lead", text, mid: "m1" };
      const ownerKey = JSON.stringify(["owner", "instagram", "lead"]);
      try {
        assert.equal(await processMessageEvents([{ ...event, text: "hello" }]), 0);
        assert.equal(writes, 0);
        assert.equal(await processMessageEvents([event]), 1);
        const first = { ...contacts.get(ownerKey)! };
        assert.equal(first.email, extractEmail(text));
        assert.equal(first.phone, extractPhone(text));
        assert.equal(first.social_account_id, "account");
        assert.equal(first.source_rule_id, null);
        assert.equal(await processMessageEvents([event]), 1);
        assert.equal(contacts.size, 1);
        assert.equal(contacts.get(ownerKey)!.id, first.id);
        assert.ok(contacts.get(ownerKey)!.last_seen_at > first.last_seen_at);
        const attributed = { ...contacts.get(ownerKey)!, social_account_id: "original-account",
          source_rule_id: "original-rule", name: "Original name", tags: ["original-tag"],
          email: "old@example.com", phone: "+14165550100" };
        contacts.set(ownerKey, { ...attributed });
        assert.equal(await processMessageEvents([event]), 1);
        assert.deepEqual(contacts.get(ownerKey), { ...attributed,
          email: extractEmail(text) ?? attributed.email,
          phone: extractPhone(text) ?? attributed.phone, last_seen_at: writes });
        const ownerSnapshot = { ...contacts.get(ownerKey)! };
        assert.equal(await processMessageEvents([{ ...event, accountExternalId: "other-account" }]), 1);
        assert.equal(contacts.size, 2);
        assert.deepEqual(contacts.get(ownerKey), ownerSnapshot);
        const other = contacts.get(JSON.stringify(["other-owner", "instagram", "lead"]))!;
        assert.notEqual(other.id, first.id);
        assert.equal(other.social_account_id, "other-account");
        assert.equal(other.source_rule_id, null);
        assert.equal(queued, 0);
      } finally {
        globalThis.__socialappPool = previousPool;
        if (previousUrl === undefined) delete process.env.DATABASE_URL;
        else process.env.DATABASE_URL = previousUrl;
      }
    });
  }
});

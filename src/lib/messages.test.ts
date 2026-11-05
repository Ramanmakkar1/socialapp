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
        if (sql.startsWith("update socialapp.contacts")) {
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

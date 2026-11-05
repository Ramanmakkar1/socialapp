import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";
import { extractTimedMessageEvents, messageEventTime } from "./inboxTime.ts";

const now = Date.now();
const hour = 3_600_000;
const receipt = new Date(now);
const item = (timestamp: unknown, sender = "customer", extra = {}) => ({
  timestamp, sender: { id: sender }, message: { mid: "message", text: "Hello", ...extra },
});
const payload = (...items: unknown[]) => ({ entry: [{ id: "account", messaging: items }] });

test("event times preserve delayed messages and replay cannot refresh them", () => {
  const old = item(now - 25 * hour);
  assert.equal(messageEventTime(old, receipt)?.getTime(), now - 25 * hour);
  assert.equal(messageEventTime(old, new Date(now + hour))?.getTime(), now - 25 * hour);
  assert.equal(messageEventTime(item(now - hour), receipt)?.getTime(), now - hour);
});

test("missing, invalid and substantially future timestamps fail closed; small skew is capped", () => {
  for (const timestamp of [undefined, null, "123", NaN, Infinity, 0, -1, 1.5, now + 60_001]) {
    assert.equal(messageEventTime(item(timestamp), receipt), null);
  }
  assert.equal(messageEventTime({}, receipt), null);
  assert.equal(messageEventTime(item(now), new Date(NaN)), null);
  assert.equal(messageEventTime(item(now + 60_000), receipt)?.getTime(), now);
});

test("timestamps stay paired with parsed inbound items after filtering", () => {
  const parsed = extractTimedMessageEvents(payload(
    item(now, "customer", { is_echo: true }), item(now, "account"),
    { timestamp: now }, item(now - 25 * hour), item(undefined, "other"),
  ), receipt);
  assert.deepEqual(parsed.map((m) => [m.senderId, m.eventAt?.getTime() ?? null]), [
    ["customer", now - 25 * hour], ["other", null],
  ]);
});

// Exercise both production Inbox paths without a database or Next.js runtime.
const compiled = ts.transpileModule(readFileSync(new URL("./inbox.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

test("replayed expired threads stay read-only; genuine recent inbound enables both reply checks", async () => {
  for (const timestamp of [now - 25 * hour, now - hour, undefined, now + 2 * hour]) {
    const original = { payload: payload(item(timestamp)), received_at: receipt };
    const rows = [original, { ...original, received_at: new Date(now + 1000) }];
    if (timestamp === now - hour) rows.push({
      payload: payload(item(now - 25 * hour, "customer", { mid: "delayed", text: "Old" })),
      received_at: new Date(now + 2000),
    });
    // Newer receipts for echoes, the account itself, or other senders/accounts
    // must not override the matching customer's valid event time.
    rows.push({ payload: payload(item(now, "customer", { is_echo: true }), item(now, "account"), item(now, "other")), received_at: receipt });
    rows.push({ payload: { entry: [{ id: "another-account", messaging: [item(now)] }] }, received_at: receipt });
    const exports = {} as typeof import("./inbox.ts");
    const imports = (id: string) => {
      if (id === "@/lib/inboxTime") return { extractTimedMessageEvents };
      if (id === "@/lib/comments") return { extractCommentEvents: () => [] };
      if (id === "@/lib/sendPolicy") return { DM_WINDOW_MS: 24 * hour, COMMENT_REPLY_WINDOW_MS: 7 * 24 * hour };
      if (id === "@/lib/db") return { query: async (sql: string, params: unknown[]) => {
        if (sql.includes("socialapp.social_accounts")) {
          assert.deepEqual(params, ["owner"]);
          return [{ id: "local-account", external_id: "account", username: "owner" }];
        }
        if (sql.includes("socialapp.events")) {
          assert.deepEqual(params, sql.includes("interval '2 days'") ? ["account", "customer"] : [["account"]]);
          return [...rows].sort((a, b) => (a.received_at.getTime() - b.received_at.getTime()) * (sql.includes("desc") ? -1 : 1));
        }
        return [];
      } };
      throw new Error(`Unexpected import: ${id}`);
    };
    new Function("require", "exports", compiled)(imports, exports);
    const { threads } = await exports.loadInbox("owner");
    const thread = threads.find((t) => t.senderId === "customer")!;
    const last = await exports.lastInboundMessageAt("account", "customer");
    assert.equal(thread.lastInboundAt?.getTime() ?? null, last?.getTime() ?? null);
    for (const time of [thread.lastInboundAt, last]) {
      assert.equal(exports.withinWindow(time, exports.DM_WINDOW_MS, now), timestamp === now - hour);
    }
    assert.equal(thread.messages.length, timestamp === now - hour ? 2 : 1);
    assert.equal(thread.messages.at(-1)!.at.getTime(), timestamp && timestamp <= now ? timestamp : now);
    if (timestamp === now - hour) assert.equal(thread.messages[0].text, "Old");
  }
});

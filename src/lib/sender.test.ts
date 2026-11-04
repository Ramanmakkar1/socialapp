import assert from "node:assert/strict";
import { test } from "node:test";
import type pg from "pg";

type RuleRow = {
  id: string;
  user_id: string;
  social_account_id: string | null;
  status: string;
};

type QueueRow = {
  id: string;
  user_id: string;
  rule_id: string | null;
  social_account_id: string;
  status: string;
  created_at: number;
  comment_id: string | null;
  recipient_external_id: string;
  message: string;
  attempts: number;
  kind: string;
};

/** Mirrors the due-row NOT EXISTS paused filter in sender.ts. */
function blockedByPausedRule(row: Pick<QueueRow, "rule_id" | "user_id" | "social_account_id">, rules: RuleRow[]): boolean {
  if (!row.rule_id) return false;
  return rules.some(
    (r) =>
      r.id === row.rule_id &&
      r.user_id === row.user_id &&
      (r.social_account_id === null || r.social_account_id === row.social_account_id) &&
      r.status === "paused"
  );
}

function selectDueRows(queue: QueueRow[], rules: RuleRow[], accountId: string, limit: number): QueueRow[] {
  return queue
    .filter(
      (q) =>
        q.social_account_id === accountId &&
        q.status === "pending" &&
        !blockedByPausedRule(q, rules)
    )
    .sort((a, b) => a.created_at - b.created_at)
    .slice(0, limit);
}

test("due selection skips 500+ older paused rows and returns newer active row", () => {
  const userId = "user-1";
  const accountId = "acc-1";
  const pausedRule = "rule-paused";
  const activeRule = "rule-active";
  const rules: RuleRow[] = [
    { id: pausedRule, user_id: userId, social_account_id: accountId, status: "paused" },
    { id: activeRule, user_id: userId, social_account_id: accountId, status: "active" },
  ];
  const queue: QueueRow[] = [];
  for (let i = 0; i < 501; i += 1) {
    queue.push({
      id: `paused-${i}`,
      user_id: userId,
      rule_id: pausedRule,
      social_account_id: accountId,
      status: "pending",
      created_at: i,
      comment_id: `c-${i}`,
      recipient_external_id: "r1",
      message: "old",
      attempts: 0,
      kind: "comment_reply",
    });
  }
  queue.push({
    id: "active-new",
    user_id: userId,
    rule_id: activeRule,
    social_account_id: accountId,
    status: "pending",
    created_at: 10_000,
    comment_id: "c-new",
    recipient_external_id: "r1",
    message: "go",
    attempts: 0,
    kind: "comment_reply",
  });

  const due = selectDueRows(queue, rules, accountId, 500);
  assert.equal(due.length, 1);
  assert.equal(due[0]?.id, "active-new");
});

test("paused backlog becomes eligible when the rule is active again", () => {
  const userId = "user-1";
  const accountId = "acc-1";
  const ruleId = "rule-1";
  const rulesPaused: RuleRow[] = [
    { id: ruleId, user_id: userId, social_account_id: accountId, status: "paused" },
  ];
  const rulesActive: RuleRow[] = [
    { id: ruleId, user_id: userId, social_account_id: accountId, status: "active" },
  ];
  const queue: QueueRow[] = [
    {
      id: "q1",
      user_id: userId,
      rule_id: ruleId,
      social_account_id: accountId,
      status: "pending",
      created_at: 1,
      comment_id: "c1",
      recipient_external_id: "r1",
      message: "hi",
      attempts: 0,
      kind: "comment_reply",
    },
  ];
  assert.equal(selectDueRows(queue, rulesPaused, accountId, 500).length, 0);
  assert.equal(selectDueRows(queue, rulesActive, accountId, 500).length, 1);
});

test("deleted or missing rules are not filtered by the paused NOT EXISTS clause", () => {
  const userId = "user-1";
  const accountId = "acc-1";
  const queue: QueueRow[] = [
    {
      id: "q-null",
      user_id: userId,
      rule_id: null,
      social_account_id: accountId,
      status: "pending",
      created_at: 1,
      comment_id: "c1",
      recipient_external_id: "r1",
      message: "x",
      attempts: 0,
      kind: "comment_reply",
    },
    {
      id: "q-gone",
      user_id: userId,
      rule_id: "missing-rule",
      social_account_id: accountId,
      status: "pending",
      created_at: 2,
      comment_id: "c2",
      recipient_external_id: "r1",
      message: "y",
      attempts: 0,
      kind: "comment_reply",
    },
  ];
  const due = selectDueRows(queue, [], accountId, 500);
  assert.equal(due.length, 2);
});

test("gateDmSendByRule: paused waits, deleted skips, wrong account skips", async () => {
  const { gateDmSendByRule } = await import("./sender.ts");
  const rules = new Map<string, RuleRow>([
    ["r-paused", { id: "r-paused", user_id: "u1", social_account_id: "acc1", status: "paused" }],
    ["r-active", { id: "r-active", user_id: "u1", social_account_id: null, status: "active" }],
    ["r-other-acct", { id: "r-other-acct", user_id: "u1", social_account_id: "acc2", status: "active" }],
  ]);
  const client = {
    query: async (_sql: string, params?: unknown[]) => {
      const id = params?.[0] as string;
      const row = rules.get(id);
      return { rows: row ? [row] : [] };
    },
  } as unknown as pg.PoolClient;

  assert.deepEqual(await gateDmSendByRule(client, { rule_id: "r-paused", user_id: "u1" }, "acc1"), {
    action: "wait",
  });
  assert.deepEqual(await gateDmSendByRule(client, { rule_id: "missing", user_id: "u1" }, "acc1"), {
    action: "skip",
    error: "Automation rule was deleted",
  });
  assert.deepEqual(await gateDmSendByRule(client, { rule_id: "r-other-acct", user_id: "u1" }, "acc1"), {
    action: "skip",
    error: "Automation rule is scoped to a different Instagram account",
  });
  assert.deepEqual(await gateDmSendByRule(client, { rule_id: "r-active", user_id: "u1" }, "acc1"), {
    action: "send",
  });
});

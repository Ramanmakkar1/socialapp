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

type MockSocialAccount = {
  id: string;
  external_id: string;
  status: string;
  dm_cooldown_until: Date | null;
  access_token_enc: string;
  created_at: number;
  auth_type?: string;
};

type MockDmQueueRow = QueueRow & { next_attempt_at?: number; sent_at?: number | null; last_error?: string | null };

type InboundMock = Date | null | "throw";

function inboundEventRow(accountExternalId: string, senderId: string, at: Date) {
  return {
    payload: {
      entry: [
        {
          id: accountExternalId,
          messaging: [
            {
              timestamp: at.getTime(),
              sender: { id: senderId },
              message: { mid: "inbound-m1", text: "hey" },
            },
          ],
        },
      ],
    },
    received_at: new Date(),
  };
}

function installSendDueDmsHarness(
  accounts: MockSocialAccount[],
  queue: MockDmQueueRow[],
  rules: RuleRow[],
  inboundByThread: Map<string, InboundMock> = new Map()
) {
  const advisoryByAccount = new Map<string, string>();
  const locksByClient = new Map<string, Set<string>>();
  let clientSeq = 0;

  const poolQuery = async (sql: string, params?: unknown[]) => {
    if (sql.includes("platform='instagram' and status='active'")) {
      return {
        rows: accounts
          .filter((a) => a.status === "active")
          .sort((a, b) => a.created_at - b.created_at)
          .map((a) => ({
            id: a.id,
            external_id: a.external_id,
            access_token_enc: a.access_token_enc,
            auth_type: a.auth_type,
          })),
      };
    }
    if (sql.includes("interval '2 days'") && sql.includes("messaging")) {
      const accountExternalId = params?.[0] as string;
      const senderId = params?.[1] as string;
      const key = `${accountExternalId}:${senderId}`;
      const mock = inboundByThread.get(key);
      if (mock === "throw") throw new Error("inbound lookup failed");
      if (mock == null) return { rows: [] };
      return { rows: [inboundEventRow(accountExternalId, senderId, mock)] };
    }
    throw new Error(`unexpected pool query: ${sql.slice(0, 80)}`);
  };

  const clientQuery = (clientId: string) => async (sql: string, params?: unknown[]) => {
    const accountId = typeof params?.[0] === "string" ? (params[0] as string) : null;
    if (sql === "begin" || sql === "commit" || sql.startsWith("rollback")) {
      if (sql === "commit" || sql.startsWith("rollback")) {
        const held = locksByClient.get(clientId);
        if (held) {
          for (const id of held) advisoryByAccount.delete(id);
          locksByClient.delete(clientId);
        }
      }
      return { rows: [] };
    }
    if (sql.includes("pg_try_advisory_xact_lock")) {
      const acct = params?.[1] as string;
      if (advisoryByAccount.has(acct)) {
        return { rows: [{ locked: false }] };
      }
      advisoryByAccount.set(acct, clientId);
      if (!locksByClient.has(clientId)) locksByClient.set(clientId, new Set());
      locksByClient.get(clientId)!.add(acct);
      return { rows: [{ locked: true }] };
    }
    if (sql.includes("dm_cooldown_until from socialapp.social_accounts")) {
      const acct = accounts.find((a) => a.id === accountId);
      return {
        rows: acct ? [{ status: acct.status, dm_cooldown_until: acct.dm_cooldown_until }] : [],
      };
    }
    if (sql.includes("for update skip locked") && sql.includes("social_accounts")) {
      const acct = accounts.find((a) => a.id === accountId && a.status === "active");
      return { rows: acct ? [{ id: acct.id }] : [] };
    }
    if (sql.includes("count(*)::int as n from socialapp.dm_queue")) {
      const n = queue.filter(
        (q) =>
          q.social_account_id === accountId &&
          q.status === "sent" &&
          q.sent_at != null &&
          q.sent_at > Date.now() - 60 * 60 * 1000
      ).length;
      return { rows: [{ n }] };
    }
    if (sql.includes("from socialapp.dm_queue q") && sql.includes("for update of q")) {
      const acct = accounts.find((a) => a.id === accountId);
      const inCooldown =
        acct?.dm_cooldown_until != null && acct.dm_cooldown_until.getTime() > Date.now();
      const due = inCooldown
        ? []
        : queue
            .filter(
              (q) =>
                q.social_account_id === accountId &&
                q.status === "pending" &&
                (q.next_attempt_at ?? 0) <= Date.now() &&
                !blockedByPausedRule(q, rules)
            )
            .sort((a, b) => a.created_at - b.created_at)
            .slice(0, (params?.[1] as number) ?? 500);
      return {
        rows: due.map((q) => ({
          id: q.id,
          user_id: q.user_id,
          rule_id: q.rule_id,
          comment_id: q.comment_id,
          recipient_external_id: q.recipient_external_id,
          message: q.message,
          attempts: q.attempts,
          kind: q.kind,
          created_at: new Date(q.created_at),
        })),
      };
    }
    if (sql.includes("from socialapp.dm_rules where id=$1")) {
      const rule = rules.find((r) => r.id === params?.[0]);
      return { rows: rule ? [rule] : [] };
    }
    if (sql.includes("update socialapp.dm_queue set status='skipped'")) {
      const row = queue.find((q) => q.id === params?.[0]);
      if (row) {
        row.status = "skipped";
        row.last_error = params?.[1] as string;
      }
      return { rows: [] };
    }
    if (sql.startsWith("update socialapp.dm_queue set status='sent'")) {
      const row = queue.find((q) => q.id === params?.[0]);
      if (row) {
        row.status = "sent";
        row.sent_at = Date.now();
      }
      return { rows: [] };
    }
    if (sql.includes("update socialapp.social_accounts set dm_cooldown_until")) {
      const acct = accounts.find((a) => a.id === accountId);
      if (acct) acct.dm_cooldown_until = new Date(Date.now() + (params?.[1] as number));
      return { rows: [] };
    }
    if (sql.startsWith("update socialapp.dm_queue")) {
      return { rows: [] };
    }
    throw new Error(`unexpected client query: ${sql.slice(0, 100)}`);
  };

  const pool = {
    query: poolQuery,
    connect: async () => {
      const clientId = `c${clientSeq++}`;
      return {
        query: clientQuery(clientId),
        release: () => {},
      };
    },
  } as unknown as pg.Pool;

  return { pool, queue, accounts };
}

async function withSendDueDmsEnv<T>(
  accounts: MockSocialAccount[],
  queue: MockDmQueueRow[],
  rules: RuleRow[],
  run: (ctx: ReturnType<typeof installSendDueDmsHarness>) => Promise<T>,
  inboundByThread: Map<string, InboundMock> = new Map()
): Promise<T> {
  const previousPool = globalThis.__socialappPool;
  const previousUrl = process.env.DATABASE_URL;
  const previousKey = process.env.TOKEN_ENCRYPTION_KEY;
  const previousFetch = globalThis.fetch;
  process.env.DATABASE_URL = "mock";
  process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32).toString("base64");
  const { encryptToken } = await import("./crypto.ts");
  for (const acct of accounts) {
    if (!acct.access_token_enc) acct.access_token_enc = encryptToken("test-token");
  }
  const ctx = installSendDueDmsHarness(accounts, queue, rules, inboundByThread);
  globalThis.__socialappPool = ctx.pool;
  try {
    return await run(ctx);
  } finally {
    globalThis.__socialappPool = previousPool;
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.TOKEN_ENCRYPTION_KEY;
    else process.env.TOKEN_ENCRYPTION_KEY = previousKey;
  }
}

function baseQueueRow(overrides: Partial<MockDmQueueRow> & Pick<MockDmQueueRow, "id" | "social_account_id">): MockDmQueueRow {
  return {
    user_id: "user-1",
    rule_id: "rule-active",
    status: "pending",
    created_at: Date.now(),
    comment_id: "c1",
    recipient_external_id: "r1",
    message: "hi",
    attempts: 0,
    kind: "comment_reply",
    next_attempt_at: 0,
    sent_at: null,
    ...overrides,
  };
}

test("sendDueDms: overlapping runs serialize sends per Instagram account", async () => {
  const accountId = "acc-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  let releaseFetch: () => void = () => {};
  const fetchGate = new Promise<void>((resolve) => {
    releaseFetch = resolve;
  });
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    await fetchGate;
    return { ok: true, text: async () => "" } as Response;
  };

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: "ig-1",
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [baseQueueRow({ id: "q1", social_account_id: accountId })],
    rules,
    async () => {
      const { sendDueDms } = await import("./sender.ts");
      const first = sendDueDms(50);
      await new Promise((r) => setTimeout(r, 5));
      const second = await sendDueDms(50);
      assert.equal(second.sent, 0);
      releaseFetch();
      const firstResult = await first;
      assert.equal(firstResult.sent, 1);
      assert.equal(fetchCalls, 1);
    }
  );
});

test("sendDueDms: cooldown set by first run blocks the next run for that account", async () => {
  const accountId = "acc-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  globalThis.fetch = async () =>
    ({
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ error: { message: "rate", code: 4 } }),
    }) as Response;

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: "ig-1",
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [baseQueueRow({ id: "q1", social_account_id: accountId })],
    rules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const first = await sendDueDms(50);
      assert.equal(first.retried, 1);
      assert.ok(ctx.accounts[0]?.dm_cooldown_until);
      assert.equal(ctx.accounts[0]!.dm_cooldown_until!.getTime() > Date.now(), true);

      globalThis.fetch = async () => {
        throw new Error("should not send while account is in cooldown");
      };
      const second = await sendDueDms(50);
      assert.equal(second.sent, 0);
      assert.equal(second.retried, 0);
    }
  );
});

test("sendDueDms: cooldown on one account does not block another account", async () => {
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: null, status: "active" },
  ];
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => "" } as Response;
  };

  await withSendDueDmsEnv(
    [
      {
        id: "acc-cool",
        external_id: "ig-cool",
        status: "active",
        dm_cooldown_until: new Date(Date.now() + 60_000),
        access_token_enc: "",
        created_at: 1,
      },
      {
        id: "acc-ok",
        external_id: "ig-ok",
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 2,
      },
    ],
    [
      baseQueueRow({ id: "q-cool", social_account_id: "acc-cool" }),
      baseQueueRow({ id: "q-ok", social_account_id: "acc-ok" }),
    ],
    rules,
    async () => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.sent, 1);
      assert.equal(fetchCalls, 1);
    }
  );
});

const HOUR_MS = 60 * 60 * 1000;
const DM_WINDOW_MS = 24 * HOUR_MS;

function dmFollowUpRow(overrides: Partial<MockDmQueueRow> & Pick<MockDmQueueRow, "id" | "social_account_id">): MockDmQueueRow {
  return baseQueueRow({
    comment_id: null,
    kind: "dm_follow_up",
    recipient_external_id: "customer-1",
    ...overrides,
  });
}

test("sendDueDms: DM follow-up skips when inbound message is outside the 24-hour window", async () => {
  const accountId = "acc-1";
  const externalId = "ig-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => "" } as Response;
  };
  const inbound = new Map<string, InboundMock>([
    [`${externalId}:customer-1`, new Date(Date.now() - 25 * HOUR_MS)],
  ]);

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: externalId,
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [
      dmFollowUpRow({
        id: "q-fresh-expired-inbound",
        social_account_id: accountId,
        created_at: Date.now(),
      }),
    ],
    rules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.skipped, 1);
      assert.equal(result.sent, 0);
      assert.equal(fetchCalls, 0);
      assert.equal(ctx.queue[0]?.status, "skipped");
      assert.match(ctx.queue[0]?.last_error ?? "", /24-hour/);
    },
    inbound
  );
});

test("sendDueDms: DM follow-up skips when no inbound timestamp is on record", async () => {
  const accountId = "acc-1";
  const externalId = "ig-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => "" } as Response;
  };

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: externalId,
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [dmFollowUpRow({ id: "q-missing-inbound", social_account_id: accountId })],
    rules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.skipped, 1);
      assert.equal(fetchCalls, 0);
      assert.match(ctx.queue[0]?.last_error ?? "", /No inbound message/);
    }
  );
});

test("sendDueDms: DM follow-up at exact 24-hour inbound boundary is skipped", async () => {
  const accountId = "acc-1";
  const externalId = "ig-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => "" } as Response;
  };
  const inbound = new Map<string, InboundMock>([
    [`${externalId}:customer-1`, new Date(Date.now() - DM_WINDOW_MS)],
  ]);

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: externalId,
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [dmFollowUpRow({ id: "q-boundary", social_account_id: accountId })],
    rules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.skipped, 1);
      assert.equal(fetchCalls, 0);
      assert.equal(ctx.queue[0]?.status, "skipped");
    },
    inbound
  );
});

test("sendDueDms: old queued DM follow-up sends when inbound message is recent", async () => {
  const accountId = "acc-1";
  const externalId = "ig-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  let fetchCalls = 0;
  globalThis.fetch = async (url, init) => {
    fetchCalls += 1;
    assert.match(String(url), /graph\.instagram\.com/);
    const body = JSON.parse(String(init?.body)) as { recipient: { id: string } };
    assert.equal(body.recipient.id, "customer-1");
    return { ok: true, text: async () => "" } as Response;
  };
  const inbound = new Map<string, InboundMock>([
    [`${externalId}:customer-1`, new Date(Date.now() - HOUR_MS)],
  ]);

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: externalId,
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [
      dmFollowUpRow({
        id: "q-old-queue",
        social_account_id: accountId,
        created_at: Date.now() - 30 * HOUR_MS,
      }),
    ],
    rules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.sent, 1);
      assert.equal(fetchCalls, 1);
      assert.equal(ctx.queue[0]?.status, "sent");
    },
    inbound
  );
});

test("sendDueDms: DM follow-up ignores inbound on another Instagram account", async () => {
  const accountId = "acc-1";
  const externalId = "ig-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => "" } as Response;
  };
  const inbound = new Map<string, InboundMock>([
    [`ig-other:customer-1`, new Date(Date.now() - HOUR_MS)],
  ]);

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: externalId,
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [dmFollowUpRow({ id: "q-wrong-account-inbound", social_account_id: accountId })],
    rules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.skipped, 1);
      assert.equal(fetchCalls, 0);
      assert.match(ctx.queue[0]?.last_error ?? "", /No inbound message/);
    },
    inbound
  );
});

test("sendDueDms: DM follow-up ignores inbound from a different customer", async () => {
  const accountId = "acc-1";
  const externalId = "ig-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => "" } as Response;
  };
  const inbound = new Map<string, InboundMock>([
    [`${externalId}:customer-other`, new Date(Date.now() - HOUR_MS)],
  ]);

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: externalId,
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [dmFollowUpRow({ id: "q-wrong-sender-inbound", social_account_id: accountId })],
    rules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.skipped, 1);
      assert.equal(fetchCalls, 0);
      assert.match(ctx.queue[0]?.last_error ?? "", /No inbound message/);
    },
    inbound
  );
});

test("sendDueDms: comment reply still uses queue age, not inbound messaging window", async () => {
  const accountId = "acc-1";
  const externalId = "ig-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  let fetchCalls = 0;
  globalThis.fetch = async (url, init) => {
    fetchCalls += 1;
    assert.match(String(url), /graph\.instagram\.com/);
    const body = JSON.parse(String(init?.body)) as { recipient: { comment_id: string } };
    assert.equal(body.recipient.comment_id, "c1");
    return { ok: true, text: async () => "" } as Response;
  };
  const inbound = new Map<string, InboundMock>([
    [`${externalId}:r1`, new Date(Date.now() - 25 * HOUR_MS)],
  ]);

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: externalId,
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [
      baseQueueRow({
        id: "q-comment-recent",
        social_account_id: accountId,
        created_at: Date.now(),
      }),
    ],
    rules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.sent, 1);
      assert.equal(fetchCalls, 1);
      assert.equal(ctx.queue[0]?.status, "sent");
    },
    inbound
  );
});

test("sendDueDms: inbound lookup failure keeps the DM pending via rollback", async () => {
  const accountId = "acc-1";
  const externalId = "ig-1";
  const rules: RuleRow[] = [
    { id: "rule-active", user_id: "user-1", social_account_id: accountId, status: "active" },
  ];
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, text: async () => "" } as Response;
  };
  const inbound = new Map<string, InboundMock>([[`${externalId}:customer-1`, "throw"]]);

  await withSendDueDmsEnv(
    [
      {
        id: accountId,
        external_id: externalId,
        status: "active",
        dm_cooldown_until: null,
        access_token_enc: "",
        created_at: 1,
      },
    ],
    [dmFollowUpRow({ id: "q-lookup-fail", social_account_id: accountId })],
    rules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.sent, 0);
      assert.equal(result.skipped, 0);
      assert.equal(fetchCalls, 0);
      assert.equal(ctx.queue[0]?.status, "pending");
    },
    inbound
  );
});

// ---- follow_check rows: durable follower re-check with backoff, then a clear give-up (bug g) ----

function followCheckRow(attempts: number) {
  return dmFollowUpRow({ id: "q-follow", social_account_id: "acc-1", kind: "follow_check", attempts, message: "LINK MESSAGE" });
}

async function runFollowCheck(attempts: number, following: boolean | null) {
  const updates: { sql: string; params: unknown[] }[] = [];
  const sentBodies: string[] = [];
  globalThis.fetch = async (url, init) => {
    if (String(url).includes("is_user_follow_business")) {
      if (following === null) return new Response("{}", { status: 500 });
      return Response.json({ is_user_follow_business: following });
    }
    sentBodies.push(String(init?.body));
    return { ok: true, text: async () => "" } as Response;
  };
  const previousError = console.error;
  console.error = () => {};
  try {
    return await withSendDueDmsEnv(
      [{ id: "acc-1", external_id: "ig-1", status: "active", dm_cooldown_until: null, access_token_enc: "", created_at: 1 }],
      [followCheckRow(attempts)],
      [{ id: "rule-active", user_id: "user-1", social_account_id: "acc-1", status: "active" }],
      async (ctx) => {
        const connect = ctx.pool.connect.bind(ctx.pool);
        (ctx.pool as unknown as { connect: () => Promise<unknown> }).connect = async () => {
          const client = (await connect()) as unknown as { query: (sql: string, params?: unknown[]) => Promise<unknown> };
          const original = client.query;
          client.query = async (sql: string, params: unknown[] = []) => {
            if (sql.startsWith("update socialapp.dm_queue")) updates.push({ sql, params });
            return original(sql, params);
          };
          return client;
        };
        const { sendDueDms } = await import("./sender.ts");
        const result = await sendDueDms(50);
        return { result, updates, sentBodies, queue: ctx.queue };
      },
      new Map<string, InboundMock>([["ig-1:customer-1", new Date(Date.now() - 60_000)]])
    );
  } finally {
    console.error = previousError;
  }
}

test("sendDueDms: follow_check retries with backoff while Instagram does not answer", async () => {
  const { result, updates, sentBodies } = await runFollowCheck(1, null);
  assert.equal(result.retried, 1);
  assert.equal(sentBodies.length, 0);
  const retry = updates.find((u) => /next_attempt_at=now\(\) \+/.test(u.sql));
  assert.ok(retry, "retry scheduled");
  assert.equal(retry.params[1], 2);
  assert.ok(Number(retry.params[3]) > 0);
});

test("sendDueDms: follow_check gives up clearly after the last attempt", async () => {
  const { MAX_ATTEMPTS } = await import("./sendPolicy.ts");
  const { FOLLOW_CHECK_GAVE_UP } = await import("./sender.ts");
  const { result, updates, sentBodies } = await runFollowCheck(MAX_ATTEMPTS - 1, null);
  assert.equal(result.failed, 1);
  assert.equal(sentBodies.length, 0);
  const failed = updates.find((u) => u.sql.includes("status='failed'"));
  assert.equal(failed?.params[2], FOLLOW_CHECK_GAVE_UP);
});

test("sendDueDms: follow_check sends the link to a follower and a nudge to a non-follower", async () => {
  const yes = await runFollowCheck(2, true);
  assert.equal(yes.result.sent, 1);
  assert.match(yes.sentBodies[0], /LINK MESSAGE/);
  assert.ok(yes.updates.some((u) => u.sql.includes("set kind='gated_link'")));
  const no = await runFollowCheck(0, false);
  assert.equal(no.result.sent, 1);
  assert.match(no.sentBodies[0], /not following yet/);
  assert.ok(no.updates.some((u) => u.sql.includes("set kind='follow_nudge'")));
});

test("sendDueDms: the monthly auto-DM plan limit is enforced on the server", async () => {
  let sends = 0;
  globalThis.fetch = async () => {
    sends += 1;
    return { ok: true, text: async () => "" } as Response;
  };
  await withSendDueDmsEnv(
    [{ id: "acc-1", external_id: "ig-1", status: "active", dm_cooldown_until: null, access_token_enc: "", created_at: 1 }],
    [baseQueueRow({ id: "q-over", social_account_id: "acc-1" })],
    [{ id: "rule-active", user_id: "user-1", social_account_id: "acc-1", status: "active" }],
    async (ctx) => {
      const connect = ctx.pool.connect.bind(ctx.pool);
      (ctx.pool as unknown as { connect: () => Promise<unknown> }).connect = async () => {
        const client = (await connect()) as unknown as { query: (sql: string, params?: unknown[]) => Promise<unknown> };
        const original = client.query;
        client.query = async (sql: string, params: unknown[] = []) =>
          sql.includes("kind <> 'manual_reply'") ? { rows: [{ n: 500 }] } : original(sql, params);
        return client;
      };
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(sends, 0);
      assert.equal(result.skipped, 1);
      assert.equal(ctx.queue[0]?.status, "skipped");
      assert.match(ctx.queue[0]?.last_error ?? "", /Monthly auto-DM limit reached \(500 on the Free plan\)/);
    }
  );
});

// Facebook Login for Business accounts: same queue, Graph host = graph.facebook.com with the Page token.
function fbAccount(): MockSocialAccount {
  return { id: "acc-fb", external_id: "ig-fb", status: "active", dm_cooldown_until: null, access_token_enc: "", created_at: 1, auth_type: "facebook_login" };
}
const fbRules: RuleRow[] = [{ id: "rule-active", user_id: "user-1", social_account_id: "acc-fb", status: "active" }];

test("sendDueDms (facebook login): a matched comment gets one private reply via graph.facebook.com/{ig-id}/messages", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return { ok: true, text: async () => "" } as Response;
  };
  await withSendDueDmsEnv(
    [fbAccount()],
    [baseQueueRow({ id: "q-comment", social_account_id: "acc-fb", comment_id: "17890001", recipient_external_id: "igsid-1", message: "Here is the link" })],
    fbRules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.sent, 1);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, "https://graph.facebook.com/v23.0/ig-fb/messages");
      assert.equal(calls[0].init?.method, "POST");
      assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, "Bearer test-token");
      assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
        recipient: { comment_id: "17890001" },
        message: { text: "Here is the link" },
      });
      assert.equal(ctx.queue[0]?.status, "sent");
      // A second run never sends the same private reply again.
      const again = await sendDueDms(50);
      assert.equal(again.sent, 0);
      assert.equal(calls.length, 1);
    }
  );
});

test("sendDueDms (facebook login): a gated follow-up DM goes to the IGSID only inside the 24-hour window", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return { ok: true, text: async () => "" } as Response;
  };
  const inbound = new Map<string, InboundMock>([
    ["ig-fb:customer-in", new Date(Date.now() - 2 * HOUR_MS)],
    ["ig-fb:customer-out", new Date(Date.now() - 30 * HOUR_MS)],
  ]);
  await withSendDueDmsEnv(
    [fbAccount()],
    [
      dmFollowUpRow({ id: "q-in", social_account_id: "acc-fb", recipient_external_id: "customer-in", kind: "gated_link", message: "Thanks! Here's your link" }),
      dmFollowUpRow({ id: "q-out", social_account_id: "acc-fb", recipient_external_id: "customer-out", kind: "gated_link", message: "Thanks! Here's your link" }),
    ],
    fbRules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.sent, 1);
      assert.equal(result.skipped, 1);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, "https://graph.facebook.com/v23.0/ig-fb/messages");
      assert.deepEqual(JSON.parse(String(calls[0].init?.body)).recipient, { id: "customer-in" });
      assert.equal(ctx.queue.find((q) => q.id === "q-out")?.status, "skipped");
      assert.match(ctx.queue.find((q) => q.id === "q-out")?.last_error ?? "", /24-hour/);
    },
    inbound
  );
});

test("sendDueDms (facebook login): 'too many' / code 613 puts the account on cooldown and keeps the DM", async () => {
  globalThis.fetch = async () =>
    ({ ok: false, status: 400, text: async () => JSON.stringify({ error: { code: 613, message: "Calls to this api have exceeded the rate limit." } }) }) as Response;
  await withSendDueDmsEnv(
    [fbAccount()],
    [baseQueueRow({ id: "q-rl", social_account_id: "acc-fb", comment_id: "c-rl" })],
    fbRules,
    async (ctx) => {
      const { sendDueDms } = await import("./sender.ts");
      const result = await sendDueDms(50);
      assert.equal(result.retried, 1);
      assert.equal(ctx.queue[0]?.status, "pending");
      assert.ok(ctx.accounts[0].dm_cooldown_until && ctx.accounts[0].dm_cooldown_until.getTime() > Date.now());
    }
  );
});

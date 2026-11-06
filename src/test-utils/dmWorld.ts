// Test-only in-memory model of the DM tables (contacts, dm_rules, dm_queue, social_accounts)
// answering the SQL used by comments.ts, messages.ts and sender.ts. Never imported by app code.
import type { FakeHandler } from "./fakePool.ts";

export type WRule = {
  id: string;
  user_id: string;
  social_account_id: string | null;
  status: "active" | "paused";
  keywords: string[];
  match_type: "contains" | "exact";
  dm_text: string;
  link_url: string | null;
  email_gate: boolean;
  follow_gate: boolean;
  triggers: string[];
  created_at: number;
};

export type WContact = {
  id: string;
  user_id: string;
  social_account_id: string | null;
  external_id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  source_rule_id: string | null;
};

export type WQueue = {
  id: string;
  user_id: string;
  social_account_id: string;
  rule_id: string | null;
  contact_id: string | null;
  comment_id: string | null;
  recipient_external_id: string;
  message: string;
  status: string;
  kind: string;
  attempts: number;
  last_error: string | null;
  created_at: number;
  sent_at: number | null;
  next_attempt_at: number;
};

export type WAccount = { id: string; user_id: string; external_id: string; status: string; access_token_enc: string | null; dm_cooldown_until: Date | null };

export function rule(overrides: Partial<WRule> & Pick<WRule, "id">): WRule {
  return {
    user_id: "owner",
    social_account_id: null,
    status: "active",
    keywords: ["link"],
    match_type: "contains",
    dm_text: "Hi {{username}}",
    link_url: "https://example.com/" + overrides.id,
    email_gate: false,
    follow_gate: false,
    triggers: ["comment"],
    created_at: 1,
    ...overrides,
  };
}

export function createDmWorld(init: { accounts: WAccount[]; rules?: WRule[]; contacts?: WContact[]; queue?: WQueue[] }) {
  const accounts = init.accounts;
  const rules = init.rules ?? [];
  const contacts = init.contacts ?? [];
  const queue = init.queue ?? [];
  let seq = 0;
  /** Set to make the gated-link duplicate check wait until N callers have read it (concurrency tests). */
  const barrier = { waiting: 0, size: 0, release: [] as (() => void)[] };

  const ruleOk = (r: WRule | undefined, q: WQueue) =>
    !!r && r.user_id === q.user_id && r.status === "active" &&
    (r.social_account_id === null || r.social_account_id === q.social_account_id);
  const unlocked = (contactId: string | null, ruleId: string | null) =>
    queue.some((g) => g.contact_id === contactId && g.rule_id === ruleId &&
      (g.kind === "gated_link" || (g.kind === "follow_check" && g.status === "pending")));

  const handlers: FakeHandler[] = [
    {
      match: /^select id, user_id from socialapp\.social_accounts where platform='instagram' and external_id=\$1/,
      reply: (p) => accounts.filter((a) => a.external_id === p[0] && a.status === "active").map((a) => ({ id: a.id, user_id: a.user_id })),
    },
    {
      match: /^select access_token_enc from socialapp\.social_accounts where id=\$1/,
      reply: (p) => accounts.filter((a) => a.id === p[0]).map((a) => ({ access_token_enc: a.access_token_enc })),
    },
    {
      match: /^select id, email from socialapp\.contacts/,
      reply: (p) => contacts.filter((c) => c.user_id === p[0] && c.external_id === p[1]).map((c) => ({ id: c.id, email: c.email })),
    },
    {
      match: /from socialapp\.dm_queue q join socialapp\.dm_rules r/,
      reply: (p) => {
        const hits = queue
          .filter((q) => q.contact_id === p[0] && q.social_account_id === p[1] && q.recipient_external_id === p[2] &&
            ["comment_reply", "story_reply"].includes(q.kind) && q.status === "sent")
          .filter((q) => {
            const r = rules.find((x) => x.id === q.rule_id);
            return ruleOk(r, q) && (r!.email_gate || r!.follow_gate) && !!r!.link_url && !unlocked(q.contact_id, q.rule_id);
          })
          .sort((a, b) => (b.sent_at ?? 0) - (a.sent_at ?? 0) || b.created_at - a.created_at);
        return hits.slice(0, 1).map((q) => {
          const r = rules.find((x) => x.id === q.rule_id)!;
          return { rule_id: r.id, link_url: r.link_url, email_gate: r.email_gate, follow_gate: r.follow_gate };
        });
      },
    },
    {
      match: /^insert into socialapp\.contacts \(user_id, social_account_id, platform, external_id, email, phone\)/,
      reply: (p) => {
        let c = contacts.find((x) => x.user_id === p[0] && x.external_id === p[1]);
        if (!c) {
          c = { id: `contact-${++seq}`, user_id: String(p[0]), social_account_id: String(p[4]), external_id: String(p[1]), username: null, email: null, phone: null, source_rule_id: null };
          contacts.push(c);
        }
        c.email = (p[2] as string | null) ?? c.email;
        c.phone = (p[3] as string | null) ?? c.phone;
        return [{ id: c.id }];
      },
    },
    {
      match: /^insert into socialapp\.contacts\(user_id, social_account_id, platform, external_id, username, source_rule_id\)/,
      reply: (p) => {
        let c = contacts.find((x) => x.user_id === p[0] && x.external_id === p[2]);
        if (!c) {
          c = { id: `contact-${++seq}`, user_id: String(p[0]), social_account_id: String(p[1]), external_id: String(p[2]), username: (p[3] as string | null), email: null, phone: null, source_rule_id: String(p[4]) };
          contacts.push(c);
        }
        return [{ id: c.id, email: c.email }];
      },
    },
    {
      match: /^select id, keywords, match_type, status, dm_text, link_url, email_gate, follow_gate from socialapp\.dm_rules/,
      reply: (p, sql) => rules
        .filter((r) => r.user_id === p[0] && r.status === "active" && (r.social_account_id === null || r.social_account_id === p[1]))
        .filter((r) => r.triggers.includes(sql.includes("'story_reply' = any(triggers)") ? "story_reply" : "comment"))
        .filter((r) => p[2] === undefined || r.id === p[2])
        .sort((a, b) => a.created_at - b.created_at),
    },
    { match: /^insert into socialapp\.short_links/, reply: (p) => [{ code: `code${String(p[2]).replace(/\W/g, "")}` }] },
    { match: /pg_advisory_xact_lock/, reply: () => [] },
    {
      match: /^select 1 as recent from socialapp\.dm_queue where kind='story_reply'/,
      reply: (p) => queue.filter((q) => q.kind === "story_reply" && q.contact_id === p[0] && q.rule_id === p[1] && q.created_at > Date.now() - 86_400_000).map(() => ({ recent: 1 })),
    },
    {
      match: /^select 1 as ok from socialapp\.dm_queue where contact_id=\$1 and rule_id=\$2/,
      reply: async (p) => {
        const result = unlocked(String(p[0]), String(p[1])) ? [{ ok: 1 }] : [];
        if (barrier.size > 0) {
          barrier.waiting += 1;
          if (barrier.waiting >= barrier.size) barrier.release.splice(0).forEach((r) => r());
          else await new Promise<void>((r) => barrier.release.push(r));
        }
        return result;
      },
    },
    {
      match: /^select count\(\*\)::int as n from socialapp\.dm_queue where contact_id=\$1 and rule_id=\$2 and kind='follow_nudge'/,
      reply: (p) => [{ n: queue.filter((q) => q.contact_id === p[0] && q.rule_id === p[1] && q.kind === "follow_nudge").length }],
    },
    {
      // gated / follow-check / nudge / story-reply enqueue (messages.ts)
      match: /^insert into socialapp\.dm_queue \(user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, kind, next_attempt_at\)/,
      reply: (p, sql) => {
        const kind = String(p[6]);
        if (kind === "gated_link" && /on conflict do nothing/.test(sql) &&
            queue.some((q) => q.contact_id === p[3] && q.rule_id === p[2] && q.kind === "gated_link")) return [];
        const row: WQueue = {
          id: `q-${++seq}`, user_id: String(p[0]), social_account_id: String(p[1]), rule_id: String(p[2]), contact_id: String(p[3]),
          comment_id: null, recipient_external_id: String(p[4]), message: String(p[5]), status: "pending", kind,
          attempts: 0, last_error: null, created_at: Date.now(), sent_at: null, next_attempt_at: Date.now() + Number(p[7] ?? 0),
        };
        queue.push(row);
        return [{ id: row.id }];
      },
    },
    {
      // comment reply enqueue (comments.ts)
      match: /^insert into socialapp\.dm_queue \(user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, created_at, kind\)/,
      reply: (p) => {
        if (queue.some((q) => q.comment_id === p[4])) return [];
        const created = p[7] ? new Date(String(p[7])).getTime() : Date.now();
        const row: WQueue = {
          id: `q-${++seq}`, user_id: String(p[0]), social_account_id: String(p[1]), rule_id: String(p[2]), contact_id: String(p[3]),
          comment_id: String(p[4]), recipient_external_id: String(p[5]), message: String(p[6]), status: "pending", kind: String(p[8] ?? "comment_reply"),
          attempts: 0, last_error: null, created_at: created, sent_at: null, next_attempt_at: Date.now(),
        };
        queue.push(row);
        return [{ id: row.id }];
      },
    },
  ];

  return { accounts, rules, contacts, queue, handlers, barrier };
}

/** A gate prompt that was delivered to `recipient` for `ruleId`. */
export function sentPrompt(id: string, contactId: string, ruleId: string, sentAt: number, extra: Partial<WQueue> = {}): WQueue {
  return {
    id, user_id: "owner", social_account_id: "account-1", rule_id: ruleId, contact_id: contactId, comment_id: `c-${id}`,
    recipient_external_id: "lead", message: "prompt", status: "sent", kind: "comment_reply", attempts: 1, last_error: null,
    created_at: sentAt, sent_at: sentAt, next_attempt_at: 0, ...extra,
  };
}

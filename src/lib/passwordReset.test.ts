import assert from "node:assert/strict";
import { test } from "node:test";
import { resetRateLimits } from "./rateLimit.ts";
import { checkResetCode, requestPasswordReset, type ResetUser } from "./passwordReset.ts";
import type { RenderedEmail } from "./emailTemplates.ts";

const USERS: Record<string, ResetUser> = {
  "jane@example.com": { id: "u1", email: "jane@example.com", name: "Jane", hasPassword: true },
  "goog@example.com": { id: "u2", email: "goog@example.com", name: null, hasPassword: false },
};

function harness() {
  const sent: { to: string; mail: RenderedEmail; tag: string }[] = [];
  const tasks: (() => Promise<void>)[] = [];
  const deps = {
    findUser: async (e: string) => USERS[e] ?? null,
    issueCode: async () => ({ code: "482913", token: "tok_abc" }),
    send: async (to: string, mail: RenderedEmail, tag: string) => {
      sent.push({ to, mail, tag });
    },
    background: (t: () => Promise<void>) => {
      tasks.push(t);
    },
  };
  return { deps, sent, run: () => Promise.all(tasks.map((t) => t())) };
}

test("no user enumeration: identical answer for existing, missing and Google-only accounts", async () => {
  resetRateLimits();
  const answers = [];
  for (const email of ["Jane@Example.com", "nobody@example.com", "goog@example.com"]) {
    const h = harness();
    const res = requestPasswordReset(email, "1.1.1.1", h.deps);
    answers.push(JSON.stringify({ ...res, email: "x" }));
    await h.run();
    if (email === "nobody@example.com") assert.equal(h.sent.length, 0);
    if (email === "goog@example.com") {
      assert.equal(h.sent[0].tag, "password_reset_google");
      assert.ok(!h.sent[0].mail.text.includes("482913"), "no code for Google accounts");
    }
    if (email === "Jane@Example.com") {
      assert.equal(h.sent[0].to, "jane@example.com");
      assert.ok(h.sent[0].mail.text.includes("482913"));
      assert.ok(h.sent[0].mail.html.includes("/reset-password?token=tok_abc"));
      assert.ok(!h.sent[0].mail.subject.includes("482913"), "code never in the subject");
    }
  }
  assert.equal(new Set(answers).size, 1);
});

test("the e-mail lookup never runs on the request path", () => {
  resetRateLimits();
  let looked = false;
  const h = harness();
  requestPasswordReset("jane@example.com", "1.1.1.1", { ...h.deps, findUser: async () => ((looked = true), null) });
  assert.equal(looked, false);
});

test("rate limited per email+IP (3 per 15 min), same message for any email", () => {
  resetRateLimits();
  const h = harness();
  for (let i = 0; i < 3; i++) assert.ok("sent" in requestPasswordReset("jane@example.com", "2.2.2.2", h.deps));
  const blocked = requestPasswordReset("jane@example.com", "2.2.2.2", h.deps);
  assert.ok("error" in blocked && /Too many attempts/.test(blocked.error));
  for (let i = 0; i < 3; i++) requestPasswordReset("ghost@example.com", "3.3.3.3", h.deps);
  const ghost = requestPasswordReset("ghost@example.com", "3.3.3.3", h.deps);
  assert.ok("error" in ghost && /Too many attempts/.test(ghost.error));
  // Another IP is not affected.
  assert.ok("sent" in requestPasswordReset("jane@example.com", "4.4.4.4", h.deps));
});

test("rejects invalid email before anything else", () => {
  resetRateLimits();
  const h = harness();
  assert.deepEqual(requestPasswordReset("not-an-email", "1.1.1.1", h.deps), { error: "Enter a valid email address." });
});

test("checkResetCode: unknown and Google-only emails look exactly like a wrong code", async () => {
  const deps = { findUser: async (e: string) => USERS[e] ?? null, redeemCode: async (_id: string, c: string) => (c === "482913" ? ("ok" as const) : ("wrong" as const)) };
  const wrong = await checkResetCode("jane@example.com", "111111", deps);
  const unknown = await checkResetCode("nobody@example.com", "482913", deps);
  const google = await checkResetCode("goog@example.com", "482913", deps);
  assert.deepEqual(unknown, wrong);
  assert.deepEqual(google, wrong);
  assert.deepEqual(await checkResetCode("JANE@example.com", "482 913", deps), { userId: "u1" });
  assert.ok("error" in (await checkResetCode("jane@example.com", "12", deps)));
});

test("checkResetCode surfaces expired / locked codes", async () => {
  const base = { findUser: async (e: string) => USERS[e] ?? null };
  const locked = await checkResetCode("jane@example.com", "482913", { ...base, redeemCode: async () => "locked" as const });
  assert.ok("error" in locked && /Too many wrong tries/.test(locked.error));
  const expired = await checkResetCode("jane@example.com", "482913", { ...base, redeemCode: async () => "expired" as const });
  assert.ok("error" in expired && /expired/.test(expired.error));
});

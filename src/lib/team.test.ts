// Team workspaces (migration 054): membership resolution, role checks and workspace isolation.
// Every write must be scoped to ctx.ownerId, and members can't reach admin-only actions.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createFakePool, installFakePool, type FakeHandler } from "../test-utils/fakePool.ts";
import { approvalBlock, approvePost, inviteMember, rejectPost, removeMember, TEAM_LIMITS, updateMember, withdrawApproval } from "./team.ts";
import { membershipFor, roleAtLeast, type WorkspaceContext } from "./workspace.ts";

const OWNER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OWNER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const MEMBER = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const POST = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

let restore: (() => void) | null = null;
const savedGating = process.env.PLAN_FEATURE_GATING;
afterEach(() => {
  restore?.();
  restore = null;
  if (savedGating === undefined) delete process.env.PLAN_FEATURE_GATING;
  else process.env.PLAN_FEATURE_GATING = savedGating;
});

function useFake(handlers: FakeHandler[]) {
  const fake = createFakePool(handlers);
  restore = installFakePool(fake.pool);
  return fake;
}

function ctx(over: Partial<WorkspaceContext> = {}): WorkspaceContext {
  const role = over.role ?? "member";
  const publishMode = over.publishMode ?? "direct";
  return {
    user: { id: MEMBER, email: "member@example.com", name: "Mo", emailVerified: true },
    ownerId: OWNER_A,
    owner: { id: OWNER_A, email: "owner@example.com", name: "Ann", workspaceName: "Studio A" },
    role,
    publishMode,
    needsApproval: role === "member" && publishMode === "approval",
    isOwnWorkspace: false,
    isClient: false,
    ...over,
  };
}

test("roles rank owner > admin > member", () => {
  assert.ok(roleAtLeast("owner", "admin"));
  assert.ok(roleAtLeast("admin", "admin"));
  assert.ok(!roleAtLeast("member", "admin"));
  assert.ok(!roleAtLeast("admin", "owner"));
});

test("membershipFor: own account, invited member, client-workspace creator, stranger", async () => {
  useFake([
    { match: /from socialapp\.workspace_members where owner_user_id=\$1 and member_user_id=\$2/, reply: (p) => (p[0] === OWNER_A && p[1] === MEMBER ? [{ role: "member", publish_mode: "approval" }] : []) },
    { match: /from socialapp\.users where id=\$1 and created_by_user_id=\$2/, reply: (p) => (p[0] === OWNER_B && p[1] === MEMBER ? [{ id: OWNER_B }] : []) },
  ]);
  assert.deepEqual(await membershipFor(MEMBER, MEMBER), { role: "owner", publishMode: "direct", isClient: false });
  assert.deepEqual(await membershipFor(MEMBER, OWNER_A), { role: "member", publishMode: "approval", isClient: false });
  assert.deepEqual(await membershipFor(MEMBER, OWNER_B), { role: "owner", publishMode: "direct", isClient: true });
  const stranger = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
  assert.equal(await membershipFor(stranger, OWNER_A), null, "no membership = no access (the session falls back to their own account)");
});

test("members can't invite, change roles or approve; nothing touches the database", async () => {
  const fake = useFake([]);
  const m = ctx({ role: "member" });
  assert.equal((await inviteMember(m, "x@example.com", "member", "direct")).ok, false);
  assert.equal((await updateMember(m, OWNER_B, "admin", "direct")).ok, false);
  assert.equal((await approvePost(m, POST)).ok, false);
  assert.equal((await rejectPost(m, POST, "no")).ok, false);
  assert.equal((await removeMember(m, OWNER_B)).ok, false, "a member can only remove themselves");
  assert.equal(fake.calls.length, 0);
});

test("the owner can never be removed", async () => {
  useFake([]);
  const r = await removeMember(ctx({ role: "admin" }), OWNER_A);
  assert.deepEqual(r, { ok: false, error: "The owner can't be removed." });
});

test("inviting is blocked on Free when plan gating is on (0 seats)", async () => {
  process.env.PLAN_FEATURE_GATING = "on";
  useFake([
    { match: /email_verified_at is not null/, reply: () => [] },
    { match: /select created_by_user_id from socialapp\.users/, reply: () => [{ created_by_user_id: null }] },
    { match: /billing_subscriptions/, reply: () => [] },
  ]);
  assert.equal(TEAM_LIMITS.Free.members, 0);
  const r = await inviteMember(ctx({ role: "admin" }), "new@example.com", "member", "approval");
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /Pro and Agency/);
});

test("an admin's invite is stored in THEIR workspace (owner id), never the inviter's own", async () => {
  process.env.PLAN_FEATURE_GATING = "off";
  const fake = useFake([
    { match: /email_verified_at is not null/, reply: () => [] },
    { match: /select created_by_user_id from socialapp\.users/, reply: () => [{ created_by_user_id: null }] },
    { match: /billing_subscriptions/, reply: () => [] },
    { match: /as used/, reply: () => [{ used: 0 }] },
    { match: /join socialapp\.users u on u\.id = m\.member_user_id where m\.owner_user_id=\$1 and u\.email=\$2/, reply: () => [] },
    { match: /^delete from socialapp\.workspace_invites/, reply: () => [] },
    { match: /^insert into socialapp\.workspace_invites/, reply: () => [] },
  ]);
  const r = await inviteMember(ctx({ role: "admin" }), "  New@Example.com ", "member", "approval");
  assert.ok(r.ok);
  const insert = fake.calls.find((c) => c.sql.startsWith("insert into socialapp.workspace_invites"));
  assert.ok(insert);
  assert.equal(insert.params[0], OWNER_A);
  assert.equal(insert.params[1], MEMBER, "invited_by = the real person");
  assert.equal(insert.params[2], "new@example.com");
  assert.notEqual(insert.params[5], r.ok ? r.token : "", "only the token's hash is stored");
});

test("approve: scoped to the workspace owner, refuses another workspace's post, asks for a new time when late", async () => {
  const fake = useFake([
    {
      match: /select scheduled_at from socialapp\.scheduled_posts where id=\$1 and user_id=\$2 and status='pending_approval' for update/,
      reply: (p) => (p[0] === POST && p[1] === OWNER_A ? [{ scheduled_at: new Date(Date.now() - 3_600_000) }] : []),
    },
    { match: /^update socialapp\.scheduled_posts set status='scheduled'/, reply: () => [] },
    { match: /join socialapp\.users u on u\.id = p\.requested_by_user_id/, reply: () => [] },
  ]);
  const admin = ctx({ role: "admin" });
  const late = await approvePost(admin, POST);
  assert.equal(late.ok, false);
  assert.equal(late.ok ? undefined : late.code, "time_passed");
  const later = new Date(Date.now() + 2 * 3_600_000);
  assert.deepEqual(await approvePost(admin, POST, later), { ok: true });
  const upd = fake.calls.find((c) => c.sql.startsWith("update socialapp.scheduled_posts set status='scheduled'"));
  assert.ok(upd);
  assert.deepEqual(upd.params.slice(0, 2), [POST, OWNER_A]);
  assert.equal(upd.params[3], MEMBER, "reviewed_by = the real person");
  const other = await approvePost({ ...admin, ownerId: OWNER_B }, POST, later);
  assert.equal(other.ok, false, "a post in workspace A can't be approved from workspace B");
});

test("reject and withdraw only touch pending posts of the current workspace", async () => {
  const fake = useFake([
    { match: /^update socialapp\.scheduled_posts set status='draft'/, reply: () => [{ "?column?": 1 }] },
    { match: /join socialapp\.users u on u\.id = p\.requested_by_user_id/, reply: () => [] },
  ]);
  const drafts = () => fake.calls.filter((c) => c.sql.startsWith("update socialapp.scheduled_posts set status='draft'"));
  assert.deepEqual(await rejectPost(ctx({ role: "admin" }), POST, "  Fix the typo  "), { ok: true });
  const rej = drafts()[0];
  assert.match(rej.sql, /where id=\$1 and user_id=\$2 and status='pending_approval'/);
  assert.deepEqual(rej.params.slice(0, 3), [POST, OWNER_A, "Fix the typo"]);
  assert.deepEqual(await withdrawApproval(ctx({ role: "member" }), POST), { ok: true });
  const wd = drafts()[1];
  assert.match(wd.sql, /requested_by_user_id=\$3 or \$4/);
  assert.deepEqual(wd.params, [POST, OWNER_A, MEMBER, false], "a member can only withdraw their own request");
});

test("approval-mode members are blocked from schedule-changing actions; others aren't", () => {
  assert.match(approvalBlock(ctx({ role: "member", publishMode: "approval" })) ?? "", /need approval/);
  assert.equal(approvalBlock(ctx({ role: "member", publishMode: "direct" })), null);
  assert.equal(approvalBlock(ctx({ role: "admin" })), null);
});

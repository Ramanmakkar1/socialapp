// Sign in with Google: PKCE/state URL, code exchange + id_token checks (mocked Google), and
// user resolution (existing sub, link by verified email, new user, unverified email rejected).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import {
  GoogleSignInError,
  exchangeGoogleCode,
  findOrCreateGoogleUser,
  googleAuthorizeUrl,
  isGoogleConfigured,
  newGoogleFlow,
  openFlow,
  pkceChallenge,
  sealFlow,
  type GoogleIdentity,
} from "./googleAuth.ts";

process.env.GOOGLE_CLIENT_ID = "client-123.apps.googleusercontent.com";
process.env.GOOGLE_CLIENT_SECRET = "g-secret";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

const FLOW = { state: "st", verifier: "v".repeat(64), nonce: "n-1" };
const NOW = 1_800_000_000_000;

function mockGoogle(info: Record<string, unknown>, tokenStatus = 200) {
  const calls: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (url === "https://oauth2.googleapis.com/token") {
      return new Response(JSON.stringify(tokenStatus === 200 ? { id_token: "id.tok.en", access_token: "at" } : { error: "invalid_grant" }), { status: tokenStatus });
    }
    if (url.startsWith("https://oauth2.googleapis.com/tokeninfo?")) return Response.json(info);
    return new Response("{}", { status: 404 });
  }) as typeof fetch;
  return calls;
}

const goodInfo = (extra: Record<string, unknown> = {}) => ({
  aud: "client-123.apps.googleusercontent.com",
  iss: "https://accounts.google.com",
  sub: "g-sub-1",
  email: "Jane@Example.com",
  email_verified: "true",
  exp: String(NOW / 1000 + 600),
  nonce: "n-1",
  name: "Jane",
  ...extra,
});

test("button is only on when both Google env vars are set", () => {
  assert.equal(isGoogleConfigured(), true);
  const saved = process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_CLIENT_SECRET;
  try {
    assert.equal(isGoogleConfigured(), false);
  } finally {
    process.env.GOOGLE_CLIENT_SECRET = saved;
  }
});

test("authorize URL: code flow with S256 PKCE, state, nonce and the poskoo.com redirect", () => {
  const flow = newGoogleFlow();
  const url = new URL(googleAuthorizeUrl(flow));
  assert.equal(url.origin + url.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("redirect_uri"), "https://poskoo.com/api/auth/google/callback");
  assert.equal(url.searchParams.get("scope"), "openid email profile");
  assert.equal(url.searchParams.get("state"), flow.state);
  assert.equal(url.searchParams.get("nonce"), flow.nonce);
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("code_challenge"), pkceChallenge(flow.verifier));
  // S256 = base64url(sha256(verifier)), no padding; the verifier itself never leaves the server.
  assert.match(url.searchParams.get("code_challenge") ?? "", /^[A-Za-z0-9_-]{43}$/);
  assert.equal(url.searchParams.has("code_verifier"), false);
});

test("flow cookie is encrypted and tamper-proof", () => {
  process.env.TOKEN_ENCRYPTION_KEY ||= Buffer.alloc(32, 3).toString("base64");
  const sealed = sealFlow(FLOW);
  assert.equal(sealed.includes(FLOW.verifier), false);
  assert.deepEqual(openFlow(sealed), FLOW);
  assert.equal(openFlow(sealed.slice(0, -4) + "AAAA"), null);
  assert.equal(openFlow(undefined), null);
});

test("code exchange sends the PKCE verifier and returns the verified identity", async () => {
  const calls = mockGoogle(goodInfo());
  const id = await exchangeGoogleCode("the-code", FLOW, NOW);
  assert.deepEqual(id, { sub: "g-sub-1", email: "jane@example.com", emailVerified: true, name: "Jane" });
  const body = new URLSearchParams(String(calls[0].init?.body));
  assert.equal(calls[0].init?.method, "POST");
  assert.equal(body.get("grant_type"), "authorization_code");
  assert.equal(body.get("code"), "the-code");
  assert.equal(body.get("code_verifier"), FLOW.verifier);
  assert.equal(body.get("client_secret"), "g-secret");
  assert.equal(body.get("redirect_uri"), "https://poskoo.com/api/auth/google/callback");
  assert.match(calls[1].url, /tokeninfo\?id_token=id\.tok\.en$/);
});

test("id_token for another app, wrong nonce, other issuer or expired is rejected; a failed exchange too", async () => {
  for (const bad of [{ aud: "someone-else" }, { nonce: "other" }, { iss: "https://evil.example" }, { exp: String(NOW / 1000 - 1) }, { sub: "" }]) {
    mockGoogle(goodInfo(bad));
    await assert.rejects(exchangeGoogleCode("c", FLOW, NOW), (e: unknown) => e instanceof GoogleSignInError && e.reason === "invalid_token");
  }
  mockGoogle(goodInfo(), 400);
  await assert.rejects(exchangeGoogleCode("c", FLOW, NOW), (e: unknown) => e instanceof GoogleSignInError && e.reason === "exchange_failed");
});

type U = { id: string; email: string; name: string | null; google_sub: string | null; password_hash: string | null };

function usersDb(users: U[], opts: { missingColumn?: boolean } = {}) {
  const missing = () => {
    if (opts.missingColumn) throw Object.assign(new Error('column "google_sub" does not exist'), { code: "42703" });
  };
  return createFakePool([
    {
      match: /^select id, email, name from socialapp\.users where google_sub=\$1$/,
      reply: (p) => {
        missing();
        return users.filter((u) => u.google_sub === p[0]).map(({ id, email, name }) => ({ id, email, name }));
      },
    },
    {
      match: /^select id, email, name, google_sub from socialapp\.users where email=\$1/,
      reply: (p) => users.filter((u) => u.email === p[0]),
    },
    {
      match: /^update socialapp\.users set google_sub=\$2 where id=\$1 and google_sub is null/,
      reply: (p) => {
        const u = users.find((x) => x.id === p[0] && x.google_sub === null);
        if (u) u.google_sub = String(p[1]);
        return [];
      },
    },
    {
      match: /^insert into socialapp\.users \(email, password_hash, name, google_sub\) values \(\$1, null, \$2, \$3\)/,
      reply: (p) => {
        if (users.some((u) => u.email === p[0] || u.google_sub === p[2])) return [];
        const u: U = { id: `u-${users.length + 1}`, email: String(p[0]), name: (p[1] as string | null) ?? null, google_sub: String(p[2]), password_hash: null };
        users.push(u);
        return [{ id: u.id, email: u.email, name: u.name }];
      },
    },
  ]);
}

async function withUsers<T>(users: U[], run: (calls: { sql: string }[]) => Promise<T>, opts: { missingColumn?: boolean } = {}): Promise<T> {
  const { pool, calls } = usersDb(users, opts);
  const restore = installFakePool(pool);
  try {
    return await run(calls);
  } finally {
    restore();
  }
}

const ID: GoogleIdentity = { sub: "g-sub-1", email: "jane@example.com", emailVerified: true, name: "Jane" };

test("new Google user: created without a password and linked to the Google sub", async () => {
  const users: U[] = [];
  await withUsers(users, async () => {
    const user = await findOrCreateGoogleUser(ID);
    assert.deepEqual(user, { id: "u-1", email: "jane@example.com", name: "Jane" });
  });
  assert.equal(users[0].password_hash, null);
  assert.equal(users[0].google_sub, "g-sub-1");
});

test("existing email/password user: the verified Google email links the account (password still works)", async () => {
  const users: U[] = [{ id: "u-7", email: "jane@example.com", name: "Jane P", google_sub: null, password_hash: "scrypt$..." }];
  await withUsers(users, async () => {
    assert.deepEqual(await findOrCreateGoogleUser(ID), { id: "u-7", email: "jane@example.com", name: "Jane P" });
  });
  assert.equal(users.length, 1);
  assert.equal(users[0].google_sub, "g-sub-1");
  assert.equal(users[0].password_hash, "scrypt$...");
});

test("existing Google sub: signs in that user even if the Google email changed", async () => {
  const users: U[] = [{ id: "u-3", email: "old@example.com", name: null, google_sub: "g-sub-1", password_hash: null }];
  await withUsers(users, async (calls) => {
    assert.deepEqual(await findOrCreateGoogleUser({ ...ID, email: "new@example.com" }), { id: "u-3", email: "old@example.com", name: null });
    assert.equal(calls.length, 1);
  });
});

test("unverified Google email is rejected before any lookup; an email linked to another Google account too", async () => {
  await withUsers([], async (calls) => {
    await assert.rejects(findOrCreateGoogleUser({ ...ID, emailVerified: false }), (e: unknown) => e instanceof GoogleSignInError && e.reason === "unverified_email");
    assert.equal(calls.length, 0);
  });
  const users: U[] = [{ id: "u-9", email: "jane@example.com", name: null, google_sub: "g-other", password_hash: null }];
  await withUsers(users, async () => {
    await assert.rejects(findOrCreateGoogleUser(ID), (e: unknown) => e instanceof GoogleSignInError && e.reason === "linked_other");
  });
  assert.equal(users[0].google_sub, "g-other");
});

test("before migration 016 (no google_sub column) Google sign-in says it is not ready", async () => {
  await withUsers(
    [],
    async () => {
      await assert.rejects(findOrCreateGoogleUser(ID), (e: unknown) => e instanceof GoogleSignInError && e.reason === "not_ready");
    },
    { missingColumn: true },
  );
});

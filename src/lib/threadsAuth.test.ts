import assert from "node:assert/strict";
import { after, test } from "node:test";
import { BRAND } from "./brand.ts";
import {
  THREADS_SCOPES,
  exchangeThreadsCode,
  fetchThreadsProfile,
  isThreadsConfigured,
  refreshThreadsToken,
  threadsAuthorizeUrl,
  threadsLongLivedToken,
} from "./threadsAuth.ts";

const APP_ID = "1234567890123456";
const APP_SECRET = "secret-threads-abc";
const TOKEN = "EAAH-test-threads-token";
const USER = 1784140000000001;

const savedEnv = {
  id: process.env.THREADS_APP_ID,
  secret: process.env.THREADS_APP_SECRET,
  redirect: process.env.THREADS_REDIRECT_URI,
};

after(() => {
  for (const [key, value] of Object.entries({
    THREADS_APP_ID: savedEnv.id,
    THREADS_APP_SECRET: savedEnv.secret,
    THREADS_REDIRECT_URI: savedEnv.redirect,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

type Call = { url: string; body: URLSearchParams | null };

function makeFetch(results: Array<Response | Error>) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    const body =
      init?.body instanceof URLSearchParams
        ? init.body
        : init?.body
          ? new URLSearchParams(String(init.body))
          : null;
    calls.push({ url: String(url), body });
    const next = results[calls.length - 1];
    if (next instanceof Error) throw next;
    return next as Response;
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

test("threadsAuthorizeUrl: client_id, redirect_uri, both scopes and state", () => {
  process.env.THREADS_APP_ID = APP_ID;
  process.env.THREADS_APP_SECRET = APP_SECRET;
  delete process.env.THREADS_REDIRECT_URI;
  const url = new URL(threadsAuthorizeUrl("st-1"));
  assert.equal(`${url.origin}${url.pathname}`, "https://threads.net/oauth/authorize");
  assert.equal(url.searchParams.get("client_id"), APP_ID);
  assert.equal(url.searchParams.get("redirect_uri"), `${BRAND.url}/api/threads/callback`);
  assert.equal(url.searchParams.get("scope"), "threads_basic,threads_content_publish");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("state"), "st-1");
  assert.deepEqual(THREADS_SCOPES, ["threads_basic", "threads_content_publish"]);
});

test("isThreadsConfigured: false when the env vars are empty", () => {
  delete process.env.THREADS_APP_ID;
  delete process.env.THREADS_APP_SECRET;
  assert.equal(isThreadsConfigured(), false);
  process.env.THREADS_APP_ID = APP_ID;
  assert.equal(isThreadsConfigured(), false);
  process.env.THREADS_APP_SECRET = APP_SECRET;
  assert.equal(isThreadsConfigured(), true);
});

test("exchangeThreadsCode: sends the form fields and returns a string user_id", async () => {
  process.env.THREADS_APP_ID = APP_ID;
  process.env.THREADS_APP_SECRET = APP_SECRET;
  delete process.env.THREADS_REDIRECT_URI;
  const { calls, fetchImpl } = makeFetch([json({ access_token: TOKEN, user_id: USER })]);
  const out = await exchangeThreadsCode("code-1", fetchImpl);
  assert.deepEqual(out, { access_token: TOKEN, user_id: "1784140000000001" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://graph.threads.net/oauth/access_token");
  assert.equal(calls[0].body?.get("client_id"), APP_ID);
  assert.equal(calls[0].body?.get("client_secret"), APP_SECRET);
  assert.equal(calls[0].body?.get("grant_type"), "authorization_code");
  assert.equal(calls[0].body?.get("redirect_uri"), `${BRAND.url}/api/threads/callback`);
  assert.equal(calls[0].body?.get("code"), "code-1");
});

test("threadsLongLivedToken: failed reply throws with the Graph message, token and secret redacted", async () => {
  process.env.THREADS_APP_SECRET = APP_SECRET;
  const { fetchImpl } = makeFetch([
    json({ error: { message: `Invalid OAuth access token ${TOKEN}`, code: 190 } }, 400),
  ]);
  await assert.rejects(
    threadsLongLivedToken(TOKEN, fetchImpl),
    (err: Error) => {
      assert.ok(err.message.includes("Invalid OAuth access token"));
      assert.ok(!err.message.includes(TOKEN));
      assert.ok(!err.message.includes(APP_SECRET));
      assert.ok(err.message.includes("[redacted]"));
      return true;
    }
  );
});

test("refreshThreadsToken: returns the new token and expiry", async () => {
  const { fetchImpl } = makeFetch([json({ access_token: "EAAH-refreshed", expires_in: 5184000 })]);
  const out = await refreshThreadsToken(TOKEN, fetchImpl);
  assert.deepEqual(out, { access_token: "EAAH-refreshed", expires_in: 5184000 });
});

test("fetchThreadsProfile: parses id and username", async () => {
  const { fetchImpl } = makeFetch([json({ id: USER, username: "poskoo" })]);
  const out = await fetchThreadsProfile(TOKEN, fetchImpl);
  assert.deepEqual(out, { user_id: "1784140000000001", username: "poskoo" });
});

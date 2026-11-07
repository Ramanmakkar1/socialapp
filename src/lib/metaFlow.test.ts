// Facebook Login for Business path with mocked Graph calls: callback exchange, Page / Instagram
// account discovery, Page webhook subscription, Page-token checks, webhook signatures and the
// content-publishing call shape.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, test } from "node:test";
import { createFakePool, installFakePool } from "../test-utils/fakePool.ts";
import { verifyAnySignature, verifySignature } from "./meta.ts";
import { checkPageToken, discoverMetaAccounts, fetchMetaPages, subscribePage } from "./metaLogin.ts";
import { classifyMetaError } from "./sendPolicy.ts";

process.env.META_APP_ID = "12345";
process.env.META_LOGIN_CONFIG_ID = "67890";
process.env.META_APP_SECRET = "test-secret";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

type Call = { url: URL; init?: RequestInit };

function mockGraph(routes: (url: URL, init?: RequestInit) => unknown | Response): Call[] {
  const calls: Call[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    calls.push({ url, init });
    const out = routes(url, init);
    return out instanceof Response ? out : Response.json(out);
  }) as typeof fetch;
  return calls;
}

const ALL_SCOPES = [
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "instagram_content_publishing",
  "pages_show_list",
  "pages_manage_metadata",
  "pages_read_engagement",
  "business_management",
];

function graphRoutes(opts: { scopes?: string[]; declined?: string[]; pages?: unknown[] } = {}) {
  return (url: URL) => {
    const path = url.pathname;
    if (path === "/v23.0/oauth/access_token" && url.searchParams.get("code")) return { access_token: "short-token" };
    if (path === "/v23.0/oauth/access_token" && url.searchParams.get("grant_type") === "fb_exchange_token") return { access_token: "long-token" };
    if (path === "/v23.0/me/permissions") {
      return {
        data: [
          ...(opts.scopes ?? ALL_SCOPES).map((permission) => ({ permission, status: "granted" })),
          ...(opts.declined ?? []).map((permission) => ({ permission, status: "declined" })),
        ],
      };
    }
    if (path === "/v23.0/me/accounts") {
      return {
        data: opts.pages ?? [
          { id: "page-1", name: "Cafe", access_token: "page-token-1", instagram_business_account: { id: "ig-1", username: "cafe" } },
          { id: "page-2", name: "No IG page", access_token: "page-token-2" },
        ],
      };
    }
    if (path === "/v23.0/me") return { id: "fb-user-9" };
    return new Response(JSON.stringify({ error: { message: "unexpected", code: 100 } }), { status: 400 });
  };
}

test("callback exchange: code -> user token -> long-lived token, all on graph.facebook.com with the app credentials", async () => {
  const calls = mockGraph(graphRoutes());
  const found = await discoverMetaAccounts("the-code");
  assert.equal(found.ok, true);
  if (!found.ok) return;
  for (const c of calls) assert.equal(c.url.origin, "https://graph.facebook.com");
  const exchange = calls.find((c) => c.url.searchParams.get("code"))!;
  assert.equal(exchange.url.searchParams.get("client_id"), "12345");
  assert.equal(exchange.url.searchParams.get("client_secret"), "test-secret");
  assert.equal(exchange.url.searchParams.get("redirect_uri"), "https://poskoo.com/api/instagram/callback");
  assert.equal(exchange.url.searchParams.get("code"), "the-code");
  const longLived = calls.find((c) => c.url.searchParams.get("grant_type") === "fb_exchange_token")!;
  assert.equal(longLived.url.searchParams.get("fb_exchange_token"), "short-token");
  // Later calls use the long-lived token.
  const accounts = calls.find((c) => c.url.pathname.endsWith("/me/accounts"))!;
  assert.equal(accounts.url.searchParams.get("access_token"), "long-token");
  assert.match(accounts.url.searchParams.get("fields") ?? "", /instagram_business_account\{id,username/);
  assert.equal(found.userToken, "long-token");
  assert.equal(found.metaUserId, "fb-user-9");
  assert.deepEqual(found.pages, [
    { pageId: "page-1", pageName: "Cafe", pageToken: "page-token-1", igUserId: "ig-1", igUsername: "cafe", igPicture: null },
  ]);
});

test("discovery: declined permissions, no Page shared, and a Page without Instagram give clear reasons", async () => {
  mockGraph(graphRoutes({ scopes: ALL_SCOPES.filter((s) => s !== "instagram_manage_messages"), declined: ["instagram_manage_messages"] }));
  assert.deepEqual(await discoverMetaAccounts("c"), { ok: false, reason: "missing_permissions", missing: ["instagram_manage_messages"] });

  mockGraph(graphRoutes({ pages: [] }));
  assert.deepEqual(await discoverMetaAccounts("c"), { ok: false, reason: "no_pages" });

  mockGraph(graphRoutes({ pages: [{ id: "p", name: "Only FB", access_token: "t" }] }));
  assert.deepEqual(await discoverMetaAccounts("c"), { ok: false, reason: "no_ig_business" });
});

test("discovery: several Instagram accounts are all returned so the user can pick", async () => {
  mockGraph(
    graphRoutes({
      pages: [
        { id: "p1", name: "One", access_token: "t1", instagram_business_account: { id: "ig-1", username: "one" } },
        { id: "p2", name: "Two", access_token: "t2", instagram_business_account: { id: "ig-2", username: "two", profile_picture_url: "https://cdn/x.jpg" } },
      ],
    }),
  );
  const found = await discoverMetaAccounts("c");
  assert.equal(found.ok && found.pages.length, 2);
});

test("an expired or reused code surfaces as a MetaApiError with Meta's code (no token in the message)", async () => {
  mockGraph(() => new Response(JSON.stringify({ error: { message: "This authorization code has been used.", code: 100 } }), { status: 400 }));
  await assert.rejects(discoverMetaAccounts("old"), (err: Error & { code?: number; status?: number }) => {
    assert.equal(err.message, "400");
    assert.equal(err.code, 100);
    return true;
  });
});

test("Page list follows Graph paging", async () => {
  let n = 0;
  mockGraph((url) => {
    n += 1;
    if (!url.searchParams.get("after")) {
      return {
        data: [{ id: "p1", name: "One", access_token: "t1", instagram_business_account: { id: "ig-1" } }],
        paging: { next: "https://graph.facebook.com/v23.0/me/accounts?after=CUR&access_token=x" },
      };
    }
    return { data: [{ id: "p2", name: "Two", access_token: "t2", instagram_business_account: { id: "ig-2" } }] };
  });
  const pages = await fetchMetaPages("tok");
  assert.equal(n, 2);
  assert.equal(pages.pageCount, 2);
  assert.deepEqual(pages.withInstagram.map((p) => p.igUserId), ["ig-1", "ig-2"]);
});

test("subscribePage installs the app on the Page with the Page token", async () => {
  const calls = mockGraph(() => ({ success: true }));
  await subscribePage("page-1", "page-token-1");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.href, "https://graph.facebook.com/v23.0/page-1/subscribed_apps");
  assert.equal(calls[0].init?.method, "POST");
  const body = new URLSearchParams(String(calls[0].init?.body));
  assert.equal(body.get("subscribed_fields"), "feed");
  assert.equal(body.get("access_token"), "page-token-1");
});

test("checkPageToken: valid, invalidated and unknown (network) Page tokens", async () => {
  const calls = mockGraph(() => ({ data: { is_valid: true } }));
  assert.equal(await checkPageToken("pt"), "valid");
  assert.equal(calls[0].url.pathname, "/v23.0/debug_token");
  assert.equal(calls[0].url.searchParams.get("input_token"), "pt");
  assert.equal(calls[0].url.searchParams.get("access_token"), "12345|test-secret");
  mockGraph(() => ({ data: { is_valid: false, error: { code: 190 } } }));
  assert.equal(await checkPageToken("pt"), "invalid");
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  assert.equal(await checkPageToken("pt"), "unknown");
});

test("token job: an invalidated Page token marks the Facebook-login account 'expired' (Reconnect needed)", async () => {
  const { encryptToken } = await import("./crypto.ts");
  const updates: { sql: string; params: unknown[] }[] = [];
  const { pool } = createFakePool([
    { match: /auth_type='instagram_login'/, reply: () => [] },
    {
      match: /auth_type='facebook_login'/,
      reply: () => [
        { id: "a-ok", access_token_enc: encryptToken("good") },
        { id: "a-dead", access_token_enc: encryptToken("dead") },
      ],
    },
    { match: /^update socialapp\.social_accounts/, reply: (params, sql) => { updates.push({ sql, params }); return []; } },
  ]);
  const restore = installFakePool(pool);
  try {
    const { refreshExpiringTokens } = await import("./tokenRefresh.ts");
    const result = await refreshExpiringTokens(50, async (token) => (token === "good" ? "valid" : "invalid"));
    assert.equal(result.pagesChecked, 2);
    assert.equal(result.pagesInvalid, 1);
    assert.deepEqual(updates.filter((u) => u.sql.includes("status='expired'")).map((u) => u.params[0]), ["a-dead"]);
  } finally {
    restore();
  }
});

test("webhook X-Hub-Signature-256: Meta app secret and the old Instagram app secret are accepted, anything else rejected", () => {
  const raw = JSON.stringify({ object: "instagram", entry: [] });
  const sign = (secret: string) => "sha256=" + createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  const secrets = ["meta-secret", "ig-secret"];
  assert.equal(verifyAnySignature(raw, sign("meta-secret"), secrets), true);
  assert.equal(verifyAnySignature(raw, sign("ig-secret"), secrets), true);
  assert.equal(verifyAnySignature(raw, sign("other"), secrets), false);
  assert.equal(verifyAnySignature(raw + " ", sign("meta-secret"), secrets), false);
  assert.equal(verifyAnySignature(raw, null, secrets), false);
  assert.equal(verifyAnySignature(raw, sign("meta-secret"), []), false);
  assert.equal(verifySignature(raw, sign("meta-secret").replace("sha256=", "sha1="), "meta-secret"), false);
});

test("publish call shape (facebook login): container on graph.facebook.com/{ig-id}/media, then media_publish with creation_id", async () => {
  const calls: Call[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    calls.push({ url, init });
    const body = url.pathname.endsWith("/media") ? { id: "container-1" } : { id: "post-1" };
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
  const { publishToInstagram } = await import("./publisher.ts");
  const { graphBaseFor } = await import("./graphHost.ts");
  const out = await publishToInstagram(graphBaseFor("facebook_login"), "ig-1", "page-token", [{ type: "image", url: "https://cdn/x.jpg" }], "Hello");
  assert.deepEqual(out, { ok: true, externalPostId: "post-1" });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url.href, "https://graph.facebook.com/v23.0/ig-1/media");
  assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, "Bearer page-token");
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { image_url: "https://cdn/x.jpg", caption: "Hello" });
  assert.equal(calls[1].url.href, "https://graph.facebook.com/v23.0/ig-1/media_publish");
  assert.deepEqual(JSON.parse(String(calls[1].init?.body)), { creation_id: "container-1" });
  // Old Instagram-login accounts keep their host.
  assert.equal(graphBaseFor("instagram_login"), "https://graph.instagram.com/v23.0");
  assert.equal(graphBaseFor(undefined), "https://graph.instagram.com/v23.0");
});

test("rate limits: codes 4/17/32/613, HTTP 429 and 'too many' messages pause sending", () => {
  assert.equal(classifyMetaError(400, { error: { code: 613 } }), "rate_limited");
  assert.equal(classifyMetaError(400, { error: { code: 4 } }), "rate_limited");
  assert.equal(classifyMetaError(429, null), "rate_limited");
  assert.equal(classifyMetaError(400, { error: { code: 10900, message: "Too many messages sent to this user" } }), "rate_limited");
  assert.equal(classifyMetaError(400, { error: { code: 100, message: "Invalid parameter" } }), "fatal");
});

test("account chooser hand-off: encrypted, bound to the user and short-lived", async () => {
  process.env.TOKEN_ENCRYPTION_KEY ||= Buffer.alloc(32, 7).toString("base64");
  const { decodePick, encodePick, PICK_MAX_AGE_S } = await import("./metaAccounts.ts");
  const now = Date.now();
  const raw = encodePick("user-1", "long-token", ["instagram_basic"], "fb-9", now);
  assert.equal(raw.includes("long-token"), false);
  assert.deepEqual(decodePick(raw, "user-1", now + 1000), { userToken: "long-token", scopes: ["instagram_basic"], metaUserId: "fb-9" });
  assert.equal(decodePick(raw, "user-2", now), null);
  assert.equal(decodePick(raw, "user-1", now + PICK_MAX_AGE_S * 1000 + 1), null);
  assert.equal(decodePick(raw.slice(0, -4) + "AAAA", "user-1", now), null);
  assert.equal(decodePick(undefined, "user-1", now), null);
});

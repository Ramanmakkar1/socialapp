import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchPagesWithInstagram, isMetaLoginConfigured, metaAuthorizeUrl, signState, verifyState } from "./metaLogin.ts";

process.env.META_APP_ID = "12345";
process.env.META_LOGIN_CONFIG_ID = "67890";
process.env.META_APP_SECRET = "test-secret";

test("metaAuthorizeUrl has config_id and no scope", () => {
  const url = new URL(metaAuthorizeUrl("state-abc"));
  assert.equal(`${url.origin}${url.pathname}`, "https://www.facebook.com/v23.0/dialog/oauth");
  assert.equal(url.searchParams.get("client_id"), "12345");
  assert.equal(url.searchParams.get("config_id"), "67890");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("state"), "state-abc");
  assert.equal(url.searchParams.has("scope"), false);
});

test("isMetaLoginConfigured requires appId, configId and appSecret", () => {
  assert.equal(isMetaLoginConfigured(), true);
  const saved = process.env.META_LOGIN_CONFIG_ID;
  delete process.env.META_LOGIN_CONFIG_ID;
  try {
    assert.equal(isMetaLoginConfigured(), false);
  } finally {
    process.env.META_LOGIN_CONFIG_ID = saved;
  }
});

test("signState/verifyState round trip passes; tampered signature and wrong nonce fail", () => {
  const signed = signState("nonce-1");
  assert.equal(verifyState(signed, "nonce-1"), true);
  const tampered = signed.slice(0, -1) + (signed.endsWith("0") ? "1" : "0");
  assert.equal(verifyState(tampered, "nonce-1"), false);
  assert.equal(verifyState(signed, "other-nonce"), false);
});

test("fetchPagesWithInstagram keeps only pages with an Instagram business account", async () => {
  const payload = {
    data: [
      {
        id: "111",
        name: "With IG",
        access_token: "pt1",
        instagram_business_account: { id: "ig1", username: "withig", profile_picture_url: "https://cdn/p1.jpg" },
      },
      { id: "222", name: "No IG", access_token: "pt2", instagram_business_account: null },
    ],
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    assert.ok(String(input).includes("/me/accounts"));
    return { ok: true, status: 200, json: async () => payload } as Response;
  }) as typeof fetch;
  try {
    const pages = await fetchPagesWithInstagram("user-token");
    assert.deepEqual(pages, [
      { pageId: "111", pageName: "With IG", pageToken: "pt1", igUserId: "ig1", igUsername: "withig", igPicture: "https://cdn/p1.jpg" },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

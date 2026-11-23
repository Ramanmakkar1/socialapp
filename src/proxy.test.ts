import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "./proxy.ts";
import { refCookieValue } from "./lib/referralCode.ts";

function setCookie(res: Response): string | null {
  return res.headers.get("set-cookie");
}

test("?ref=CODE sets a 60-day first-touch cookie; an existing valid cookie is never overwritten", () => {
  const first = proxy(new NextRequest("https://poskoo.com/?ref=abcd2345"));
  const cookie = setCookie(first) ?? "";
  assert.match(cookie, /^pf_ref=ABCD2345\.\d{13};/);
  assert.match(cookie, /Max-Age=5184000/);
  assert.match(cookie, /HttpOnly/);

  const existing = new NextRequest("https://poskoo.com/signup?ref=ZZZZ9999", {
    headers: { cookie: `pf_ref=${refCookieValue("ABCD2345", Date.now() - 86_400_000)}` },
  });
  assert.equal(setCookie(proxy(existing)), null);

  const expired = new NextRequest("https://poskoo.com/signup?ref=ZZZZ9999", {
    headers: { cookie: `pf_ref=${refCookieValue("ABCD2345", Date.now() - 61 * 86_400_000)}` },
  });
  assert.match(setCookie(proxy(expired)) ?? "", /^pf_ref=ZZZZ9999\./);

  assert.equal(setCookie(proxy(new NextRequest("https://poskoo.com/?ref=bad!"))), null);
});

test("legacy staging host 301s to poskoo.com with noindex", () => {
  const res = proxy(
    new NextRequest("https://socialapp.splitforms.com/pricing?utm=1", {
      headers: { host: "socialapp.splitforms.com" },
    }),
  );
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "https://poskoo.com/pricing?utm=1");
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(res.headers.get("cache-control"), "no-store");
});

test("legacy host with a port in x-forwarded-host is still redirected", () => {
  const res = proxy(
    new NextRequest("https://socialapp.splitforms.com/", {
      headers: { "x-forwarded-host": "socialapp.splitforms.com:443" },
    }),
  );
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "https://poskoo.com/");
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
});

test("poskoo.com passes through", () => {
  const res = proxy(
    new NextRequest("https://poskoo.com/pricing", { headers: { host: "poskoo.com" } }),
  );
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-robots-tag"), null);
});

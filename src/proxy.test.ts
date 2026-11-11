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

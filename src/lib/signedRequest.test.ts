import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSignedRequest, signRequest } from "./signedRequest.ts";

const SECRET = "test-secret";

test("valid signed_request returns the payload with a string user_id", () => {
  const sr = signRequest({ algorithm: "HMAC-SHA256", user_id: 1784, issued_at: 1 }, SECRET);
  assert.equal(parseSignedRequest(sr, SECRET)?.user_id, "1784");
});

test("wrong secret, tampered payload and junk are rejected", () => {
  const sr = signRequest({ algorithm: "HMAC-SHA256", user_id: "42" }, SECRET);
  assert.equal(parseSignedRequest(sr, "other"), null);
  const [sig] = sr.split(".");
  const forged = Buffer.from(JSON.stringify({ algorithm: "HMAC-SHA256", user_id: "43" })).toString("base64url");
  assert.equal(parseSignedRequest(`${sig}.${forged}`, SECRET), null);
  assert.equal(parseSignedRequest("nodot", SECRET), null);
  assert.equal(parseSignedRequest("", SECRET), null);
  assert.equal(parseSignedRequest(sr, ""), null);
});

test("missing user_id or other algorithm is rejected", () => {
  assert.equal(parseSignedRequest(signRequest({ algorithm: "HMAC-SHA256" }, SECRET), SECRET), null);
  assert.equal(parseSignedRequest(signRequest({ algorithm: "MD5", user_id: "1" }, SECRET), SECRET), null);
});

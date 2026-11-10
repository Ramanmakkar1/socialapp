import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import {
  mediaFilePath,
  mediaKeyFor,
  signMediaKey,
  verifyMediaSignatureWithSecret,
} from "./mediaStorage.ts";

const KEY = "11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222.jpg";
const SECRET = "test-media-secret";

test("media keys are user-scoped and keep the file extension", () => {
  const key = mediaKeyFor("11111111-1111-1111-1111-111111111111", "png");
  assert.match(key, /^11111111-1111-1111-1111-111111111111\/[0-9a-f-]{36}\.png$/);
});

test("storage paths reject traversal and unknown extensions", () => {
  assert.equal(mediaFilePath("../secret.jpg"), null);
  assert.equal(mediaFilePath("11111111-1111-1111-1111-111111111111/../../secret.jpg"), null);
  assert.equal(mediaFilePath("11111111-1111-1111-1111-111111111111/file.exe"), null);
  assert.ok(mediaFilePath(KEY)?.endsWith(KEY.replace("/", path.sep)));
});

test("signed URLs verify only with the right key, signature and expiry", () => {
  const expires = 2_000_000_000;
  const signature = signMediaKey(KEY, expires, SECRET);
  assert.equal(verifyMediaSignatureWithSecret(KEY, expires, signature, SECRET, 1_900_000_000), true);
  assert.equal(verifyMediaSignatureWithSecret(KEY, expires, signature, "wrong", 1_900_000_000), false);
  assert.equal(verifyMediaSignatureWithSecret(KEY, expires, "bad", SECRET, 1_900_000_000), false);
  assert.equal(verifyMediaSignatureWithSecret(KEY, expires, signature, SECRET, expires + 1), false);
  assert.equal(
    verifyMediaSignatureWithSecret(
      "11111111-1111-1111-1111-111111111111/33333333-3333-3333-3333-333333333333.jpg",
      expires,
      signature,
      SECRET,
      1_900_000_000,
    ),
    false,
  );
});

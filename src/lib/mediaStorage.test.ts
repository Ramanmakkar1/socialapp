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

test("Range headers: single, open-ended, suffix, invalid and out-of-file ranges", async () => {
  const { parseRange } = await import("./mediaStorage.ts");
  assert.equal(parseRange(null, 100), null);
  assert.deepEqual(parseRange("bytes=0-9", 100), { start: 0, end: 9 });
  assert.deepEqual(parseRange("bytes=90-", 100), { start: 90, end: 99 });
  assert.deepEqual(parseRange("bytes=-10", 100), { start: 90, end: 99 });
  assert.deepEqual(parseRange("bytes=50-500", 100), { start: 50, end: 99 });
  assert.equal(parseRange("bytes=100-", 100), "unsatisfiable");
  assert.equal(parseRange("bytes=9-3", 100), "unsatisfiable");
  assert.equal(parseRange("bytes=0-1,5-6", 100), null);
  assert.equal(parseRange("items=0-1", 100), null);
});

async function withTempStorage<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const os = await import("node:os");
  const dir = await mkdtemp(path.join(os.tmpdir(), "poskoo-media-"));
  const prev = process.env.MEDIA_STORAGE_DIR;
  process.env.MEDIA_STORAGE_DIR = dir;
  try {
    return await run(dir);
  } finally {
    if (prev === undefined) delete process.env.MEDIA_STORAGE_DIR;
    else process.env.MEDIA_STORAGE_DIR = prev;
    await rm(dir, { recursive: true, force: true });
  }
}

const USER = "11111111-1111-1111-1111-111111111111";

function streamOf(...chunks: number[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const n of chunks) controller.enqueue(new Uint8Array(n));
      controller.close();
    },
  });
}

test("uploads stream to disk, count toward the user's usage, and stop at the byte limit", async () => {
  const { saveMediaStream, userMediaUsage, MediaTooLargeError } = await import("./mediaStorage.ts");
  const { readdir } = await import("node:fs/promises");
  await withTempStorage(async (dir) => {
    const saved = await saveMediaStream(USER, streamOf(1000, 1000), "jpg", 5000);
    assert.equal(saved.size, 2000);
    assert.equal(await userMediaUsage(USER), 2000);
    await assert.rejects(saveMediaStream(USER, streamOf(3000, 3000), "mp4", 5000), MediaTooLargeError);
    const files = await readdir(path.join(dir, USER));
    assert.equal(files.length, 1, "the rejected upload leaves no file behind");
    assert.equal(await userMediaUsage(USER), 2000);
  });
});

test("cleanup deletes only old uploads that nothing references", async () => {
  const { saveMediaStream, cleanupUnusedMedia, mediaFilePath } = await import("./mediaStorage.ts");
  const { utimes, stat } = await import("node:fs/promises");
  await withTempStorage(async () => {
    const used = await saveMediaStream(USER, streamOf(10), "jpg", 100);
    const unused = await saveMediaStream(USER, streamOf(20), "jpg", 100);
    const fresh = await saveMediaStream(USER, streamOf(30), "jpg", 100);
    const old = new Date(Date.now() - 40 * 86_400_000);
    for (const k of [used.key, unused.key]) await utimes(mediaFilePath(k)!, old, old);
    const result = await cleanupUnusedMedia(async () => [`[{"url":"https://x/api/media/${used.key}?exp=1&sig=a"}]`]);
    assert.deepEqual(result, { deleted: 1, freedBytes: 20 });
    await stat(mediaFilePath(used.key)!);
    await stat(mediaFilePath(fresh.key)!);
    await assert.rejects(stat(mediaFilePath(unused.key)!));
  });
});

test("cleanup leaves a user's files alone when the reference lookup fails", async () => {
  const { saveMediaStream, cleanupUnusedMedia, mediaFilePath } = await import("./mediaStorage.ts");
  const { utimes } = await import("node:fs/promises");
  await withTempStorage(async () => {
    const a = await saveMediaStream(USER, streamOf(10), "png", 100);
    const old = new Date(Date.now() - 40 * 86_400_000);
    await utimes(mediaFilePath(a.key)!, old, old);
    const origError = console.error;
    console.error = () => {};
    try {
      const result = await cleanupUnusedMedia(async () => {
        throw new Error("db down");
      });
      assert.equal(result.deleted, 0);
    } finally {
      console.error = origError;
    }
  });
});

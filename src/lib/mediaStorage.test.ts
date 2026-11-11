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

test("thumbnail keys are served, follow their upload, and are found in post JSON", async () => {
  const { thumbKeyFor, isThumbKey, mediaKeysInText } = await import("./mediaStorage.ts");
  const thumb = thumbKeyFor(KEY);
  assert.equal(thumb, KEY.replace(/\.jpg$/, ".thumb.jpg"));
  assert.ok(isThumbKey(thumb));
  assert.ok(mediaFilePath(thumb));
  assert.deepEqual(mediaKeysInText(`x /api/media/${KEY}?a /api/media/${thumb}?b`), [KEY, thumb]);
});

test("cleanup (7 days) keeps a poster while its upload exists, and drops orphaned posters", async () => {
  const { saveMediaStream, cleanupUnusedMedia, mediaFilePath: filePath, thumbKeyFor } = await import("./mediaStorage.ts");
  const { utimes, stat } = await import("node:fs/promises");
  await withTempStorage(async () => {
    const kept = await saveMediaStream(USER, streamOf(10), "mp4", 100);
    const keptThumb = await saveMediaStream(USER, streamOf(3), "jpg", 100, thumbKeyFor(kept.key));
    const orphanThumb = await saveMediaStream(USER, streamOf(4), "jpg", 100, thumbKeyFor(`${USER}/44444444-4444-4444-4444-444444444444.mp4`));
    const eightDays = new Date(Date.now() - 8 * 86_400_000);
    for (const k of [kept.key, keptThumb.key, orphanThumb.key]) await utimes(filePath(k)!, eightDays, eightDays);
    const result = await cleanupUnusedMedia(async () => [`/api/media/${kept.key}?x`]);
    assert.deepEqual(result, { deleted: 1, freedBytes: 4 });
    await stat(filePath(keptThumb.key)!);
    await assert.rejects(stat(filePath(orphanThumb.key)!));
  });
});

test("deleteMediaKeys and listUserMedia", async () => {
  const { saveMediaStream, deleteMediaKeys, listUserMedia } = await import("./mediaStorage.ts");
  await withTempStorage(async () => {
    const a = await saveMediaStream(USER, streamOf(10), "jpg", 100);
    const b = await saveMediaStream(USER, streamOf(20), "png", 100);
    assert.equal((await listUserMedia(USER)).length, 2);
    assert.deepEqual(await deleteMediaKeys([a.key, a.key, "../../etc/passwd"]), { deleted: 1, freedBytes: 10 });
    assert.deepEqual((await listUserMedia(USER)).map((f) => f.key), [b.key]);
  });
});

test("disk threshold: refuse below the minimum, warn below twice the minimum", async () => {
  const { diskDecision, minFreeBytes, mediaDiskSpace } = await import("./mediaStorage.ts");
  const G = 1_000_000_000;
  assert.equal(diskDecision(100 * G, 1 * G, 20 * G), "ok");
  assert.equal(diskDecision(45 * G, 6 * G, 20 * G), "warn");
  assert.equal(diskDecision(21 * G, 2 * G, 20 * G), "refuse");
  const prev = process.env.MEDIA_MIN_FREE_GB;
  delete process.env.MEDIA_MIN_FREE_GB;
  assert.equal(minFreeBytes(), 20 * G);
  process.env.MEDIA_MIN_FREE_GB = "5";
  assert.equal(minFreeBytes(), 5 * G);
  if (prev === undefined) delete process.env.MEDIA_MIN_FREE_GB;
  else process.env.MEDIA_MIN_FREE_GB = prev;
  await withTempStorage(async () => {
    const space = await mediaDiskSpace();
    assert.ok(space && space.freeBytes > 0 && space.totalBytes >= space.freeBytes);
  });
});

test("video length is read from the MP4 mvhd box", async () => {
  const { probeVideoDurationSec } = await import("./mediaProbe.ts");
  const { writeFile } = await import("node:fs/promises");
  await withTempStorage(async (dir) => {
    const box = (type: string, body: Buffer) => {
      const head = Buffer.alloc(8);
      head.writeUInt32BE(8 + body.length, 0);
      head.write(type, 4, "latin1");
      return Buffer.concat([head, body]);
    };
    const mvhd = Buffer.alloc(100);
    mvhd.writeUInt32BE(1000, 12); // timescale
    mvhd.writeUInt32BE(5500, 16); // duration -> 5.5 s
    const file = Buffer.concat([box("ftyp", Buffer.from("isom0000")), box("mdat", Buffer.alloc(64)), box("moov", box("mvhd", mvhd))]);
    const p = path.join(dir, "v.mp4");
    await writeFile(p, file);
    assert.equal(await probeVideoDurationSec(p), 5.5);
    await writeFile(p, Buffer.from("not a video"));
    assert.equal(await probeVideoDurationSec(p), null);
  });
});

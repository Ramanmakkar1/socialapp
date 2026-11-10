import assert from "node:assert/strict";
import { test } from "node:test";
import {
  instagramAspectWarning,
  mediaKindFromUrl,
  validateMediaFile,
} from "./mediaUpload.ts";

test("accepts the image and video types Instagram can publish", () => {
  assert.deepEqual(validateMediaFile({ type: "image/jpeg", size: 1024 }), {
    ok: true,
    kind: "image",
    ext: "jpg",
  });
  assert.deepEqual(validateMediaFile({ type: "image/png", size: 1024 }), {
    ok: true,
    kind: "image",
    ext: "png",
  });
  assert.deepEqual(validateMediaFile({ type: "video/mp4", size: 1024 }), {
    ok: true,
    kind: "video",
    ext: "mp4",
  });
  assert.deepEqual(validateMediaFile({ type: "video/quicktime", size: 1024 }), {
    ok: true,
    kind: "video",
    ext: "mov",
  });
});

test("rejects unsupported types, empty files and files over the size limit", () => {
  assert.equal(validateMediaFile({ type: "image/gif", size: 1024 }).ok, false);
  assert.equal(validateMediaFile({ type: "application/pdf", size: 1024 }).ok, false);
  assert.equal(validateMediaFile({ type: "image/jpeg", size: 0 }).ok, false);
  assert.equal(validateMediaFile({ type: "image/jpeg", size: 8 * 1024 * 1024 + 1 }).ok, false);
  assert.equal(validateMediaFile({ type: "video/mp4", size: 100 * 1024 * 1024 + 1 }).ok, false);
});

test("reads the media kind from a signed upload URL", () => {
  assert.equal(
    mediaKindFromUrl("https://poskoo.com/api/media/u/1.jpg?exp=1&sig=abc"),
    "image",
  );
  assert.equal(
    mediaKindFromUrl("https://poskoo.com/api/media/u/1.mp4?exp=1&sig=abc"),
    "video",
  );
  assert.equal(mediaKindFromUrl("https://example.com/photo.webp"), null);
  assert.equal(mediaKindFromUrl("not a url"), null);
});

test("warns only when an image is outside Instagram's feed aspect range", () => {
  assert.equal(instagramAspectWarning(1080, 1350), null);
  assert.equal(instagramAspectWarning(1080, 1080), null);
  assert.equal(instagramAspectWarning(1080, 566), null);
  assert.match(instagramAspectWarning(1080, 1920) ?? "", /taller than Instagram's 4:5/);
  assert.match(instagramAspectWarning(2000, 1000) ?? "", /wider than Instagram's 1.91:1/);
});

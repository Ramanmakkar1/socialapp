import assert from "node:assert/strict";
import { test } from "node:test";
import { CROPS, REEL_H, REEL_W, TITLE_STYLES, coverFit, cropRect, titleBox, wrapTitle } from "./reelCover.ts";

test("cropRect centres grid and feed inside the 1080x1920 frame", () => {
  assert.equal(REEL_W, 1080);
  assert.equal(REEL_H, 1920);
  assert.equal(CROPS.length, 2);
  const grid = cropRect(CROPS.find((c) => c.id === "grid")!);
  assert.deepEqual(grid, { x: 0, y: 240, w: 1080, h: 1440 });
  const feed = cropRect(CROPS.find((c) => c.id === "feed")!);
  assert.deepEqual(feed, { x: 0, y: 285, w: 1080, h: 1350 });
});

test("coverFit covers the 1920x1080 frame at offsets -1, 0 and 1", () => {
  for (const ox of [-1, 0, 1]) {
    const fit = coverFit(1920, 1080, 1, ox, 0);
    assert.equal(fit.dh, 1920);
    assert.ok(fit.dw >= REEL_W, `dw ${fit.dw} must cover the width`);
    assert.equal(fit.dy, 0);
    assert.ok(fit.dx <= 0 && fit.dx + fit.dw >= REEL_W, `frame covered at offset ${ox}`);
  }
  // offset -1 shows the photo's left edge, +1 its right edge
  assert.equal(coverFit(1920, 1080, 1, -1).dx, REEL_W - coverFit(1920, 1080).dw);
  assert.equal(coverFit(1920, 1080, 1, 1).dx, 0);
});

test("coverFit clamps zoom to 1..3", () => {
  const zoomed = coverFit(1920, 1080, 5);
  assert.equal(zoomed.dh, 5760);
  assert.equal(zoomed.dw, 10240);
  const tiny = coverFit(1920, 1080, 0.2);
  assert.equal(tiny.dh, 1920);
});

test("wrapTitle trims, wraps on words and hard-breaks long words", () => {
  assert.deepEqual(wrapTitle("  Sale  "), ["Sale"]);
  assert.deepEqual(wrapTitle(""), []);
  assert.deepEqual(wrapTitle("abcdefghijklmnopqrstuv"), ["abcdefghijklmnopqr", "stuv"]);
  assert.deepEqual(wrapTitle("hello world foo", 11), ["hello world", "foo"]);
});

test("wrapTitle keeps at most maxLines and adds an ellipsis when cut", () => {
  const many = wrapTitle("aa bb cc dd ee ff gg hh ii jj", 8, 3);
  assert.equal(many.length, 3);
  assert.equal(many[2], "gg hh i…");
  const short = wrapTitle("aa bb cc", 8, 3);
  assert.deepEqual(short, ["aa bb cc"]);
});

test("TITLE_STYLES has 4 presets with valid colours", () => {
  assert.equal(TITLE_STYLES.length, 4);
  const hex = /^#[0-9a-f]{6}$/i;
  for (const s of TITLE_STYLES) {
    assert.ok(s.bg === null || hex.test(s.bg), `style ${s.id} bg is not #hex: ${s.bg}`);
    assert.ok(hex.test(s.fg), `style ${s.id} fg is not #hex: ${s.fg}`);
  }
  const none = TITLE_STYLES.find((s) => s.id === "none");
  assert.ok(none && none.bg === null && none.band === false);
});

test("titleBox stays inside the grid crop", () => {
  const grid = cropRect(CROPS.find((c) => c.id === "grid")!);
  const box = titleBox(["Reel title", "second line"], 80);
  assert.equal(box.x, 60);
  assert.equal(box.w, REEL_W - 120);
  assert.equal(box.h, 2 * 1.15 * 80 + 80);
  assert.ok(box.y >= grid.y, `y ${box.y} is above the grid crop`);
  assert.ok(box.y + box.h <= grid.y + grid.h, `box bottom ${box.y + box.h} is below the grid crop`);
});

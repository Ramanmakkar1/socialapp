import assert from "node:assert/strict";
import { test } from "node:test";
import { COVER_SIZE, ICONS, PALETTES, clampText, coverLayout } from "./highlightCovers.ts";

test("square layout is a 1080x1080 centred circle", () => {
  const sq = coverLayout("square");
  assert.equal(COVER_SIZE, 1080);
  assert.deepEqual(
    { width: sq.width, height: sq.height, cx: sq.cx, cy: sq.cy, circleR: sq.circleR },
    { width: 1080, height: 1080, cx: 540, cy: 540, circleR: 540 },
  );
  assert.ok(sq.iconSize > 0 && sq.iconSize < sq.circleR * 2);
});

test("story layout is a 1080x1920 frame with the circle centred at (540,960)", () => {
  const st = coverLayout("story");
  assert.deepEqual(
    { width: st.width, height: st.height, cx: st.cx, cy: st.cy, circleR: st.circleR },
    { width: 1080, height: 1920, cx: 540, cy: 960, circleR: 540 },
  );
  assert.equal(st.iconSize, coverLayout("square").iconSize);
});

test("clampText trims and caps at 12 characters", () => {
  assert.equal(clampText("  Sale  "), "Sale");
  assert.equal(clampText("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "ABCDEFGHIJKL");
  assert.equal(clampText("123456789012"), "123456789012");
  assert.equal(clampText("1234567890123"), "123456789012");
  assert.equal(clampText(""), "");
});

test("every palette has a valid #hex bg and fg", () => {
  const hex = /^#[0-9a-f]{6}$/i;
  assert.ok(PALETTES.length === 8);
  for (const p of PALETTES) {
    assert.ok(hex.test(p.bg), `palette ${p.id} bg is not #hex: ${p.bg}`);
    assert.ok(hex.test(p.fg), `palette ${p.id} fg is not #hex: ${p.fg}`);
  }
});

test("every icon id is unique and has a non-empty 24x24 path", () => {
  const ids = ICONS.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const icon of ICONS) {
    assert.ok(icon.path.length > 0, `icon ${icon.id} has an empty path`);
    assert.ok(/^[Mm]/.test(icon.path), `icon ${icon.id} path does not start with a move`);
  }
});

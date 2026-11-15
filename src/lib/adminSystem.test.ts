// Admin → System: job state, token health merge, env presence (names only) and migration diff.
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { compareMigrations, envPresence, jobState, mergeTokenHealth, migrationFiles } from "./adminSystem.ts";

test("jobState: overdue work beats recent activity", () => {
  assert.equal(jobState(0, new Date()), "ok");
  assert.equal(jobState(0, null), "unknown");
  assert.equal(jobState(2, new Date()), "warn");
  assert.equal(jobState(5, new Date()), "err");
});

test("mergeTokenHealth adds YouTube and failures, worst networks first", () => {
  const rows = mergeTokenHealth(
    [
      { platform: "instagram", active: 3, expired: 1, disconnected: 0, past_expiry: 1, expiring_7d: 0 },
      { platform: "tiktok", active: 1, expired: 0, disconnected: 0, past_expiry: 0, expiring_7d: 0 },
    ],
    { active: 2, disconnected: 1 },
    [{ platform: "youtube", n: 4 }, { platform: "x", n: 1 }],
  );
  assert.deepEqual(rows.map((r) => r.platform), ["youtube", "instagram", "x", "tiktok"]);
  assert.equal(rows[0].active, 2);
  assert.equal(rows[0].failed_7d, 4);
  assert.equal(rows.find((r) => r.platform === "x")?.active, 0);
});

test("envPresence reports names and booleans, never values", () => {
  const out = envPresence(["A", "B", "C"], { A: "secret-value", B: "   " });
  assert.deepEqual(out, [
    { name: "A", set: true },
    { name: "B", set: false },
    { name: "C", set: false },
  ]);
  assert.ok(!JSON.stringify(out).includes("secret-value"));
});

test("compareMigrations finds pending files and applied names with no file", () => {
  const s = compareMigrations(["001_init.sql", "002_x.sql", "051_admin_indexes.sql"], [
    { name: "001_init.sql", applied_at: null },
    { name: "002_x.sql", applied_at: null },
    { name: "012_old_name.sql", applied_at: null },
  ]);
  assert.deepEqual(s.pending, ["051_admin_indexes.sql"]);
  assert.deepEqual(s.unknown, ["012_old_name.sql"]);
  assert.equal(s.filesAvailable, true);
  const noFiles = compareMigrations(null, [{ name: "001_init.sql", applied_at: null }]);
  assert.equal(noFiles.filesAvailable, false);
  assert.deepEqual(noFiles.pending, []);
});

test("migrationFiles lists .sql files sorted, null when the folder is missing", async () => {
  const dir = await mkdtemp(join(tmpdir(), "poskoo-mig-"));
  await writeFile(join(dir, "002_b.sql"), "");
  await writeFile(join(dir, "001_a.sql"), "");
  await writeFile(join(dir, "README.md"), "");
  assert.deepEqual(await migrationFiles(dir), ["001_a.sql", "002_b.sql"]);
  assert.equal(await migrationFiles(join(dir, "missing")), null);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { csvField, leadsCsv, localTimestamp, validTimeZone } from "./leadsCsv.ts";

test("csv fields are quoted and formula-injection safe", () => {
  assert.equal(csvField('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvField("+1 416 555 0199"), `"'+1 416 555 0199"`);
  assert.equal(csvField("-2"), `"'-2"`);
  assert.equal(csvField("@SUM(A1)"), `"'@SUM(A1)"`);
  assert.equal(csvField("  =1+1"), `"'  =1+1"`);
  assert.equal(csvField("\t=cmd"), `"'\t=cmd"`);
  assert.equal(csvField("a,b\nc"), `"a,b\nc"`);
  assert.equal(csvField(null), `""`);
  assert.equal(csvField("Zoë 🔥"), `"Zoë 🔥"`);
});

test("export has every lead, UTC time, and local time in the owner's time zone", () => {
  const csv = leadsCsv(
    [
      { username: "ana", name: null, email: "a@x.com", phone: null, rule_name: "Guide", created_at: new Date("2026-03-08T07:30:00Z") },
      { username: "bo", name: "Bo", email: null, phone: "+15551234567", rule_name: null, created_at: "2026-12-31T23:59:59Z" },
    ],
    "America/New_York",
  );
  assert.ok(csv.startsWith("﻿"));
  const lines = csv.slice(1).trimEnd().split("\r\n");
  assert.equal(lines.length, 3);
  assert.equal(lines[0], `"username","name","email","phone","rule","created_at_utc","created_at_local (America/New_York)"`);
  assert.equal(lines[1], `"ana","","a@x.com","","Guide","2026-03-08T07:30:00.000Z","2026-03-08 03:30:00"`);
  assert.equal(lines[2], `"bo","Bo","","'+15551234567","","2026-12-31T23:59:59.000Z","2026-12-31 18:59:59"`);
});

test("unknown or hostile time zones fall back to UTC only", () => {
  assert.equal(validTimeZone("Mars/Base"), null);
  assert.equal(validTimeZone("'; drop"), null);
  assert.equal(validTimeZone("Asia/Kolkata"), "Asia/Kolkata");
  const csv = leadsCsv([], "Mars/Base");
  assert.equal(csv, `﻿"username","name","email","phone","rule","created_at_utc"\r\n`);
  assert.equal(localTimestamp(new Date("2026-01-01T00:00:00Z"), "Asia/Kolkata"), "2026-01-01 05:30:00");
});

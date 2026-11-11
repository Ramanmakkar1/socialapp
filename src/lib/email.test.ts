import assert from "node:assert/strict";
import { test } from "node:test";
import { isEmailConfigured, maskAddress, sendEmail } from "./email.ts";

function capture(fn: () => Promise<unknown>): Promise<string> {
  const orig = console.info;
  let out = "";
  console.info = (...a: unknown[]) => {
    out += a.join(" ") + "\n";
  };
  return fn().then(
    () => ((console.info = orig), out),
    (e) => {
      console.info = orig;
      throw e;
    },
  );
}

const msg = { to: "jane@example.com", subject: "Reset your Poskoo password", html: "<p>482913</p>", text: "Your code: 482913", tag: "password_reset" };

test("unconfigured: production logs subject + masked recipient, never the code", async () => {
  const env = process.env as Record<string, string | undefined>;
  const prev = { host: env.SMTP_HOST, node: env.NODE_ENV };
  delete env.SMTP_HOST;
  env.NODE_ENV = "production";
  assert.equal(isEmailConfigured(), false);
  let res;
  const out = await capture(async () => {
    res = await sendEmail(msg);
  });
  assert.deepEqual(res, { ok: true, via: "log" });
  assert.ok(out.includes("Reset your Poskoo password"));
  assert.ok(out.includes("ja***@example.com"));
  assert.ok(!out.includes("482913"));
  env.NODE_ENV = "development";
  const dev = await capture(() => sendEmail(msg));
  assert.ok(dev.includes("482913"), "dev prints the full text for local testing");
  env.NODE_ENV = prev.node;
  if (prev.host !== undefined) env.SMTP_HOST = prev.host;
});

test("invalid recipients are refused without throwing", async () => {
  assert.deepEqual(await sendEmail({ ...msg, to: "nope" }), { ok: false, error: "invalid recipient" });
  assert.equal(maskAddress("ab@x.io"), "ab***@x.io");
});

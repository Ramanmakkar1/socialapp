import assert from "node:assert/strict";
import { test } from "node:test";
import { PREVIEWS, esc, formatMoney, passwordResetEmail, verifyEmail, welcomeEmail, newOrderEmail, buyerReceiptEmail } from "./emailTemplates.ts";

test("every template renders subject, preheader, HTML and a plain-text part", () => {
  for (const [name, render] of Object.entries(PREVIEWS)) {
    const m = render();
    assert.ok(m.subject.length > 5, name);
    assert.ok(m.preheader.length > 10, name);
    assert.match(m.html, /^<!doctype html>/i, name);
    assert.ok(m.html.includes('name="color-scheme"'), `${name}: color-scheme meta`);
    assert.ok(m.html.includes(esc(m.preheader)), `${name}: preheader`);
    assert.ok(m.html.includes("/email/mark.png"), `${name}: logo`);
    assert.ok(m.html.includes('role="presentation"'), `${name}: table layout`);
    assert.ok(m.html.includes("hello@poskoo.com"), `${name}: footer`);
    assert.ok(m.text.length > 40 && !/<[a-z]/i.test(m.text), `${name}: plain text without tags`);
  }
});

test("password reset shows the code big, the reset button URL and the didn't-request note", () => {
  const m = passwordResetEmail({ name: "Jane Doe", code: "305718", link: "https://poskoo.com/reset-password?token=abc" });
  assert.ok(m.html.includes(">305718</div>"));
  assert.ok(m.html.includes('href="https://poskoo.com/reset-password?token=abc"'));
  assert.ok(m.html.includes("Reset password"));
  assert.ok(m.html.includes("Didn’t request this?"));
  assert.ok(m.text.includes("305718"));
  assert.ok(m.text.includes("https://poskoo.com/reset-password?token=abc"));
  assert.ok(m.text.includes("15 minutes"));
  assert.ok(!m.subject.includes("305718"));
  assert.ok(m.text.startsWith("Hi Jane,"));
});

test("verify email contains code + magic link in both parts", () => {
  const m = verifyEmail({ code: "000123", link: "https://poskoo.com/verify-email?token=t" });
  assert.ok(m.text.includes("000123"));
  assert.ok(m.html.includes("https://poskoo.com/verify-email?token=t"));
  assert.ok(m.text.includes("https://poskoo.com/verify-email?token=t"));
});

test("welcome CTA opens the dashboard and lists 3 steps", () => {
  const m = welcomeEmail({ name: null });
  assert.ok(m.html.includes("Open your dashboard"));
  assert.match(m.html, /href="https?:\/\/[^"]+\/app"/);
  assert.ok(/1\. Connect/.test(m.text) && /2\. Schedule/.test(m.text) && /3\. Create/.test(m.text));
});

test("user-supplied values are HTML-escaped", () => {
  const m = newOrderEmail({ name: "<b>x</b>", buyerEmail: "a@b.co", product: '<img src=x onerror="alert(1)">', amountCents: 1900, feeCents: 57, currency: "usd" });
  assert.ok(!m.html.includes('<img src=x onerror="alert(1)">'));
  assert.ok(m.html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert.ok(m.html.includes("$19.00") && m.html.includes("$0.57"));
});

test("receipt links to the access URL", () => {
  const m = buyerReceiptEmail({ product: "Guide", amountCents: 500, currency: "eur", accessUrl: "https://poskoo.com/p/guide/success?session_id=cs_test_1", delivery: "file" });
  assert.ok(m.html.includes("https://poskoo.com/p/guide/success?session_id=cs_test_1"));
  assert.ok(m.html.includes("Download Guide"));
  assert.equal(formatMoney(500, "eur"), "€5.00");
});

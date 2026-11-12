import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ORDER_REF_RE,
  newOrderRef,
  nextUpiStatus,
  normalizeBuyerName,
  normalizeEmail,
  normalizeRejectReason,
  normalizeUtr,
  normalizeVpa,
  payoutRoute,
  upiAmount,
  upiDeepLink,
  upiNote,
} from "./upi.ts";

test("country routing: India -> UPI, Stripe countries -> Stripe, others -> unsupported", () => {
  assert.equal(payoutRoute("IN"), "upi");
  assert.equal(payoutRoute("in"), "upi");
  assert.equal(payoutRoute("US"), "stripe");
  assert.equal(payoutRoute("SG"), "stripe");
  assert.equal(payoutRoute("BR"), "unsupported");
  assert.equal(payoutRoute("OTHER"), "unsupported");
  assert.equal(payoutRoute(null), "unsupported");
});

test("VPA validation", () => {
  assert.equal(normalizeVpa(" priya@okhdfcbank "), "priya@okhdfcbank");
  assert.equal(normalizeVpa("98765.43210@ybl"), "98765.43210@ybl");
  assert.equal(normalizeVpa("a_b-c@paytm"), "a_b-c@paytm");
  assert.equal(normalizeVpa("a@b"), "a@b");
  for (const bad of ["", "ab", "priya", "@ybl", "priya@", "pri ya@ybl", "a@b@c", "priya@9bank", ".priya@ybl", "priya.@ybl", "priya@ybl.", "pri<ya@ybl", `${"a".repeat(253)}@ybl`]) {
    assert.equal(normalizeVpa(bad), null, bad);
  }
  assert.equal(normalizeVpa(`${"a".repeat(252)}@ybl`)?.length, 256);
});

test("UTR validation: exactly 12 digits, spaces ignored", () => {
  assert.equal(normalizeUtr("412345678901"), "412345678901");
  assert.equal(normalizeUtr(" 4123 4567 8901 "), "412345678901");
  for (const bad of ["", "41234567890", "4123456789012", "41234567890a", "UTR412345678901"]) assert.equal(normalizeUtr(bad), null, bad);
});

test("amount: paise -> rupees with 2 decimals", () => {
  assert.equal(upiAmount(49900), "499.00");
  assert.equal(upiAmount(50), "0.50");
  assert.equal(upiAmount(123405), "1234.05");
  assert.equal(upiAmount(-5), "0.00");
});

test("deep link encodes every value", () => {
  const link = upiDeepLink({ vpa: "priya@okhdfcbank", payeeName: "Priya & Co", amountPaise: 49900, note: upiNote("PKABCDEFGH", "Reels Guide #1") });
  assert.equal(link, "upi://pay?pa=priya%40okhdfcbank&pn=Priya%20%26%20Co&am=499.00&cu=INR&tn=PKABCDEFGH%20Reels%20Guide%20%231");
  const parsed = new URL(link.replace("upi://", "https://x/"));
  assert.equal(parsed.searchParams.get("pa"), "priya@okhdfcbank");
  assert.equal(parsed.searchParams.get("pn"), "Priya & Co");
  assert.equal(parsed.searchParams.get("cu"), "INR");
});

test("note keeps the order ref and is at most 50 chars, single line", () => {
  const note = upiNote("PKABCDEFGH", "A\nvery long product title that goes on and on and on forever");
  assert.ok(note.startsWith("PKABCDEFGH A very"));
  assert.ok(note.length <= 50);
  assert.ok(!/\n/.test(note));
});

test("order ref format", () => {
  const ref = newOrderRef(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 255]));
  assert.match(ref, ORDER_REF_RE);
  assert.equal(ref.length, 10);
  assert.doesNotMatch("PKABCDEFG0", ORDER_REF_RE);
});

test("status transitions: only awaiting_confirmation can be decided", () => {
  assert.equal(nextUpiStatus("awaiting_confirmation", "confirm"), "paid");
  assert.equal(nextUpiStatus("awaiting_confirmation", "reject"), "rejected");
  for (const s of ["paid", "rejected", "pending", "refunded"]) {
    assert.equal(nextUpiStatus(s, "confirm"), null);
    assert.equal(nextUpiStatus(s, "reject"), null);
  }
});

test("buyer fields", () => {
  assert.equal(normalizeEmail(" Buyer@Example.com "), "buyer@example.com");
  assert.equal(normalizeEmail("nope"), null);
  assert.equal(normalizeBuyerName("  Ravi   Kumar "), "Ravi Kumar");
  assert.equal(normalizeBuyerName("   "), null);
  assert.equal(normalizeRejectReason("no"), null);
  assert.equal(normalizeRejectReason("No payment received for this UTR"), "No payment received for this UTR");
});

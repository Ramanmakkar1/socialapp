// Direct UPI payments for sellers in India: pure helpers (no DB, no Next imports; unit tested,
// safe in client components). The buyer pays the seller's own UPI ID from a UPI app; Poskoo
// never holds the money and takes no per-sale fee. The order then waits for the seller to
// confirm the UPI transaction reference (UTR) before anything is delivered.

export const UPI_CURRENCY = "inr" as const;
export const UPI_COUNTRY = "IN" as const;

/** Countries where Stripe Connect onboarding is offered (mirrors stripeConnect.CONNECT_COUNTRIES). */
export const STRIPE_COUNTRY_CODES = ["US", "CA", "GB", "AU", "NZ", "IE", "DE", "FR", "NL", "ES", "IT", "SG"] as const;

export type PayoutRoute = "upi" | "stripe" | "unsupported";

/** India -> Direct UPI; Stripe-supported -> Stripe Connect; anything else -> not supported yet. */
export function payoutRoute(country: string | null | undefined): PayoutRoute {
  const c = (country ?? "").trim().toUpperCase();
  if (c === UPI_COUNTRY) return "upi";
  if ((STRIPE_COUNTRY_CODES as readonly string[]).includes(c)) return "stripe";
  return "unsupported";
}

/**
 * UPI ID (VPA) like "name@bank" / "98765.43210@okicici". 3-256 chars, one "@", a handle of
 * letters/digits/._- and a PSP part of letters/digits/.-. Returns the trimmed VPA or null.
 */
export function normalizeVpa(input: string): string | null {
  const v = input.trim();
  if (v.length < 3 || v.length > 256) return null;
  const m = v.match(/^([A-Za-z0-9._-]+)@([A-Za-z][A-Za-z0-9.-]*)$/);
  if (!m) return null;
  if (/^[.-]|[.-]$/.test(m[1]) || /[.-]$/.test(m[2])) return null;
  return v;
}

/** UPI transaction reference (UTR / RRN): exactly 12 digits (spaces ignored). Null otherwise. */
export function normalizeUtr(input: string): string | null {
  const v = input.replace(/\s+/g, "");
  return /^\d{12}$/.test(v) ? v : null;
}

/** Order reference shown to the buyer and put in the UPI note: "PK" + 8 of [A-Z2-9] (no 0/O/1/I). */
export const ORDER_REF_RE = /^PK[A-HJ-NP-Z2-9]{8}$/;

export function newOrderRef(randomBytes: Uint8Array): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "PK";
  for (let i = 0; i < 8; i++) s += alphabet[(randomBytes[i] ?? 0) % alphabet.length];
  return s;
}

/** Paise -> "499.00" (UPI `am` is rupees with 2 decimals; integer math, no floats). */
export function upiAmount(paise: number): string {
  const p = Math.max(0, Math.floor(paise));
  return `${Math.floor(p / 100)}.${String(p % 100).padStart(2, "0")}`;
}

/** Payee name / note for a UPI link: printable, single line, trimmed to `max`. */
function clean(s: string, max: number): string {
  return s.replace(/\p{Cc}+/gu, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * `upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<note>` with every value URL-encoded
 * (encodeURIComponent, so spaces are %20, which all UPI apps accept).
 */
export function upiDeepLink(d: { vpa: string; payeeName: string; amountPaise: number; note: string }): string {
  const params: [string, string][] = [
    ["pa", d.vpa.trim()],
    ["pn", clean(d.payeeName, 80)],
    ["am", upiAmount(d.amountPaise)],
    ["cu", "INR"],
    ["tn", clean(d.note, 50)],
  ];
  return `upi://pay?${params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")}`;
}

/** Short UPI note: "PK7XQ2M9AB Reels Guide" (order ref first so it survives truncation). */
export function upiNote(orderRef: string, productTitle: string): string {
  return clean(`${orderRef} ${productTitle}`, 50);
}

export type UpiOrderStatus = "awaiting_confirmation" | "paid" | "rejected";
export type UpiDecision = "confirm" | "reject";

/** Only an order awaiting confirmation can be decided; confirm -> paid, reject -> rejected. */
export function nextUpiStatus(current: string, decision: UpiDecision): UpiOrderStatus | null {
  if (current !== "awaiting_confirmation") return null;
  return decision === "confirm" ? "paid" : "rejected";
}

/** Seller's reason for rejecting (shown to the buyer): 3-300 printable chars, or null. */
export function normalizeRejectReason(input: string): string | null {
  const v = clean(input, 300);
  return v.length >= 3 ? v : null;
}

/** Buyer name: 1-80 printable chars, or null. */
export function normalizeBuyerName(input: string): string | null {
  const v = clean(input, 80);
  return v.length >= 1 ? v : null;
}

/** Plain e-mail check for buyer addresses (same spirit as the rest of the app's forms). */
export function normalizeEmail(input: string): string | null {
  const v = input.trim().toLowerCase();
  return v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? v : null;
}

/** Optional seller support contact (phone, e-mail or handle): 0-120 printable chars. */
export function normalizeSupportContact(input: string): string {
  return clean(input, 120);
}

export function normalizePayeeName(input: string): string | null {
  const v = clean(input, 80);
  return v.length >= 1 ? v : null;
}

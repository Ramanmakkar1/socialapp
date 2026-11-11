// Pure money helpers for creator product sales (no Stripe import, safe in client components).

/** Platform fee in basis points (300 = 3%). Override with PLATFORM_FEE_BPS. */
export const DEFAULT_PLATFORM_FEE_BPS = 300;

export function platformFeeBps(raw: string | undefined = process.env.PLATFORM_FEE_BPS): number {
  if (raw === undefined || raw.trim() === "") return DEFAULT_PLATFORM_FEE_BPS;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= 10_000 ? n : DEFAULT_PLATFORM_FEE_BPS;
}

/** Application fee in minor units: amount x bps / 10,000, rounded half up, never above the amount. */
export function platformFeeCents(amountCents: number, bps: number = platformFeeBps()): number {
  if (!Number.isFinite(amountCents) || amountCents <= 0) return 0;
  const fee = Math.round((Math.floor(amountCents) * bps) / 10_000);
  return Math.min(Math.max(fee, 0), Math.floor(amountCents));
}

/** Two-decimal currencies only, so cents math is the same everywhere. */
export const SUPPORTED_CURRENCIES = ["usd", "cad", "eur", "gbp", "aud", "nzd"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(value: string): value is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

/** "19.99" / "19" / "19.9" -> 1999 / 1900 / 1990. Null for anything else (no floats involved). */
export function parsePriceToCents(input: string): number | null {
  const m = input.trim().replace(/,/g, "").match(/^(\d{1,7})(?:\.(\d{1,2}))?$/);
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}


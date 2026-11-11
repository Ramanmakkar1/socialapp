// Stripe Connect for creators. Server only.
//
// Each creator gets one connected account created with the Accounts v2 API (Stripe's current
// Connect API), set up for Stripe Managed Risk + DIRECT charges: the creator is the merchant
// of record, Stripe collects its processing fees from the creator (fees_collector "stripe") and
// carries negative-balance losses (losses_collector "stripe"); Poskoo only takes an application
// fee. Merchant configuration with card_payments requested; dashboard "express" (Stripe-hosted
// Express Dashboard). Express + Managed Risk is a Stripe public preview, so account CREATION
// is sent with the preview API version (ACCOUNT_CREATE_API_VERSION) - every other call uses the
// SDK default. Onboarding uses Stripe-hosted Account Links.
//
// Stored state (stripe_accounts): charges_enabled = merchant card_payments capability active
// (the account can take direct charges), payouts_enabled = merchant stripe_balance.payouts active.
// It is refreshed when the creator returns from onboarding and whenever Settings or Products
// is opened while the account is not fully enabled yet.
import type Stripe from "stripe";
import { query } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { getStripe } from "@/lib/payments";

export type ConnectedAccount = {
  stripe_account_id: string;
  country: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  updated_at: Date;
};

/** Countries offered in the Settings form; Stripe's onboarding confirms support. */
export const CONNECT_COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "SG", name: "Singapore" },
];

/**
 * Stripe API version for v2 account creation only. Express Dashboard + Stripe as losses
 * collector is in public preview and needs the current preview version
 * (docs.stripe.com/connect/risk-management/connected-accounts-with-managed-risk). Without it
 * Stripe answers "This account configuration is not supported". Override with
 * STRIPE_CONNECT_PREVIEW_API_VERSION when Stripe publishes a newer preview string.
 */
export const ACCOUNT_CREATE_API_VERSION = process.env.STRIPE_CONNECT_PREVIEW_API_VERSION?.trim() || "2026-10-28.preview";

type Capability = { status?: string } | null | undefined;

/** Minimal shape of a v2 Account we read (structural, so tests can pass plain objects). */
export type V2AccountLike = {
  configuration?: {
    merchant?: {
      capabilities?: {
        card_payments?: Capability;
        stripe_balance?: { payouts?: Capability } | null;
      } | null;
    } | null;
  } | null;
  requirements?: { entries?: unknown[] | null } | null;
};

/** v2 merchant capability status -> the booleans we store. */
export function accountStatusFromV2(account: V2AccountLike): { charges_enabled: boolean; payouts_enabled: boolean; details_submitted: boolean } {
  const caps = account.configuration?.merchant?.capabilities;
  const cards = caps?.card_payments?.status === "active";
  const payouts = caps?.stripe_balance?.payouts?.status === "active";
  const outstanding = account.requirements?.entries?.length ?? 0;
  return { charges_enabled: cards, payouts_enabled: payouts, details_submitted: cards || outstanding === 0 };
}

/** v2 account create params (pure, unit tested): Managed Risk + direct charges. */
export function accountCreateParams(user: { id: string; email: string; name: string | null }, country: string): Stripe.V2.Core.AccountCreateParams {
  return {
    contact_email: user.email,
    display_name: user.name || user.email,
    dashboard: "express",
    identity: { country: country.toLowerCase() },
    defaults: { responsibilities: { fees_collector: "stripe", losses_collector: "stripe" } },
    configuration: { merchant: { capabilities: { card_payments: { requested: true } } } },
    include: ["configuration.merchant", "requirements"],
    metadata: { poskoo_user_id: user.id },
  };
}

export async function getConnectedAccount(userId: string): Promise<ConnectedAccount | null> {
  const rows = await query<ConnectedAccount>(
    "select stripe_account_id, country, charges_enabled, payouts_enabled, details_submitted, updated_at from socialapp.stripe_accounts where user_id=$1",
    [userId],
  );
  return rows[0] ?? null;
}

/** Creates the connected account on first use (idempotent per user). */
export async function ensureConnectedAccount(user: { id: string; email: string; name: string | null }, country: string): Promise<string> {
  const existing = await getConnectedAccount(user.id);
  if (existing) return existing.stripe_account_id;
  const account = await getStripe().v2.core.accounts.create(accountCreateParams(user, country), {
    apiVersion: ACCOUNT_CREATE_API_VERSION,
    // Two quick clicks must not create two accounts, but a later retry (e.g. after a failed
    // onboarding or a platform/sandbox change) must not replay a stale cached account.
    idempotencyKey: `poskoo-connect-${user.id}-${country.toUpperCase()}-${Math.floor(Date.now() / 60_000)}`,
  });
  const inserted = await query<{ stripe_account_id: string }>(
    `insert into socialapp.stripe_accounts (user_id, stripe_account_id, country) values ($1,$2,$3)
     on conflict (user_id) do update set updated_at = socialapp.stripe_accounts.updated_at
     returning stripe_account_id`,
    [user.id, account.id, country.toUpperCase()],
  );
  return inserted[0]?.stripe_account_id ?? account.id;
}

/** Stripe-hosted onboarding (or update) link for the creator's account. */
export async function onboardingLink(accountId: string, kind: "account_onboarding" | "account_update" = "account_onboarding"): Promise<string> {
  const refresh_url = `${BRAND.url}/app/settings/payments/connect`;
  const return_url = `${BRAND.url}/app/settings/payments/return`;
  const link = await getStripe().v2.core.accountLinks.create({
    account: accountId,
    use_case:
      kind === "account_onboarding"
        ? { type: "account_onboarding", account_onboarding: { refresh_url, return_url } }
        : { type: "account_update", account_update: { refresh_url, return_url } },
  });
  return link.url;
}

/** Re-reads the account from Stripe and stores the capability state. */
export async function refreshConnectedAccount(userId: string): Promise<ConnectedAccount | null> {
  const existing = await getConnectedAccount(userId);
  if (!existing) return null;
  const account = await getStripe().v2.core.accounts.retrieve(existing.stripe_account_id, {
    include: ["configuration.merchant", "requirements"],
  });
  const status = accountStatusFromV2(account);
  const rows = await query<ConnectedAccount>(
    `update socialapp.stripe_accounts set charges_enabled=$2, payouts_enabled=$3, details_submitted=$4, updated_at=now()
     where user_id=$1
     returning stripe_account_id, country, charges_enabled, payouts_enabled, details_submitted, updated_at`,
    [userId, status.charges_enabled, status.payouts_enabled, status.details_submitted],
  );
  return rows[0] ?? null;
}

/** Account state for pages: refreshes from Stripe (at most once a minute) until fully enabled. Never throws. */
export async function connectedAccountForPage(userId: string): Promise<ConnectedAccount | null> {
  try {
    const acct = await getConnectedAccount(userId);
    if (!acct || (acct.charges_enabled && acct.payouts_enabled)) return acct;
    if (Date.now() - new Date(acct.updated_at).getTime() < 60_000) return acct;
    return (await refreshConnectedAccount(userId)) ?? acct;
  } catch (err) {
    console.error("connected account status unavailable for user", userId, err instanceof Error ? err.message : err);
    try {
      return await getConnectedAccount(userId);
    } catch {
      return null;
    }
  }
}

/** Express Dashboard login link (payments, payouts, disputes, risk interventions). */
export async function expressDashboardLink(accountId: string): Promise<string> {
  const link = await getStripe().accounts.createLoginLink(accountId);
  return link.url;
}

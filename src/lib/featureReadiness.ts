// Feature readiness: ONE place that decides, from environment configuration at RUNTIME, which
// features are switched on for real users and which show an honest "Not switched on yet" state instead
// of a flow that would break (or quietly run in Stripe test mode, or "send" an e-mail nobody gets).
//
// Pure helpers (pass an env object; tests use plain objects). Server code calls them with
// process.env and hands the result to client components as props. Never import this into a
// client component for its logic: the browser has no server env, so everything would read "soon".
//
// Same idea as the channel map in src/lib/channelStatus.ts (TikTok / Pinterest / X / GBP /
// LinkedIn Pages), and the result uses the same ChannelStatus shape (pill / title / body), so the
// dashboard shows features and channels with one pattern.
//
// Rules:
//   - `hard` requirements: without them the feature cannot work at all (never ready, even forced).
//   - `launch` requirements: what production needs before real users get it (live Stripe keys,
//     webhook secrets, the owner's go-ahead). Missing = "Not switched on yet" (the safe default).
//   - FEATURE_FORCE_READY=billing,email (or "all") skips the launch requirements, for testing
//     (e.g. a Stripe test-mode checkout locally). FEATURE_FORCE_SOON=... (or "all") turns features
//     off whatever is configured; it wins over FORCE_READY.
//   - `missing` only ever names env vars / conditions, never their values.
import type { ChannelStatus } from "@/lib/channelStatus";

export type FeatureId = "billing" | "card_payments" | "email" | "ai" | "ai_replies";
export const FEATURE_IDS: readonly FeatureId[] = ["billing", "card_payments", "email", "ai", "ai_replies"];

export type Env = Record<string, string | undefined>;

export type FeatureReadiness = {
  id: FeatureId;
  ready: boolean;
  /** "forced_ready" / "forced_soon" when an override decided it. */
  source: "config" | "forced_ready" | "forced_soon";
  /** What is still needed (env var names or plain conditions). Empty when ready by config. */
  missing: string[];
};

export type StripeMode = "live" | "test" | "none";

/** sk_live_ / rk_live_ = live; sk_test_ / rk_test_ = test; anything else (or unset) = none. */
export function stripeMode(key: string | undefined): StripeMode {
  const k = (key ?? "").trim();
  if (/^(sk|rk)_live_/.test(k)) return "live";
  if (/^(sk|rk)_test_/.test(k)) return "test";
  return "none";
}

const has = (env: Env, name: string) => Boolean(env[name]?.trim());
const on = (env: Env, name: string) => ["1", "true", "yes", "on"].includes((env[name] ?? "").trim().toLowerCase());

type Check = { label: string; ok: (env: Env) => boolean };
const set = (name: string): Check => ({ label: name, ok: (env) => has(env, name) });
const flag = (name: string): Check => ({ label: `${name}=1`, ok: (env) => on(env, name) });
const liveStripe: Check = { label: "STRIPE_SECRET_KEY must be a live key (sk_live_ / rk_live_)", ok: (env) => stripeMode(env.STRIPE_SECRET_KEY) === "live" };

export const FEATURE_RULES: Record<FeatureId, { hard: Check[]; launch: Check[] }> = {
  // Pro / Agency subscriptions (src/lib/billing.ts). Prices are found by lookup_key in Stripe, so
  // the owner confirms scripts/stripe-setup-billing.mjs ran on the LIVE account with the flag.
  billing: {
    hard: [set("STRIPE_SECRET_KEY"), set("DATABASE_URL")],
    launch: [liveStripe, set("STRIPE_BILLING_WEBHOOK_SECRET"), flag("STRIPE_BILLING_LIVE_PRICES")],
  },
  // Creator product checkout by card (Stripe Connect, src/lib/stripeConnect.ts, orders.ts).
  // Direct UPI (India) never needs Stripe and is not gated by this.
  card_payments: {
    hard: [set("STRIPE_SECRET_KEY"), set("DATABASE_URL")],
    launch: [liveStripe, set("STRIPE_WEBHOOK_SECRET")],
  },
  // Transactional e-mail (src/lib/email.ts): without SMTP nothing is delivered (only logged).
  email: { hard: [set("SMTP_HOST")], launch: [] },
  // AI caption / DM message ideas (src/lib/ai.ts).
  ai: { hard: [set("ANTHROPIC_API_KEY")], launch: [] },
  // AI replies to incoming DMs (src/lib/aiReplyQueue.ts): on hold until the owner switches them on.
  ai_replies: { hard: [set("ANTHROPIC_API_KEY")], launch: [flag("AI_REPLIES_ENABLED")] },
};

function listed(env: Env, name: string, id: FeatureId): boolean {
  const items = (env[name] ?? "").split(/[\s,]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  return items.includes("all") || items.includes(id);
}

export function featureReadiness(id: FeatureId, env: Env): FeatureReadiness {
  const rule = FEATURE_RULES[id];
  const hardMissing = rule.hard.filter((c) => !c.ok(env)).map((c) => c.label);
  const launchMissing = rule.launch.filter((c) => !c.ok(env)).map((c) => c.label);
  const missing = [...hardMissing, ...launchMissing];
  if (listed(env, "FEATURE_FORCE_SOON", id)) return { id, ready: false, source: "forced_soon", missing };
  if (hardMissing.length === 0 && launchMissing.length > 0 && listed(env, "FEATURE_FORCE_READY", id)) {
    return { id, ready: true, source: "forced_ready", missing: launchMissing };
  }
  return { id, ready: missing.length === 0, source: "config", missing };
}

export function allFeatureReadiness(env: Env): Record<FeatureId, FeatureReadiness> {
  const out = {} as Record<FeatureId, FeatureReadiness>;
  for (const id of FEATURE_IDS) out[id] = featureReadiness(id, env);
  return out;
}

/** Server-side shortcut: is this feature switched on for real users right now? */
export function isFeatureReady(id: FeatureId, env: Env = process.env): boolean {
  return featureReadiness(id, env).ready;
}

// ---- What users see while a feature is not ready -------------------------------------------------

export const FEATURE_COPY: Record<FeatureId, { title: string; body: string }> = {
  billing: {
    title: "Paid plans are launching soon",
    body: "Pro and Agency aren't on sale yet. Everything on the Free plan works today, and you'll never be charged without choosing a plan first.",
  },
  card_payments: {
    title: "Card payments aren't switched on yet",
    body: "Selling by card through Stripe isn't switched on yet. You can already create products; buy links start taking card payments once it is. In India, Direct UPI works today.",
  },
  email: {
    title: "E-mail sending isn't switched on yet",
    body: "Poskoo can't send e-mails yet (sign-in codes, reminders, receipts). Everything else keeps working.",
  },
  ai: {
    title: "AI ideas aren't switched on yet",
    body: "AI caption ideas, per-network rewrites, campaign drafts and DM message ideas aren't switched on yet. You can still write and schedule everything yourself.",
  },
  ai_replies: {
    title: "AI DM replies aren't switched on yet",
    body: "Automatic AI replies to your DMs are on hold while we finish them. Your saved instructions stay, and nothing is sent by AI until this is switched on.",
  },
};

/** The ChannelStatus-shaped pill / title / body for a feature ("ready" has empty texts). */
export function featureStatus(id: FeatureId, env: Env): ChannelStatus {
  if (featureReadiness(id, env).ready) return { state: "ready", pill: "", title: "", body: "" };
  return { state: "soon", pill: "Not switched on yet", ...FEATURE_COPY[id] };
}

/** Reminder channels (Instagram personal, Facebook Group) work by e-mail: "soon" without a mailer. */
export function reminderChannelStatus(name: string, env: Env): ChannelStatus {
  if (featureReadiness("email", env).ready) return { state: "ready", pill: "", title: name, body: "" };
  return {
    state: "soon",
    pill: "Not switched on yet",
    title: `${name} reminders need e-mail sending switched on`,
    body: "Reminder channels e-mail you the caption and files at the scheduled time so you can post them yourself. Poskoo's e-mail sending isn't switched on yet, so you can't add these channels for now. Tap “Notify me” and we'll tell you when it is.",
  };
}

/** What the public pricing cards need (src/lib/plans.ts plansFor). */
export function planReadiness(env: Env = process.env): { paidPlans: boolean; ai: boolean } {
  return { paidPlans: featureReadiness("billing", env).ready, ai: featureReadiness("ai", env).ready };
}

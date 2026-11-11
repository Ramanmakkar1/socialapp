-- Poskoo's own subscription billing (Pro / Agency) on the PLATFORM Stripe account (2026-11-11).
-- Additive only. One row per user: the Stripe customer, plus the current (or last) subscription.
-- Written by the "Your account" webhook (/api/stripe/billing-webhook) and by the success-page /
-- billing-page sync (src/lib/billing.ts). Webhook idempotency reuses socialapp.stripe_events (035).
begin;

create table if not exists socialapp.billing_subscriptions (
  user_id uuid primary key references socialapp.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  plan text check (plan in ('Pro','Agency')),
  billing_interval text check (billing_interval in ('month','year')),
  -- Stripe subscription status, as Stripe reports it.
  status text check (status in ('active','trialing','past_due','canceled','incomplete','incomplete_expired','unpaid','paused')),
  price_lookup_key text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  -- Set when the subscription will end on a date (portal "cancel" may set cancel_at instead of cancel_at_period_end).
  cancel_at timestamptz,
  -- First time we saw status past_due in the current failure streak: paid limits stay for 7 days after this.
  past_due_since timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

commit;

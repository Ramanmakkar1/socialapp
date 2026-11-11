-- Digital products sold through Stripe Connect (2026-11-11). Additive only.
-- Direct charges (Stripe Managed Risk): the Checkout Session is created ON the creator's
-- connected account (Stripe-Context header) with application_fee_amount = Poskoo's fee.
begin;

-- One connected Stripe account per Poskoo user (Accounts v2, Express dashboard, merchant configuration,
-- Stripe as fees + losses collector).
create table if not exists socialapp.stripe_accounts (
  user_id uuid primary key references socialapp.users(id) on delete cascade,
  stripe_account_id text not null unique,
  country text,
  -- charges_enabled: the account can take direct card charges (v2 merchant card_payments
  -- capability is active). payouts_enabled: merchant stripe_balance.payouts active.
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists socialapp.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,80}$'),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  price_cents integer not null check (price_cents >= 50 and price_cents <= 99999999),
  currency text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
  cover_url text,
  delivery_type text not null default 'link' check (delivery_type in ('file','link')),
  delivery_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_user_created_idx
  on socialapp.products (user_id, created_at desc);

-- An auto-DM rule can send a product's buy link (/p/<slug>).
alter table socialapp.dm_rules
  add column if not exists product_id uuid references socialapp.products(id) on delete set null;

create table if not exists socialapp.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  product_id uuid references socialapp.products(id) on delete set null,
  product_title text not null default '',
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_account_id text,
  buyer_email text,
  amount_cents integer not null default 0,
  fee_cents integer not null default 0,
  amount_refunded_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending'
    check (status in ('pending','paid','failed','refunded','partially_refunded','disputed','dispute_lost')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx on socialapp.orders (user_id, created_at desc);
create index if not exists orders_payment_intent_idx on socialapp.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- Webhook idempotency: an event id is processed once (inserted in the same transaction as its effects).
create table if not exists socialapp.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

commit;

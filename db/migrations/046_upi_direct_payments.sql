-- Direct UPI payments for sellers in India (2026-11-12). Additive only.
-- Stripe can't onboard India-based sellers from our platform, so a seller in India publishes
-- their own UPI ID (VPA). The buyer pays the seller directly from a UPI app (Poskoo never holds
-- the money and takes no per-sale fee), then submits the UPI transaction reference (UTR). The
-- order waits in 'awaiting_confirmation' until the seller confirms it (-> paid, delivery is sent)
-- or rejects it (-> rejected). Nothing is delivered before the seller confirms.
begin;

-- Where a seller is paid from. country decides the route: IN -> UPI, Stripe-supported -> Stripe
-- Connect (stripe_accounts), anything else -> not supported yet.
create table if not exists socialapp.seller_payouts (
  user_id uuid primary key references socialapp.users(id) on delete cascade,
  country text not null check (country ~ '^[A-Z]{2}$' or country = 'OTHER'),
  upi_vpa text check (upi_vpa is null or (char_length(upi_vpa) between 3 and 256 and upi_vpa ~ '^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$')),
  upi_payee_name text check (upi_payee_name is null or char_length(upi_payee_name) between 1 and 80),
  upi_support_contact text check (upi_support_contact is null or char_length(upi_support_contact) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders: UPI orders have no Checkout Session.
alter table socialapp.orders alter column stripe_checkout_session_id drop not null;

alter table socialapp.orders
  add column if not exists payment_method text not null default 'stripe' check (payment_method in ('stripe','upi')),
  add column if not exists buyer_name text,
  add column if not exists order_ref text,
  add column if not exists upi_utr text check (upi_utr is null or upi_utr ~ '^[0-9]{12}$'),
  add column if not exists upi_vpa text,
  -- Bearer secret in the buyer's status/access link (/p/<slug>/order/<id>?t=...).
  add column if not exists access_token text,
  add column if not exists reject_reason text,
  add column if not exists decided_at timestamptz;

alter table socialapp.orders drop constraint if exists orders_status_check;
alter table socialapp.orders add constraint orders_status_check check (status in (
  'pending','paid','failed','refunded','partially_refunded','disputed','dispute_lost','awaiting_confirmation','rejected'));

alter table socialapp.orders drop constraint if exists orders_method_fields_check;
alter table socialapp.orders add constraint orders_method_fields_check check (
  (payment_method = 'stripe' and stripe_checkout_session_id is not null)
  or (payment_method = 'upi' and upi_utr is not null and access_token is not null and order_ref is not null));

-- One UTR per seller, whatever happened to the earlier order (a rejected UTR can't be resubmitted).
create unique index if not exists orders_seller_utr_uidx on socialapp.orders (user_id, upi_utr) where upi_utr is not null;
create unique index if not exists orders_order_ref_uidx on socialapp.orders (order_ref) where order_ref is not null;
-- Sidebar badge / Orders page: pending confirmations per seller.
create index if not exists orders_awaiting_idx on socialapp.orders (user_id, created_at desc) where status = 'awaiting_confirmation';

commit;

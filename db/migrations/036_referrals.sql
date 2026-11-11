-- Refer and earn (2026-11-11). Additive only.
-- Reward: +500 automated DMs per UTC month for the referrer, per referred user who signs up
-- and connects a social account (qualifying event). One connected social account can qualify
-- at most one referral ever (unique index below), so re-connecting the same Instagram to new
-- sign-ups earns nothing.
begin;

create table if not exists socialapp.referral_codes (
  user_id uuid primary key references socialapp.users(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{6,16}$'),
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);

alter table socialapp.users
  add column if not exists referred_by_user_id uuid references socialapp.users(id) on delete set null;

create table if not exists socialapp.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references socialapp.users(id) on delete cascade,
  referred_user_id uuid not null unique references socialapp.users(id) on delete cascade,
  code text not null,
  first_touch_at timestamptz,
  created_at timestamptz not null default now(),
  qualified_at timestamptz,
  qualified_platform text,
  qualified_external_id text,
  bonus_dms integer not null default 0,
  check (referrer_user_id <> referred_user_id)
);

create index if not exists referrals_referrer_idx on socialapp.referrals (referrer_user_id, created_at desc);
create index if not exists referrals_pending_idx on socialapp.referrals (referred_user_id) where qualified_at is null;
create unique index if not exists referrals_qualified_account_once
  on socialapp.referrals (qualified_platform, qualified_external_id)
  where qualified_external_id is not null;

commit;

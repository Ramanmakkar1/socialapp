-- Transactional e-mail (2026-11-11). Additive only.
-- 1. email_codes: one-time 6-digit codes + magic-link tokens for password reset and e-mail
--    verification. Only hashes are stored; a code dies after 15 minutes, 5 wrong tries or one use.
-- 2. email_sends: "sent once" keys so webhook replays, retries and parallel cron runs never send
--    the same notification twice (new order, buyer receipt, post failed, referral bonus, welcome).
begin;

create table if not exists socialapp.email_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  purpose text not null check (purpose in ('reset', 'verify')),
  -- "<saltHex>$<sha256Hex>" of the 6-digit code.
  code_hash text not null,
  -- sha256 hex of the random magic-link token.
  token_hash text not null unique,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_codes_user_purpose_idx
  on socialapp.email_codes (user_id, purpose, created_at desc);

create table if not exists socialapp.email_sends (
  key text primary key,
  created_at timestamptz not null default now()
);

commit;

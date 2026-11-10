-- Daily follower snapshots per connected account, powering the account growth chart.
create table if not exists socialapp.account_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  account_id uuid not null references socialapp.social_accounts(id) on delete cascade,
  followers bigint not null default 0,
  taken_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (account_id, taken_at)
);
create index if not exists account_snapshots_user_taken_idx on socialapp.account_snapshots (user_id, taken_at);

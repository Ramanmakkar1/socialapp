begin;

create table if not exists socialapp.rewind_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  rule_id uuid references socialapp.dm_rules(id) on delete set null,
  scanned int not null default 0,
  queued int not null default 0,
  failures int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists rewind_runs_user_created_idx on socialapp.rewind_runs (user_id, created_at desc);

commit;

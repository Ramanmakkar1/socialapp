begin;

create table if not exists socialapp.dm_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  social_account_id uuid references socialapp.social_accounts(id) on delete set null,
  rule_id uuid references socialapp.dm_rules(id) on delete set null,
  contact_id uuid references socialapp.contacts(id) on delete set null,
  comment_id text not null,
  recipient_external_id text not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed','skipped')),
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (comment_id)
);

create index if not exists dm_queue_status_created_idx on socialapp.dm_queue (status, created_at);

commit;

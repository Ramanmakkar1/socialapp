begin;

create schema if not exists socialapp;

create table if not exists socialapp.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists socialapp.sessions (
  id text primary key,
  user_id uuid not null references socialapp.users(id) on delete cascade,
  expires_at timestamptz not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on socialapp.sessions (user_id);

create table if not exists socialapp.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  platform text not null check (platform in ('instagram','facebook','threads')),
  external_id text not null,
  username text,
  access_token_enc text,
  refresh_token_enc text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (platform, external_id)
);

create table if not exists socialapp.dm_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  social_account_id uuid references socialapp.social_accounts(id) on delete set null,
  name text not null,
  keywords text[] not null default '{}',
  match_type text not null default 'contains' check (match_type in ('contains','exact')),
  dm_text text not null,
  link_url text,
  email_gate boolean not null default false,
  follow_gate boolean not null default false,
  status text not null default 'active' check (status in ('active','paused')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists dm_rules_user_id_idx on socialapp.dm_rules (user_id);

create table if not exists socialapp.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  social_account_id uuid references socialapp.social_accounts(id) on delete set null,
  platform text not null default 'instagram',
  external_id text,
  username text,
  name text,
  email text,
  phone text,
  source_rule_id uuid references socialapp.dm_rules(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  unique (user_id, platform, external_id)
);

create index if not exists contacts_user_id_created_idx on socialapp.contacts (user_id, created_at desc);

create table if not exists socialapp.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  caption text not null default '',
  media jsonb not null default '[]',
  scheduled_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','publishing','published','failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists scheduled_posts_user_id_scheduled_idx on socialapp.scheduled_posts (user_id, scheduled_at);

create table if not exists socialapp.post_targets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references socialapp.scheduled_posts(id) on delete cascade,
  platform text not null check (platform in ('instagram','facebook','threads')),
  social_account_id uuid references socialapp.social_accounts(id) on delete set null,
  caption_override text,
  status text not null default 'pending',
  external_post_id text,
  error text,
  published_at timestamptz,
  unique (post_id, platform)
);

create table if not exists socialapp.events (
  id bigserial primary key,
  user_id uuid references socialapp.users(id) on delete set null,
  source text not null,
  type text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists events_source_received_idx on socialapp.events (source, received_at desc);

commit;

-- API keys for the Poskoo MCP server (let AI assistants schedule posts).
-- Keys are stored hashed (sha256); only a short prefix is shown in the UI.
create table if not exists socialapp.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  name text not null default 'MCP',
  key_hash text not null,
  key_prefix text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists api_keys_user_idx on socialapp.api_keys (user_id);
create index if not exists api_keys_hash_idx on socialapp.api_keys (key_hash);

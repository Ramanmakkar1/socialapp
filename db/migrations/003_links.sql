begin;

create table if not exists socialapp.short_links (
  code text primary key,
  user_id uuid not null references socialapp.users(id) on delete cascade,
  rule_id uuid references socialapp.dm_rules(id) on delete cascade,
  target_url text not null,
  clicks int not null default 0,
  created_at timestamptz not null default now(),
  unique (rule_id, target_url)
);

create table if not exists socialapp.link_clicks (
  id bigserial primary key,
  code text not null references socialapp.short_links(code) on delete cascade,
  clicked_at timestamptz not null default now()
);

create index if not exists link_clicks_code_clicked_idx on socialapp.link_clicks (code, clicked_at);

commit;

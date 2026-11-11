-- Lead magnets (2026-11-11): a free resource (file or link) an auto-DM rule hands out once
-- its email gate collects an email. Additive only. The DM pipeline tolerates these objects
-- being absent (the delivery record is best-effort), so this can land before or after the code.
begin;

create table if not exists socialapp.lead_magnets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  cover_url text,
  delivery_type text not null default 'link' check (delivery_type in ('file','link')),
  delivery_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lead_magnets_user_created_idx
  on socialapp.lead_magnets (user_id, created_at desc);

-- Which magnet an auto-DM rule delivers (null = none).
alter table socialapp.dm_rules
  add column if not exists lead_magnet_id uuid references socialapp.lead_magnets(id) on delete set null;

create index if not exists dm_rules_lead_magnet_idx
  on socialapp.dm_rules (lead_magnet_id) where lead_magnet_id is not null;

-- One row per lead per magnet: "who got which magnet". Contacts are also tagged
-- 'lead-magnet:<title>' so the Contacts page and its filters show it.
create table if not exists socialapp.lead_magnet_deliveries (
  id bigserial primary key,
  lead_magnet_id uuid not null references socialapp.lead_magnets(id) on delete cascade,
  user_id uuid not null references socialapp.users(id) on delete cascade,
  rule_id uuid references socialapp.dm_rules(id) on delete set null,
  contact_id uuid not null references socialapp.contacts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (lead_magnet_id, contact_id)
);

create index if not exists lead_magnet_deliveries_user_idx
  on socialapp.lead_magnet_deliveries (user_id, created_at desc);

commit;

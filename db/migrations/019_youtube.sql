-- YouTube channel connections + video scheduling.
-- gen_random_uuid() is built in (no pgcrypto extension needed, so this runs on any PG12+ server).
begin;

create table if not exists socialapp.youtube_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  channel_id text not null,
  title text not null default '',
  avatar_url text,
  refresh_token_enc text not null,
  status text not null default 'active' check (status in ('active','disconnected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, channel_id)
);

create index if not exists youtube_channels_user_idx on socialapp.youtube_channels (user_id);

-- Per-target YouTube video metadata (title, tags, privacy, shorts hint).
alter table socialapp.post_targets add column if not exists yt_metadata jsonb;

-- Add 'youtube' to the post_targets.platform check constraint (idempotent).
do $$
begin
  alter table socialapp.post_targets drop constraint if exists post_targets_platform_check;
exception when undefined_object then null;
end $$;

do $$
begin
  alter table socialapp.post_targets
    add constraint post_targets_platform_check
    check (platform in ('instagram','facebook','threads','youtube'));
exception when duplicate_object then null;
end $$;

commit;

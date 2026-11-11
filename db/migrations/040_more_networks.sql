-- More networks (2026-11-11): TikTok, Bluesky, Mastodon, LinkedIn, Pinterest, X.
-- Additive only: widens the platform checks and adds nullable columns / one new table.
-- The code reads the new columns only for the new networks, so old rows keep working.

-- social_accounts.platform: allow the new networks.
do $$
begin
  alter table socialapp.social_accounts drop constraint if exists social_accounts_platform_check;
exception when undefined_object then null;
end $$;
do $$
begin
  alter table socialapp.social_accounts
    add constraint social_accounts_platform_check
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x'));
exception when duplicate_object then null;
end $$;

-- post_targets.platform: same list plus youtube (YouTube channels live in youtube_channels).
do $$
begin
  alter table socialapp.post_targets drop constraint if exists post_targets_platform_check;
exception when undefined_object then null;
end $$;
do $$
begin
  alter table socialapp.post_targets
    add constraint post_targets_platform_check
    check (platform in ('instagram','facebook','threads','youtube','tiktok','bluesky','mastodon','linkedin','pinterest','x'));
exception when duplicate_object then null;
end $$;

-- posting_schedules.platform: the new networks can have a queue schedule too.
do $$
begin
  alter table socialapp.posting_schedules drop constraint if exists posting_schedules_platform_check;
exception when undefined_object then null;
end $$;
do $$
begin
  alter table socialapp.posting_schedules
    add constraint posting_schedules_platform_check
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x'));
exception when duplicate_object then null;
end $$;

-- Per-account extras for the new networks.
--   meta:       non-secret details (Mastodon instance + character limit, Bluesky service URL,
--               avatar URL, LinkedIn organizations, ...).
--   secret_enc: AES-GCM encrypted JSON of extra secrets (Bluesky app password). Wiped on disconnect.
--   refresh_expires_at: when the stored refresh token itself stops working (TikTok, Pinterest, X).
alter table socialapp.social_accounts add column if not exists meta jsonb not null default '{}'::jsonb;
alter table socialapp.social_accounts add column if not exists secret_enc text;
alter table socialapp.social_accounts add column if not exists refresh_expires_at timestamptz;

-- Per-target options chosen in the composer (TikTok privacy / interaction / disclosure settings,
-- Pinterest board + title + link, LinkedIn author, ...).
alter table socialapp.post_targets add column if not exists net_options jsonb;

-- Mastodon: one OAuth app per instance, registered on first connect via POST /api/v1/apps.
create table if not exists socialapp.mastodon_apps (
  instance text primary key,
  client_id text not null,
  client_secret_enc text not null,
  redirect_uri text not null,
  created_at timestamptz not null default now()
);

-- Reminder channels + channel interest (2026-11-12). Additive only.
--
-- 1. Reminder channels ("notification publishing"): Instagram personal accounts (ig_personal) and
--    Facebook Groups (fb_group) have no posting API. They are social_accounts rows without OAuth
--    (external_id = the @handle or the group), and their post_targets are not published: at the
--    scheduled time Poskoo e-mails the owner and the target waits in status 'reminded' until the
--    owner clicks "Mark as posted" (-> 'published') or 7 days pass (media_hold_until).
-- 2. channel_requests: "Notify me when it's ready" (kind = 'notify', one per user + channel) and
--    "Can't find it? Request a channel" (kind = 'request', free text).

do $$
begin
  alter table socialapp.social_accounts drop constraint if exists social_accounts_platform_check;
exception when undefined_object then null;
end $$;
do $$
begin
  alter table socialapp.social_accounts
    add constraint social_accounts_platform_check
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp','ig_personal','fb_group'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table socialapp.post_targets drop constraint if exists post_targets_platform_check;
exception when undefined_object then null;
end $$;
do $$
begin
  alter table socialapp.post_targets
    add constraint post_targets_platform_check
    check (platform in ('instagram','facebook','threads','youtube','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp','ig_personal','fb_group'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table socialapp.posting_schedules drop constraint if exists posting_schedules_platform_check;
exception when undefined_object then null;
end $$;
do $$
begin
  alter table socialapp.posting_schedules
    add constraint posting_schedules_platform_check
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp','ig_personal','fb_group'));
exception when duplicate_object then null;
end $$;

-- Reminder targets waiting for the owner (the 7-day expiry sweep reads these).
create index if not exists post_targets_reminded_idx on socialapp.post_targets (media_hold_until) where status = 'reminded';

create table if not exists socialapp.channel_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  kind text not null check (kind in ('notify', 'request')),
  -- notify: a channel id from the Connect dialog (tiktok, pinterest, x, gbp, linkedin_pages, ...).
  -- request: what the user typed ("Substack", "Reddit", ...).
  channel text not null check (char_length(channel) between 1 and 80),
  note text check (note is null or char_length(note) <= 500),
  -- Set when the user has been told the channel is ready (manual / future job).
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists channel_requests_notify_uniq on socialapp.channel_requests (user_id, channel) where kind = 'notify';
create index if not exists channel_requests_recent_idx on socialapp.channel_requests (created_at desc);

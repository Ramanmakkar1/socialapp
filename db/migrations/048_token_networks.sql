-- Token networks (2026-11-15). Additive only.
--
-- Networks connected with a bot token, webhook, API key, application password or self-hosted
-- server + token instead of a reviewed OAuth app (src/lib/networks/tokenNetworks.ts): Telegram,
-- Discord, Slack, Mattermost, Matrix, Misskey, Pixelfed, PeerTube, DEV, Hashnode, Ghost,
-- WordPress, Discourse and Listmonk. They are ordinary social_accounts rows (token in
-- access_token_enc, extra secrets in secret_enc, server address etc. in meta), so only the
-- platform check constraints change.

do $$
begin
  alter table socialapp.social_accounts drop constraint if exists social_accounts_platform_check;
exception when undefined_object then null;
end $$;
do $$
begin
  alter table socialapp.social_accounts
    add constraint social_accounts_platform_check
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp','ig_personal','fb_group',
      'telegram','discord','slack','mattermost','matrix','misskey','pixelfed','peertube','devto','hashnode','ghost','wordpress','discourse','listmonk'));
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
    check (platform in ('instagram','facebook','threads','youtube','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp','ig_personal','fb_group',
      'telegram','discord','slack','mattermost','matrix','misskey','pixelfed','peertube','devto','hashnode','ghost','wordpress','discourse','listmonk'));
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
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp','ig_personal','fb_group',
      'telegram','discord','slack','mattermost','matrix','misskey','pixelfed','peertube','devto','hashnode','ghost','wordpress','discourse','listmonk'));
exception when duplicate_object then null;
end $$;

-- More networks (2026-11-24), ported from Postiz (AGPL-3.0). Additive only: only the platform check
-- constraints change. Reddit, Dribbble, VK, Kick, Whop, MeWe and TikTok Business connect through an
-- OAuth app the owner registers (env-gated, src/lib/networks/moreApps.ts); Medium, Lemmy and Moltbook
-- connect with a token / API key (src/lib/networks/tokenNetworks.ts).

do $$
begin
  alter table socialapp.social_accounts drop constraint if exists social_accounts_platform_check;
exception when undefined_object then null;
end $$;
do $$
begin
  alter table socialapp.social_accounts
    add constraint social_accounts_platform_check
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp','ig_personal','fb_group','telegram','discord','slack','mattermost','matrix','misskey','pixelfed','peertube','devto','hashnode','ghost','wordpress','discourse','listmonk','nostr','tumblr','wpcom','plurk','twitch','farcaster',
      'reddit','medium','dribbble','lemmy','vk','kick','whop','mewe','moltbook','tiktok_business'));
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
    check (platform in ('instagram','facebook','threads','youtube','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp','ig_personal','fb_group','telegram','discord','slack','mattermost','matrix','misskey','pixelfed','peertube','devto','hashnode','ghost','wordpress','discourse','listmonk','nostr','tumblr','wpcom','plurk','twitch','farcaster',
      'reddit','medium','dribbble','lemmy','vk','kick','whop','mewe','moltbook','tiktok_business'));
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
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp','ig_personal','fb_group','telegram','discord','slack','mattermost','matrix','misskey','pixelfed','peertube','devto','hashnode','ghost','wordpress','discourse','listmonk','nostr','tumblr','wpcom','plurk','twitch','farcaster',
      'reddit','medium','dribbble','lemmy','vk','kick','whop','mewe','moltbook','tiktok_business'));
exception when duplicate_object then null;
end $$;

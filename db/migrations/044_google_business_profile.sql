-- Google Business Profile locations as channels (2026-11-11). Additive: widens the platform checks.
-- Each connected location is one social_accounts row (external_id = "locations/<id>",
-- meta.account = "accounts/<id>"), sharing the Google refresh token of the user who connected it.

do $$
begin
  alter table socialapp.social_accounts drop constraint if exists social_accounts_platform_check;
exception when undefined_object then null;
end $$;
do $$
begin
  alter table socialapp.social_accounts
    add constraint social_accounts_platform_check
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp'));
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
    check (platform in ('instagram','facebook','threads','youtube','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp'));
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
    check (platform in ('instagram','facebook','threads','tiktok','bluesky','mastodon','linkedin','pinterest','x','gbp'));
exception when duplicate_object then null;
end $$;

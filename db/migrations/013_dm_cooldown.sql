alter table socialapp.social_accounts
  add column if not exists dm_cooldown_until timestamptz;

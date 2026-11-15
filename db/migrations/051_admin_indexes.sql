-- Indexes for the admin pages (/admin/users, /admin/posts, /admin/billing). Additive only; the
-- pages work without them (just slower on big tables), so this can run before or after the deploy.
begin;

-- Per-user channel counts and the user search (social_accounts had no user_id index).
create index if not exists social_accounts_user_id_idx on socialapp.social_accounts (user_id);

commit;

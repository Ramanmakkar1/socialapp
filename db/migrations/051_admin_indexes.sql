-- Indexes for the admin pages (/admin/users, /admin/posts, /admin/billing). Additive only; the
-- pages work without them (just slower on big tables), so this can run before or after the deploy.
begin;

-- Per-user channel counts and the user search (social_accounts had no user_id index).
create index if not exists social_accounts_user_id_idx on socialapp.social_accounts (user_id);

-- /admin/posts lists all users' posts newest activity first.
create index if not exists scheduled_posts_updated_idx on socialapp.scheduled_posts (updated_at desc);

-- /admin/billing shows the newest Stripe webhook events.
create index if not exists stripe_events_received_idx on socialapp.stripe_events (received_at desc);

commit;

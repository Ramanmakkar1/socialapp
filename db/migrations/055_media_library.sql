-- Media library (2026-11-25). Every upload becomes a reusable asset of the WORKSPACE OWNER
-- (user_id = the owner, like every other table; uploaded_by_user_id = the real person).
-- Files still live on disk under <MEDIA_STORAGE_DIR>/<user_id>/; storage_key is "<user_id>/<uuid>.<ext>".
-- A live asset (deleted_at is null) keeps its file: publishing a post no longer deletes library files
-- (src/lib/mediaLifecycle.ts treats live asset keys as references). Deleting from the library is a
-- soft delete; the file goes once no unpublished post still uses it.

create table if not exists socialapp.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  storage_key text not null,
  original_name text not null default '',
  mime text not null,
  kind text not null check (kind in ('image', 'video')),
  bytes bigint not null default 0 check (bytes >= 0),
  width int,
  height int,
  duration_sec numeric(10, 2),
  alt_text text not null default '' check (char_length(alt_text) <= 1000),
  thumb_key text,
  uploaded_by_user_id uuid references socialapp.users(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists media_assets_storage_key_uidx on socialapp.media_assets (storage_key);
create index if not exists media_assets_user_live_idx on socialapp.media_assets (user_id, created_at desc) where deleted_at is null;

-- Prod runs the app as poskoo_app and migrations as postgres: hand the new table to the app role
-- (054 forgot this and the app got "permission denied"). Local databases may not have that role.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'poskoo_app') then
    alter table socialapp.media_assets owner to poskoo_app;
  end if;
end $$;

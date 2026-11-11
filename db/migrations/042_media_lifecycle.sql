-- Media lifecycle (2026-11-11). Additive only.
-- Uploaded files are deleted as soon as every target of their post has published
-- (src/lib/mediaLifecycle.ts). These two columns make that safe and cheap:
--   post_targets.media_hold_until: a network accepted the post but has not confirmed it yet
--     (TikTok still processing), so the file must stay until then.
--   scheduled_posts.media_released_at: the post's files were released (deleted or handed over);
--     the media JSON then carries `thumb` + `purged: true` for each uploaded item.
alter table socialapp.post_targets add column if not exists media_hold_until timestamptz;
alter table socialapp.scheduled_posts add column if not exists media_released_at timestamptz;

-- The release sweep looks only at published posts that still have files.
create index if not exists scheduled_posts_media_unreleased_idx
  on socialapp.scheduled_posts (updated_at)
  where status = 'published' and media_released_at is null;

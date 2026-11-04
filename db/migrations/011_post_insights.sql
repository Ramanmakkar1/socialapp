alter table socialapp.post_targets add column if not exists insights jsonb, add column if not exists insights_at timestamptz;

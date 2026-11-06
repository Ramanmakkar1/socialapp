begin;

-- One unlocked gated link per contact + automation (idempotent webhook handling).
-- Older duplicates (if any) are renamed, not deleted, so history stays visible.
update socialapp.dm_queue q set kind = 'gated_link_duplicate'
where q.id in (
  select id from (
    select id, row_number() over (partition by contact_id, rule_id order by created_at, id) as rn
    from socialapp.dm_queue
    where kind = 'gated_link' and contact_id is not null and rule_id is not null
  ) d where d.rn > 1
);
create unique index if not exists dm_queue_gated_link_once
  on socialapp.dm_queue (contact_id, rule_id) where kind = 'gated_link';

-- Lookups by contact + automation (gate prompts, nudges, follower re-checks).
create index if not exists dm_queue_contact_rule_idx on socialapp.dm_queue (contact_id, rule_id, kind);

-- Monthly auto-DM plan limit (sent per user per month).
create index if not exists dm_queue_user_sent_idx on socialapp.dm_queue (user_id, sent_at) where status = 'sent';

-- Publisher: due posts and stuck-claim recovery.
create index if not exists scheduled_posts_status_scheduled_idx on socialapp.scheduled_posts (status, scheduled_at);
create index if not exists post_targets_status_idx on socialapp.post_targets (status) where status in ('pending','publishing');

commit;

begin;

alter table socialapp.scheduled_posts add column if not exists dm_rule_id uuid references socialapp.dm_rules(id) on delete set null;

commit;

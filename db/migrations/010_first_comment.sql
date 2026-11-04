begin;
alter table socialapp.scheduled_posts add column if not exists first_comment text;
commit;

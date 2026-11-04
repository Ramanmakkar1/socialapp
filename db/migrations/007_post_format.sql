begin;

alter table socialapp.scheduled_posts add column if not exists ig_format text not null default 'feed' check (ig_format in ('feed','story'));

commit;

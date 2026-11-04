begin;

alter table socialapp.users add column if not exists brand_voice text;

commit;

begin;

alter table socialapp.dm_rules add column if not exists triggers text[] not null default '{comment}';

commit;

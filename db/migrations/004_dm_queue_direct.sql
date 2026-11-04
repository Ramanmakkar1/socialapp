begin;

alter table socialapp.dm_queue alter column comment_id drop not null;
alter table socialapp.dm_queue add column if not exists kind text not null default 'comment_reply';

commit;

begin;

alter table socialapp.dm_queue add column if not exists next_attempt_at timestamptz not null default now();

create index if not exists dm_queue_due_idx on socialapp.dm_queue (status, next_attempt_at);

commit;

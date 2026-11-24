begin;

-- 1. Multi-account targeting (src/lib/savePost.ts, src/lib/publisher.ts, src/lib/networks/publish.ts).
--    A post can now go to several accounts of the same network (e.g. two Instagram accounts), one
--    post_targets row per account. The old unique (post_id, platform) is replaced by a unique index
--    that includes the account. Old rows (social_account_id null, account_locked false) keep
--    publishing to the user's oldest active account, exactly as before.
--    YouTube channels live in socialapp.youtube_channels, so they get their own column.
alter table socialapp.post_targets
  add column if not exists youtube_channel_id uuid references socialapp.youtube_channels(id) on delete set null;
--    true = the user picked this exact account. If that account is later removed (FK sets the id
--    to null) the target fails with a clear message instead of silently posting somewhere else.
alter table socialapp.post_targets add column if not exists account_locked boolean not null default false;

do $$
declare c text;
begin
  for c in
    select con.conname from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    where ns.nspname = 'socialapp' and rel.relname = 'post_targets' and con.contype = 'u'
  loop
    execute format('alter table socialapp.post_targets drop constraint %I', c);
  end loop;
end $$;

create unique index if not exists post_targets_post_platform_account_uidx
  on socialapp.post_targets (post_id, platform, coalesce(social_account_id, youtube_channel_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- 2. Error categories + automatic retry (src/lib/publishErrors.ts, src/lib/publishRetry.ts).
--    error      = plain-English reason shown to the user (unchanged column)
--    error_kind = refresh_token | reconnect | bad_body | retry | rate_limit | ambiguous | unknown
--    error_raw  = the network's own message ("Message from the network" in the UI)
--    status 'retrying' + next_retry_at: a transient failure the worker retries by itself.
alter table socialapp.post_targets add column if not exists error_kind text;
alter table socialapp.post_targets add column if not exists error_raw text;
alter table socialapp.post_targets add column if not exists attempt_count int not null default 0;
alter table socialapp.post_targets add column if not exists next_retry_at timestamptz;
--    First comment (Instagram) failed after the post itself went live.
alter table socialapp.post_targets add column if not exists warning text;

create index if not exists post_targets_retrying_idx
  on socialapp.post_targets (next_retry_at) where status = 'retrying';

commit;

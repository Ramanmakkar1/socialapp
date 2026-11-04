begin;

-- Meta data-deletion callback requests. external_id_hash = sha256 of the Meta user id (we do not keep the raw id).
create table if not exists socialapp.data_deletion_requests (
  code text primary key,
  platform text not null default 'instagram',
  external_id_hash text not null,
  status text not null default 'received' check (status in ('received','completed','not_found')),
  accounts_deleted int not null default 0,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

-- App-scoped Instagram user id (the id Meta puts in signed_request), next to the professional account id.
alter table socialapp.social_accounts add column if not exists app_user_id text;
create index if not exists social_accounts_app_user_id_idx on socialapp.social_accounts (app_user_id);

commit;

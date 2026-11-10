-- Inbox state per comment: hidden from the inbox, marked done (answered), liked via the Graph API.
create table if not exists socialapp.comment_status (
  user_id uuid not null,
  social_account_id uuid not null,
  comment_id text not null,
  hidden boolean not null default false,
  done boolean not null default false,
  liked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

create index if not exists comment_status_user_idx
  on socialapp.comment_status (user_id);

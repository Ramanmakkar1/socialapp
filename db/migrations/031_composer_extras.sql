begin;

alter table socialapp.scheduled_posts add column if not exists tags text[] not null default '{}';
create index if not exists scheduled_posts_user_id_tags_idx on socialapp.scheduled_posts using gin (tags);

create table if not exists socialapp.post_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  name text not null,
  caption text not null default '',
  first_comment text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists post_templates_user_id_created_idx on socialapp.post_templates (user_id, created_at desc);

create table if not exists socialapp.hashtag_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  name text not null,
  hashtags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hashtag_groups_user_id_created_idx on socialapp.hashtag_groups (user_id, created_at desc);

commit;

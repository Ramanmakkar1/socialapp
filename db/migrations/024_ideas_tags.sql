begin;

-- Ideas board (2026-11-09): save post ideas, tag them, and turn one into a post.
-- Code tolerates these tables being absent (the board shows a load error instead of
-- breaking the calendar), so the migration can land before or after the code.
create table if not exists socialapp.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  text text not null default '',
  media jsonb not null default '[]',
  status text not null default 'unassigned'
    check (status in ('unassigned','todo','in_progress','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ideas_user_created_idx
  on socialapp.ideas (user_id, created_at desc);

create table if not exists socialapp.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists socialapp.idea_tags (
  idea_id uuid not null references socialapp.ideas(id) on delete cascade,
  tag_id uuid not null references socialapp.tags(id) on delete cascade,
  primary key (idea_id, tag_id)
);

create index if not exists idea_tags_tag_idx
  on socialapp.idea_tags (tag_id);

commit;

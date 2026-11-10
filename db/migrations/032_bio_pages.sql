begin;

-- Link-in-bio pages: one public page per user at /@handle.
create table if not exists socialapp.bio_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references socialapp.users(id) on delete cascade,
  handle text not null unique,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  theme text not null default 'sunrise',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists socialapp.bio_links (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references socialapp.bio_pages(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order int not null default 0,
  short_code text references socialapp.short_links(code) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists bio_links_page_idx on socialapp.bio_links (page_id, sort_order);

commit;

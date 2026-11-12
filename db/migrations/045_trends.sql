begin;

-- Trends (2026-11-12): Instagram accounts a user watches, read with Meta's Business Discovery API
-- through the user's own Instagram account connected via Facebook Login. Public business data only.

create table if not exists socialapp.trend_watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  -- Lowercase Instagram username without "@".
  username text not null check (username ~ '^[a-z0-9._]{1,30}$'),
  name text,
  profile_picture_url text,
  followers_count integer,
  media_count integer,
  -- Last successful Business Discovery read / last attempt (success or failure).
  fetched_at timestamptz,
  attempted_at timestamptz,
  -- null = ok; otherwise 'not_found' | 'rate_limited' | 'token' | 'permission' | 'error'.
  error_kind text,
  error_message text,
  created_at timestamptz not null default now(),
  unique (user_id, username)
);

create index if not exists trend_watches_user_idx on socialapp.trend_watches (user_id, created_at);

-- Latest numbers for each post of a watched account (upserted on every refresh).
create table if not exists socialapp.trend_media (
  watch_id uuid not null references socialapp.trend_watches(id) on delete cascade,
  media_id text not null,
  media_type text,
  media_product_type text,
  caption text,
  permalink text,
  thumbnail_url text,
  media_url text,
  posted_at timestamptz not null,
  -- null = hidden by the account (Instagram omits like_count when likes are hidden).
  like_count integer,
  comments_count integer not null default 0,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (watch_id, media_id)
);

create index if not exists trend_media_posted_idx on socialapp.trend_media (watch_id, posted_at desc);

-- One account-level snapshot per watched account per UTC day, for week-over-week follower change.
create table if not exists socialapp.trend_account_snapshots (
  watch_id uuid not null references socialapp.trend_watches(id) on delete cascade,
  day date not null,
  followers_count integer,
  media_count integer,
  primary key (watch_id, day)
);

commit;

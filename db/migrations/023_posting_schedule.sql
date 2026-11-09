begin;

-- Per-channel posting schedule (2026-11-09): days of week x times, in the user's timezone.
-- days: 1=Monday .. 7=Sunday. times: "HH:MM" wall-clock in `timezone`.
-- Code tolerates this table being absent (treated as "no schedule set"),
-- so the migration can land before or after the code.
create table if not exists socialapp.posting_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references socialapp.users(id) on delete cascade,
  platform text not null check (platform in ('instagram','facebook','threads')),
  timezone text not null default 'UTC',
  days int[] not null default '{}',
  times text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, platform)
);

-- Manual position in the publishing queue (drag reorder reassigns it and the times).
alter table socialapp.scheduled_posts add column if not exists queue_order int;

commit;

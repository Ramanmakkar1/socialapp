begin;

-- Per-user AI request log for the monthly AI quota (audit 2026-11-11): one row per user-started AI
-- action (caption ideas, DM message ideas). Counted per UTC month. The code allows AI actions (and
-- logs an error) while this table is missing, so the migration can run before or after the deploy.
create table if not exists socialapp.ai_requests (
  id bigserial primary key,
  user_id uuid not null references socialapp.users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_requests_user_month_idx on socialapp.ai_requests (user_id, created_at);

commit;

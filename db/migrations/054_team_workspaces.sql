-- Team workspaces + post approvals (2026-11-24). Additive only.
--
-- A workspace is an OWNER user's data: every existing table stays keyed by user_id (= the owner).
-- Members act inside the owner's workspace through sessions.active_owner_user_id, which the app
-- re-checks against workspace_members on every request (src/lib/workspace.ts).
-- Client workspaces (Agency plan) are login-less owner users created by an agency user
-- (users.created_by_user_id = the agency user); their plan is the creator's plan.

create table if not exists socialapp.workspace_members (
  owner_user_id uuid not null references socialapp.users(id) on delete cascade,
  member_user_id uuid not null references socialapp.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  publish_mode text not null default 'direct' check (publish_mode in ('direct', 'approval')),
  created_at timestamptz not null default now(),
  primary key (owner_user_id, member_user_id),
  check (owner_user_id <> member_user_id)
);
create index if not exists workspace_members_member_idx on socialapp.workspace_members (member_user_id);

create table if not exists socialapp.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references socialapp.users(id) on delete cascade,
  invited_by_user_id uuid references socialapp.users(id) on delete set null,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  publish_mode text not null default 'direct' check (publish_mode in ('direct', 'approval')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists workspace_invites_owner_idx on socialapp.workspace_invites (owner_user_id) where accepted_at is null;

-- Client workspaces: login-less owner users an agency creates.
alter table socialapp.users add column if not exists created_by_user_id uuid references socialapp.users(id) on delete cascade;
alter table socialapp.users add column if not exists workspace_name text;
create index if not exists users_created_by_idx on socialapp.users (created_by_user_id) where created_by_user_id is not null;

-- Which workspace a session is acting in (null = the user's own account).
alter table socialapp.sessions add column if not exists active_owner_user_id uuid references socialapp.users(id) on delete set null;

-- Approvals: a member in approval mode saves scheduled / queued posts as 'pending_approval'.
alter table socialapp.scheduled_posts drop constraint if exists scheduled_posts_status_check;
alter table socialapp.scheduled_posts add constraint scheduled_posts_status_check
  check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed', 'pending_approval'));
alter table socialapp.scheduled_posts add column if not exists requested_by_user_id uuid references socialapp.users(id) on delete set null;
alter table socialapp.scheduled_posts add column if not exists requested_mode text check (requested_mode in ('schedule', 'queue'));
alter table socialapp.scheduled_posts add column if not exists approval_note text;
alter table socialapp.scheduled_posts add column if not exists reviewed_by_user_id uuid references socialapp.users(id) on delete set null;
alter table socialapp.scheduled_posts add column if not exists reviewed_at timestamptz;
create index if not exists scheduled_posts_pending_idx on socialapp.scheduled_posts (user_id) where status = 'pending_approval';

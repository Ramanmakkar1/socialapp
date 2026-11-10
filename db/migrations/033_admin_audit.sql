-- Admin audit log: every admin action is recorded (who, what, on whom, when).
-- Additive only; never touches existing tables.
begin;

create table if not exists socialapp.admin_audit (
  id bigserial primary key,
  admin_email text not null,
  action text not null,
  target_user_id uuid references socialapp.users(id) on delete set null,
  target_email text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_created_idx on socialapp.admin_audit (created_at desc);
create index if not exists admin_audit_target_idx on socialapp.admin_audit (target_user_id);

commit;

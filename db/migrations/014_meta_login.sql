begin;

-- Meta unified login (Facebook Login with config_id). Existing rows keep auth_type 'instagram_login'.
alter table socialapp.social_accounts add column if not exists auth_type text not null default 'instagram_login';
do $$
begin
  alter table socialapp.social_accounts add constraint social_accounts_auth_type_check check (auth_type in ('instagram_login','facebook_login'));
exception
  when duplicate_object then null;
end $$;
alter table socialapp.social_accounts add column if not exists page_id text;
alter table socialapp.social_accounts add column if not exists page_name text;

commit;

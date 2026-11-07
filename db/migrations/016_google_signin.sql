begin;

-- Sign in with Google: the verified Google account id ("sub") per user, and Google-only users
-- without a password.
alter table socialapp.users add column if not exists google_sub text;
create unique index if not exists users_google_sub_key on socialapp.users (google_sub) where google_sub is not null;
alter table socialapp.users alter column password_hash drop not null;

commit;

begin;

-- Email ownership proof (audit 2026-11-11). Poskoo sends no e-mail, so the only proof of owning an
-- address is a Google sign-in with a Google-verified email. Admin access requires it.
alter table socialapp.users add column if not exists email_verified_at timestamptz;

-- Accounts created through Google (no password) already proved their email.
update socialapp.users set email_verified_at = coalesce(email_verified_at, created_at)
 where google_sub is not null and password_hash is null and email_verified_at is null;

-- Accounts that were password sign-ups later linked to Google stay unverified on purpose: the next
-- Google sign-in claims them (clears the password, revokes all sessions, sets email_verified_at).

commit;

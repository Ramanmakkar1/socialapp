-- App-wide settings an admin changes from /admin/settings (src/lib/appSettings.ts).
-- First use: the Anthropic API key for the AI features (key = 'anthropic_api_key'), stored
-- encrypted with TOKEN_ENCRYPTION_KEY like social_accounts.access_token_enc. Secrets are only ever
-- in value_enc; `hint` keeps the last 4 characters so the admin page can show "•••• abcd".
-- An env var (ANTHROPIC_API_KEY) still wins over a stored key. Additive only; the code treats a
-- missing table as "nothing stored", so this can run before or after the deploy.
begin;

create table if not exists socialapp.app_settings (
  key text primary key,
  value_enc text not null,
  hint text,
  updated_by text,
  updated_at timestamptz not null default now()
);

commit;

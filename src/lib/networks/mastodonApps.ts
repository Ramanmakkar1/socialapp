// Server only: the per-instance Mastodon OAuth app (registered once, client secret encrypted).
import { decryptToken, encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { mastodonRedirectUri, registerMastodonApp } from "@/lib/networks/mastodon";

export type MastodonApp = { clientId: string; clientSecret: string };

/** The stored app for this instance, registering a new one when missing or when our redirect URI changed. */
export async function getOrRegisterMastodonApp(instance: string, register = registerMastodonApp): Promise<MastodonApp> {
  const rows = await query<{ client_id: string; client_secret_enc: string; redirect_uri: string }>(
    "select client_id, client_secret_enc, redirect_uri from socialapp.mastodon_apps where instance=$1",
    [instance],
  );
  const row = rows[0];
  if (row && row.redirect_uri === mastodonRedirectUri()) {
    try {
      return { clientId: row.client_id, clientSecret: decryptToken(row.client_secret_enc) };
    } catch {
      // unreadable (key rotated): register again below
    }
  }
  const app = await register(instance);
  await query(
    `insert into socialapp.mastodon_apps (instance, client_id, client_secret_enc, redirect_uri) values ($1, $2, $3, $4)
     on conflict (instance) do update set client_id=excluded.client_id, client_secret_enc=excluded.client_secret_enc, redirect_uri=excluded.redirect_uri, created_at=now()`,
    [instance, app.clientId, encryptToken(app.clientSecret), app.redirectUri],
  );
  return { clientId: app.clientId, clientSecret: app.clientSecret };
}

/** Read-only lookup for the callback (never registers). */
export async function getMastodonApp(instance: string): Promise<MastodonApp | null> {
  const rows = await query<{ client_id: string; client_secret_enc: string }>(
    "select client_id, client_secret_enc from socialapp.mastodon_apps where instance=$1",
    [instance],
  );
  if (!rows[0]) return null;
  try {
    return { clientId: rows[0].client_id, clientSecret: decryptToken(rows[0].client_secret_enc) };
  } catch {
    return null;
  }
}

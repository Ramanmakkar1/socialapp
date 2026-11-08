// Server only: stores the YouTube channel a user connected (encrypted refresh token) and reads it back
// for the scheduler and the publisher. Mirrors the social_accounts pattern from metaAccounts.ts.
import { decryptToken, encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import type { YouTubeChannel } from "@/lib/youtubeAuth";

export type YouTubeChannelRow = {
  id: string;
  channelId: string;
  title: string;
  avatarUrl: string | null;
  refreshToken: string;
};

/** Saves (or re-connects) the user's YouTube channel with its encrypted refresh token. */
export async function saveYouTubeChannel(userId: string, channel: YouTubeChannel, refreshToken: string): Promise<void> {
  await query(
    `insert into socialapp.youtube_channels (user_id, channel_id, title, avatar_url, refresh_token_enc, status)
     values ($1, $2, $3, $4, $5, 'active')
     on conflict (user_id, channel_id) do update set
       title = excluded.title,
       avatar_url = excluded.avatar_url,
       refresh_token_enc = excluded.refresh_token_enc,
       status = 'active',
       updated_at = now()`,
    [userId, channel.channelId, channel.title, channel.avatarUrl, encryptToken(refreshToken)],
  );
}

/** The user's active YouTube channel (decrypted refresh token), or null when none is connected. */
export async function getYouTubeChannel(userId: string): Promise<YouTubeChannelRow | null> {
  const rows = await query<{
    id: string;
    channel_id: string;
    title: string;
    avatar_url: string | null;
    refresh_token_enc: string;
  }>(
    "select id, channel_id, title, avatar_url, refresh_token_enc from socialapp.youtube_channels where user_id=$1 and status='active' order by updated_at desc limit 1",
    [userId],
  );
  const row = rows[0];
  if (!row) return null;
  let refreshToken: string;
  try {
    refreshToken = decryptToken(row.refresh_token_enc);
  } catch {
    return null;
  }
  return { id: row.id, channelId: row.channel_id, title: row.title, avatarUrl: row.avatar_url, refreshToken };
}

/** Marks the user's YouTube channel disconnected and clears the stored refresh token
 * (the privacy policy promises the token is deleted on disconnect). */
export async function disconnectYouTubeChannel(userId: string): Promise<void> {
  await query(
    "update socialapp.youtube_channels set status='disconnected', refresh_token_enc='', updated_at=now() where user_id=$1 and status='active'",
    [userId],
  );
}

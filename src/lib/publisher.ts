// Server only: publishes due scheduled posts through the official Instagram API.
import { decryptToken } from "@/lib/crypto";
import { getPool } from "@/lib/db";

const GRAPH_BASE = "https://graph.instagram.com/v21.0";
const PUBLISH_TIMEOUT_MS = 20_000;

type ClaimedRow = {
  id: string;
  post_id: string;
  caption_override: string | null;
  caption: string;
  media: unknown;
  user_id: string;
};

type AccountRow = {
  id: string;
  external_id: string;
  access_token_enc: string | null;
};

export type PublishResult = { published: number; failed: number; skipped: number };

function cleanError(message: string, token: string): string {
  const safe = token ? message.split(token).join("[redacted]") : message;
  return safe.slice(0, 500);
}

function metaMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null) {
    const err = (body as { error?: unknown }).error;
    if (typeof err === "object" && err !== null) {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
    }
  }
  return fallback;
}

function firstImageUrl(media: unknown): string | null {
  if (!Array.isArray(media)) return null;
  for (const item of media) {
    if (typeof item === "object" && item !== null) {
      const row = item as { type?: unknown; url?: unknown };
      if (row.type === "image" && typeof row.url === "string") return row.url;
    }
  }
  return null;
}

async function markTargetFailed(
  targetId: string,
  postId: string,
  error: string,
  token: string,
): Promise<void> {
  const pool = getPool();
  const cleaned = cleanError(error, token);
  await pool.query(
    "update socialapp.post_targets set status='failed', error=$2, published_at=null, external_post_id=null where id=$1",
    [targetId, cleaned],
  );
  await refreshPostStatus(postId);
}

async function refreshPostStatus(postId: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    `update socialapp.scheduled_posts p set status = case
      when exists(select 1 from socialapp.post_targets where post_id=p.id and status='failed') then 'failed'
      when not exists(select 1 from socialapp.post_targets where post_id=p.id and status in ('pending','publishing')) then 'published'
      else p.status
    end, updated_at=now() where p.id=$1`,
    [postId],
  );
}

async function publishToInstagram(
  igUserId: string,
  token: string,
  imageUrl: string,
  caption: string,
): Promise<{ ok: true; externalPostId: string } | { ok: false; error: string }> {
  try {
    const mediaRes = await fetch(`${GRAPH_BASE}/${encodeURIComponent(igUserId)}/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: imageUrl, caption }),
      signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
    });
    const mediaText = await mediaRes.text().catch(() => "");
    let mediaBody: unknown = mediaText;
    try {
      mediaBody = JSON.parse(mediaText);
    } catch {
      // keep raw text
    }
    if (!mediaRes.ok) {
      return {
        ok: false,
        error: cleanError(`HTTP ${mediaRes.status}: ${metaMessage(mediaBody, mediaText)}`, token),
      };
    }
    const creationId =
      typeof mediaBody === "object" && mediaBody !== null
        ? (mediaBody as { id?: unknown }).id
        : undefined;
    if (typeof creationId !== "string" || !creationId) {
      return { ok: false, error: cleanError("Instagram media create returned no id", token) };
    }

    const publishRes = await fetch(
      `${GRAPH_BASE}/${encodeURIComponent(igUserId)}/media_publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creation_id: creationId }),
        signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
      },
    );
    const publishText = await publishRes.text().catch(() => "");
    let publishBody: unknown = publishText;
    try {
      publishBody = JSON.parse(publishText);
    } catch {
      // keep raw text
    }
    if (!publishRes.ok) {
      return {
        ok: false,
        error: cleanError(
          `HTTP ${publishRes.status}: ${metaMessage(publishBody, publishText)}`,
          token,
        ),
      };
    }
    const externalPostId =
      typeof publishBody === "object" && publishBody !== null
        ? (publishBody as { id?: unknown }).id
        : undefined;
    if (typeof externalPostId !== "string" || !externalPostId) {
      return { ok: false, error: cleanError("Instagram publish returned no id", token) };
    }
    return { ok: true, externalPostId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: cleanError(`network: ${message}`, token) };
  }
}

export async function publishDuePosts(limit = 20): Promise<PublishResult> {
  const result: PublishResult = { published: 0, failed: 0, skipped: 0 };
  const pool = getPool();
  const claimed = await pool.query<ClaimedRow>(
    `update socialapp.post_targets t set status='publishing'
     from socialapp.scheduled_posts p
     where t.post_id=p.id and t.platform='instagram' and t.status='pending'
       and p.status='scheduled' and p.scheduled_at <= now()
       and t.id in (
         select t2.id from socialapp.post_targets t2
         join socialapp.scheduled_posts p2 on p2.id=t2.post_id
         where t2.platform='instagram' and t2.status='pending'
           and p2.status='scheduled' and p2.scheduled_at <= now()
         order by p2.scheduled_at
         limit $1
         for update of t2 skip locked
       )
     returning t.id, t.post_id, t.caption_override, p.caption, p.media, p.user_id`,
    [limit],
  );

  for (const row of claimed.rows) {
    let token = "";
    const accounts = await pool.query<AccountRow>(
      `select id, external_id, access_token_enc from socialapp.social_accounts
       where user_id=$1 and platform='instagram' and status='active'
       order by created_at limit 1`,
      [row.user_id],
    );
    const account = accounts.rows[0];
    if (!account?.access_token_enc) {
      await markTargetFailed(row.id, row.post_id, "No connected Instagram account", token);
      result.failed += 1;
      continue;
    }

    const imageUrl = firstImageUrl(row.media);
    if (!imageUrl) {
      await markTargetFailed(row.id, row.post_id, "Instagram needs an image", token);
      result.failed += 1;
      continue;
    }

    try {
      token = decryptToken(account.access_token_enc);
    } catch {
      await markTargetFailed(row.id, row.post_id, "No connected Instagram account", token);
      result.failed += 1;
      continue;
    }

    const caption = row.caption_override ?? row.caption;
    const outcome = await publishToInstagram(
      account.external_id,
      token,
      imageUrl,
      caption,
    );

    if (outcome.ok) {
      await pool.query(
        `update socialapp.post_targets set status='published', external_post_id=$2,
         published_at=now(), error=null, social_account_id=$3 where id=$1`,
        [row.id, outcome.externalPostId, account.id],
      );
      // This loop only claims Instagram targets; switch on the post's attached auto-DM rule.
      try {
        await pool.query(
          `update socialapp.dm_rules r set status='active',
           social_account_id=coalesce(r.social_account_id,$2), updated_at=now()
           from socialapp.scheduled_posts p
           where p.id=$1 and r.id=p.dm_rule_id and r.user_id=p.user_id`,
          [row.post_id, account.id],
        );
      } catch {
        // Never fail a published post because the rule could not be switched on.
      }
      await refreshPostStatus(row.post_id);
      result.published += 1;
    } else {
      await markTargetFailed(row.id, row.post_id, outcome.error, token);
      result.failed += 1;
    }
  }

  return result;
}

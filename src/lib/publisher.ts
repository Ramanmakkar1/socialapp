// Server only: publishes due scheduled posts through the official Instagram API.
import { decryptToken } from "@/lib/crypto";
import { getPool } from "@/lib/db";
import { shouldPostFirstComment } from "@/lib/firstComment";
import { graphBaseFor } from "@/lib/graphHost";

const PUBLISH_TIMEOUT_MS = 20_000;

type ClaimedRow = {
  id: string;
  post_id: string;
  caption_override: string | null;
  caption: string;
  media: unknown;
  user_id: string;
  ig_format: string;
  first_comment: string | null;
};

type AccountRow = {
  id: string;
  external_id: string;
  access_token_enc: string | null;
  auth_type?: string | null;
};

export type PublishResult = { published: number; failed: number; skipped: number; recovered: number };

/** A claim older than this is treated as an interrupted run (worst real publish is ~10 min: video polling / 10-slide carousel). */
export const STUCK_PUBLISHING_MS = 20 * 60 * 1000;
export const STUCK_PUBLISHING_ERROR =
  "Publishing was interrupted before Instagram confirmed this post. Check your Instagram profile first: if the post is not there, press Retry.";

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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function firstMedia(
  media: unknown,
): { type: "image" | "video"; url: string } | null {
  if (!Array.isArray(media)) return null;
  for (const item of media) {
    if (typeof item === "object" && item !== null) {
      const row = item as { type?: unknown; url?: unknown };
      if (
        (row.type === "image" || row.type === "video") &&
        typeof row.url === "string"
      ) {
        return {
          type: row.type,
          url: row.url,
        };
      }
    }
  }
  return null;
}

function allImages(media: unknown): string[] {
  if (!Array.isArray(media)) return [];
  const urls: string[] = [];
  for (const item of media) {
    if (typeof item === "object" && item !== null) {
      const row = item as { type?: unknown; url?: unknown };
      if (row.type === "image" && typeof row.url === "string") {
        urls.push(row.url);
      }
    }
  }
  return urls;
}

async function postForId(
  base: string,
  path: string,
  token: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const mediaRes = await fetch(`${base}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
    const id =
      typeof mediaBody === "object" && mediaBody !== null
        ? (mediaBody as { id?: unknown }).id
        : undefined;
    if (typeof id !== "string" || !id) {
      return { ok: false, error: cleanError("Instagram media create returned no id", token) };
    }
    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: cleanError(`network: ${message}`, token) };
  }
}

async function publishCreationId(
  base: string,
  igUserId: string,
  token: string,
  creationId: string,
): Promise<{ ok: true; externalPostId: string } | { ok: false; error: string }> {
  const publishRes = await fetch(
    `${base}/${encodeURIComponent(igUserId)}/media_publish`,
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
}

async function waitForVideoContainerReady(
  base: string,
  creationId: string,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const maxTries = 24;
  for (let attempt = 0; attempt < maxTries; attempt += 1) {
    const statusRes = await fetch(
      `${base}/${encodeURIComponent(creationId)}?fields=status_code`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
      },
    );
    const statusText = await statusRes.text().catch(() => "");
    let statusBody: unknown = statusText;
    try {
      statusBody = JSON.parse(statusText);
    } catch {
      // keep raw text
    }
    if (!statusRes.ok) {
      return {
        ok: false,
        error: cleanError(
          `HTTP ${statusRes.status}: ${metaMessage(statusBody, statusText)}`,
          token,
        ),
      };
    }
    const statusCode =
      typeof statusBody === "object" && statusBody !== null
        ? (statusBody as { status_code?: unknown }).status_code
        : undefined;
    if (statusCode === "FINISHED") return { ok: true };
    if (statusCode === "ERROR" || statusCode === "EXPIRED") {
      return {
        ok: false,
        error: cleanError(
          `Instagram could not process the video (status ${String(statusCode)})`,
          token,
        ),
      };
    }
    if (attempt === maxTries - 1) {
      return {
        ok: false,
        error: cleanError(
          "Instagram is still processing the video, try Retry in a few minutes",
          token,
        ),
      };
    }
    await sleep(5000);
  }
  return { ok: false, error: cleanError("Instagram video processing failed", token) };
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
      when not exists(select 1 from socialapp.post_targets where post_id=p.id and status='publishing') then 'scheduled'
      else p.status
    end, updated_at=now() where p.id=$1`,
    [postId],
  );
}

/**
 * Content publishing: POST {ig-user-id}/media (container), wait for video containers, then
 * POST {ig-user-id}/media_publish. `base` is graph.facebook.com for Facebook-login accounts
 * (Page token) and graph.instagram.com for older Instagram-login accounts.
 */
export async function publishToInstagram(
  base: string,
  igUserId: string,
  token: string,
  mediaRaw: unknown,
  caption: string,
  format: "feed" | "story" = "feed",
): Promise<{ ok: true; externalPostId: string } | { ok: false; error: string }> {
  const igPath = `${encodeURIComponent(igUserId)}/media`;

  if (format === "story") {
    const media = firstMedia(mediaRaw);
    if (!media) {
      return { ok: false, error: cleanError("Instagram needs an image or video", token) };
    }
    try {
      const createBody =
        media.type === "video"
          ? { media_type: "STORIES", video_url: media.url }
          : { media_type: "STORIES", image_url: media.url };

      const created = await postForId(base, igPath, token, createBody);
      if (!created.ok) {
        return created;
      }
      const creationId = created.id;

      if (media.type === "video") {
        const ready = await waitForVideoContainerReady(base, creationId, token);
        if (!ready.ok) {
          return ready;
        }
      }

      return publishCreationId(base, igUserId, token, creationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: cleanError(`network: ${message}`, token) };
    }
  }

  const carouselImages = allImages(mediaRaw);
  if (carouselImages.length >= 2) {
    try {
      const childIds: string[] = [];
      for (const imageUrl of carouselImages) {
        const child = await postForId(base, igPath, token, {
          image_url: imageUrl,
          is_carousel_item: true,
        });
        if (!child.ok) {
          return {
            ok: false,
            error: cleanError(`Carousel slide failed: ${child.error}`, token),
          };
        }
        childIds.push(child.id);
      }
      const carousel = await postForId(base, igPath, token, {
        media_type: "CAROUSEL",
        children: childIds.join(","),
        caption,
      });
      if (!carousel.ok) {
        return carousel;
      }
      return publishCreationId(base, igUserId, token, carousel.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: cleanError(`network: ${message}`, token) };
    }
  }

  const media = firstMedia(mediaRaw);
  if (!media) {
    return { ok: false, error: cleanError("Instagram needs an image or video", token) };
  }

  try {
    const createBody =
      media.type === "video"
        ? { media_type: "REELS", video_url: media.url, caption }
        : { image_url: media.url, caption };

    const created = await postForId(base, igPath, token, createBody);
    if (!created.ok) {
      return created;
    }
    const creationId = created.id;

    if (media.type === "video") {
      const ready = await waitForVideoContainerReady(base, creationId, token);
      if (!ready.ok) {
        return ready;
      }
    }

    return publishCreationId(base, igUserId, token, creationId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: cleanError(`network: ${message}`, token) };
  }
}

/**
 * Recovers targets left in 'publishing' by a run that crashed or timed out (bug a).
 * We cannot know whether Instagram received the post, so we never auto-repost: the
 * target is failed with a clear reason and the owner decides to Retry.
 */
export async function recoverStuckPublishing(staleMs = STUCK_PUBLISHING_MS): Promise<number> {
  const pool = getPool();
  const res = await pool.query<{ post_id: string }>(
    `update socialapp.post_targets t set status='failed', error=$1, published_at=null
     from socialapp.scheduled_posts p
     where t.post_id=p.id and t.status='publishing'
       and ((p.status='publishing' and p.updated_at < now() - ($2::int * interval '1 millisecond'))
         or (p.status='scheduled' and p.scheduled_at < now() - ($2::int * interval '1 millisecond')))
     returning t.post_id`,
    [STUCK_PUBLISHING_ERROR, staleMs],
  );
  const postIds = [...new Set(res.rows.map((r) => r.post_id))];
  for (const postId of postIds) {
    console.error("publisher: recovered interrupted publish, post", postId);
    await refreshPostStatus(postId);
  }
  return res.rows.length;
}

/**
 * Claims due posts in one transaction: the post row becomes 'publishing' together with its
 * Instagram targets, so delete / reschedule (which only touch draft/scheduled/failed rows)
 * can never race the publisher (bugs b, c). SKIP LOCKED keeps overlapping runs apart.
 */
async function claimDueTargets(limit: number): Promise<ClaimedRow[]> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const due = await client.query<{ id: string }>(
      `select p.id from socialapp.scheduled_posts p
       where p.status='scheduled' and p.scheduled_at <= now()
         and exists (select 1 from socialapp.post_targets t
           where t.post_id=p.id and t.platform='instagram' and t.status='pending')
       order by p.scheduled_at
       limit $1
       for update of p skip locked`,
      [limit],
    );
    const ids = due.rows.map((r) => r.id);
    if (ids.length === 0) {
      await client.query("commit");
      return [];
    }
    await client.query(
      "update socialapp.scheduled_posts set status='publishing', updated_at=now() where id = any($1::uuid[]) and status='scheduled'",
      [ids],
    );
    const claimed = await client.query<ClaimedRow>(
      `update socialapp.post_targets t set status='publishing'
       from socialapp.scheduled_posts p
       where t.post_id=p.id and p.id = any($1::uuid[]) and t.platform='instagram' and t.status='pending'
       returning t.id, t.post_id, t.caption_override, p.caption, p.media, p.user_id, p.ig_format, p.first_comment`,
      [ids],
    );
    await client.query("commit");
    return claimed.rows;
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

export async function publishDuePosts(limit = 20): Promise<PublishResult> {
  const result: PublishResult = { published: 0, failed: 0, skipped: 0, recovered: 0 };
  const pool = getPool();
  try {
    result.recovered = await recoverStuckPublishing();
  } catch (err) {
    console.error("publisher: stuck-claim recovery failed", err instanceof Error ? err.message : err);
  }
  const claimed = { rows: await claimDueTargets(limit) };

  for (const row of claimed.rows) {
    let token = "";
    const accounts = await pool.query<AccountRow>(
      `select id, external_id, access_token_enc, auth_type from socialapp.social_accounts
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

    const postMedia = firstMedia(row.media);
    if (!postMedia && allImages(row.media).length < 2) {
      await markTargetFailed(row.id, row.post_id, "Instagram needs an image or video", token);
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
    const igFormat = row.ig_format === "story" ? "story" : "feed";
    const base = graphBaseFor(account.auth_type);
    const outcome = await publishToInstagram(
      base,
      account.external_id,
      token,
      row.media,
      caption,
      igFormat,
    );

    if (outcome.ok) {
      await pool.query(
        `update socialapp.post_targets set status='published', external_post_id=$2,
         published_at=now(), error=null, social_account_id=$3 where id=$1`,
        [row.id, outcome.externalPostId, account.id],
      );
      if (shouldPostFirstComment(igFormat, row.first_comment)) {
        try {
          const comment = await postForId(
            base,
            `${encodeURIComponent(outcome.externalPostId)}/comments`, token,
            { message: row.first_comment },
          );
          if (!comment.ok) throw new Error(comment.error);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("First comment failed:", cleanError(message, token));
        }
      }
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
      // Expired or revoked token: flag the account so Settings shows a clear Reconnect prompt.
      const tokenDead = /HTTP 401\b|OAuthException|access token|session has expired/i.test(outcome.error);
      if (tokenDead) {
        await pool
          .query("update socialapp.social_accounts set status='expired', updated_at=now() where id=$1 and status='active'", [account.id])
          .catch(() => undefined);
      }
      const error = tokenDead
        ? `Instagram access expired or was removed. Reconnect Instagram in Settings, then retry. (${outcome.error})`
        : outcome.error;
      await markTargetFailed(row.id, row.post_id, error, token);
      result.failed += 1;
    }
  }

  try {
    const unsupported = await pool.query<{ post_id: string }>(
      `update socialapp.post_targets t set status='failed',
         error='Facebook and Threads publishing is coming soon. Remove this platform from the post (or duplicate it for Instagram only).',
         published_at=null, external_post_id=null
       from socialapp.scheduled_posts p
       where t.post_id=p.id and t.platform <> 'instagram' and t.status='pending'
         and p.status='scheduled' and p.scheduled_at <= now()
         and not exists (select 1 from socialapp.post_targets i
           where i.post_id=p.id and i.platform='instagram' and i.status in ('pending','publishing'))
       returning t.post_id`,
    );
    const postIds = [...new Set(unsupported.rows.map((r) => r.post_id))];
    for (const postId of postIds) await refreshPostStatus(postId);
    result.failed += unsupported.rows.length;
  } catch {
    // Never fail the publish pass because unsupported platforms could not be marked failed.
  }

  return result;
}

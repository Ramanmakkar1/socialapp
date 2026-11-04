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
  ig_format: string;
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
  path: string,
  token: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const mediaRes = await fetch(`${GRAPH_BASE}/${path}`, {
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
  igUserId: string,
  token: string,
  creationId: string,
): Promise<{ ok: true; externalPostId: string } | { ok: false; error: string }> {
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
}

async function waitForVideoContainerReady(
  creationId: string,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const maxTries = 24;
  for (let attempt = 0; attempt < maxTries; attempt += 1) {
    const statusRes = await fetch(
      `${GRAPH_BASE}/${encodeURIComponent(creationId)}?fields=status_code`,
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
      else p.status
    end, updated_at=now() where p.id=$1`,
    [postId],
  );
}

async function publishToInstagram(
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

      const created = await postForId(igPath, token, createBody);
      if (!created.ok) {
        return created;
      }
      const creationId = created.id;

      if (media.type === "video") {
        const ready = await waitForVideoContainerReady(creationId, token);
        if (!ready.ok) {
          return ready;
        }
      }

      return publishCreationId(igUserId, token, creationId);
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
        const child = await postForId(igPath, token, {
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
      const carousel = await postForId(igPath, token, {
        media_type: "CAROUSEL",
        children: childIds.join(","),
        caption,
      });
      if (!carousel.ok) {
        return carousel;
      }
      return publishCreationId(igUserId, token, carousel.id);
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

    const created = await postForId(igPath, token, createBody);
    if (!created.ok) {
      return created;
    }
    const creationId = created.id;

    if (media.type === "video") {
      const ready = await waitForVideoContainerReady(creationId, token);
      if (!ready.ok) {
        return ready;
      }
    }

    return publishCreationId(igUserId, token, creationId);
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
     returning t.id, t.post_id, t.caption_override, p.caption, p.media, p.user_id, p.ig_format`,
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
    const outcome = await publishToInstagram(
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

// Server-only: the one place a post is validated and written. The calendar server
// action (src/app/app/calendar/actions.ts) and the MCP create_post tool both call
// savePostForUser, so both paths enforce the same rules.
import { getPool, query } from "@/lib/db";
import { countChars, PLATFORM_LIMITS } from "@/lib/captionLimits";
import { checkCaption, type PlatformId } from "@/lib/platforms";
import { scheduledPostLimitError } from "@/lib/planLimits";
import { canPublishToFacebook } from "@/lib/facebookPublish";
import { nextSlot } from "@/lib/postingSchedule";
import { shouldPostFirstComment } from "@/lib/firstComment";
import { hasColumn, parseTags, tagValidationError } from "@/lib/tagFilter";
import { isNetworkId, NETWORK_LABEL } from "@/lib/networks/common";
import { networkTargetError, normalizeNetOptions } from "@/lib/networks/validate";
import { scheduledMediaError } from "@/lib/mediaLifecycle";
import { EXTRA_NETWORK_IDS } from "@/lib/networks/tokenNetworks";

export const ALLOWED_PLATFORMS: PlatformId[] = [
  "instagram", "facebook", "threads", "youtube", "tiktok", "bluesky", "mastodon", "linkedin", "pinterest", "x", "gbp",
  // Reminder channels (src/lib/networks/reminder.ts).
  "ig_personal", "fb_group",
  // Token networks (src/lib/networks/tokenNetworks.ts).
  ...EXTRA_NETWORK_IDS,
];

export type SavePostInput = {
  draftId?: string;
  caption: string;
  firstComment?: string;
  tags?: string[];
  platforms: PlatformId[];
  overrides: Partial<Record<string, string>>;
  scheduledAt: string | null;
  mode: "draft" | "schedule" | "queue";
  imageUrl?: string | null;
  mediaUrls?: string[];
  dmRuleId?: string | null;
  igFormat?: "feed" | "story";
  ytTitle?: string;
  ytTags?: string[];
  ytPrivacy?: "public" | "unlisted" | "private";
  ytShorts?: boolean;
  /** Per-network options (TikTok privacy / disclosure, Pinterest board + title + link, LinkedIn author). */
  netOptions?: Partial<Record<string, unknown>>;
  /**
   * The exact connected accounts to post to, per network (social_accounts ids; youtube_channels ids
   * for YouTube). A network left out goes to the user's oldest active account, as before.
   */
  accounts?: Partial<Record<string, string[]>>;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Most accounts one network can get in a single post (the Agency plan connects up to 25). */
export const MAX_ACCOUNTS_PER_NETWORK = 25;

/** One post_targets row: the account it goes to (both null = oldest active account, the old behaviour). */
export type TargetAccount = { socialAccountId: string | null; youtubeChannelId: string | null };

/**
 * Check every picked account belongs to this user and to that network. Facebook Pages are stored as
 * the Instagram (Facebook login) row that holds the Page; YouTube channels have their own table.
 */
export async function resolvePickedAccounts(
  userId: string,
  platforms: PlatformId[],
  picked: Partial<Record<string, string[]>> | undefined,
  /** Scheduling needs every picked account connected right now; a draft may keep one that needs reconnecting. */
  requireActive = false,
  run: typeof query = query,
): Promise<{ ok: true; targets: Partial<Record<string, TargetAccount[]>> } | { ok: false; error: string }> {
  const targets: Partial<Record<string, TargetAccount[]>> = {};
  for (const platform of platforms) {
    const raw = picked?.[platform];
    if (raw === undefined) continue;
    if (!Array.isArray(raw)) return { ok: false, error: "Invalid account." };
    const ids = [...new Set(raw.filter((id): id is string => typeof id === "string"))];
    if (ids.length === 0) return { ok: false, error: `Pick at least one ${platformLabel(platform)} account.` };
    if (ids.length > MAX_ACCOUNTS_PER_NETWORK) return { ok: false, error: "Too many accounts picked." };
    if (!ids.every((id) => UUID_RE.test(id))) return { ok: false, error: "Invalid account." };
    const active = requireActive ? " and status='active'" : "";
    let rows: { id: string }[];
    if (platform === "youtube") {
      rows = await run<{ id: string }>(`select id from socialapp.youtube_channels where user_id=$1 and id = any($2::uuid[])${active}`, [userId, ids]);
    } else if (platform === "facebook") {
      rows = await run<{ id: string }>(
        `select id from socialapp.social_accounts where user_id=$1 and platform='instagram' and auth_type='facebook_login' and page_id is not null and id = any($2::uuid[])${active}`,
        [userId, ids],
      );
    } else {
      rows = await run<{ id: string }>(`select id from socialapp.social_accounts where user_id=$1 and platform=$2 and id = any($3::uuid[])${active}`, [userId, platform, ids]);
    }
    if (rows.length !== ids.length) {
      return {
        ok: false,
        error: requireActive
          ? `A ${platformLabel(platform)} account you picked needs reconnecting. Reconnect it in Settings, untick it, or save as a draft.`
          : `That ${platformLabel(platform)} account isn't connected any more. Refresh and pick again.`,
      };
    }
    targets[platform] = ids.map((id) =>
      platform === "youtube" ? { socialAccountId: null, youtubeChannelId: id } : { socialAccountId: id, youtubeChannelId: null },
    );
  }
  return { ok: true, targets };
}

function platformLabel(platform: string): string {
  if (isNetworkId(platform)) return NETWORK_LABEL[platform];
  return { instagram: "Instagram", facebook: "Facebook", threads: "Threads", youtube: "YouTube" }[platform] ?? platform;
}

type MediaItem = { type: "image" | "video"; url: string };

function parseMediaLink(
  trimmed: string,
): { ok: true; item: MediaItem } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      error: "Media link must be a public https link to a .jpg, .png or .mp4 file.",
    };
  }
  const pathname = parsed.pathname.toLowerCase();
  let detectedType: "image" | "video" | null = null;
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg") || pathname.endsWith(".png")) {
    detectedType = "image";
  } else if (pathname.endsWith(".mp4") || pathname.endsWith(".mov")) {
    detectedType = "video";
  }
  if (parsed.protocol !== "https:" || trimmed.length > 2000 || !detectedType) {
    return {
      ok: false,
      error: "Media link must be a public https link to a .jpg, .png or .mp4 file.",
    };
  }
  return { ok: true, item: { type: detectedType, url: trimmed } };
}

function effectiveCaption(
  platform: PlatformId,
  caption: string,
  overrides: Partial<Record<string, string>>,
): string {
  if (Object.prototype.hasOwnProperty.call(overrides, platform)) {
    return overrides[platform] ?? "";
  }
  return caption;
}

// Next free slot across the user's saved channel schedules for the selected platforms.
// Returns null when there is no usable schedule (or the table is not present yet).
export async function nextQueueSlot(userId: string, platforms: PlatformId[]): Promise<Date | null> {
  let rows: { platform: string; timezone: string; days: number[]; times: string[] }[];
  try {
    rows = await query(
      "select platform, timezone, days, times from socialapp.posting_schedules where user_id=$1",
      [userId],
    );
  } catch {
    return null;
  }
  const schedules = rows
    .filter((r) => (ALLOWED_PLATFORMS as string[]).includes(r.platform) && platforms.includes(r.platform as PlatformId))
    .map((r) => ({ platform: r.platform as PlatformId, timezone: r.timezone, days: r.days ?? [], times: r.times ?? [] }));
  const slot = nextSlot(schedules, Date.now());
  return slot === null ? null : new Date(slot);
}

export async function savePostForUser(
  userId: string,
  input: SavePostInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (
    input.draftId !== undefined &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.draftId)
  ) {
    return { ok: false, error: "Invalid draft." };
  }

  if (input.platforms.length === 0) {
    return { ok: false, error: "Select at least one platform." };
  }

  const platforms: PlatformId[] = [];
  for (const p of input.platforms) {
    if (!ALLOWED_PLATFORMS.includes(p)) {
      return { ok: false, error: "Invalid platform." };
    }
    platforms.push(p);
  }

  // Mastodon servers can allow more than 500 characters (stored when the account was connected).
  let mastodonMax: number | null = null;
  if (platforms.includes("mastodon")) {
    try {
      const [row] = await query<{ max: number | null }>(
        "select (meta->>'maxChars')::int as max from socialapp.social_accounts where user_id=$1 and platform='mastodon' and status='active' order by created_at limit 1",
        [userId],
      );
      mastodonMax = row?.max ?? null;
    } catch {
      mastodonMax = null;
    }
  }

  for (const platform of platforms) {
    const text = effectiveCaption(platform, input.caption, input.overrides);
    if (!text.trim() && platform !== "pinterest" && platform !== "tiktok") {
      return { ok: false, error: "Add a caption for each selected platform." };
    }
    const check = checkCaption(platform, text, platform === "mastodon" ? mastodonMax : null);
    if (check.errors.length > 0) {
      return { ok: false, error: check.errors[0] ?? "Caption is too long." };
    }
  }

  const urlList =
    input.mediaUrls !== undefined
      ? input.mediaUrls.map((u) => u.trim()).filter((u) => u !== "")
      : input.imageUrl && input.imageUrl.trim() !== ""
        ? [input.imageUrl.trim()]
        : [];

  if (urlList.length > 10) {
    return { ok: false, error: "Up to 10 images per carousel." };
  }

  const mediaItems: MediaItem[] = [];
  for (const trimmed of urlList) {
    const parsed = parseMediaLink(trimmed);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }
    mediaItems.push(parsed.item);
  }

  if (mediaItems.length > 1 && mediaItems.some((m) => m.type === "video")) {
    return { ok: false, error: "Carousels can only have images for now." };
  }

  const igFormatRaw = input.igFormat;
  const igFormat = igFormatRaw === "story" ? "story" : "feed";
  const instagramSelected = platforms.includes("instagram");
  const firstComment = typeof input.firstComment === "string" ? input.firstComment.trim() : "";
  if (countChars(firstComment) > (PLATFORM_LIMITS.instagram.max ?? 2200)) {
    return { ok: false, error: "First comment must be 2,200 characters or fewer." };
  }
  const tags = parseTags(input.tags);
  const tagsError = tagValidationError(tags);
  if (tagsError) return { ok: false, error: tagsError };

  if (igFormat === "story" && mediaItems.length > 1) {
    return { ok: false, error: "A Story takes one image or video." };
  }

  if (
    igFormat === "story" &&
    instagramSelected &&
    input.mode === "schedule" &&
    mediaItems.length !== 1
  ) {
    return {
      ok: false,
      error:
        mediaItems.length > 1
          ? "A Story takes one image or video."
          : "Instagram posts need an image or video link. Add one or untick Instagram.",
    };
  }

  if (platforms.includes("instagram") && input.mode === "schedule" && mediaItems.length === 0) {
    return {
      ok: false,
      error: "Instagram posts need an image or video link. Add one or untick Instagram.",
    };
  }

  const youtubeSelected = platforms.includes("youtube");
  if (youtubeSelected) {
    const ytTitle = typeof input.ytTitle === "string" ? input.ytTitle.trim() : "";
    if (ytTitle.length === 0) {
      return { ok: false, error: "Add a title for the YouTube video." };
    }
    if (ytTitle.length > 100) {
      return { ok: false, error: "The YouTube title must be 100 characters or fewer." };
    }
    if (input.mode === "schedule" && mediaItems.filter((m) => m.type === "video").length === 0) {
      return { ok: false, error: "YouTube posts need a video link (.mp4). Add one or untick YouTube." };
    }
  }

  const scheduling = input.mode === "schedule" || input.mode === "queue";
  for (const platform of platforms) {
    if (!isNetworkId(platform)) continue;
    const netError = networkTargetError(platform, mediaItems, input.netOptions?.[platform], scheduling);
    if (netError) return { ok: false, error: netError };
  }
  if (scheduling && mediaItems.length > 0) {
    // Uploaded files: plan + every selected network's size / type / length (src/lib/mediaLimits.ts).
    const mediaError = await scheduledMediaError(userId, platforms, mediaItems, igFormat);
    if (mediaError) return { ok: false, error: mediaError };
  }

  let scheduledAt: Date | null = null;
  if (input.scheduledAt) {
    const parsed = new Date(input.scheduledAt);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Invalid schedule time." };
    }
    scheduledAt = parsed;
  }

  if (input.mode === "queue") {
    // "Add to queue": the server picks the next free slot from the channel schedules.
    const slot = await nextQueueSlot(userId, platforms);
    if (!slot) {
      return { ok: false, error: "Set a posting schedule in Settings → Channels first, then add posts to the queue." };
    }
    scheduledAt = slot;
  }

  if (input.mode === "schedule" || input.mode === "queue") {
    if (!scheduledAt) {
      return { ok: false, error: "Pick a schedule time." };
    }
    if (scheduledAt.getTime() <= Date.now() + 60_000) {
      return { ok: false, error: "Schedule time must be more than one minute from now." };
    }
  }

  if ((input.mode === "schedule" || input.mode === "queue") && scheduledAt) {
    try {
      if (platforms.includes("instagram")) {
        const connected = await query(
          "select 1 from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='active' and access_token_enc is not null limit 1",
          [userId],
        );
        if (connected.length === 0) {
          return {
            ok: false,
            error: "Connect Instagram in Settings before scheduling. You can save this post as a draft for now.",
          };
        }
      }
      if (platforms.includes("facebook")) {
        const [fbRow] = await query<{ scopes: string[] | null; auth_type: string | null }>(
          "select scopes, auth_type from socialapp.social_accounts where user_id=$1 and platform='instagram' and auth_type='facebook_login' and status='active' and page_id is not null and access_token_enc is not null limit 1",
          [userId],
        );
        if (!fbRow || !canPublishToFacebook(fbRow.scopes, fbRow.auth_type)) {
          return {
            ok: false,
            error:
              "To post to Facebook, reconnect Instagram with Facebook login in Settings and allow Page posting.",
          };
        }
      }
      if (platforms.includes("threads")) {
        const threadsRows = await query(
          "select 1 from socialapp.social_accounts where user_id=$1 and platform='threads' and status='active' and access_token_enc is not null limit 1",
          [userId],
        );
        if (threadsRows.length === 0) {
          return {
            ok: false,
            error: "Connect your Threads account in Settings before scheduling to Threads.",
          };
        }
      }
      if (platforms.includes("youtube")) {
        const ytRows = await query(
          "select 1 from socialapp.youtube_channels where user_id=$1 and status='active' limit 1",
          [userId],
        );
        if (ytRows.length === 0) {
          return {
            ok: false,
            error: "Connect a YouTube channel in Settings before scheduling. You can save this post as a draft for now.",
          };
        }
      }
      for (const platform of platforms) {
        if (!isNetworkId(platform)) continue;
        const rows = await query(
          "select 1 from socialapp.social_accounts where user_id=$1 and platform=$2 and status='active' and access_token_enc is not null limit 1",
          [userId, platform],
        );
        if (rows.length === 0) {
          const label = NETWORK_LABEL[platform];
          return { ok: false, error: `Connect ${label} first (Connect a channel), or untick ${label}. You can save this post as a draft for now.` };
        }
      }
      const limitError = await scheduledPostLimitError(userId, scheduledAt, input.draftId ?? null);
      if (limitError) return { ok: false, error: limitError };
    } catch (err) {
      console.error("savePost: plan limit check failed", userId, err instanceof Error ? err.message : err);
      return { ok: false, error: "Could not save post. Please try again." };
    }
  }

  const status = input.mode === "draft" ? "draft" : "scheduled";

  let pickedTargets: Partial<Record<string, TargetAccount[]>> = {};
  try {
    const resolved = await resolvePickedAccounts(userId, platforms, input.accounts, input.mode !== "draft");
    if (!resolved.ok) return { ok: false, error: resolved.error };
    pickedTargets = resolved.targets;
  } catch (err) {
    console.error("savePost: account check failed", userId, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not save post. Please try again." };
  }

  let dmRuleId: string | null = null;
  if (input.dmRuleId) {
    if (
      typeof input.dmRuleId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.dmRuleId)
    ) {
      return { ok: false, error: "Auto-DM rule not found" };
    }
    try {
      const owned = await query(
        "select 1 from socialapp.dm_rules where id = $1 and user_id = $2",
        [input.dmRuleId, userId],
      );
      if (owned.length === 0) {
        return { ok: false, error: "Auto-DM rule not found" };
      }
    } catch {
      return { ok: false, error: "Auto-DM rule not found" };
    }
    dmRuleId = input.dmRuleId;
  }

  // Check once before BEGIN: a missing-column failure inside the transaction cannot be retried.
  let hasTags = false;
  try {
    const columnRows = await query<{ exists: boolean }>(
      "select exists (select 1 from information_schema.columns where table_schema='socialapp' and table_name='scheduled_posts' and column_name='tags') as exists",
    );
    hasTags = hasColumn(columnRows);
  } catch {
    hasTags = false;
  }

  let client;
  try {
    client = await getPool().connect();
  } catch {
    return { ok: false, error: "Could not save post. Please try again." };
  }

  let id: string | undefined;
  try {
    await client.query("begin");

    if (input.draftId) {
      const locked = await client.query<{ status: string; scheduled_at: Date | string | null }>(
        "select status, scheduled_at from scheduled_posts where id = $1 and user_id = $2 for update",
        [input.draftId, userId],
      );
      if (locked.rows.length === 0) {
        await client.query("rollback");
        return {
          ok: false,
          error: "That draft wasn't found. It may have been deleted or belongs to another account.",
        };
      }
      const lockedStatus = locked.rows[0].status;
      if (lockedStatus !== "draft" && lockedStatus !== "scheduled") {
        await client.query("rollback");
        return {
          ok: false,
          error: "This post can no longer be edited here. Manage it from your queue.",
        };
      }
      if (lockedStatus === "scheduled") {
        // The publisher claims due posts (`status='scheduled' and scheduled_at <= now() ... for update`);
        // refuse to edit one that is about to be claimed so the two never race.
        const storedAt = locked.rows[0].scheduled_at ? new Date(locked.rows[0].scheduled_at).getTime() : NaN;
        if (storedAt <= Date.now() + 60_000) {
          await client.query("rollback");
          return {
            ok: false,
            error: "This post is about to publish and can no longer be edited.",
          };
        }
      }
      const strayTargets = await client.query(
        "select 1 from post_targets where post_id = $1 and status not in ('pending','retrying') limit 1",
        [input.draftId],
      );
      if (strayTargets.rows.length > 0) {
        await client.query("rollback");
        return {
          ok: false,
          error: "This draft can't be edited here because publishing has already started.",
        };
      }

      const postRes = await client.query<{ id: string }>(
        `update scheduled_posts set caption=$2, scheduled_at=$3, status=$4, media=$5::jsonb, dm_rule_id=$6, ig_format=$7, first_comment=$8${hasTags ? ", tags=$9" : ""}, updated_at=now() where id=$1 returning id`,
        [
          input.draftId,
          input.caption,
          scheduledAt,
          status,
          JSON.stringify(mediaItems),
          dmRuleId,
          instagramSelected ? igFormat : "feed",
          shouldPostFirstComment(igFormat, firstComment) ? firstComment : null,
          ...(hasTags ? [tags] : []),
        ],
      );
      id = postRes.rows[0]?.id;
      if (!id) {
        await client.query("rollback");
        return { ok: false, error: "Could not save post." };
      }

      await client.query("delete from post_targets where post_id = $1", [id]);
    } else {
      const postRes = await client.query<{ id: string }>(
        `insert into scheduled_posts (user_id, caption, scheduled_at, status, media, dm_rule_id, ig_format, first_comment${hasTags ? ", tags" : ""}) values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8${hasTags ? ", $9" : ""}) returning id`,
        [
          userId,
          input.caption,
          scheduledAt,
          status,
          JSON.stringify(mediaItems),
          dmRuleId,
          instagramSelected ? igFormat : "feed",
          shouldPostFirstComment(igFormat, firstComment) ? firstComment : null,
          ...(hasTags ? [tags] : []),
        ],
      );
      id = postRes.rows[0]?.id;
      if (!id) {
        await client.query("rollback");
        return { ok: false, error: "Could not save post." };
      }
    }

    const ytMetadata = youtubeSelected
      ? JSON.stringify({
          title: typeof input.ytTitle === "string" ? input.ytTitle.trim() : "",
          tags: Array.isArray(input.ytTags) ? input.ytTags.filter((t) => typeof t === "string") : [],
          privacy: input.ytPrivacy === "unlisted" || input.ytPrivacy === "private" ? input.ytPrivacy : "public",
          shorts: input.ytShorts === true,
        })
      : null;

    for (const platform of platforms) {
      const customized = Object.prototype.hasOwnProperty.call(input.overrides, platform);
      const raw = customized ? input.overrides[platform] : undefined;
      const captionOverride = customized ? raw ?? "" : null;
      // One target per picked account; none picked = one target for the oldest active account.
      const picked = pickedTargets[platform];
      const accounts: (TargetAccount | null)[] = picked && picked.length > 0 ? picked : [null];

      for (const account of accounts) {
        const accountCols = account
          ? [account.socialAccountId, account.youtubeChannelId, true]
          : [null, null, false];
        if (isNetworkId(platform)) {
          const options = normalizeNetOptions(platform, input.netOptions?.[platform]);
          await client.query(
            "insert into post_targets (post_id, platform, caption_override, net_options, social_account_id, youtube_channel_id, account_locked) values ($1, $2, $3, $4::jsonb, $5, $6, $7)",
            [id, platform, captionOverride, options ? JSON.stringify(options) : null, ...accountCols],
          );
          continue;
        }
        await client.query(
          "insert into post_targets (post_id, platform, caption_override, yt_metadata, social_account_id, youtube_channel_id, account_locked) values ($1, $2, $3, $4, $5, $6, $7)",
          [id, platform, captionOverride, platform === "youtube" ? ytMetadata : null, ...accountCols],
        );
      }
    }

    await client.query("commit");
  } catch {
    await client.query("rollback").catch(() => {});
    return { ok: false, error: "Could not save post." };
  } finally {
    client.release();
  }

  return { ok: true, id: id! };
}

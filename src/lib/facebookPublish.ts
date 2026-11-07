// Facebook Page publishing via the Graph API (self-contained logic; not wired into the publisher yet).
// Needs the 'pages_manage_posts' permission in the Meta Facebook Login for Business configuration
// (config_id); until the owner adds it, canPublishToFacebook() returns false and the publisher
// keeps Facebook disabled.

import { FB_GRAPH } from "@/lib/graphHost";

export type FbMedia = { type: "image" | "video"; url: string };

export type FbPublishOutcome =
  | { ok: true; postId: string }
  | { ok: false; error: string; tokenDead: boolean };

export const FB_PUBLISH_SCOPE = "pages_manage_posts";

/** True only for Facebook Login accounts whose saved scopes include pages_manage_posts. */
export function canPublishToFacebook(
  scopes: string[] | null | undefined,
  authType: string | null | undefined
): boolean {
  return (
    authType === "facebook_login" &&
    Array.isArray(scopes) &&
    scopes.includes(FB_PUBLISH_SCOPE)
  );
}

/**
 * Plan a Facebook post from the same media JSON shape the publisher uses
 * (array of { type: 'image' | 'video', url }; bad items are ignored).
 */
export function planFacebookPost(
  caption: string,
  media: unknown
):
  | { kind: "text" | "photo" | "album" | "video"; images: string[]; video: string | null }
  | { error: string } {
  const images: string[] = [];
  let video: string | null = null;
  if (Array.isArray(media)) {
    for (const item of media) {
      if (typeof item === "object" && item !== null) {
        const row = item as { type?: unknown; url?: unknown };
        if (row.type === "image" && typeof row.url === "string") images.push(row.url);
        else if (row.type === "video" && typeof row.url === "string" && video === null) {
          video = row.url;
        }
      }
    }
  }
  if (video !== null && images.length > 0) {
    return { error: "Facebook posts can have photos or one video, not both." };
  }
  if (video !== null) return { kind: "video", images: [], video };
  if (images.length === 1) return { kind: "photo", images, video: null };
  if (images.length > 10) return { error: "Facebook allows up to 10 photos per post." };
  if (images.length > 1) return { kind: "album", images, video: null };
  if (!caption.trim()) return { error: "Write a caption or add media." };
  return { kind: "text", images: [], video: null };
}

/** Replace the token in a message with '[token]' (same idea as cleanError in publisher.ts). */
function stripToken(message: string, token: string): string {
  const safe = token ? message.split(token).join("[token]") : message;
  return safe.slice(0, 500);
}

/** Read a non-2xx Graph response: error.message, and code 190 / HTTP 401 mean the token is dead. */
async function graphFailure(
  res: Response,
  token: string
): Promise<{ ok: false; error: string; tokenDead: boolean }> {
  let message = "";
  let code: number | undefined;
  try {
    const data = (await res.json()) as { error?: { message?: unknown; code?: unknown } };
    if (data && typeof data === "object" && data.error) {
      if (typeof data.error.message === "string") message = data.error.message;
      if (typeof data.error.code === "number") code = data.error.code;
    }
  } catch {
    // non-JSON body
  }
  return {
    ok: false,
    error: stripToken(message || `HTTP ${res.status}`, token),
    tokenDead: code === 190 || res.status === 401,
  };
}

/**
 * Publish a post to a Facebook Page with a Page access token (facebook_login accounts).
 * The token goes in the form body, never in a logged URL. Never throws.
 */
export async function publishToFacebookPage(
  pageId: string,
  pageToken: string,
  caption: string,
  media: unknown,
  fetchImpl: typeof fetch = fetch
): Promise<FbPublishOutcome> {
  const plan = planFacebookPost(caption, media);
  if ("error" in plan) return { ok: false, error: plan.error, tokenDead: false };

  const base = `${FB_GRAPH}/${encodeURIComponent(pageId)}`;
  const form = (entries: Array<[string, string]>): URLSearchParams => {
    const body = new URLSearchParams();
    for (const [key, value] of entries) body.set(key, value);
    body.set("access_token", pageToken);
    return body;
  };
  const post = (path: string, entries: Array<[string, string]>) =>
    fetchImpl(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form(entries),
    });

  try {
    if (plan.kind === "text") {
      const res = await post("/feed", [["message", caption]]);
      if (!res.ok) return graphFailure(res, pageToken);
      const data = (await res.json().catch(() => ({}))) as { post?: unknown; id?: unknown };
      const postId =
        typeof data.post === "string" ? data.post : typeof data.id === "string" ? data.id : null;
      return postId
        ? { ok: true, postId }
        : { ok: false, error: stripToken("Facebook feed post returned no id", pageToken), tokenDead: false };
    }

    if (plan.kind === "photo") {
      const res = await post("/photos", [
        ["url", plan.images[0]],
        ["caption", caption],
        ["published", "true"],
      ]);
      if (!res.ok) return graphFailure(res, pageToken);
      const data = (await res.json().catch(() => ({}))) as { post_id?: unknown; id?: unknown };
      const postId =
        typeof data.post_id === "string"
          ? data.post_id
          : typeof data.id === "string"
            ? data.id
            : null;
      return postId
        ? { ok: true, postId }
        : { ok: false, error: stripToken("Facebook photo post returned no id", pageToken), tokenDead: false };
    }

    if (plan.kind === "album") {
      const ids: string[] = [];
      for (const url of plan.images) {
        const res = await post("/photos", [
          ["url", url],
          ["published", "false"],
        ]);
        if (!res.ok) return graphFailure(res, pageToken);
        const data = (await res.json().catch(() => ({}))) as { id?: unknown };
        if (typeof data.id !== "string") {
          return {
            ok: false,
            error: stripToken("Facebook album photo returned no id", pageToken),
            tokenDead: false,
          };
        }
        ids.push(data.id);
      }
      const entries: Array<[string, string]> = [["message", caption]];
      ids.forEach((id, i) => entries.push([`attached_media[${i}]`, JSON.stringify({ media_fbid: id })]));
      const res = await post("/feed", entries);
      if (!res.ok) return graphFailure(res, pageToken);
      const data = (await res.json().catch(() => ({}))) as { post?: unknown; id?: unknown };
      const postId =
        typeof data.post === "string" ? data.post : typeof data.id === "string" ? data.id : null;
      return postId
        ? { ok: true, postId }
        : { ok: false, error: stripToken("Facebook album post returned no id", pageToken), tokenDead: false };
    }

    // video
    const res = await post("/videos", [
      ["file_url", plan.video as string],
      ["description", caption],
    ]);
    if (!res.ok) return graphFailure(res, pageToken);
    const data = (await res.json().catch(() => ({}))) as { id?: unknown };
    const postId = typeof data.id === "string" ? data.id : null;
    return postId
      ? { ok: true, postId }
      : { ok: false, error: stripToken("Facebook video post returned no id", pageToken), tokenDead: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: stripToken(`Could not reach Facebook: ${message}`, pageToken),
      tokenDead: false,
    };
  }
}

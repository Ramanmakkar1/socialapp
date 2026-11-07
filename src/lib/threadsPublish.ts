// Threads publishing via the official Threads API (self-contained logic; not wired into the
// publisher yet). Needs a Threads user id (the connected account's Threads id) and a token
// with the 'threads_publish' permission.

export const THREADS_GRAPH = "https://graph.threads.net/v1.0";

export const THREADS_CAPTION_MAX = 500;

export type ThreadsPublishOutcome =
  | { ok: true; id: string }
  | { ok: false; error: string; retryable: boolean };

const RECONNECT_MESSAGE = "Threads connection expired, reconnect Threads in Settings";
const PERMISSION_MESSAGE =
  "This Threads account does not have permission to publish. Reconnect Threads in Settings.";

/**
 * Build the form params for a Threads container (POST {threads-user-id}/threads).
 * TEXT has no media, IMAGE adds image_url, VIDEO adds video_url.
 * Throws when the text is over 500 characters or when both image and video are set.
 */
export function buildThreadsContainerParams(input: {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
}): URLSearchParams {
  if (input.imageUrl && input.videoUrl) {
    throw new Error("Threads posts can have an image or a video, not both.");
  }
  const text = input.text.trim();
  if (text.length > THREADS_CAPTION_MAX) {
    throw new Error(
      `Threads text is ${text.length - THREADS_CAPTION_MAX} characters over the ${THREADS_CAPTION_MAX} limit.`
    );
  }
  const params = new URLSearchParams();
  if (input.videoUrl) {
    params.set("media_type", "VIDEO");
    params.set("video_url", input.videoUrl);
  } else if (input.imageUrl) {
    params.set("media_type", "IMAGE");
    params.set("image_url", input.imageUrl);
  } else {
    params.set("media_type", "TEXT");
  }
  params.set("text", text);
  return params;
}

/** Replace the token in a message with '[token]' (same idea as cleanError in publisher.ts). */
function stripToken(message: string, token: string): string {
  const safe = token ? message.split(token).join("[token]") : message;
  return safe.slice(0, 500);
}

/**
 * Read a non-2xx Graph response: HTTP 429 / any 5xx are retryable; Graph code 190 (bad token)
 * and 10/200 (permissions) are not, with a plain-English message. The token never leaks out.
 */
async function graphFailure(res: Response, token: string): Promise<ThreadsPublishOutcome> {
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
  if (code === 190) return { ok: false, error: RECONNECT_MESSAGE, retryable: false };
  if (code === 10 || code === 200) return { ok: false, error: PERMISSION_MESSAGE, retryable: false };
  return {
    ok: false,
    error: stripToken(message || `HTTP ${res.status}`, token),
    retryable: res.status === 429 || res.status >= 500,
  };
}

/**
 * Publish a post to a Threads account with a Threads access token.
 * (a) POST {threads-user-id}/threads to create the container, (b) for videos poll the
 * container until FINISHED, (c) POST {threads-user-id}/threads_publish. Never throws.
 */
export async function publishToThreads(opts: {
  threadsUserId: string;
  accessToken: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  pollAttempts?: number;
}): Promise<ThreadsPublishOutcome> {
  const { threadsUserId, accessToken, text, imageUrl, videoUrl } = opts;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const sleep = opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const pollAttempts = opts.pollAttempts ?? 10;

  let params: URLSearchParams;
  try {
    params = buildThreadsContainerParams({ text, imageUrl, videoUrl });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err), retryable: false };
  }

  const form = (extra: Array<[string, string]>): URLSearchParams => {
    const body = new URLSearchParams(params);
    for (const [key, value] of extra) body.set(key, value);
    body.set("access_token", accessToken);
    return body;
  };

  try {
    // (a) create the container
    const createRes = await fetchImpl(`${THREADS_GRAPH}/${encodeURIComponent(threadsUserId)}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form([]),
    });
    if (!createRes.ok) return await graphFailure(createRes, accessToken);
    const createData = (await createRes.json().catch(() => ({}))) as { id?: unknown };
    const creationId = typeof createData.id === "string" ? createData.id : null;
    if (!creationId) {
      return {
        ok: false,
        error: stripToken("Threads container creation returned no id", accessToken),
        retryable: false,
      };
    }

    // (b) videos: poll the container until FINISHED
    if (videoUrl) {
      for (let attempt = 0; attempt < pollAttempts; attempt += 1) {
        const statusRes = await fetchImpl(
          `${THREADS_GRAPH}/${encodeURIComponent(creationId)}?fields=status,error_message&access_token=${encodeURIComponent(accessToken)}`
        );
        if (!statusRes.ok) return await graphFailure(statusRes, accessToken);
        const statusData = (await statusRes.json().catch(() => ({}))) as {
          status?: unknown;
          error_message?: unknown;
        };
        const status = typeof statusData.status === "string" ? statusData.status : undefined;
        if (status === "FINISHED") break;
        if (status === "ERROR" || status === "EXPIRED") {
          const detail =
            typeof statusData.error_message === "string" ? `: ${statusData.error_message}` : "";
          return {
            ok: false,
            error: stripToken(`Threads could not process the video (status ${status})${detail}`, accessToken),
            retryable: false,
          };
        }
        if (attempt === pollAttempts - 1) {
          return {
            ok: false,
            error: stripToken("Threads is still processing the video, try Retry in a few minutes", accessToken),
            retryable: true,
          };
        }
        await sleep(3000);
      }
    }

    // (c) text/image: short wait (Meta recommends it), then publish
    await sleep(1000);
    const publishRes = await fetchImpl(
      `${THREADS_GRAPH}/${encodeURIComponent(threadsUserId)}/threads_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form([["creation_id", creationId]]),
      }
    );
    if (!publishRes.ok) return await graphFailure(publishRes, accessToken);
    const publishData = (await publishRes.json().catch(() => ({}))) as { id?: unknown };
    const id = typeof publishData.id === "string" ? publishData.id : null;
    return id
      ? { ok: true, id }
      : { ok: false, error: stripToken("Threads publish returned no id", accessToken), retryable: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: stripToken(`Could not reach Threads: ${message}`, accessToken), retryable: true };
  }
}

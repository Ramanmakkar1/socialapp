// Server only: small HTTP helpers shared by the token networks (src/lib/networks/tokenNetworks.ts).
import { downloadMedia, obj, readBody, redact, str, type Fetch, type MediaItem } from "@/lib/networks/common";

/**
 * A user-typed server address -> "https://host[/path]" (no trailing slash), or null. Only public
 * https host names: no IP literals, ports, localhost or .local / .internal names (same rule as
 * Mastodon's normalizeInstance), so a connect form can't point the server at its own network.
 */
export function normalizeBaseUrl(input: string): string | null {
  let raw = input.trim();
  if (raw === "") return null;
  if (!raw.includes("://")) raw = `https://${raw}`;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.port || u.username || u.password) return null;
    const host = u.hostname.toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return null;
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return null;
    const path = u.pathname.replace(/\/+$/, "");
    return `https://${host}${path}`;
  } catch {
    return null;
  }
}

/** Host name of a base URL ("https://a.b/c" -> "a.b"). */
export function hostOf(base: string): string {
  try {
    return new URL(base).hostname;
  } catch {
    return base;
  }
}

export type CallResult = { ok: true; status: number; json: Record<string, unknown>; body: unknown } | { ok: false; status: number; error: string; body: unknown };

/** The most useful error text in a JSON error body. */
export function errorText(body: unknown, status: number): string {
  if (typeof body === "string") return body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200) || `HTTP ${status}`;
  const o = obj(body);
  const nested = obj(o.error);
  const errors = Array.isArray(o.errors) ? o.errors : [];
  const first = errors.length > 0 ? (typeof errors[0] === "string" ? errors[0] : str(obj(errors[0]).message)) : "";
  return (
    str(nested.message) ||
    str(o.error) ||
    str(o.message) ||
    str(o.description) ||
    str(o.detail) ||
    str(o.errcode) ||
    first ||
    `HTTP ${status}`
  );
}

/** fetch with a timeout; never throws. JSON body when there is one. */
export async function call(url: string, init: RequestInit, fetchImpl: Fetch = fetch, timeoutMs = 60_000): Promise<CallResult> {
  let res: Response;
  try {
    res = await fetchImpl(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(timeoutMs), ...init });
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err), body: null };
  }
  const body = await readBody(res);
  if (!res.ok) return { ok: false, status: res.status, error: errorText(body, res.status), body };
  return { ok: true, status: res.status, json: obj(body), body };
}

/** "<label> <what> failed: <error>" with every secret redacted; 401/403 = the token is dead. */
export function failed(label: string, what: string, r: { status: number; error: string }, ...secrets: string[]) {
  return {
    ok: false as const,
    error: redact(`${label} ${what} failed: ${r.error}`, ...secrets),
    tokenDead: r.status === 401 || r.status === 403,
  };
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export type Downloaded = { bytes: Buffer; contentType: string; filename: string; kind: MediaItem["type"] };

/** Download every media item (in order) for a multipart upload. */
export async function downloadAll(
  media: MediaItem[],
  fetchImpl: Fetch,
  maxBytes: number,
): Promise<{ ok: true; files: Downloaded[] } | { ok: false; error: string }> {
  const files: Downloaded[] = [];
  for (const [i, m] of media.entries()) {
    const d = await downloadMedia(m.url, fetchImpl, maxBytes);
    if (!d.ok) return d;
    const fallback = m.type === "video" ? "video/mp4" : "image/jpeg";
    const contentType = d.contentType.startsWith(`${m.type}/`) ? d.contentType : fallback;
    files.push({ bytes: d.bytes, contentType, filename: `poskoo-${i + 1}.${EXT[contentType] ?? (m.type === "video" ? "mp4" : "jpg")}`, kind: m.type });
  }
  return { ok: true, files };
}

export function blobOf(file: Downloaded): Blob {
  return new Blob([new Uint8Array(file.bytes)], { type: file.contentType });
}

/** Plain text -> minimal HTML paragraphs (escaped), for blogs that take HTML. */
export function textToHtml(text: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const link = (s: string) => s.replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (u) => `<a href="${u}">${u}</a>`);
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${link(esc(p)).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

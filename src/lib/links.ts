import { createHash, randomBytes } from "node:crypto";
import { BRAND } from "./brand";
import { query } from "./db";

const BASE62 =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const CODE_RE = /^[A-Za-z0-9]{6,16}$/;

export function newCode(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += BASE62[bytes[i]! % 62];
  }
  return code;
}

export async function shortLinkFor(
  userId: string,
  ruleId: string,
  targetUrl: string,
): Promise<string> {
  const rows = await query<{ code: string }>(
    `insert into socialapp.short_links (code, user_id, rule_id, target_url)
     values ($1, $2, $3, $4)
     on conflict (rule_id, target_url) do update set target_url = excluded.target_url
     returning code`,
    [newCode(), userId, ruleId, targetUrl],
  );
  const code = rows[0]?.code;
  if (!code) {
    throw new Error("short link insert failed");
  }
  return `${BRAND.url}/l/${code}`;
}

/**
 * Crawlers and link-preview fetchers (chat apps, social networks, search engines) that open a
 * short link without a person clicking it. Matched case-insensitively against the User-Agent.
 */
const BOT_UA_RE = new RegExp(
  [
    "bot\\b", "bot/", "crawler", "spider", "slurp", "preview", "facebookexternalhit", "facebookcatalog",
    "meta-externalagent", "meta-externalfetcher", "whatsapp", "slackbot", "slack-imgproxy",
    "twitterbot", "discordbot", "telegrambot", "linkedinbot", "skypeuripreview", "googlebot",
    "google-inspectiontool", "googleother", "bingbot", "bingpreview", "applebot", "baiduspider",
    "duckduckbot", "embedly", "redditbot", "vkshare", "w3c_validator", "outbrain", "quora link preview",
    "iframely", "headlesschrome", "curl/", "wget/", "python-requests", "go-http-client", "node-fetch", "axios/",
  ].join("|"),
  "i",
);

/** True for crawlers, link-preview fetchers and requests with no User-Agent at all. */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim();
  if (!ua) return true;
  return BOT_UA_RE.test(ua);
}

/** Anonymous per-link visitor key used to count unique clicks (no raw IP is stored). */
export function visitorHash(code: string, ip: string | null | undefined, userAgent: string | null | undefined): string {
  return createHash("sha256").update(`${code}|${ip ?? ""}|${userAgent ?? ""}`).digest("hex").slice(0, 32);
}

export type ClickContext = { method?: string; userAgent?: string | null; ip?: string | null };

/** Whether a request to /l/<code> should be recorded as a human click. */
export function shouldCountClick(ctx: ClickContext): boolean {
  const method = (ctx.method ?? "GET").toUpperCase();
  if (method !== "GET") return false;
  return !isBotUserAgent(ctx.userAgent);
}

/**
 * The single definition of "link clicks" used by Home, Analytics, the Auto-DM pages and the bio
 * editor: rows in link_clicks (bots and HEAD requests are never recorded). `where` filters the
 * joined short_links row `s` and click row `c`.
 */
export function clickCountSql(where: string): string {
  return `(select count(*)::int from socialapp.link_clicks c join socialapp.short_links s on s.code = c.code where ${where})`;
}

/** Unique clicks: one per visitor per link (rows recorded before visitor tracking count once each). */
export function uniqueClickCountSql(where: string): string {
  return `(select count(distinct coalesce(c.visitor_hash, c.id::text))::int from socialapp.link_clicks c join socialapp.short_links s on s.code = c.code where ${where})`;
}

export { ctrPercent, formatCtr } from "./ctr";

export async function resolveAndCount(code: string, ctx: ClickContext = {}): Promise<string | null> {
  if (!CODE_RE.test(code)) {
    return null;
  }
  const rows = await query<{ target_url: string }>(
    "select target_url from socialapp.short_links where code=$1",
    [code],
  );
  const targetUrl = rows[0]?.target_url;
  if (!targetUrl) {
    return null;
  }
  if (!shouldCountClick(ctx)) {
    return targetUrl;
  }
  try {
    await query(
      `with tracked_link as (
         update socialapp.short_links set clicks = clicks + 1 where code=$1
         returning code
       )
       insert into socialapp.link_clicks (code, visitor_hash)
       select code, $2 from tracked_link`,
      [code, visitorHash(code, ctx.ip, ctx.userAgent)],
    );
  } catch {
    console.error("Failed to record link click");
  }
  return targetUrl;
}

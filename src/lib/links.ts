import { randomBytes } from "node:crypto";
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

export async function resolveAndCount(code: string): Promise<string | null> {
  if (!CODE_RE.test(code)) {
    return null;
  }
  const rows = await query<{ target_url: string }>(
    "update socialapp.short_links set clicks = clicks + 1 where code=$1 returning target_url",
    [code],
  );
  const targetUrl = rows[0]?.target_url;
  if (!targetUrl) {
    return null;
  }
  await query(
    "insert into socialapp.link_clicks (code) values ($1)",
    [code],
  );
  return targetUrl;
}

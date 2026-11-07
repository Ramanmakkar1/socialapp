import { createHmac, timingSafeEqual } from "node:crypto";

export function metaConfig(): {
  verifyToken: string;
  appSecret: string;
  /** Secrets Meta may sign with: the Meta app (Facebook Login for Business) and, for accounts
   *  connected with the older Instagram Login, the Instagram app secret. */
  appSecrets: string[];
} {
  const appSecret = process.env.META_APP_SECRET ?? "";
  const igSecret = process.env.INSTAGRAM_APP_SECRET ?? "";
  return {
    verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN ?? "",
    appSecret,
    appSecrets: [appSecret, igSecret].filter((s, i, all) => s !== "" && all.indexOf(s) === i),
  };
}

/** X-Hub-Signature-256 check against any of the app secrets. */
export function verifyAnySignature(rawBody: string, signatureHeader: string | null, appSecrets: string[]): boolean {
  return appSecrets.some((secret) => verifySignature(rawBody, signatureHeader, secret));
}

export function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
): boolean {
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) {
    return false;
  }
  const expected = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  const received = signatureHeader.slice(7);
  try {
    const a = Buffer.from(received, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

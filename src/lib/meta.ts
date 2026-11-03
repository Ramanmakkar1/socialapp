import { createHmac, timingSafeEqual } from "node:crypto";

export function metaConfig(): {
  verifyToken: string;
  appSecret: string;
} {
  return {
    verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN ?? "",
    appSecret: process.env.META_APP_SECRET ?? "",
  };
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

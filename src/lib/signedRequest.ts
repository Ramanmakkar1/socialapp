// Meta "signed_request" parsing for the deauthorize and data-deletion callbacks.
// Format: base64url(signature) + "." + base64url(JSON payload); signature = HMAC-SHA256(payload part, app secret).
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type SignedRequestPayload = {
  user_id: string;
  algorithm?: string;
  issued_at?: number;
  [key: string]: unknown;
};

function b64urlDecode(part: string): Buffer {
  return Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

// Returns the payload when the signature is valid, otherwise null. Never throws.
export function parseSignedRequest(signedRequest: string, appSecret: string): SignedRequestPayload | null {
  if (!appSecret || typeof signedRequest !== "string") return null;
  const dot = signedRequest.indexOf(".");
  if (dot <= 0 || dot === signedRequest.length - 1) return null;
  const sigPart = signedRequest.slice(0, dot);
  const payloadPart = signedRequest.slice(dot + 1);
  try {
    const received = b64urlDecode(sigPart);
    const expected = createHmac("sha256", appSecret).update(payloadPart, "utf8").digest();
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
    const payload = JSON.parse(b64urlDecode(payloadPart).toString("utf8")) as Record<string, unknown>;
    if (typeof payload !== "object" || payload === null) return null;
    const algorithm = typeof payload.algorithm === "string" ? payload.algorithm.toUpperCase() : "HMAC-SHA256";
    if (algorithm !== "HMAC-SHA256") return null;
    const userId = payload.user_id;
    if ((typeof userId !== "string" && typeof userId !== "number") || String(userId) === "") return null;
    return { ...payload, user_id: String(userId) } as SignedRequestPayload;
  } catch {
    return null;
  }
}

// Meta posts signed_request as a form field; accept JSON too.
export async function readSignedRequest(request: Request): Promise<string> {
  const raw = await request.text();
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    try {
      const body = JSON.parse(raw) as { signed_request?: unknown };
      return typeof body.signed_request === "string" ? body.signed_request : "";
    } catch {
      return "";
    }
  }
  return new URLSearchParams(raw).get("signed_request") ?? "";
}

export function newConfirmationCode(): string {
  return randomBytes(9).toString("base64url");
}

// For tests and local tooling.
export function signRequest(payload: Record<string, unknown>, appSecret: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", appSecret).update(body, "utf8").digest("base64url");
  return `${sig}.${body}`;
}

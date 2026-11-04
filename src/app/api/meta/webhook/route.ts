import {
  extractCommentEvents,
  processCommentEvents,
} from "@/lib/comments";
import {
  extractMessageEvents,
  processMessageEvents,
} from "@/lib/messages";
import { isDbConfigured, query } from "@/lib/db";
import { metaConfig, verifySignature } from "@/lib/meta";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const { verifyToken } = metaConfig();
  if (
    mode === "subscribe" &&
    token &&
    challenge &&
    verifyToken &&
    token === verifyToken
  ) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const sig = request.headers.get("x-hub-signature-256");
  const { appSecret } = metaConfig();
  if (!verifySignature(raw, sig, appSecret)) {
    return new Response("Invalid signature", { status: 403 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return Response.json({ received: true });
  }

  if (isDbConfigured()) {
    try {
      const object =
        typeof body === "object" &&
        body !== null &&
        "object" in body &&
        typeof (body as { object?: unknown }).object === "string"
          ? (body as { object: string }).object
          : null;
      await query(
        "insert into socialapp.events (source, type, payload) values ($1, $2, $3::jsonb)",
        ["meta", object, JSON.stringify(body)],
      );
    } catch (err) {
      console.error("meta webhook db insert failed", err);
    }
    try {
      const n = await processCommentEvents(extractCommentEvents(body));
      if (n) console.log("queued DMs", n);
    } catch (err) {
      console.error("comment processing failed", err);
    }
    try {
      const m = await processMessageEvents(extractMessageEvents(body));
      if (m) console.log("contacts updated from DMs", m);
    } catch (err) {
      console.error("message processing failed", err);
    }
  }

  return Response.json({ received: true });
}

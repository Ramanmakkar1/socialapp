// Meta "Deauthorize callback URL": called when a user removes the app from Instagram.
import { disconnectAccounts, findAccountIdsByMetaUser } from "@/lib/accountData";
import { isDbConfigured } from "@/lib/db";
import { igConfig } from "@/lib/instagram";
import { parseSignedRequest, readSignedRequest } from "@/lib/signedRequest";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = parseSignedRequest(await readSignedRequest(request), igConfig().appSecret);
  if (!payload) {
    return Response.json({ error: "invalid signed_request" }, { status: 400 });
  }
  if (!isDbConfigured()) {
    return Response.json({ error: "not configured" }, { status: 503 });
  }
  try {
    const ids = await findAccountIdsByMetaUser(payload.user_id);
    const disconnected = await disconnectAccounts(ids);
    return Response.json({ success: true, disconnected });
  } catch (err) {
    console.error("instagram deauthorize failed", err instanceof Error ? err.message : "unknown error");
    return Response.json({ error: "server error" }, { status: 500 });
  }
}

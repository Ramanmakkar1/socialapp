// Meta "Data Deletion Request URL": deletes the user's connected-account data and returns a status link + code.
import { deleteAccountData, findAccountIdsByMetaUser, hashExternalId } from "@/lib/accountData";
import { BRAND } from "@/lib/brand";
import { isDbConfigured, query } from "@/lib/db";
import { metaConfig } from "@/lib/meta";
import { newConfirmationCode, parseSignedRequestAny, readSignedRequest } from "@/lib/signedRequest";

export async function POST(request: Request) {
  const payload = parseSignedRequestAny(await readSignedRequest(request), metaConfig().appSecrets);
  if (!payload) {
    return Response.json({ error: "invalid signed_request" }, { status: 400 });
  }
  if (!isDbConfigured()) {
    return Response.json({ error: "not configured" }, { status: 503 });
  }
  const code = newConfirmationCode();
  try {
    await query(
      "insert into socialapp.data_deletion_requests (code, platform, external_id_hash, status) values ($1, 'instagram', $2, 'received')",
      [code, hashExternalId(payload.user_id)]
    );
    const ids = await findAccountIdsByMetaUser(payload.user_id);
    const deleted = await deleteAccountData(ids);
    await query(
      "update socialapp.data_deletion_requests set status=$2, accounts_deleted=$3, completed_at=now() where code=$1",
      [code, deleted > 0 ? "completed" : "not_found", deleted]
    );
  } catch (err) {
    // The request stays "received" and is finished by hand (privacy policy promises 30 days).
    console.error("instagram data deletion failed", err instanceof Error ? err.message : "unknown error");
  }
  return Response.json({
    url: `${BRAND.url}/data-deletion/status?code=${encodeURIComponent(code)}`,
    confirmation_code: code,
  });
}

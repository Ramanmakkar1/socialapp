import { cleanAlt, deleteAssets, getAssets, libraryQuotaBytes, libraryUsage, listAssets, updateAssetAlt, viewOf, type ListFilter } from "@/lib/mediaLibrary";
import { planForUser } from "@/lib/planLimits";
import { asOwnerUser, getWorkspaceContext, roleAtLeast } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = new Set(["image", "video", "gif", "all"]);

function baseUrlOf(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

/**
 * The current WORKSPACE's media library (never another workspace's: the owner id comes from the
 * session's re-checked membership, src/lib/workspace.ts).
 * GET ?q=&kind=image|video|gif|all&offset=&ids=a,b  -> { items, usage, quota }
 */
export async function GET(request: Request) {
  const ctx = await getWorkspaceContext();
  if (!ctx) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const owner = asOwnerUser(ctx);
  const sp = new URL(request.url).searchParams;
  const kind = sp.get("kind") ?? "all";
  const ids = (sp.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const filter: ListFilter = {
    q: sp.get("q") ?? "",
    kind: (KINDS.has(kind) ? kind : "all") as ListFilter["kind"],
    offset: Number(sp.get("offset") ?? 0) || 0,
    limit: Number(sp.get("limit") ?? 60) || 60,
  };
  const base = baseUrlOf(request);
  const [items, usage, plan] = await Promise.all([
    ids.length > 0 ? getAssets(owner.id, ids) : listAssets(owner.id, filter),
    libraryUsage(owner.id).catch(() => 0),
    planForUser(owner.id),
  ]);
  return Response.json({ items: items.map((a) => viewOf(a, base)), usage, quota: libraryQuotaBytes(plan) });
}

/** PATCH { id, alt } -> update an asset's alt text. Any role can describe media. */
export async function PATCH(request: Request) {
  const ctx = await getWorkspaceContext();
  if (!ctx) return Response.json({ error: "Please sign in again." }, { status: 401 });
  let body: { id?: unknown; alt?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const ok = await updateAssetAlt(ctx.ownerId, id, cleanAlt(body.alt));
  return ok ? Response.json({ ok: true, alt: cleanAlt(body.alt) }) : Response.json({ error: "File not found." }, { status: 404 });
}

/** DELETE { ids } -> soft delete. Owners/admins delete anything; members only their own uploads. */
export async function DELETE(request: Request) {
  const ctx = await getWorkspaceContext();
  if (!ctx) return Response.json({ error: "Please sign in again." }, { status: 401 });
  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string").slice(0, 200) : [];
  if (ids.length === 0) return Response.json({ error: "Pick at least one file." }, { status: 400 });
  const admin = roleAtLeast(ctx.role, "admin");
  const result = await deleteAssets(ctx.ownerId, ids, (a) => admin || a.uploadedBy === ctx.user.id, baseUrlOf(request));
  return Response.json({ ok: true, ...result });
}

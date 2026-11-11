// Link-in-bio page builder: one public page per user at /@handle.
// Links are tracked through the existing short_links table, so a click on a bio
// link goes through /l/<code> and increments the same counters as auto-DM links.
import { getPool, query } from "@/lib/db";
import { newCode } from "@/lib/links";
import { PLAN_LIMITS, planForUser } from "@/lib/planLimits";
import {
  BIO_HANDLE_RE,
  normalizeHandle,
  planBioLinkChanges,
  themeFor,
  validateBioPage,
  type BioLinkRow,
  type BioPage,
  type BioPageInput,
} from "@/lib/bioPageShared";

export {
  BIO_HANDLE_RE,
  BIO_MAX_BIO,
  BIO_MAX_LABEL,
  BIO_MAX_LINKS,
  BIO_MAX_NAME,
  BIO_THEMES,
  normalizeHandle,
  planBioLinkChanges,
  themeFor,
  validateBioPage,
  validateHandle,
  type BioLinkInput,
  type BioLinkPlan,
  type BioLinkRow,
  type BioPage,
  type BioPageInput,
  type BioTheme,
} from "@/lib/bioPageShared";

export async function saveBioPage(userId: string, input: BioPageInput): Promise<{ handle: string }> {
  const error = validateBioPage(input);
  if (error) throw new Error(error);
  const plan = planForUser();
  const maxLinks = PLAN_LIMITS[plan].bioLinks;
  if (input.links.length > maxLinks) {
    throw new Error(`The ${plan} plan includes ${maxLinks} links on your bio page. Remove a link to save.`);
  }
  const handle = normalizeHandle(input.handle);
  const displayName = input.displayName.trim();
  const bio = input.bio.trim();
  const avatarUrl = input.avatarUrl?.trim() || null;
  const theme = themeFor(input.theme).id;
  const published = input.published !== false;

  const client = await getPool().connect();
  try {
    await client.query("begin");
    const pageRows = await client.query<{ id: string }>(
      `insert into socialapp.bio_pages (user_id, handle, display_name, bio, avatar_url, theme, published)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (user_id) do update set
         handle = excluded.handle,
         display_name = excluded.display_name,
         bio = excluded.bio,
         avatar_url = excluded.avatar_url,
         theme = excluded.theme,
         published = excluded.published,
         updated_at = now()
       returning id`,
      [userId, handle, displayName, bio, avatarUrl, theme, published],
    );
    const pageId = pageRows.rows[0]?.id;
    if (!pageId) throw new Error("bio page save failed");

    const existingRows = await client.query<BioLinkRow>(
      `select l.id, l.label, l.url, l.sort_order, l.short_code, (select count(*)::int from socialapp.link_clicks c where c.code = l.short_code) as clicks
       from socialapp.bio_links l
       where l.page_id = $1
       order by l.sort_order, l.created_at`,
      [pageId],
    );
    const plan = planBioLinkChanges(existingRows.rows, input.links);

    for (const link of plan.updates) {
      await client.query(
        "update socialapp.bio_links set label=$2, url=$3, sort_order=$4 where id=$1 and page_id=$5",
        [link.id, link.label, link.url, link.sortOrder, pageId],
      );
      if (link.shortCode) {
        // Keep the same code and its click count; only the destination changes.
        await client.query("update socialapp.short_links set target_url=$2 where code=$1", [link.shortCode, link.url]);
      } else {
        const code = newCode();
        await client.query("insert into socialapp.short_links (code, user_id, target_url) values ($1, $2, $3)", [
          code,
          userId,
          link.url,
        ]);
        await client.query("update socialapp.bio_links set short_code=$2 where id=$1", [link.id, code]);
      }
    }

    for (const link of plan.inserts) {
      const code = newCode();
      await client.query("insert into socialapp.short_links (code, user_id, target_url) values ($1, $2, $3)", [
        code,
        userId,
        link.url,
      ]);
      await client.query(
        "insert into socialapp.bio_links (page_id, label, url, sort_order, short_code) values ($1, $2, $3, $4, $5)",
        [pageId, link.label, link.url, link.sortOrder, code],
      );
    }

    for (const id of plan.deletes) {
      const removed = await client.query<{ short_code: string | null }>(
        "delete from socialapp.bio_links where id=$1 and page_id=$2 returning short_code",
        [id, pageId],
      );
      const code = removed.rows[0]?.short_code;
      if (code) {
        await client.query("delete from socialapp.short_links where code=$1", [code]);
      }
    }

    await client.query("commit");
    return { handle };
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "23505") {
      throw new Error("That handle is already taken. Please pick another one.");
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function getBioPage(userId: string): Promise<BioPage | null> {
  try {
    const pages = await query<Omit<BioPage, "links">>(
      `select id, user_id, handle, display_name, bio, avatar_url, theme, published
       from socialapp.bio_pages where user_id=$1`,
      [userId],
    );
    const page = pages[0];
    if (!page) return null;
    const links = await query<BioLinkRow>(
      `select l.id, l.label, l.url, l.sort_order, l.short_code, (select count(*)::int from socialapp.link_clicks c where c.code = l.short_code) as clicks
       from socialapp.bio_links l
       where l.page_id = $1
       order by l.sort_order, l.created_at`,
      [page.id],
    );
    return { ...page, links };
  } catch {
    // Migration 032 not applied yet: behave like a user with no page.
    return null;
  }
}

export async function getPublicBioPage(handle: string): Promise<BioPage | null> {
  const normalized = normalizeHandle(handle);
  if (!BIO_HANDLE_RE.test(normalized)) return null;
  try {
    const pages = await query<Omit<BioPage, "links">>(
      `select id, user_id, handle, display_name, bio, avatar_url, theme, published
       from socialapp.bio_pages where handle=$1 and published=true`,
      [normalized],
    );
    const page = pages[0];
    if (!page) return null;
    const links = await query<BioLinkRow>(
      `select l.id, l.label, l.url, l.sort_order, l.short_code, (select count(*)::int from socialapp.link_clicks c where c.code = l.short_code) as clicks
       from socialapp.bio_links l
       where l.page_id = $1
       order by l.sort_order, l.created_at`,
      [page.id],
    );
    return { ...page, links };
  } catch {
    return null;
  }
}

export type BioPost = { id: string; caption: string; imageUrl: string | null };

export async function getLatestPosts(userId: string, limit = 6): Promise<BioPost[]> {
  const rows = await query<{ id: string; caption: string; media: unknown }>(
    `select id, caption, media from socialapp.scheduled_posts
     where user_id=$1 and status='published'
     order by coalesce(scheduled_at, updated_at) desc
     limit $2`,
    [userId, Math.min(Math.max(limit, 1), 12)],
  );
  return rows.map((row) => {
    let imageUrl: string | null = null;
    if (Array.isArray(row.media)) {
      for (const item of row.media) {
        if (typeof item === "object" && item !== null) {
          const media = item as { type?: unknown; url?: unknown };
          if (media.type === "image" && typeof media.url === "string" && media.url) {
            imageUrl = media.url;
            break;
          }
        }
      }
    }
    return { id: row.id, caption: row.caption, imageUrl };
  });
}

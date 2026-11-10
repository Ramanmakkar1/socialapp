"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getPool, isDbConfigured } from "@/lib/db";
import type { PoolClient } from "pg";
import {
  cleanMediaUrls,
  ideaInsertStatement,
  ideaUpdateStatement,
  normalizeIdeaStatus,
  normalizeTags,
  shouldReplaceTags,
} from "@/lib/ideas";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SaveIdeaInput = {
  ideaId?: string;
  text: string;
  mediaUrls?: string[];
  status?: string;
  tags?: string[];
};

type SaveIdeaResult = { ok: true; id: string } | { ok: false; error: string };

async function replaceTags(
  client: PoolClient,
  ideaId: string,
  userId: string,
  tags: string[],
): Promise<void> {
  await client.query("delete from socialapp.idea_tags where idea_id = $1", [ideaId]);
  for (const name of tags) {
    const tagRes = await client.query(
      "insert into socialapp.tags (user_id, name) values ($1, $2) on conflict (user_id, name) do update set name = excluded.name returning id",
      [userId, name],
    );
    const tagId = tagRes.rows[0]?.id;
    if (!tagId) continue;
    await client.query(
      "insert into socialapp.idea_tags (idea_id, tag_id) values ($1, $2) on conflict do nothing",
      [ideaId, tagId],
    );
  }
}

export async function saveIdea(input: SaveIdeaInput): Promise<SaveIdeaResult> {
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }
  if (input.ideaId !== undefined && !UUID_RE.test(input.ideaId)) {
    return { ok: false, error: "Invalid idea." };
  }

  const user = await requireUser();
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const mediaUrls = cleanMediaUrls(input.mediaUrls);
  if (!text && mediaUrls.length === 0) {
    return { ok: false, error: "Add some text or media to the idea." };
  }
  const status = normalizeIdeaStatus(input.status);
  const tags = normalizeTags(input.tags);

  let client;
  try {
    client = await getPool().connect();
  } catch {
    return { ok: false, error: "Could not save idea. Please try again." };
  }

  let id: string | undefined;
  try {
    await client.query("begin");
    if (input.ideaId) {
      const statement = ideaUpdateStatement({
        ideaId: input.ideaId,
        userId: user.id,
        text,
        mediaUrls,
        status,
      });
      const result = await client.query<{ id: string }>(statement.text, statement.params);
      id = result.rows[0]?.id;
      if (!id) {
        await client.query("rollback");
        return { ok: false, error: "That idea wasn't found. It may have been deleted." };
      }
    } else {
      const statement = ideaInsertStatement({ userId: user.id, text, mediaUrls, status });
      const result = await client.query<{ id: string }>(statement.text, statement.params);
      id = result.rows[0]?.id;
      if (!id) {
        await client.query("rollback");
        return { ok: false, error: "Could not save idea." };
      }
    }

    // An empty tag box must not delete the tags already saved on the idea.
    if (shouldReplaceTags(tags)) {
      await replaceTags(client, id, user.id, tags);
    }

    await client.query("commit");
  } catch {
    await client.query("rollback").catch(() => {});
    return { ok: false, error: "Could not save idea." };
  } finally {
    client.release();
  }

  revalidatePath("/app/calendar");
  return { ok: true, id: id! };
}

export async function deleteIdea(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return { ok: false, error: "Invalid idea." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }
  const user = await requireUser();
  try {
    const client = await getPool().connect();
    try {
      await client.query("delete from socialapp.ideas where id = $1 and user_id = $2", [id, user.id]);
    } finally {
      client.release();
    }
    revalidatePath("/app/calendar");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete idea." };
  }
}

export async function moveIdea(id: string, status: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return { ok: false, error: "Invalid idea." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }
  const user = await requireUser();
  try {
    const client = await getPool().connect();
    try {
      await client.query(
        "update socialapp.ideas set status = $3, updated_at = now() where id = $1 and user_id = $2",
        [id, user.id, normalizeIdeaStatus(status)],
      );
    } finally {
      client.release();
    }
    revalidatePath("/app/calendar");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not move idea." };
  }
}

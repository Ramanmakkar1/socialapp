/**
 * Isolated DB fixture for savePost atomic insert (task #2390).
 * Run: node scripts/save-post-atomic-fixture.mjs  (requires DATABASE_URL)
 */
import pg from "pg";

const FIXTURE_USER_ID = "aaaaaaaa-2390-4000-8000-000000002390";
const FIXTURE_EMAIL = "fixture-save-post-2390@example.com";
const MEDIA = JSON.stringify([
  { type: "image", url: "https://example.com/fixture-2390.jpg" },
]);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — skip fixture");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url,
  max: 3,
  ssl:
    process.env.DATABASE_SSL === "false"
      ? false
      : { rejectUnauthorized: false },
});

async function ensureUser(client) {
  await client.query("SET search_path TO socialapp, public");
  await client.query(
    `insert into users (id, email, password_hash)
     values ($1, $2, 'fixture')
     on conflict (email) do update set email = excluded.email`,
    [FIXTURE_USER_ID, FIXTURE_EMAIL],
  );
}

async function countPostAndTargets(client, postId) {
  const post = await client.query(
    "select id from scheduled_posts where id = $1",
    [postId],
  );
  const targets = await client.query(
    "select platform from post_targets where post_id = $1",
    [postId],
  );
  return { posts: post.rowCount, targets: targets.rowCount };
}

/** Mirrors savePost transaction in calendar/actions.ts */
async function savePostAtomic(client, { forceTargetFailure = false } = {}) {
  const scheduledAt = new Date(Date.now() + 3_600_000);
  await client.query("begin");
  let postId;
  try {
    const postRes = await client.query(
      `insert into scheduled_posts (user_id, caption, scheduled_at, status, media, dm_rule_id, ig_format, first_comment)
       values ($1, $2, $3, 'scheduled', $4::jsonb, null, 'feed', null) returning id`,
      [FIXTURE_USER_ID, "fixture caption", scheduledAt, MEDIA],
    );
    postId = postRes.rows[0]?.id;
    if (!postId) {
      await client.query("rollback");
      return { ok: false, postId: null };
    }
    await client.query(
      "insert into post_targets (post_id, platform, caption_override) values ($1, $2, null)",
      [postId, "instagram"],
    );
    if (forceTargetFailure) {
      await client.query(
        "insert into post_targets (post_id, platform, caption_override) values ($1, $2, null)",
        [postId, "instagram"],
      );
    }
    await client.query("commit");
    return { ok: true, postId };
  } catch {
    await client.query("rollback").catch(() => {});
    return { ok: false, postId: postId ?? null };
  }
}

try {
  const writer = await pool.connect();
  try {
    await ensureUser(writer);

    const ok = await savePostAtomic(writer);
    if (!ok.ok || !ok.postId) throw new Error("success case: save failed");
    const afterOk = await countPostAndTargets(writer, ok.postId);
    if (afterOk.posts !== 1 || afterOk.targets !== 1) {
      throw new Error(
        `success case: expected 1 post + 1 target, got ${afterOk.posts}/${afterOk.targets}`,
      );
    }
    await writer.query("delete from scheduled_posts where id = $1", [ok.postId]);
    console.log("pass: successful save creates post and targets");

    const bad = await savePostAtomic(writer, { forceTargetFailure: true });
    if (bad.ok) throw new Error("rollback case: expected failure");
    if (bad.postId) {
      const orphan = await countPostAndTargets(writer, bad.postId);
      if (orphan.posts !== 0) {
        throw new Error("rollback case: orphan scheduled_posts row left behind");
      }
    }
    console.log("pass: target insert failure rolls back post");

    const tx = await pool.connect();
    const observer = await pool.connect();
    let openPostId;
    try {
      await ensureUser(tx);
      await tx.query("begin");
      const ins = await tx.query(
        `insert into scheduled_posts (user_id, caption, scheduled_at, status, media, ig_format)
         values ($1, 'uncommitted', now() + interval '1 hour', 'scheduled', $2::jsonb, 'feed') returning id`,
        [FIXTURE_USER_ID, MEDIA],
      );
      openPostId = ins.rows[0].id;
      await ensureUser(observer);
      const peek = await observer.query(
        "select id from scheduled_posts where id = $1",
        [openPostId],
      );
      if (peek.rowCount !== 0) {
        throw new Error("visibility case: observer saw uncommitted post");
      }
      await tx.query("rollback");
      const afterRollback = await observer.query(
        "select id from scheduled_posts where id = $1",
        [openPostId],
      );
      if (afterRollback.rowCount !== 0) {
        throw new Error("visibility case: post visible after rollback");
      }
      console.log("pass: uncommitted post not visible to other connection");
    } finally {
      tx.release();
      observer.release();
    }

    console.log("\nAll save-post atomic fixture cases passed.");
  } finally {
    writer.release();
  }
} finally {
  await pool.end();
}

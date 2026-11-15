import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// page.tsx and FirstSessionChecklist.tsx are client/server components that pull
// in next/font and CSS modules, so they cannot be imported in a node:test
// process. Read the source instead and lock the completion contract.
const pageSource = readFileSync("src/app/app/page.tsx", "utf8");
const checklistSource = readFileSync("src/app/app/FirstSessionChecklist.tsx", "utf8");
const statsSource = readFileSync("src/lib/stats.ts", "utf8");

test("a draft alone does not complete the first-session checklist", () => {
  // postCreated is the "create a post" signal and includes drafts, so the
  // dashboard must also require a scheduled/publishing/published post before
  // hiding the checklist.
  assert.ok(
    pageSource.includes("const checklistDone = channelConnected && postCreated && stats.hasScheduledPost && hasActiveComment && hasScheduledMedia;"),
    "checklistDone must require stats.hasScheduledPost and the media milestone, not just postCreated",
  );
  assert.ok(
    pageSource.includes("postScheduled={stats.hasScheduledPost}"),
    "the schedule step must receive the scheduled/publishing/published signal",
  );
  assert.ok(
    pageSource.includes("select exists(select 1 from socialapp.scheduled_posts where user_id=$1) as n"),
    "postCreated must keep counting drafts so the create-post step can complete",
  );
});

test("hasScheduledPost only counts scheduled, publishing or published posts", () => {
  assert.ok(
    statsSource.includes(
      "status in ('scheduled','publishing','published')) as \"hasScheduledPost\"",
    ),
    "hasScheduledPost must exclude draft posts",
  );
});

test("checklist copy distinguishes creating a post from scheduling it", () => {
  assert.ok(
    checklistSource.includes('{ label: "Create a post", detail: "Compose a caption and add media.", href: "/app/calendar?compose=1", done: postCreated }'),
    "create-post step must use postCreated and its own copy",
  );
  assert.ok(
    checklistSource.includes('{ label: "Schedule it", detail: "Pick a date and time on the calendar.", href: "/app/calendar", done: postScheduled }'),
    "schedule step must use postScheduled and its own copy",
  );
});

test("the Auto-DM step requires an active rule with an explicit comment trigger", () => {
  const fnSource = pageSource.slice(
    pageSource.indexOf("async function hasActiveCommentRule"),
    pageSource.indexOf("// Active comment rules with their post scope"),
  );
  assert.ok(fnSource.includes("'comment' = any(triggers)"), "hasActiveCommentRule must require an explicit comment trigger");
  assert.ok(
    !fnSource.includes("cardinality(triggers)=0") && !fnSource.includes("triggers is null"),
    "rules without a comment trigger must not complete the Auto-DM step",
  );
  assert.ok(
    checklistSource.includes('href: "/app/auto-dm"'),
    "the Auto-DM step must link to /app/auto-dm",
  );
  assert.ok(
    checklistSource.includes("done: hasActiveCommentRule"),
    "the Auto-DM step must use the active comment rule signal",
  );
});

test("the scheduler milestone follows Auto-DM and requires a scheduled post with media", () => {
  const autoDmIndex = checklistSource.indexOf('href: "/app/auto-dm"');
  const milestoneIndex = checklistSource.indexOf('label: "Schedule a post with media"');
  assert.ok(autoDmIndex > -1 && milestoneIndex > autoDmIndex, "the media milestone must come after the Auto-DM step");
  assert.ok(
    checklistSource.includes("done: postWithMedia"),
    "the media milestone must use the scheduled-post-with-media signal",
  );
  assert.ok(
    pageSource.includes("hasScheduledPostWithMedia(user.id)"),
    "the dashboard must derive the media milestone from existing post data",
  );
  assert.ok(
    pageSource.includes("jsonb_array_length(media) > 0"),
    "the media milestone must require at least one media item",
  );
  assert.ok(
    checklistSource.includes("DISMISS_KEY") && checklistSource.includes("Dismiss first-session checklist"),
    "the checklist must stay dismissible",
  );
});

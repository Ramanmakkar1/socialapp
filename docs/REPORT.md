# Poskoo features round: report (2026-11-06)

Branch `zcode-redesign-2026-11-06`. Redesign kept; only new states were added with the shared kit.
Checks at the end: `npx tsc --noEmit -p .` passes, `npm test` passes (224 tests), `npx eslint` is clean on
every changed file. `next build` was NOT run here (node_modules is a junction); the supervisor builds on the server.

`npm test` is new: `npx --yes tsx@4 --test "src/**/*.test.ts" src/lib/rewind.test.mjs` (Node test runner).
Tests are colocated in `src/lib/*.test.ts`; test-only helpers are in `src/test-utils/` (fake pg pool and an
in-memory model of the DM tables). No npm packages were added.

## Known bugs a-k

| Bug | Status | Fix | Test |
|---|---|---|---|
| a. Posts stuck in "publishing" | Fixed | Publisher claims the post row (`status='publishing'`) and its targets in one transaction; claims older than 20 min are failed with "Publishing was interrupted... check Instagram, then Retry" (never auto-reposted, so no double posts) | `publisher.test.ts` |
| b. Delete while publishing | Fixed | Guarded single-statement delete (draft/scheduled/failed only, no target publishing/published) + clear message | `postMutations.test.ts` |
| c. Reschedule after claim / state change | Fixed | Guarded update: status scheduled/draft, all targets still pending, scheduled_at unchanged since read | `postMutations.test.ts` |
| d. Draft by URL / switching drafts | Fixed | Composer state is built from the draft as lazy initial state (`composerStateFromDraft`), component keyed by draft id | `composerDraft.test.ts` |
| e. Draft time shifts across time zones | Fixed | Stored UTC instant is kept when the time field is untouched (DST-ambiguous times, seconds); edited times are read in the browser zone and must round-trip | `composerDraft.test.ts` |
| f. DM cooldown not persisted | Fixed | Manual Inbox replies / private replies now check and set `social_accounts.dm_cooldown_until` (the send queue already did) | `dmCooldown.test.ts` |
| g. Failed follower checks acknowledged | Fixed | Unanswered check -> durable `follow_check` queue row; the send worker re-checks with backoff, then fails with a clear reason | `messages.test.ts`, `sender.test.ts` |
| h. Duplicate gated-link replies | Fixed | `ON CONFLICT DO NOTHING` + unique index (migration 015) on top of the advisory lock. Also: a failed 24-h window lookup no longer rolls back DMs already sent in the same run (that could re-send them) | `messages.test.ts` ("concurrent webhooks...") |
| i. Follow-up unlocks the wrong rule | Fixed | The reply is matched to the latest gate prompt actually sent to that person and not yet unlocked | `messages.test.ts` |
| j. Replayed comments lose their time | Fixed | Comment time is carried from Graph `timestamp` / webhook entry time into `dm_queue.created_at` (7-day window measured correctly) | `comments.test.ts`, `rewind.test.mjs` |
| k. Returning lead, second automation | Fixed | Same matching as (i); a lead whose email is already known gets an email-only automation's link directly | `messages.test.ts`, `comments.test.ts` |

## Features checked (and fixed)

- **Auth**: sign up / log in / log out / 30-day DB sessions / `/app/*` redirect to `/login` (layout `requireUser`) - OK.
  New: rate limit on log in (10 per email+IP, 50 per IP / 15 min) and sign up (5 per IP / hour) (`rateLimit.test.ts`).
  "Forgot password" goes to `/contact#password-reset` (support e-mail); there is no e-mail sending, so no self-service reset yet.
- **Onboarding**: "Connect Instagram" now needs an *active* Instagram account; a post being published counts as scheduled.
- **Calendar / composer**: create, edit draft, schedule, reschedule (desktop drag + "Reschedule" date control for touch), duplicate,
  delete, retry - guarded as above. Scheduling now requires a connected Instagram account (drafts still save). Media is entered as
  public https links (.jpg/.png/.mp4/.mov, max 10, no mixed carousels, one item for Stories); there is no file upload in the app.
- **Publisher**: claims once (SKIP LOCKED), records the result, recovers interrupted runs, never re-posts automatically.
- **Auto-DM rules**: create/edit/pause/delete with validation (1000-char limit incl. gate text, https links).
  New: emoji keywords match (`match.test.ts`); the **story-reply trigger now works** (it could be chosen but nothing handled it).
- **Send queue**: per-account hourly budget (180/h), persisted cooldown, retries with backoff, 24-h / 7-day windows, follower re-checks.
- **Inbox**: thread list, replies in the 24-h window with a clear message outside it, inbound de-duplicated by message id,
  unsent reply kept in sessionStorage; a sent DM is no longer shown as failed when only the DB record fails.
- **Leads**: filters, 50/page, CSV export now via `leadsCsv.ts`: formula-injection safe, UTF-8 BOM, `created_at_utc` plus a
  local-time column in the browser time zone (`leadsCsv.test.ts`). The export caps at 10,000 rows (shown in the UI).
- **Plan limits (server-side)**: `src/lib/planLimits.ts` (numbers tested against `plans.ts`, prices untouched). Everyone is on Free:
  10 scheduled posts per UTC month (save, reschedule into another month, retry) and 500 automated DMs per UTC month (send worker).
- **Settings**: "Connecting Instagram is not switched on yet" state when no Meta/Instagram keys are set; disconnect and brand voice
  show friendly errors. Time zone: the app uses the browser's time zone everywhere (no stored per-user zone).
- **Hardening**: past-comment replay only shows its own messages; one log line with the record id per failure in changed code.
- **Free tools, help, legal, 404/500**: unchanged; existing unit tests pass. Contact is a mailto (no server form).
- **E-mails**: the app sends none.

## Not finished / for the owner

- **Plan limit "2 social accounts" is NOT enforced**: it belongs in the Instagram OAuth callback, which was off limits this round.
- **No file upload / aspect-ratio check** for media: only link validation (Instagram rejects bad ratios at publish time with a clear error).
- **Forgot password** is a support-email path only (needs an e-mail provider for self-service reset).
- Touch devices move posts with the "Reschedule" date control, not drag (HTML5 drag-and-drop is desktop only).
- `next build` must be run by the supervisor.

## Migration

`db/migrations/015_dm_idempotency_and_indexes.sql` (new): renames any duplicate `gated_link` rows to `gated_link_duplicate`,
adds the unique index `dm_queue_gated_link_once`, and indexes for the new queries. The code works without it
(`ON CONFLICT DO NOTHING` is a no-op without the index), so it can run before or after the deploy. Run it with `npm run db:migrate`.

## Cron schedule (all `POST` with header `x-cron-secret: $CRON_SECRET`)

| Route | Schedule | Notes |
|---|---|---|
| `/api/jobs/publish-posts` | every minute | also recovers interrupted runs (>20 min). A run can take several minutes (video processing): use a 15-minute request timeout; overlapping runs are safe (SKIP LOCKED) |
| `/api/jobs/send-dms` | every minute | overlapping runs are safe (per-account advisory lock); also runs follower re-checks |
| `/api/jobs/refresh-tokens` | once a day (e.g. 03:17 UTC) | refreshes Instagram Login tokens expiring within 10 days |
| `/api/jobs/refresh-insights` | every 6 hours | post insights for recently published posts |

## Env vars

No new ones. See `docs/ENV-NEEDED.md` (note: `META_APP_ID` and `META_LOGIN_CONFIG_ID` are used by the code but missing from `.env.example`).

## Meta / Instagram code (not changed, notes only)

- Callback / connect / Graph host / webhook subscription untouched. The webhook signature check stays on.
- Webhook *parsing* of messages now also reads `message.reply_to.story` (story-reply automations).
- `src/lib/insights.ts` passes the token as a query parameter and has no fetch timeout; worth aligning with `igGraph.ts` during the Meta migration.

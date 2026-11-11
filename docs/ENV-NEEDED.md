# Environment variables

New on 2026-11-11 (subscriptions): `STRIPE_BILLING_WEBHOOK_SECRET`, `STRIPE_TAX_ENABLED`, `STRIPE_PORTAL_CONFIGURATION_ID` (Poskoo Pro / Agency billing; migration 043). See "Subscription billing" below.

New on 2026-11-11 (later): TikTok, LinkedIn, Pinterest and X keys (`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`,
`LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`, `X_CLIENT_ID`,
`X_CLIENT_SECRET`, optional `LINKEDIN_API_VERSION`, `LINKEDIN_COMPANY_PAGES`, `PINTEREST_SANDBOX`). Bluesky and
Mastodon need no keys. Needs migration `040_more_networks.sql`. See "More networks" below.

New on 2026-11-11 (e-mail): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `EMAIL_POSTAL_ADDRESS`, `EMAIL_NEW_DEVICE_ALERTS` (transactional e-mail; migration 041). See "Transactional e-mail" below.
New on 2026-11-11: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (unused for now), `PLATFORM_FEE_BPS` (creator products via Stripe Connect; migrations 034-036).
New on 2026-11-06: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Sign in with Google, see docs/REPORT-meta-google.md). The app reads these (see `.env.example`):

| Variable | Needed for | Notes |
|---|---|---|
| `DATABASE_URL`, `DATABASE_SSL` | everything | Postgres, schema `socialapp` |
| `TOKEN_ENCRYPTION_KEY` | Instagram tokens | 32-byte base64 |
| `CRON_SECRET` | `/api/jobs/*` | sent as header `x-cron-secret` |
| `NEXT_PUBLIC_SITE_URL` | links, OAuth redirects, tracked links | |
| `META_APP_ID`, `META_APP_SECRET`, `META_LOGIN_CONFIG_ID` | Facebook Login for Business (Instagram connect) | `META_APP_ID` / `META_LOGIN_CONFIG_ID` are read by `src/lib/metaLogin.ts` but are missing from `.env.example` |
| `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN` | `/api/meta/webhook` | without them the webhook answers 403 (signature check stays on) |
| `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` | Instagram Login (older flow) only | deauthorize / data-deletion / webhook now also accept `META_APP_SECRET` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Sign in with Google | button hidden unless both are set; needs migration 016 |
| `REVIEWER_EMAIL`, `REVIEWER_PASSWORD` | optional Meta App Review demo login | |
| `ANTHROPIC_API_KEY`, `AI_MODEL` | optional AI caption helper | |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN`, `NEXT_PUBLIC_ANALYTICS_SRC` | optional analytics | |
| `SITE_INDEXABLE` | keep unset (noindex until launch) | |
| `STRIPE_SECRET_KEY` | Products / Orders / Stripe Connect onboarding / checkout | platform key (restricted `rk_` key recommended; needs v2 Accounts write (`v2_account_storer_write`), Account Links + login links write, Checkout Sessions write on connected accounts). Without it Products, Orders and Settings show "Payments are not switched on yet" |
| `STRIPE_WEBHOOK_SECRET` | `/api/stripe/webhook` | `whsec_...` of that endpoint (a **Connected accounts** endpoint, see below); without it the webhook answers 503 |
| `STRIPE_CONNECT_PREVIEW_API_VERSION` | optional | API version sent only on connected-account creation (Express Dashboard + Managed Risk is a Stripe public preview). Default `2026-10-28.preview`; set it when Stripe publishes a newer preview string |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | not used yet | Checkout is Stripe-hosted; reserved for embedded components |
| `PLATFORM_FEE_BPS` | platform fee per sale | basis points, default `300` (3%) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | all e-mail (reset codes, verification, welcome, orders, alerts) | unset = nothing is sent: production logs only subject + masked recipient; development prints the whole e-mail (codes, links) to the server console. `SMTP_SECURE` defaults to `true` on port 465 |
| `EMAIL_FROM`, `EMAIL_REPLY_TO` | sender | default `Poskoo <hello@poskoo.com>`; reply-to optional |
| `EMAIL_POSTAL_ADDRESS` | e-mail footer | optional postal address line after "Town Media Labs" |
| `EMAIL_NEW_DEVICE_ALERTS` | "new login" e-mail | on by default; `false` turns it off |

While no Instagram/Meta app keys are set, Settings shows "Connecting Instagram is not switched on yet",
scheduling asks to connect first (drafts still save), and Inbox / Analytics show their connect states.

## Stripe Connect model and webhook setup (2026-11-11)

Poskoo uses **Stripe Managed Risk + direct charges**. Each creator's connected account (Accounts v2)
is created with `defaults.responsibilities.fees_collector = stripe`, `losses_collector = stripe`,
`configuration.merchant.capabilities.card_payments.requested = true` and `dashboard = express`
(created with the preview API version above). The creator is the merchant of record and pays
Stripe's processing fees; Stripe carries negative-balance losses; Poskoo only receives the
application fee (`PLATFORM_FEE_BPS`, 3% by default) on each Checkout Session, which is created
ON the connected account (`Stripe-Context: acct_...`).

Platform prerequisites (Dashboard): Connect enabled with Managed Risk; Radar enabled for connected
accounts (Managed Risk requirement); Stripe-hosted onboarding is used, so nothing else is needed.

**Webhook endpoint (one per mode, test and live):** Workbench / Developers -> Webhooks -> Add destination

- Events from: **Connected accounts** (NOT "Your account"). Direct-charge payments, refunds and
  disputes happen on the creators' accounts, so a "Your account" endpoint never receives them.
- Payload style: **Snapshot** (classic v1 events). API version: the account default is fine.
- URL: `<NEXT_PUBLIC_SITE_URL>/api/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `charge.refunded`
  - `charge.dispute.created`
  - `charge.dispute.closed`
- Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.

The handler takes the connected account from `event.account` (or `event.context`), looks up the
creator in `stripe_accounts`, and ignores events from the platform account itself or from unknown
accounts. Account status (charges/payouts enabled) is NOT webhook driven: it is re-read from Stripe
when the creator returns from onboarding and when Settings/Products is opened while not fully
enabled. If push updates are wanted later, add a separate **v2 thin-event** destination
(`v2.core.account[configuration.merchant].capability_status_updated`,
`v2.core.account[requirements].updated`) with its own secret and handler; it is not required now.

## Transactional e-mail (2026-11-11)

Code: `src/lib/email.ts` (SMTP via nodemailer, 10 s cap, never throws), templates in
`src/lib/emailTemplates.ts` (images in `public/email/`, loaded from `NEXT_PUBLIC_SITE_URL/email/...`, so
that URL must be the live public site), notifications in `src/lib/emailNotify.ts`. Run migration
`041_email_auth.sql` (`email_codes`, `email_sends`). Preview every e-mail in development at
`/api/dev/email-preview` (404 in production).

Suggested setup (Hostinger mailbox hello@poskoo.com):

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=hello@poskoo.com
SMTP_PASS=<mailbox password>
EMAIL_FROM=Poskoo <hello@poskoo.com>
```

DNS for poskoo.com (so mail lands in the inbox, not spam). Take the exact values from hPanel ->
Emails -> poskoo.com -> DNS / "Connect domain":

- SPF (TXT on `@`): `v=spf1 include:_spf.mail.hostinger.com ~all` (one SPF record only; merge if one exists).
- DKIM: the CNAME/TXT records hPanel shows (`hostingermail-a._domainkey` etc.).
- DMARC (TXT on `_dmarc`): start with `v=DMARC1; p=none; rua=mailto:hello@poskoo.com`, move to `p=quarantine` once reports are clean.
- MX records as hPanel lists them (needed to receive replies at hello@poskoo.com).

Any other SMTP provider (Postmark, Resend SMTP, SES, Brevo) works with the same variables. For
higher volume use a transactional provider rather than a mailbox.

## Media storage on the app server (2026-11-11)

Code: `src/lib/mediaStorage.ts` (disk), `src/lib/mediaLimits.ts` (ONE table of per-file limits by plan
and network), `src/lib/mediaLifecycle.ts` (delete after publish, quota). Run migration
`042_media_lifecycle.sql` (adds `post_targets.media_hold_until`, `scheduled_posts.media_released_at`).

| Variable | Default | What it does |
|---|---|---|
| `MEDIA_STORAGE_DIR` | `/data/poskoo-media` | Folder for uploads (one sub-folder per user). |
| `MEDIA_URL_SECRET` | falls back to `TOKEN_ENCRYPTION_KEY` / `CRON_SECRET` | Signs the media URLs the networks fetch. |
| `MEDIA_MIN_FREE_GB` | `20` | Uploads get a friendly 503 when they would leave less than this free on the media disk; a warning is logged under 2x. The admin overview shows folder size and free space. |

Behaviour: files are deleted as soon as every target of their post has published (a ≤480px poster
`<id>.thumb.jpg` stays for the calendar); failed / pending posts keep them for Retry; files not attached
to any post are deleted after 7 days by the daily `refresh-tokens` job. Only files waiting to be posted
count toward the plan's storage (Free 2 GB, Pro 20 GB, Agency 100 GB).

### Moving the media folder to a new disk (e.g. the 2 TB drive)

1. Format and mount the drive on the host, for example at `/mnt/media2tb`, and add it to `/etc/fstab`
   (use the UUID from `blkid`, options `defaults,nofail`) so it survives reboots.
2. Create the folder: `sudo mkdir -p /mnt/media2tb/poskoo-media`.
3. Copy the existing files out of the named volume while the app keeps running:
   `docker run --rm -v poskoo_poskoo-media:/from -v /mnt/media2tb/poskoo-media:/to alpine sh -c "cp -a /from/. /to/"`
   (check the exact volume name with `docker volume ls | grep poskoo-media`).
4. In `docker-compose.yml`, replace the named volume with a bind mount:
   `- /mnt/media2tb/poskoo-media:/data/poskoo-media` (and remove `poskoo-media:` under `volumes:`).
   `MEDIA_STORAGE_DIR` stays `/data/poskoo-media` inside the container, so stored URLs keep working.
5. The current Dockerfile runs the app as root, so no `chown` is needed. If a `USER` line is added later,
   `chown` the folder to that uid (`docker compose exec app id`).
6. `docker compose up -d` (recreates the container), then run the copy once more with `cp -an` to pick up
   files uploaded during the switch. Upload a test image and open it.
7. When everything works, remove the old volume: `docker volume rm poskoo_poskoo-media`.


## More networks: TikTok, Bluesky, Mastodon, LinkedIn, Pinterest, X (2026-11-11)

Code: `src/lib/networks/*` (one file per network + `registry.ts`, `publish.ts`, `refresh.ts`, `routes.ts`),
routes `src/app/api/<network>/{connect,callback}`, Connect dialog `src/app/app/ConnectChannelDialog.tsx`.
Run `npm run db:migrate` (migration **040_more_networks.sql**) before switching any of them on.
Without keys a network's card in "Connect a New Channel" shows **Not set up yet**; Bluesky and Mastodon are always on.
Every redirect URI below uses `NEXT_PUBLIC_SITE_URL` (production: `https://poskoo.com`).

| Network | Env vars | Redirect URI to register | Scopes / products |
|---|---|---|---|
| TikTok | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | `<site>/api/tiktok/callback` | Login Kit (web) + Content Posting API; scopes `user.info.basic`, `video.publish`, `video.upload` |
| LinkedIn | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` (`LINKEDIN_API_VERSION` optional, default `202605`; `LINKEDIN_COMPANY_PAGES=1` only after Community Management approval) | `<site>/api/linkedin/callback` | Products "Sign In with LinkedIn using OpenID Connect" + "Share on LinkedIn"; scopes `openid profile email w_member_social` (+ `w_organization_social r_organization_admin` with the flag) |
| Pinterest | `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET` (`PINTEREST_SANDBOX=1` while on Trial access) | `<site>/api/pinterest/callback` | `boards:read`, `pins:write`, `user_accounts:read` |
| X | `X_CLIENT_ID`, `X_CLIENT_SECRET` (OAuth 2.0 client id/secret, app type "Web App, Confidential client") | `<site>/api/x/callback` | OAuth 2.0 with PKCE; `tweet.read tweet.write users.read offline.access media.write` |
| Mastodon | none | `<site>/api/mastodon/callback` (registered automatically per server via `POST /api/v1/apps`) | `read:accounts write:statuses write:media` |
| Bluesky | none | none (handle + app password, stored encrypted) | - |

Owner steps per developer portal:

- **TikTok** (developers.tiktok.com): add Login Kit + Content Posting API (enable **Direct Post**), set the
  redirect URI above, add the three scopes. Verify the media URL prefix `<site>/api/media/` (or the domain) under
  Content Posting API -> "Manage URL properties" so TikTok can use PULL_FROM_URL (the
  `public/tiktok*.txt` site-verification file is already in place). Without it Poskoo falls back to
  FILE_UPLOAD for videos automatically; **photo posts only work with a verified domain**. Until the app passes
  TikTok's **audit**, TikTok only accepts posts from private accounts with visibility "Only me"
  (`SELF_ONLY`); Poskoo shows that exact message when TikTok returns
  `unaudited_client_can_only_post_to_private_accounts`. The audit needs a screen recording of the composer's TikTok
  section (creator name, visibility picker with no default, interaction toggles, disclosure toggles, consent text).
  Web Login Kit does not use PKCE (TikTok only uses PKCE for desktop/mobile); the flow is protected by `state`.
- **LinkedIn** (linkedin.com/developers): app linked to a Company Page, products "Sign In with LinkedIn using
  OpenID Connect" and "Share on LinkedIn" (both self-serve). Access tokens last 60 days; refresh tokens only exist
  if LinkedIn enabled programmatic refresh for the app, otherwise members reconnect every 60 days (Poskoo flags it).
  Company pages need the **Community Management API** product (separate review); then set `LINKEDIN_COMPANY_PAGES=1`.
  Video posts are not supported yet (text + images only).
- **Pinterest** (developers.pinterest.com): create the app, add the redirect URI. New apps get **Trial access**:
  pins can only be created in the sandbox (`PINTEREST_SANDBOX=1`); request **Standard access** (demo video of the
  flow) to publish for real. Image pins only (single image or 2-5 image carousel).
- **X** (developer.x.com): project + app, User authentication settings: OAuth 2.0, Web App (confidential),
  callback above, website URL. Posting and media upload need a paid **API plan / credits**; without them X answers
  402 and Poskoo says so. Access tokens last 2 hours and are refreshed automatically (`offline.access`).

Tokens: TikTok (access ~2-24 h, refresh up to 365 days, rotating), X (2 h, rotating refresh), Bluesky (session JWTs,
renewed with the stored app password), Pinterest (30 days, continuous refresh) are refreshed right before publishing
and by the daily `/api/jobs/refresh-tokens` job; dead tokens mark the channel "Reconnect".


## Google Business Profile (GBP) posting (2026-11-11)

Code: `src/lib/networks/gbp.ts` (OAuth, locations, localPosts), `src/lib/networks/gbpConnect.ts` (location picker),
routes `/api/gbp/connect` + `/api/gbp/callback`, picker step in `ConnectChannelDialog.tsx`, composer panel in
`calendar/NetworkOptionsPanel.tsx`, preview card in `calendar/PostPreview.tsx`. Migration **044_google_business_profile.sql**.
Each connected location is one channel (counts toward the plan's account limit).

| | |
|---|---|
| Redirect URI | `https://poskoo.com/api/gbp/callback` (`<NEXT_PUBLIC_SITE_URL>/api/gbp/callback`) |
| Scope | `https://www.googleapis.com/auth/business.manage` (offline access, refresh token, PKCE) |
| Option A: reuse the Sign-in-with-Google client | Set `GBP_ENABLED=1`. In the same Google Cloud OAuth client (`GOOGLE_CLIENT_ID/SECRET`) add the redirect URI above, and add the `business.manage` scope to the OAuth consent screen (it is a sensitive scope: Google verification of the consent screen is needed for public use). |
| Option B: separate client | Create a new OAuth client (Web application) with the redirect URI above and set `GBP_CLIENT_ID`, `GBP_CLIENT_SECRET` (these win over the Google sign-in client; no `GBP_ENABLED` needed). |

Without `GBP_ENABLED=1` or `GBP_CLIENT_ID`, the Connect dialog shows Google Business Profile as "Not set up yet".

**Request API access (required, Google approves it manually):**
1. In the Google Cloud project of the OAuth client, enable **My Business Account Management API**,
   **My Business Business Information API** and **Google My Business API** (the v4 API that still serves
   `localPosts`). Until access is approved their quota is 0.
2. Fill in the **Google Business Profile API access request** form (Google Business Profile APIs ->
   "Request access to the API", https://developers.google.com/my-business/content/prereqs#request-access) with the
   project number, a business that has a verified profile managed for 60+ days, and the use case ("schedule posts for
   the user's own locations").
3. After approval the quota becomes 300 QPM. Before that Google answers 403 (API not enabled / not used in project)
   or 429 (quota 0); Poskoo shows "Google Business Profile posting is waiting for Google's approval" in the Connect
   dialog and on failed posts.

Posts: Update (STANDARD), Offer (title, dates, coupon code, redeem link, terms) and Event (title, dates, optional
times); summary up to 1,500 characters; optional button (Book, Order online, Buy, Learn more, Sign up, Call now);
one JPG/PNG photo (10 KB-5 MB, at least 250x250) taken from the post's public `/api/media/...` URL. Access tokens
last 1 hour and are refreshed before publishing (Google refresh tokens do not rotate).

**Facebook personal profiles and Groups** cannot be supported: Meta removed `publish_actions` (profile posting) in
2018 and the Groups API in 2024. The Connect dialog's Facebook card says "Page" and has a short note.

## Subscription billing: Pro / Agency (2026-11-11)

Code: `src/lib/billing.ts` (Checkout, portal, sync), `src/lib/billingState.ts` (pure rules: lookup keys,
`planFromBilling`, 7-day past_due grace), `src/lib/billingWebhook.ts` + `/api/stripe/billing-webhook`,
page `/app/settings/billing`, setup script `scripts/stripe-setup-billing.mjs`. Table `billing_subscriptions`
(migration `043_billing.sql`); webhook idempotency reuses `stripe_events`. Everything runs on the PLATFORM
account (no connected accounts). `planForUser(userId)` reads the table: active/trialing = paid plan,
past_due = paid plan for 7 days after the first failure, anything else = Free. Downgrades never delete data.

| Variable | Needed for | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | everything billing | same platform key as Connect; a restricted key needs write on Customers, Checkout Sessions, Customer Portal sessions + configurations, read on Prices/Products/Subscriptions/Invoices (the setup script also needs Products + Prices write) |
| `STRIPE_BILLING_WEBHOOK_SECRET` | `/api/stripe/billing-webhook` | `whsec_...` of the **Your account** endpoint (separate from `STRIPE_WEBHOOK_SECRET`); unset = 503 |
| `STRIPE_TAX_ENABLED` | optional | `true` adds `automatic_tax` to subscription Checkout. Only after Stripe Tax has a head-office address AND an active registration, otherwise no tax is collected |
| `STRIPE_PORTAL_CONFIGURATION_ID` | optional | default: the configuration tagged `metadata.poskoo=poskoo_billing_portal_v1` by the setup script |

Production setup (live mode), in order:

1. Deploy the code and run migrations (`npm run db:migrate`, applies `043_billing.sql`).
2. Create the catalog + portal with the LIVE key (the script refuses a live key without `--live`):
   `STRIPE_SECRET_KEY=sk_live_... SITE_URL=https://poskoo.com node scripts/stripe-setup-billing.mjs --live`
   It creates products `poskoo_pro` / `poskoo_agency`, prices with lookup keys `poskoo_pro_monthly` ($17),
   `poskoo_pro_yearly` ($168), `poskoo_agency_monthly` ($35), `poskoo_agency_yearly` ($348), USD, and a Customer
   Portal configuration (switch between the 4 prices: upgrades charged now prorated, downgrades and
   yearly->monthly at period end; cancel at period end with reason; update card; invoice history;
   return URL `https://poskoo.com/app/settings/billing?portal=1`). Safe to re-run.
3. Workbench / Developers -> Webhooks -> Add destination: Events from **Your account**, Snapshot payload,
   URL `https://poskoo.com/api/stripe/billing-webhook`, events `checkout.session.completed`,
   `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.paid`, `invoice.payment_failed`. Put its signing secret in `STRIPE_BILLING_WEBHOOK_SECRET`.
4. Dashboard -> Settings -> Billing -> Subscriptions and emails: turn on Smart Retries (dunning) and
   "Email customers about successful payments / failed payments" if Stripe receipts are wanted
   (Poskoo's own e-mails say Stripe sends the receipt). Customer emails: successful payments on.
5. Tax decision: Stripe Tax is OFF by default. To collect tax, set the head-office address, add the
   registrations you need (Dashboard -> Tax), then set `STRIPE_TAX_ENABLED=true`. Prices were created
   without `tax_behavior`, so the account's default tax behavior applies (set it in Tax settings first).
6. Test once in live mode with a real card and refund it from the Dashboard.


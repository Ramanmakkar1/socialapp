# Environment variables

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

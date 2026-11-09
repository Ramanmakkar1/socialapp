# Poskoo Admin: design system

Owner: Raman, 2026-11-09. The visual reference is `docs/admin/admin-mockup.html`. Open it in a browser and match it.
Every admin page (`/admin/**`) follows these rules. They are **Poskoo's own brand**, never a copy of another product.

## 1. Brand tokens (already in `src/app/globals.css`; never hard-code other colours)

| Use | Token |
|---|---|
| Page background | `--poskoo-paper` #fffcf6 |
| Cards, sidebar, tables | `--poskoo-card` #fff |
| Text / headings | `--poskoo-ink` #1e1631 |
| Secondary text | `--poskoo-muted` #5f5873 |
| Borders, dividers | `--poskoo-line` #ece6da |
| Primary action, active nav icon, key numbers | `--poskoo-coral` #ff6a3d |
| Links, focus ring, selected rows | `--poskoo-violet` #6b4eff |
| Soft backgrounds, active nav, hover | `--poskoo-band` #f3eeff |
| Status: ok / paid / active | `--poskoo-mint` bg + `--poskoo-green` text |
| Status: warning / trial / expiring | `--poskoo-peach` bg + #8a4b00 text |
| Status: error / failed / suspended | #fde4e5 bg + `--poskoo-red` text |
| Status: info / free plan | `--poskoo-lilac` bg + ink text |
| Highlight (new, celebratory) | `--poskoo-lime` |

The font is Instrument Sans (`--font-instrument-sans`). Headings use weight 700, letter-spacing -0.03em. Numbers use `font-variant-numeric: tabular-nums`.

## 2. Layout

- **Admin shell** (`src/app/admin/layout.tsx`, its own `admin.module.css`):
  - **Left sidebar**, 248 px, white with a right border.
    - Top: the Poskoo logo plus an **"Admin"** pill (ink background, white text, 11 px, uppercase).
    - Nav groups, each with a small uppercase title:
      - **Monitor**: Overview, System
      - **Customers**: Users, Billing
      - **Content**: Posts & queue, Automations
      - **Control**: Settings, Audit log
    - The active item has a band background with a coral icon.
    - Bottom: the admin's email, "Back to app" and Log out.
  - **Top bar**, 64 px, white with a bottom border:
    - the page title on the left
    - a global search in the middle ("Search users, emails, @handles", ⌘K hint)
    - an environment pill on the right (green "Live" / peach "Stripe test mode")
  - **Content**: max-width 1400 px, 28 px padding, a 24 px gap between sections.
- **Phones (< 900 px)**: the sidebar becomes a top bar with a horizontal pill nav (the same pattern as `/app`). Tables scroll horizontally inside their card, never the page.

## 3. Components (build them once in `src/app/admin/ui/` and reuse them)

- **KpiCard**: white card, 20 px radius, `--poskoo-shadow-card`. Inside: a 12 px uppercase muted label, a 30 px bold value, and a delta chip (▲ green / ▼ red, "vs previous 30 days"). Optional sparkline: inline SVG, coral line with a 10% coral area fill.
- **Panel**: a card with a header row (16 px bold title, muted subtitle, right-side actions) and a body.
- **DataTable**:
  - sticky header (12 px uppercase muted, band background), 52 px rows, hover band, zebra off
  - left-aligned text, right-aligned numbers, avatar + name + email stacked in the first column
  - a row click opens the detail page, and the row ends with a "⋯" actions menu
  - pagination "1–25 of 1,240" with prev/next
  - empty state: an illustration-free friendly line plus one action
- **StatusPill**: 24 px high, 999 px radius, 12 px semibold, colours from §1.
- **PlatformBadge**: a 16 px icon in brand colours (Instagram #d62976, Facebook #1877f2, Threads #000, YouTube #f00, TikTok #000) plus the handle.
- **Buttons**:
  - Primary: coral, white text, 12 px radius, 40 px high.
  - Secondary: white with a line border.
  - Danger: white with red text and a red border; it opens a **ConfirmDialog** where the admin types the user's email to confirm.
- **Tabs** (user detail): underline style, coral 2 px underline on the active tab.
- **Charts**: inline SVG, no heavy chart library.
  - Line or area for signups and revenue; stacked bars for post status (published mint, scheduled lilac, failed red).
  - Axis text is 11 px muted, and every chart has an accessible `aria-label` summary.

## 4. Pages

1. **Overview**:
   - Row 1: 6 KpiCards: Users, New users (30 d), Paid users, MRR, Connected channels, Posts published (30 d).
   - Row 2: Signups per day (line, 2/3 width) + Plan mix (donut or bars, 1/3).
   - Row 3: Posts by status per day (stacked bars) + Auto-DMs sent per day (line).
   - Row 4: "Needs attention" list (failed posts, expiring tokens, failed payments, webhook errors), each with a link, + "Recent signups" table (10 rows).
2. **Users**:
   - Filter bar: search, plan, status, platform, signup date.
   - DataTable columns: User · Plan · Status · Channels (badges) · Posts (30 d) · DMs (30 d) · Last active · Joined · ⋯.
3. **User detail**:
   - Header card: avatar initial, name, email, plan pill, status pill, joined date. Actions on the right: View as user (primary), Change plan, Suspend, ⋯ (more).
   - Tabs: Overview · Channels · Posts · Automations · Billing · Activity · Danger zone.
4. **View as user**: the user's real `/app` with a fixed 44 px **coral banner** on top: "👁 Viewing as name@email · read-only · Exit view".
5. **System**: health cards (Publisher, DM queue, Webhooks, Tokens, Database), each with a green/peach/red dot and the last-run time, plus a table of failures with a Retry button.
6. **Billing, Settings, Audit log**: the same Panel + DataTable patterns. Settings uses toggle rows (label, help text, switch on the right).

## 5. Quality bar

- Numbers are formatted: 1,240 · $2,431 · 12.4%. Dates are relative ("3 h ago") with the exact date in a `title` tooltip.
- Loading states are skeleton blocks; errors are inline with a "Try again" button. Never show a blank page.
- Keyboard: visible violet focus ring, Esc closes dialogs, tables are reachable by Tab.
- No secrets are ever shown (tokens are masked as `••••1234`).
- Check the page at 1440 px, 1024 px and 390 px wide.

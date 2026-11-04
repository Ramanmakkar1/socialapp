import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Instagram auto DM not working? Fix it step by step",
  description:
    `Troubleshoot ${BRAND.name} comment-to-DM: Instagram connection, message access, active rules, keyword match, follow and email gates, send queue timing, and reconnect.`,
  alternates: { canonical: "/help/instagram-auto-dm-not-working" },
};

const faqs = [
  {
    q: "Why is my auto-DM rule not sending?",
    a: `Check that Instagram is connected in Settings, the rule status is Active (a paused rule attached to a scheduled post only switches on once that post publishes), comment is enabled as a trigger, and the comment matches your keyword using the rule's contains or exact match type.`,
  },
  {
    q: "What is the difference between exact and contains keyword match?",
    a: "Exact match fires only when the normalized comment text equals the keyword, for example a comment that is just GUIDE. Contains match fires when the keyword appears as its own word in the comment, for example I want the GUIDE please matches GUIDE but GUIDE123 does not.",
  },
  {
    q: "Why did someone get a message but not the link?",
    a: "If follow gate is on, the first DM asks them to follow and reply done before the link is queued. If email gate is on, they must reply with an email address in the DM thread before the link is sent.",
  },
  {
    q: "How long until a DM actually sends?",
    a: "Comments are queued right away, but sending runs through a worker queue with retries and per-account send budgeting. Most DMs go out within a few minutes, not instantly, especially if earlier sends are still in the queue.",
  },
  {
    q: "Why did the same person not get another DM on a second comment?",
    a: "Each Instagram comment is queued at most once. A second comment on another post still needs to match an active rule; duplicate follow nudges and gated links are also capped per contact and rule.",
  },
  {
    q: "Settings shows Reconnect needed — what now?",
    a: "Your Instagram token expired or was revoked. Open Settings, tap Reconnect, and sign in through Meta again so webhooks and the send queue can keep working.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Instagram auto DM not working? Fix it step by step",
  description: metadata.description,
  dateModified: "2026-11-04",
  author: { "@type": "Organization", name: BRAND.company },
  publisher: { "@type": "Organization", name: BRAND.company, url: BRAND.url },
  mainEntityOfPage: `${BRAND.url}/help/instagram-auto-dm-not-working`,
};

export default function InstagramAutoDmNotWorkingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg">
              <Zap className="h-4 w-4" />
            </span>
            {BRAND.name}
          </Link>
          <Link href="/signup" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">
            Start free
          </Link>
        </div>
      </header>
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/help" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Help center
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Instagram auto DM not working?
          </h1>
          <p className="mt-3 text-ink-2">
            Walk through this checklist in order. Each step reflects how {BRAND.name} actually processes comments, gates,
            and the send queue.
          </p>

          <ol className="mt-10 list-none space-y-8">
            <li className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-lg font-semibold">1. Instagram Business or Creator, connected in Settings</h2>
              <p className="mt-2 text-sm text-ink-2">
                Auto-DM only runs for a professional Instagram account linked to your user. In{" "}
                <Link href="/app/settings" className="font-medium text-brand hover:underline">
                  Settings
                </Link>
                , use <strong className="font-medium text-ink">Connect Instagram</strong> and finish Meta&apos;s login. The
                account row should show Connected, not Reconnect needed.
              </p>
            </li>

            <li className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-lg font-semibold">2. Allow access to messages in Instagram</h2>
              <p className="mt-2 text-sm text-ink-2">
                In the Instagram app, open your professional account settings, then message controls (Connected tools). Turn
                on <strong className="font-medium text-ink">Allow access to messages</strong> for the connected app so
                Meta can deliver comment and DM webhooks and send replies.
              </p>
            </li>

            <li className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-lg font-semibold">3. Make sure the rule is Active</h2>
              <p className="mt-2 text-sm text-ink-2">
                In{" "}
                <Link href="/app/auto-dm" className="font-medium text-brand hover:underline">
                  Auto-DM
                </Link>
                , the rule status must be <strong className="font-medium text-ink">Active</strong> (paused rules are
                skipped). Comment must be selected as a trigger. If you paused a rule and attached it to a scheduled post in
                the calendar, it switches on automatically when that post publishes.
              </p>
              <p className="mt-2 text-sm text-ink-2">
                Put the keyword in that post&apos;s caption so people comment the word you are listening for. If several
                active rules share keywords, the oldest rule wins — use distinct keywords when you run multiple automations.
              </p>
            </li>

            <li className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-lg font-semibold">4. Match type: exact vs contains</h2>
              <p className="mt-2 text-sm text-ink-2">
                <strong className="font-medium text-ink">Exact</strong> — the whole comment (after normalizing mentions and
                punctuation) must equal the keyword. Example: keyword <code className="rounded bg-surface-2 px-1">GUIDE</code>{" "}
                matches a comment that is only <code className="rounded bg-surface-2 px-1">guide</code>, not{" "}
                <code className="rounded bg-surface-2 px-1">send me the guide</code>.
              </p>
              <p className="mt-2 text-sm text-ink-2">
                <strong className="font-medium text-ink">Contains</strong> — the keyword must appear as its own word.
                Example: <code className="rounded bg-surface-2 px-1">GUIDE</code> matches{" "}
                <code className="rounded bg-surface-2 px-1">Need the GUIDE please</code> but not{" "}
                <code className="rounded bg-surface-2 px-1">GUIDE123</code>.
              </p>
            </li>

            <li className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-lg font-semibold">5. Follow gate and email gate</h2>
              <p className="mt-2 text-sm text-ink-2">
                With <strong className="font-medium text-ink">follow gate</strong>, the first DM explains that they should
                follow you and reply <code className="rounded bg-surface-2 px-1">done</code> (or reply with email if both
                gates are on). The link is queued only after {BRAND.name} confirms they follow your account.
              </p>
              <p className="mt-2 text-sm text-ink-2">
                With <strong className="font-medium text-ink">email gate</strong>, they must reply in the DM thread with an
                email address. {BRAND.name} extracts it from their message and then queues the link DM.
              </p>
            </li>

            <li className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-lg font-semibold">6. Queue timing and per-contact limits</h2>
              <p className="mt-2 text-sm text-ink-2">
                Matching comments enqueue a send job immediately, but delivery runs in the background with retries and
                per-account send budgeting. Expect most messages within a few minutes, not the second the comment is posted.
              </p>
              <p className="mt-2 text-sm text-ink-2">
                Each comment is sent at most once. Gated links send once per contact and rule; follow reminders send at most
                twice per contact and rule when someone still has not followed.
              </p>
            </li>

            <li className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-lg font-semibold">7. Expired token → Reconnect needed</h2>
              <p className="mt-2 text-sm text-ink-2">
                If Settings shows <strong className="font-medium text-ink">Reconnect needed</strong>, Instagram stopped
                accepting the stored token. Tap Reconnect and sign in through Meta before testing again.
              </p>
            </li>
          </ol>

          <section className="mt-12">
            <h2 className="text-xl font-semibold">FAQ</h2>
            <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
              {faqs.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                  <p className="mt-2 text-sm text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <p className="mt-10 text-sm text-ink-2">
            Still stuck?{" "}
            <Link href="/app" className="font-medium text-brand hover:underline">
              Open your dashboard
            </Link>{" "}
            to review rules, the calendar, and Settings.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

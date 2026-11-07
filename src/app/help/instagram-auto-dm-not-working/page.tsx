import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

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

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: `${BRAND.url}/` },
  { name: "Help", url: `${BRAND.url}/help` },
  { name: "Instagram auto DM not working", url: `${BRAND.url}/help/instagram-auto-dm-not-working` },
]);

const checks = [
  "Instagram Business or Creator, connected in Settings",
  "Allow access to messages in Instagram",
  "Make sure the rule is Active",
  "Match type: exact vs contains",
  "Follow gate and email gate",
  "Queue timing and per-contact limits",
  "Expired token → Reconnect needed",
];

const codeStyle: CSSProperties = {
  background: "var(--poskoo-band)",
  borderRadius: "8px",
  padding: "0.12em 0.45em",
  fontSize: "0.9em",
};

export default function InstagramAutoDmNotWorkingPage() {
  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }}
      />
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/help">Help center</Link> / Instagram auto DM not working
      </nav>
      <header className="hero">
        <p className="eyebrow">Troubleshooting guide</p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1>
            Instagram auto DM <em className="s">not working?</em>
          </h1>
          <HelpGuideIllustration variant="troubleshoot" className="w-36 shrink-0 sm:w-48" />
        </div>
        <p className="lede">
          Walk through this checklist in order. Each step reflects how {BRAND.name} actually processes comments, gates,
          and the send queue.
        </p>
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">The checklist</p>
              <h2>Seven checks, in order.</h2>
              <div className="pains">
                {checks.map((c, i) => (
                  <div key={c} className="pain">
                    <b>Check {i + 1}</b>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-dm.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A relaxed creator on a beanbag while DMs fly out of his phone to followers"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>1. Instagram Business or Creator, connected in Settings</h2>
            <p>
              Auto-DM only runs for a professional Instagram account linked to your user. In{" "}
              <Link className={s.vlink} href="/app/settings">
                Settings
              </Link>
              , use <strong>Connect Instagram</strong> and finish Meta&apos;s login. The account row should show Connected,
              not Reconnect needed.
            </p>

            <h2>2. Allow access to messages in Instagram</h2>
            <p>
              In the Instagram app, open your professional account settings, then message controls (Connected tools). Turn
              on <strong>Allow access to messages</strong> for the connected app so Meta can deliver comment and DM
              webhooks and send replies.
            </p>

            <h2>3. Make sure the rule is Active</h2>
            <p>
              In{" "}
              <Link className={s.vlink} href="/app/auto-dm">
                Auto-DM
              </Link>
              , the rule status must be <strong>Active</strong> (paused rules are skipped). Comment must be selected as a
              trigger. If you paused a rule and attached it to a scheduled post in the calendar, it switches on
              automatically when that post publishes.
            </p>
            <p>
              Put the keyword in that post&apos;s caption so people comment the word you are listening for. If several
              active rules share keywords, the oldest rule wins — use distinct keywords when you run multiple automations.
            </p>

            <h2>4. Match type: exact vs contains</h2>
            <p>
              <strong>Exact</strong> — the whole comment (after normalizing mentions and punctuation) must equal the
              keyword. Example: keyword <code style={codeStyle}>GUIDE</code> matches a comment that is only{" "}
              <code style={codeStyle}>guide</code>, not <code style={codeStyle}>send me the guide</code>.
            </p>
            <p>
              <strong>Contains</strong> — the keyword must appear as its own word. Example:{" "}
              <code style={codeStyle}>GUIDE</code> matches <code style={codeStyle}>Need the GUIDE please</code> but not{" "}
              <code style={codeStyle}>GUIDE123</code>.
            </p>

            <h2>5. Follow gate and email gate</h2>
            <p>
              With <strong>follow gate</strong>, the first DM explains that they should follow you and reply{" "}
              <code style={codeStyle}>done</code> (or reply with email if both gates are on). The link is queued only after{" "}
              {BRAND.name} confirms they follow your account.
            </p>
            <p>
              With <strong>email gate</strong>, they must reply in the DM thread with an email address. {BRAND.name}{" "}
              extracts it from their message and then queues the link DM.
            </p>

            <h2>6. Queue timing and per-contact limits</h2>
            <p>
              Matching comments enqueue a send job immediately, but delivery runs in the background with retries and
              per-account send budgeting. Expect most messages within a few minutes, not the second the comment is posted.
            </p>
            <p>
              Each comment is sent at most once. Gated links send once per contact and rule; follow reminders send at most
              twice per contact and rule when someone still has not followed.
            </p>

            <h2>7. Expired token → Reconnect needed</h2>
            <p>
              If Settings shows <strong>Reconnect needed</strong>, Instagram stopped accepting the stored token. Tap
              Reconnect and sign in through Meta before testing again.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>FAQ</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>
            Still stuck?{" "}
            <Link className={s.vlink} href="/app">
              Open your dashboard
            </Link>{" "}
            to review rules, the calendar, and Settings.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}

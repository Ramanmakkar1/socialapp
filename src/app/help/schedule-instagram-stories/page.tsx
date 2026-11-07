import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = {
  title: { absolute: `How to Schedule Instagram Stories (Free Guide) | ${BRAND.name}` },
  description:
    `Schedule Instagram Stories: paste one public image or video link, pick Story, choose a time and ${BRAND.name} publishes it for you. Specs and fixes inside.`,
  alternates: { canonical: "/help/schedule-instagram-stories" },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to schedule Instagram Stories",
  description: metadata.description,
  dateModified: "2026-11-06",
  author: { "@type": "Organization", name: BRAND.company },
  publisher: { "@type": "Organization", name: BRAND.company, url: BRAND.url },
  mainEntityOfPage: `${BRAND.url}/help/schedule-instagram-stories`,
};

const steps = [
  {
    name: "Connect an Instagram professional account",
    body: (
      <>
        Stories publish to an Instagram professional account (Business or Creator). Connect it in{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>{" "}
        through Meta&apos;s official login, or follow the{" "}
        <Link className={s.vlink} href="/help/connect-instagram-account">
          connect your Instagram account guide
        </Link>{" "}
        if you haven&apos;t done this yet.
      </>
    ),
  },
  {
    name: "Open the Calendar and start a new post",
    body: (
      <>
        Open the{" "}
        <Link className={s.vlink} href="/app/calendar#new">
          Calendar
        </Link>{" "}
        and start a new post. The composer opens with Instagram selected by default.
      </>
    ),
  },
  {
    name: "Choose the Story format",
    body: (
      <>
        Keep Instagram selected and, under <strong>Instagram format</strong>, choose <strong>Story</strong> — the
        option next to <strong>Post</strong>.
      </>
    ),
  },
  {
    name: "Paste one public image or video link",
    body: (
      <>
        Paste exactly one public <code>https</code> link to a .jpg, .png or .mp4 file. A Story takes one image or
        video — if you add more, the composer shows &quot;A Story takes one image or video.&quot;
      </>
    ),
  },
  {
    name: "Skip the caption and first comment",
    body: (
      <>
        The caption is not shown on Instagram Stories, so you don&apos;t need to write one for the Story itself. There
        is also no first comment for Stories — that option only applies to feed posts.
      </>
    ),
  },
  {
    name: "Pick a date and time, then Schedule",
    body: (
      <>
        Choose the date and time in your own time zone (the composer shows your time zone under the field), then press{" "}
        <strong>Schedule</strong>.
      </>
    ),
  },
  {
    name: "Watch the Calendar queue",
    body: (
      <>
        In the Calendar, the post&apos;s status changes to <strong>published</strong> when it goes live, or{" "}
        <strong>failed</strong> if publishing hits a problem — failed posts can be retried. If a Story keeps failing,
        email{" "}
        <a className={s.vlink} href={`mailto:${BRAND.supportEmail}`}>
          support
        </a>
        .
      </>
    ),
  },
];

const faqs = [
  {
    q: "Can I schedule Instagram Stories for free?",
    a: "Yes. Scheduling Stories is part of the Free plan's monthly post allowance — a Story counts as one post, like a feed post — and you don't need a credit card to start.",
  },
  {
    q: "Can I add link stickers, polls or music to a scheduled Story?",
    a: "No. Instagram's API publishes the image or video only, so link stickers, polls and music can't be added through the scheduler. Add those manually in the Instagram app after the Story goes live.",
  },
  {
    q: "Can I schedule more than one Story at once?",
    a: "Yes. Schedule each Story as its own post at its own time. There is no batch Story mode, so plan each one separately in the calendar.",
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

const related = [
  { href: "/instagram-scheduler", label: "Instagram scheduler" },
  { href: "/help/connect-instagram-account", label: "Connect your Instagram account" },
  { href: "/help/getting-started", label: "Getting started" },
  { href: "/tools/instagram-safe-zone-checker", label: "Story safe zone checker" },
  { href: "/tools/instagram-image-size", label: "Instagram image sizes" },
];

export default function ScheduleInstagramStoriesHelpPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule Instagram Stories", path: "/help/schedule-instagram-stories" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <p className="eyebrow">Guide</p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1>
            How to schedule Instagram <em className="s">Stories</em>
          </h1>
          <HelpGuideIllustration variant="schedule" className="w-36 shrink-0 sm:w-48" />
        </div>
        <p className="lede">
          Paste one public image or video link, pick the Story format, choose a time and {BRAND.name} publishes it for
          you. Here is exactly what a scheduled Story can and can&apos;t include.
        </p>
      </header>

      {steps.map((st, i) => (
        <section key={st.name} style={{ paddingTop: i === 0 ? 40 : 20 }}>
          <div className="wrap">
            <div className={s.prose}>
              <h2>
                Step {i + 1}: {st.name}
              </h2>
              <p>{st.body}</p>
            </div>
          </div>
        </section>
      ))}

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Story specs</h2>
            <p>
              Use 9:16 vertical, 1080 × 1920 px recommended. Keep text out of the top and bottom edges — check your
              layout with the{" "}
              <Link className={s.vlink} href="/tools/instagram-safe-zone-checker">
                Story safe zone checker
              </Link>{" "}
              and the{" "}
              <Link className={s.vlink} href="/tools/instagram-image-size">
                Instagram image sizes
              </Link>{" "}
              guide.
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
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Related guides</h2>
            <ul>
              {related.map((r) => (
                <li key={r.href}>
                  <Link className={s.vlink} href={r.href}>
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

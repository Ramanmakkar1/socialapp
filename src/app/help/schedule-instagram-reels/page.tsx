import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = {
  title: { absolute: "How to Schedule Instagram Reels: A Step-by-Step Guide" },
  description:
    `Schedule Instagram Reels: paste one public .mp4 link, write a caption, pick a date and time and ${BRAND.name} publishes it for you. Specs, tips and fixes inside.`,
  alternates: { canonical: "/help/schedule-instagram-reels" },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to schedule Instagram Reels",
  description: metadata.description,
  dateModified: "2026-11-07",
  author: { "@type": "Organization", name: BRAND.company },
  publisher: { "@type": "Organization", name: BRAND.company, url: BRAND.url },
  mainEntityOfPage: `${BRAND.url}/help/schedule-instagram-reels`,
};

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: `${BRAND.url}/` },
  { name: "Help", url: `${BRAND.url}/help` },
  { name: "Schedule Instagram Reels", url: `${BRAND.url}/help/schedule-instagram-reels` },
]);

const steps = [
  {
    name: "Connect your Instagram account",
    body: (
      <>
        Reels publish to an Instagram professional account (Business or Creator). Connect it in{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>{" "}
        through Meta&apos;s official login.
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
    name: "Paste your .mp4 video link",
    body: (
      <>
        Paste one public <code>https</code> link to a .mp4 file. A .mp4 link is posted as a Reel — if you paste 2–10
        image links instead, the composer makes a carousel post.
      </>
    ),
  },
  {
    name: "Write your caption",
    body: (
      <>
        Write the caption that will appear under the Reel. If you run a comment-to-DM rule, put your keyword in the
        caption so viewers know what to comment.
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
        In the Calendar, the post&apos;s status changes to <strong>published</strong> when the Reel goes live, or{" "}
        <strong>failed</strong> if publishing hits a problem — failed posts can be retried.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Can I schedule Reels for free?",
    a: "Yes. Scheduling Reels is part of the Free plan's monthly post allowance — a Reel counts as one post, like a feed post — and you don't need a credit card to start.",
  },
  {
    q: "Can I edit a scheduled Reel?",
    a: "Yes. Open the post in the Calendar before it publishes and change the caption, the video link, the date or the time. Once the Reel has published, edit it in the Instagram app or delete and reschedule it in the Calendar.",
  },
  {
    q: "Which video formats work for a Reel?",
    a: "Use an MP4 file with H.264 encoding, 9:16 vertical, 1080 × 1920 px recommended. Paste a public https link to the .mp4 file in the composer.",
  },
  {
    q: "Can I schedule Reels to Facebook and Threads too?",
    a: "Instagram works today, and Facebook Page and Threads publishing work today too. Connect each one in Settings and pick it in the composer; the same .mp4 link is posted as a video on your Facebook Page and on Threads.",
  },
  {
    q: "Can I post more than one video in a Reel?",
    a: "No. A Reel is one .mp4 video. If you want multiple items in a single post, paste 2–10 image links and the composer makes a carousel post instead.",
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
  { href: "/help/schedule-instagram-stories", label: "Schedule Instagram Stories" },
  { href: "/instagram-scheduler", label: "Instagram scheduler" },
  { href: "/instagram-auto-dm", label: "Instagram auto DM" },
  { href: "/tools/instagram-safe-zone-checker", label: "Reel and Story safe zone checker" },
  { href: "/help/getting-started", label: "Getting started" },
];

export default function ScheduleInstagramReelsHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule Instagram Reels", path: "/help/schedule-instagram-reels" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
          <h1>
              How to schedule Instagram <em className="s">Reels</em>
            </h1>
          <p className="lede">
            Paste one public .mp4 link, write a caption, choose a time and {BRAND.name} publishes your Reel for you. Here
            is exactly what a scheduled Reel needs, step by step.
          </p>
        </div>
        <HelpGuideIllustration variant="schedule" className="hero-art" />
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What you need</h2>
            <ul>
              <li>
                An Instagram professional account (Business or Creator) connected to {BRAND.name} through Meta&apos;s
                official login.
              </li>
              <li>
                A public <code>https</code> link to a .mp4 video file — from your website, cloud storage or any public
                host.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Step by step</h2>
            {steps.map((st, i) => (
              <div key={st.name}>
                <h3>
                  Step {i + 1}: {st.name}
                </h3>
                <p>{st.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Reel video specs</h2>
            <p>
              Use 9:16 vertical, 1080 × 1920 px recommended, encoded as MP4 with H.264. Keep your cover frame and any
              on-screen text out of the top and bottom edges — check your layout with the{" "}
              <Link className={s.vlink} href="/tools/instagram-safe-zone-checker">
                Reel and Story safe zone checker
              </Link>{" "}
              so nothing important gets cut off.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Tips for Reels that get comments</h2>
            <p>
              Put your comment keyword on screen in the video and in the caption, then set up a{" "}
              <Link className={s.vlink} href="/instagram-auto-dm">
                comment-to-DM rule
              </Link>{" "}
              so everyone who comments the keyword automatically gets a DM with your link.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>If your Reel did not publish</h2>
            <p>
              If the post shows as <strong>failed</strong> in the Calendar, read the error message on the post first,
              then check these common causes before you retry:
            </p>
            <ul>
              <li>
                The video link must be a public <code>https</code> link that opens the .mp4 file directly, without a
                login or a download page.
              </li>
              <li>
                If Instagram is still processing the video, wait a few minutes and press <strong>Retry</strong>.
              </li>
              <li>
                If the error says your access expired, reconnect Instagram in{" "}
                <Link className={s.vlink} href="/app/settings">
                  Settings
                </Link>
                , then retry the post.
              </li>
            </ul>
            <p>
              Still stuck?{" "}
              <Link className={s.vlink} href="/contact">
                Contact support
              </Link>{" "}
              with the error message and we will help.
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

      <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>
        New to {BRAND.name}?{" "}
        <Link className={s.vlink} href="/signup">Create a free account</Link>{" "}
        or email{" "}
        <a className={s.vlink} href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
      </p>
    </PublicShell>
  );
}

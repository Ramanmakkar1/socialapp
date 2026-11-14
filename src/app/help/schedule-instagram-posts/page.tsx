import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "How to Schedule Instagram Posts: Step-by-Step Guide" },
  description:
    "Schedule Instagram posts in Poskoo: connect your account, paste a JPEG image link, write a caption, pick a time and it auto-publishes. Free plan inside.",
  alternates: { canonical: "/help/schedule-instagram-posts" },
});

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to schedule Instagram posts",
  description: metadata.description,
  dateModified: "2026-11-14",
  author: { "@type": "Organization", name: BRAND.company },
  publisher: publisherRef(),
  mainEntityOfPage: `${BRAND.url}/help/schedule-instagram-posts`,
};

const steps = [
  {
    name: "Connect your Instagram account",
    body: (
      <>
        Feed posts publish to an Instagram professional account (Business or Creator). Connect it in{" "}
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
    name: "Paste one public https image link",
    body: (
      <>
        Paste one public <code>https</code> link to a JPEG image — that makes a single-image feed post. If you paste 2–10
        image links instead, the composer makes a carousel post (see{" "}
        <Link className={s.vlink} href="/help/schedule-instagram-carousel">
          Schedule Instagram carousels
        </Link>
        ). A .mp4 link makes a Reel (see{" "}
        <Link className={s.vlink} href="/help/schedule-instagram-reels">
          Schedule Instagram Reels
        </Link>
        ).
      </>
    ),
  },
  {
    name: "Write your caption",
    body: (
      <>
        Write the caption that will appear under the post. If you run a comment-to-DM rule, put your keyword in the
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
        In the Calendar, the post&apos;s status changes to <strong>published</strong> when the post goes live, or{" "}
        <strong>failed</strong> if publishing hits a problem — failed posts can be retried.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Can I schedule Instagram posts for free?",
    a: "Yes. Scheduling feed posts is part of the Free plan's monthly post allowance — a single-image post counts as one post, like a Reel — and you don't need a credit card to start.",
  },
  {
    q: "Can I edit or reschedule a scheduled post?",
    a: "Yes. Open the post in the Calendar before it publishes and change the caption, the image link, the date or the time. Once the post has published, edit it in the Instagram app or delete and reschedule it in the Calendar.",
  },
  {
    q: "Do I need a Business or Creator account?",
    a: "Yes. Instagram requires a professional account (Business or Creator) for API publishing. Personal accounts cannot be used to schedule posts through Poskoo.",
  },
  {
    q: "Can I add a first comment?",
    a: "Not yet. You can add the comment keyword in the caption so people know what to comment, and the auto-DM rule will reply to those comments automatically.",
  },
  {
    q: "Can I post the same image to Facebook and Threads?",
    a: "Yes. Connect Facebook Pages and Threads in Settings and pick them in the composer; the same image link is posted as a feed post on Facebook and on Threads.",
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
  { href: "/help/schedule-instagram-carousel", label: "Schedule Instagram carousels" },
  { href: "/help/schedule-instagram-reels", label: "Schedule Instagram Reels" },
  { href: "/help/schedule-instagram-stories", label: "Schedule Instagram Stories" },
  { href: "/instagram-scheduler", label: "Instagram scheduler" },
  { href: "/help/auto-dm-instagram-comments", label: "Auto-DM Instagram comments" },
];

export default function ScheduleInstagramPostsHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help", path: "/help" },
        { name: "Schedule Instagram posts", path: "/help/schedule-instagram-posts" },
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
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
          <h1>
              How to schedule Instagram <em className="s">posts</em>
            </h1>
          <p className="lede">
            Connect an Instagram professional (Business or Creator) account through Meta&apos;s official login, open the
            Calendar, paste one public https JPEG image link, write a caption, pick a date and time, press Schedule, and
            Poskoo publishes it automatically.
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
                A public <code>https</code> link to a JPEG image file — from your website, cloud storage or any public
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
            <h2>Instagram feed post image sizes</h2>
            <p>
              Feed posts support three aspect ratios, all exported as JPEG:
            </p>
            <ul>
              <li><strong>1:1 square</strong> — 1080 × 1080 px</li>
              <li><strong>4:5 portrait</strong> — 1080 × 1350 px</li>
              <li><strong>1.91:1 landscape</strong> — 1080 × 566 px</li>
            </ul>
            <p>
              Resize or crop your image with the{" "}
              <Link className={s.vlink} href="/tools/instagram-image-resizer">
                Instagram image resizer
              </Link>{" "}
              and verify the exact dimensions with the{" "}
              <Link className={s.vlink} href="/tools/instagram-image-size">
                Instagram image size guide
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Best time to schedule Instagram posts</h2>
            <p>
              Weekday late mornings (10&nbsp;AM–12&nbsp;PM) and early evenings (6&nbsp;PM–8&nbsp;PM) in your audience&apos;s
              time zone tend to work well for feed posts. Test a few slots for two weeks and compare reach.
              Find your starting slots with the{" "}
              <Link className={s.vlink} href="/tools/best-time-to-post-on-instagram">
                best time to post on Instagram
              </Link>
              tool.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>If your post did not publish</h2>
            <p>
              If the post shows as <strong>failed</strong> in the Calendar, read the error message on the post first,
              then check these common causes before you retry:
            </p>
            <ul>
              <li>
                The image link must be a public <code>https</code> link that opens the JPEG file directly, without a
                login or a download page.
              </li>
              <li>
                The image must be a valid JPEG file — other formats (PNG, WebP, HEIC) are not accepted for feed posts.
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
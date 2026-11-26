import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "Schedule Threads Posts in Poskoo: Step-by-Step Help" },
  description:
    `Step-by-step help for scheduling Threads posts in ${BRAND.name}: connect Threads, write up to 500 characters, add media, pick a time and ${BRAND.name} publishes it.`,
  alternates: { canonical: "/help/schedule-threads-posts" },
});

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to schedule Threads posts",
  description: metadata.description,
  image: `${BRAND.canonicalUrl}/landing/hero.webp`,
  dateModified: "2026-11-11",
  author: { "@type": "Organization", name: BRAND.company },
  publisher: publisherRef(),
  mainEntityOfPage: `${BRAND.canonicalUrl}/help/schedule-threads-posts`,
};

const steps = [
  {
    name: "Connect your Threads account",
    body: (
      <>
        Connect Threads in{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>{" "}
        through Meta&apos;s official login. You approve publishing access on Meta&apos;s screen and never share your
        password with {BRAND.name}.
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
        and start a new post. The composer opens ready for your text and media.
      </>
    ),
  },
  {
    name: "Write your text",
    body: <>Write the post you want to publish, up to{" "}<Link className={s.vlink} href="/tools/threads-character-counter">500 characters</Link>.</>,
  },
  {
    name: "Add one image or one video link (optional)",
    body: (
      <>
        Optionally add one public image link or one public video link. A single post cannot contain both an image and a
        video.
      </>
    ),
  },
  {
    name: "Select Threads and pick a date and time",
    body: (
      <>
        Select Threads as the channel, then choose the date and time for the post and press <strong>Schedule</strong>.
      </>
    ),
  },
  {
    name: "Check the result in the queue",
    body: (
      <>
        In the queue, each post shows a <strong>published</strong> or <strong>failed</strong> status so you can see
        exactly what went live.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Do I need to give Poskoo my Threads password?",
    a: "No. You sign in through Meta's official login and approve publishing access. Poskoo never asks for, stores or scrapes your Threads password.",
  },
  {
    q: "What can I post to Threads?",
    a: "A Threads post can be text up to 500 characters, one image or one video. A single post cannot contain both an image and a video.",
  },
  {
    q: "Can I edit, reschedule or delete a post?",
    a: "Yes. Scheduled posts can be edited, moved to a new time, duplicated or deleted before they publish.",
  },
  {
    q: "What happens if publishing fails?",
    a: "The post shows a failed status with the error. After you fix the connection or content issue, you can retry the same post from the queue.",
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
  { href: "/threads-scheduler", label: "Threads scheduler" },
  { href: "/tools/threads-post-preview", label: "Threads post preview tool" },
  { href: "/help", label: "All help guides" },
];

export default function ScheduleThreadsPostsHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule Threads Posts", path: "/help/schedule-threads-posts" },
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
              How to schedule Threads <em className="s">posts</em>
            </h1>
          <p className="lede">
            Connect Threads, open the Calendar, write your post, pick Threads and a time, and {BRAND.name} publishes it
            automatically. Here is exactly what a scheduled Threads post needs, step by step.
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
                A Threads account connected to {BRAND.name} through Meta&apos;s official login.
              </li>
              <li>
                Your post text, up to 500 characters, and optionally one public image or video link.
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
            <h2>What you can post to Threads</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.th} scope="col">Type</th>
                    <th className={s.th} scope="col">Limit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={s.td}>Text</td>
                    <td className={s.td}>up to 500 characters</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Image</td>
                    <td className={s.td}>one public image link</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video</td>
                    <td className={s.td}>one public video link</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Image + video together</td>
                    <td className={s.td}>not supported</td>
                  </tr>
                </tbody>
              </table>
            </div>
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

import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "How to Schedule Bluesky Posts (App Password Guide) | Poskoo" },
  description:
    "Schedule Bluesky posts with an app password: connect your handle, write up to 300 characters, add up to 4 images or a link, pick a time and fix errors.",
  alternates: { canonical: new URL("/help/schedule-bluesky-posts", BRAND.url).toString() },
});

const steps = [
  {
    name: "Create a Bluesky app password",
    text: "In Bluesky, open Settings → Privacy and security → App passwords and create a new app password. Keep your main password private.",
    body: (
      <>
        In Bluesky, open <strong>Settings → Privacy and security → App passwords</strong> and create a new app password.
        This is Bluesky&apos;s official method for third-party apps. Keep your main password private; {BRAND.name} never
        asks for it.
      </>
    ),
  },
  {
    name: "Connect Bluesky in Poskoo Settings",
    text: "In Poskoo Settings, open Channels and connect Bluesky with your handle and app password. You can revoke the app password in Bluesky at any time.",
    body: (
      <>
        In {BRAND.name}{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>
        , open <strong>Channels</strong> and connect Bluesky with your handle and app password. Never enter your main
        Bluesky password. You can revoke the app password in Bluesky at any time.
      </>
    ),
  },
  {
    name: "Compose your post and add images or a link",
    text: "Open the calendar composer, select Bluesky and write up to 300 characters. Add up to 4 images; images over 1 MB are shrunk automatically when possible. Links and resolvable mentions become clickable, and the first link in a post without images becomes a link-preview card.",
    body: (
      <>
        Open the{" "}
        <Link className={s.vlink} href="/app/calendar">
          calendar composer
        </Link>
        , select Bluesky and write up to <strong>300 characters</strong>. Add up to <strong>4 images</strong>; images over
        1 MB are shrunk automatically when possible. Links and resolvable @mentions become clickable, and the first link
        in a post without images becomes a <strong>link-preview card</strong>.
      </>
    ),
  },
  {
    name: "Pick a date and time",
    text: "Choose when the post should go out. Times are shown in your browser's time zone, so the post publishes when you expect it to.",
    body: (
      <>
        Choose when the post should go out. Times are shown in your browser&apos;s <strong>time zone</strong>, so the
        post publishes when you expect it to.
      </>
    ),
  },
  {
    name: "Check the queue and publishing status",
    text: "Find the scheduled post in the calendar or queue. You can edit or reschedule it before publishing, then see a published or failed status after it goes out.",
    body: (
      <>
        Find the scheduled post in the <strong>calendar or queue</strong>. You can edit or reschedule it before
        publishing. Afterwards, you see a <strong>published</strong> or <strong>failed</strong> status.
      </>
    ),
  },
  {
    name: "Fix common publishing failures",
    text: "If the app password was revoked, reconnect Bluesky with a valid app password and retry. Shorten text over 300 characters. If an image cannot be shrunk to 1 MB or smaller, replace it with a smaller image.",
    body: (
      <>
        Open the failed post and read its error. If the app password was revoked, reconnect Bluesky in Settings →
        Channels with a valid app password and retry. Shorten text over <strong>300 characters</strong>. If an image
        cannot be shrunk to <strong>1 MB or smaller</strong>, replace it with a smaller image and retry.
      </>
    ),
  },
];

const faqs = [
  {
    q: "How do I create a Bluesky app password for Poskoo?",
    a: "In Bluesky, go to Settings → Privacy and security → App passwords and create a new app password. In Poskoo, open Settings → Channels and connect Bluesky with your handle and that app password.",
  },
  {
    q: "Do I need to give Poskoo my main Bluesky password?",
    a: "No. Use a Bluesky app password, never your main password. App passwords are Bluesky's official method for third-party apps, and you can revoke access in Bluesky at any time.",
  },
  {
    q: "What are the Bluesky text and image limits?",
    a: "Write up to 300 characters and add up to 4 images per post. Each image must be 1 MB or smaller after processing; Poskoo automatically shrinks larger images when possible. Bluesky video is not supported in Poskoo yet.",
  },
  {
    q: "How do links and mentions work in scheduled Bluesky posts?",
    a: "Links and mentions that Bluesky can resolve become clickable. On a post without images, the first link also becomes a link-preview card using the linked page's title and description.",
  },
  {
    q: "What should I do if my Bluesky post fails?",
    a: "Read the error on the failed post. If you revoked the app password, reconnect in Settings → Channels with a valid app password and retry. Shorten text over 300 characters, or replace an image that cannot be shrunk to 1 MB or smaller.",
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

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to schedule Bluesky posts",
  description: metadata.description,
  totalTime: "PT5M",
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
    url: `${BRAND.url}/help/schedule-bluesky-posts#step-${i + 1}`,
  })),
};

const related = [
  { href: "/bluesky-scheduler", label: "Bluesky scheduler" },
  { href: "/tools/bluesky-character-counter", label: "Bluesky character counter (300 limit)" },
  { href: "/help/schedule-threads-posts", label: "Schedule Threads posts" },
  { href: "/help/getting-started", label: "Getting started guide" },
];

export default function ScheduleBlueskyPostsHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule Bluesky Posts", path: "/help/schedule-bluesky-posts" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
            <h1>
              How to schedule Bluesky <em className="s">posts</em>
            </h1>
          <p className="lede">
            To schedule a Bluesky post, create an app password, connect your handle in {BRAND.name} Settings → Channels,
            write up to 300 characters, add up to 4 images if needed and pick a time. {BRAND.name} publishes the post and
            shows its status; you never need to share your main Bluesky password.
          </p>
        </div>
        <HelpGuideIllustration variant="schedule" className="hero-art" />
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What you need</h2>
            <ul>
              <li>A Bluesky account and an app password created in Bluesky&apos;s App passwords settings.</li>
              <li>
                Your Bluesky handle and app password connected in {BRAND.name} Settings → Channels, never your main
                password.
              </li>
              <li>Post text of up to 300 characters, with optional images, links and @mentions.</li>
            </ul>
            <p>
              Prefer the product page? See the{" "}
              <Link className={s.vlink} href="/bluesky-scheduler">
                Bluesky scheduler
              </Link>{" "}
              for app passwords, image limits and publishing on one calendar.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Step by step</h2>
            {steps.map((st, i) => (
              <div key={st.name} id={`step-${i + 1}`}>
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
            <h2>What you can schedule on Bluesky</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.th} scope="col">Type</th>
                    <th className={s.th} scope="col">Limit or behaviour</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={s.td}>Post text</td>
                    <td className={s.td}>up to 300 characters</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Images per post</td>
                    <td className={s.td}>up to 4</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Image size</td>
                    <td className={s.td}>1 MB or smaller after processing; larger images are shrunk when possible</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Post types</td>
                    <td className={s.td}>text and image posts; no video yet</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Links and mentions</td>
                    <td className={s.td}>clickable facets, with a preview card for the first link when no images are attached</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Scheduling</td>
                    <td className={s.td}>date, time and time zone in one queue with published or failed status</td>
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

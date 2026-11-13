import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "How to Schedule YouTube Videos and Shorts | Poskoo" },
  description:
    "Schedule YouTube videos and Shorts in Poskoo: connect with Google, add your video, title, description and tags, set privacy, then choose a publishing time.",
  alternates: { canonical: new URL("/help/schedule-youtube-videos", BRAND.url).toString() },
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: `${BRAND.url}/` },
  { name: "Help", url: `${BRAND.url}/help` },
  { name: "Schedule YouTube Videos", url: `${BRAND.url}/help/schedule-youtube-videos` },
]);

const steps = [
  {
    name: "Connect your YouTube channel with Google sign-in",
    text: "In Settings, open Channels and connect YouTube through Google's official sign-in. Approve access on Google's screen; you never share your Google password with Poskoo.",
    body: (
      <>
        In{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>
        , open <strong>Channels</strong> and connect YouTube through Google&apos;s official sign-in. Approve access on
        Google&apos;s screen; you never share your Google password with {BRAND.name}.
      </>
    ),
  },
  {
    name: "Open the composer and attach your video",
    text: "Open the calendar composer, select YouTube and attach one MP4 or MOV video. The YouTube limit in Poskoo is 2 GB per file, and your plan may have a lower limit.",
    body: (
      <>
        Open the{" "}
        <Link className={s.vlink} href="/app/calendar">
          calendar composer
        </Link>
        , select YouTube and attach one <strong>MP4 or MOV video</strong>. The YouTube limit in {BRAND.name} is 2 GB per
        file, and your plan may have a lower limit.
      </>
    ),
  },
  {
    name: "Add the YouTube title, description and tags",
    text: "Enter a video title of up to 100 characters; it is required. Write the description in the caption field and add optional comma-separated tags.",
    body: (
      <>
        Enter a <strong>video title</strong> of up to 100 characters; it is required. Write the description in the caption
        field and add optional <strong>comma-separated tags</strong>. {BRAND.name} sends these details with the scheduled
        upload.
      </>
    ),
  },
  {
    name: "Choose the video privacy",
    text: "Set visibility to public, unlisted or private. Poskoo uses that privacy setting when it uploads the video to YouTube.",
    body: (
      <>
        Set visibility to <strong>public</strong>, <strong>unlisted</strong> or <strong>private</strong>. {BRAND.name}{" "}
        uses that privacy setting when it uploads the video to YouTube.
      </>
    ),
  },
  {
    name: "Tick the Short option for a vertical video under 60 seconds",
    text: "For a vertical video under 60 seconds, tick This is a Short. Poskoo adds #Short to the description when it is not already there.",
    body: (
      <>
        For a vertical video under 60 seconds, tick <strong>This is a Short</strong>. {BRAND.name} adds #Short to the
        description when it is not already there.
      </>
    ),
  },
  {
    name: "Pick a date and time in your time zone",
    text: "Choose when the video should go out. Times are shown in your browser's time zone, so the upload starts when you expect it to.",
    body: (
      <>
        Choose when the video should go out. Times are shown in your browser&apos;s <strong>time zone</strong>, so the
        upload starts when you expect it to.
      </>
    ),
  },
  {
    name: "Check the calendar, queue and publishing status",
    text: "Find the scheduled video in the calendar or queue. You can edit or reschedule it before publishing, then see a published or failed status with a retry option if it fails.",
    body: (
      <>
        Find the scheduled video in the <strong>calendar or queue</strong>. You can edit or reschedule it before
        publishing. Afterwards, you see a <strong>published</strong> or <strong>failed</strong> status, with a retry option
        if it fails.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Can I schedule YouTube videos and Shorts with Poskoo?",
    a: "Yes. Connect your channel with Google sign-in, attach a video, add its title, description and tags, choose privacy and pick a time. For a Short, use a vertical video under 60 seconds and tick the Short option.",
  },
  {
    q: "Do I need to give Poskoo my Google password?",
    a: "No. You connect your YouTube channel through Google's official sign-in and approve access there. Poskoo never asks for your Google password.",
  },
  {
    q: "What video formats and sizes can I schedule for YouTube?",
    a: "Use an MP4 or MOV video. Poskoo's YouTube limit is 2 GB per file, and your plan may set a lower per-file limit. If the file is too large, compress or trim it before uploading again.",
  },
  {
    q: "How does the YouTube Shorts option work?",
    a: "Tick This is a Short for a vertical video under 60 seconds. Poskoo adds the #Short marker to the description if it is not already present, then uploads the video with your chosen details and privacy.",
  },
  {
    q: "What should I do if my YouTube upload fails?",
    a: "Open the failed post in the queue and read its error. Reconnect YouTube in Settings if Google access has expired, check that the file is MP4 or MOV and within your size limit, then retry the post.",
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
  name: "How to schedule YouTube videos and Shorts",
  description: metadata.description,
  totalTime: "PT5M",
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
    url: `${BRAND.url}/help/schedule-youtube-videos#step-${i + 1}`,
  })),
};

const related = [
  { href: "/youtube-scheduler", label: "YouTube scheduler" },
  { href: "/tools/youtube-title-counter", label: "YouTube title and description counter" },
  { href: "/tools/best-time-to-post-on-youtube", label: "Best time to post on YouTube" },
  { href: "/help/schedule-tiktok-posts", label: "Schedule TikTok videos" },
  { href: "/help/getting-started", label: "Getting started guide" },
];

export default function ScheduleYouTubeVideosHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule YouTube Videos", path: "/help/schedule-youtube-videos" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }}
      />
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
              How to schedule YouTube <em className="s">videos and Shorts</em>
            </h1>
          <p className="lede">
            To schedule a YouTube video or Short, connect your channel with Google sign-in in {BRAND.name}, attach the
            video, add its title, description and tags, choose privacy, then pick a date and time. {BRAND.name} uploads it
            through the official YouTube Data API and shows the result in your queue. Here is exactly how it works, step by
            step.
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
                A YouTube channel connected in Settings &gt; Channels through Google&apos;s official sign-in, with
                permission to upload videos.
              </li>
              <li>One MP4 or MOV video within your plan&apos;s file-size limit and the 2 GB YouTube limit.</li>
              <li>A video title of up to 100 characters, plus a description and any tags you want to include.</li>
            </ul>
            <p>
              Prefer the product page? See the{" "}
              <Link className={s.vlink} href="/youtube-scheduler">
                YouTube scheduler
              </Link>{" "}
              for videos, Shorts, privacy settings and publishing on one calendar.
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
            <h2>What you can schedule on YouTube</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.th} scope="col">Setting</th>
                    <th className={s.th} scope="col">What Poskoo supports</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={s.td}>Video format</td>
                    <td className={s.td}>MP4 or MOV</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video size</td>
                    <td className={s.td}>up to 2 GB, with a lower limit on some plans</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video title</td>
                    <td className={s.td}>required, up to 100 characters</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video details</td>
                    <td className={s.td}>description and optional comma-separated tags</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Privacy</td>
                    <td className={s.td}>public, unlisted or private</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Shorts</td>
                    <td className={s.td}>Short option for vertical videos under 60 seconds</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Scheduling</td>
                    <td className={s.td}>date and time in your time zone, with calendar and queue status</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What should I do if the YouTube upload fails?</h2>
            <p>
              Open the failed post in the queue and read the error. {BRAND.name} retries an interrupted upload with a new
              resumable session; if it still fails, fix the cause and retry the post.
            </p>
            <ul>
              <li>If Google access has expired, reconnect the YouTube channel in Settings &gt; Channels.</li>
              <li>Check that the file is MP4 or MOV and within both your plan limit and the 2 GB YouTube limit.</li>
              <li>Check that the required title is present and is no longer than 100 characters.</li>
              <li>Return to the calendar or queue, retry the post and check its publishing status again.</li>
            </ul>
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

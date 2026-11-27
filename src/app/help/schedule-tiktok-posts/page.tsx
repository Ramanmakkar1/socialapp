import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const revalidate = 600;

export const metadata: Metadata = withSocial({
  title: { absolute: "Schedule TikTok Videos in Poskoo: Step-by-Step Help" },
  description:
    `Step-by-step help for scheduling TikTok videos in ${BRAND.name}: connect TikTok with its login, upload a vertical video, set privacy, pick a time and publish.`,
  alternates: { canonical: new URL("/help/schedule-tiktok-posts", BRAND.canonicalUrl).toString() },
});

const steps = [
  {
    name: "Connect your TikTok account",
    text: "Connect TikTok in Settings through TikTok's official Login Kit. You approve access on TikTok's own screen, and you never share your password with Poskoo.",
    body: (
      <>
        Connect TikTok in{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>{" "}
        through TikTok&apos;s official <strong>Login Kit</strong>. You approve access on TikTok&apos;s own screen, and
        you never share your password with {BRAND.name}.
      </>
    ),
  },
  {
    name: "Add a vertical video and caption",
    text: "Upload a vertical MP4 or MOV video from 3 seconds to 10 minutes, up to 1 GB (250 MB on Free), then write your caption.",
    body: (
      <>
        Upload a vertical MP4 or MOV video from 3 seconds to 10 minutes, up to 1 GB (250 MB on the Free plan), then
        write your <Link className={s.vlink} href="/tools/tiktok-caption-generator">caption</Link>. A 9:16 video such as <Link className={s.vlink} href="/tools/tiktok-video-size-checker">1080×1920</Link> looks best in the TikTok feed.
      </>
    ),
  },
  {
    name: "Choose the privacy level",
    text: "Pick who can see the video. Only the options TikTok allows for your account are shown, because TikTok checks them before posting. You can also send the video to your TikTok inbox to finish it in the app.",
    body: (
      <>
        Pick who can see the video. Only the options TikTok allows for your account are shown, because TikTok checks
        them before posting. {BRAND.name} supports both a direct post and an inbox upload, so you can send the video to
        your TikTok inbox and finish it in the app instead. Until TikTok audits the app, TikTok only accepts posts
        from private accounts with the visibility set to <strong>Only me</strong>.
      </>
    ),
  },
  {
    name: "Pick a date, time and time zone",
    text: "Choose the date and time for the video. Times are shown in your browser's time zone, so the post goes out when you expect it to.",
    body: (
      <>
        Choose the <Link className={s.vlink} href="/tools/best-time-to-post-on-tiktok">date and time</Link> for the video. Times are shown in your browser&apos;s time zone, so the post goes out
        when you expect it to.
      </>
    ),
  },
  {
    name: "Check the queue and calendar",
    text: "Your scheduled video appears in the queue and on the calendar. You can edit, reschedule or delete it before it goes out, then see a success or failure status after publishing.",
    body: (
      <>
        Your scheduled video appears in the queue and on the calendar. You can edit, reschedule or delete it before it
        goes out. After publishing you see a <strong>success</strong> or <strong>failure</strong> status, and you can
        retry the same post from the queue if it fails.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Does TikTok allow scheduling from other apps?",
    a: "Yes. TikTok allows approved apps to schedule and publish videos through its official Content Posting API. Poskoo uses that API, so you connect with TikTok's own login and never share your password.",
  },
  {
    q: "What video size and length does TikTok accept?",
    a: "TikTok takes MP4 or MOV videos from 3 seconds to 10 minutes. Poskoo allows up to 1 GB per video on Pro (250 MB on Free). Vertical 9:16 video such as 1080×1920 looks best in the feed.",
  },
  {
    q: "What does sending to the TikTok inbox mean?",
    a: "Instead of publishing directly, Poskoo sends the video to your TikTok inbox. You open TikTok, find the video in your inbox and finish the post in the app, where you can add sounds, effects or extra edits before it goes live.",
  },
  {
    q: "Why did my TikTok post fail?",
    a: "The queue shows the exact error. Common reasons are an expired TikTok connection, a privacy option that TikTok no longer allows for your account, a daily posting limit, or TikTok not having audited the app yet. Fix the issue, reconnect if needed, then retry the same post.",
  },
];

const faqJsonLdFor = (list: typeof faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: list.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to schedule TikTok videos",
  description: metadata.description,
  image: `${BRAND.canonicalUrl}/landing/hero.webp`,
  totalTime: "PT5M",
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
    url: `${BRAND.canonicalUrl}/help/schedule-tiktok-posts#step-${i + 1}`,
  })),
};

const related = [
  { href: "/tiktok-scheduler", label: "TikTok scheduler" },
  { href: "/tools/tiktok-safe-zone-checker", label: "9:16 safe zone checker" },
  { href: "/help/getting-started", label: "Getting started guide" },
];

export default function ScheduleTikTokPostsHelpPage() {
  const state = networkAvailability("tiktok");
  const pageFaqs =
    state === "live"
      ? faqs
      : faqs.map((f) =>
          f.q === "Does TikTok allow scheduling from other apps?"
            ? {
                ...f,
                a: `Yes, TikTok allows approved apps to post through its official Content Posting API. TikTok publishing in Poskoo is ${availabilityPhrase(
                  state,
                  "TikTok"
                )}; once it is switched on you connect with TikTok's own login and never share your password.`,
              }
            : f
        );
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule TikTok Videos", path: "/help/schedule-tiktok-posts" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLdFor(pageFaqs)).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
            <h1>
              How to schedule TikTok <em className="s">videos</em>
            </h1>
          <p className="lede">
            To schedule a TikTok video, connect TikTok in {BRAND.name} with TikTok&apos;s official login, upload a
            vertical video, write a caption and pick a date and time.{" "}
            {state !== "live" ? (
              <>
                TikTok publishing is {availabilityPhrase(state, "TikTok")}; once it is on, {BRAND.name} publishes it or
                sends it to your TikTok inbox at that moment.
              </>
            ) : (
              <>
                {BRAND.name} then publishes it, or sends it to your TikTok inbox, at that moment.
              </>
            )}{" "}
            Here is exactly how it works, step by step.
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
                A TikTok account connected to {BRAND.name} through TikTok&apos;s official Login Kit with permission to
                post videos.
              </li>
              <li>
                A vertical MP4 or MOV video from 3 seconds to 10 minutes, up to 1 GB, plus a caption for the post.
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
            <h2>What you can post to TikTok</h2>
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
                    <td className={s.td}>Video format</td>
                    <td className={s.td}>MP4 or MOV</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video length</td>
                    <td className={s.td}>3 seconds to 10 minutes</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video size</td>
                    <td className={s.td}>up to 1 GB (250 MB on Free)</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Best aspect ratio</td>
                    <td className={s.td}>9:16, for example 1080×1920</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Publishing</td>
                    <td className={s.td}>direct post or send to TikTok inbox</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Scheduling</td>
                    <td className={s.td}>date, time and time zone in one queue</td>
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
            {pageFaqs.map((f) => (
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

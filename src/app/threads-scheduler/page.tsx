import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/threads-scheduler";
const title = `Threads Scheduler: Plan & Auto-Publish Posts | ${BRAND.name}`;
const description = `Schedule Threads posts on one calendar and publish them automatically through Meta's official API. Plan text, image or video posts and track results.`;

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const features = [
  {
    no: "01 / Formats",
    title: "Text, one image or one video",
    text: "Write a Threads post up to 500 characters and add one public image or video link. A post uses an image or a video, not both.",
  },
  {
    no: "02 / Calendar",
    title: "Pick the date and time",
    text: "Choose when each post goes live, see upcoming posts in the week and month calendar, and reschedule from the queue when plans change.",
  },
  {
    no: "03 / Multi-channel",
    title: "Plan Threads beside Instagram and Facebook",
    text: "Select Threads, Instagram and Facebook Pages in the same composer, customize the caption per channel, and keep one publishing queue.",
  },
  {
    no: "04 / Status",
    title: "See what published and what failed",
    text: "The publishing worker sends due Threads posts through the official API, records success or failure, and lets you retry a failed post after fixing it.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect Threads through Meta",
    text: "Sign in on Meta's official login screen and allow Poskoo to publish to your Threads account. We never ask for your Threads password.",
  },
  {
    n: "2",
    title: "Compose and choose a time",
    text: "Write your text, add an image or video link if you want one, select Threads, and pick the date and time for the post.",
  },
  {
    n: "3",
    title: "Let the queue publish it",
    text: "Poskoo publishes the post when it is due and shows a published or failed status. If something goes wrong, you can retry it.",
  },
];

const comparison = [
  { task: "Choosing a consistent posting time", manual: "You set a reminder and post by hand", scheduled: "You pick the time once and it is queued" },
  { task: "Planning a week of posts", manual: "Open the app each day and write from scratch", scheduled: "Draft the week in one calendar session" },
  { task: "Posting while busy or offline", manual: "The post waits until you are free", scheduled: "The worker publishes at the scheduled time" },
  { task: "Changing a planned post", manual: "Remember and rewrite it later", scheduled: "Edit, reschedule or delete it from the queue" },
  { task: "Checking what went live", manual: "Scroll your profile to check", scheduled: "See published or failed status in the queue" },
  { task: "Recovering from a failed post", manual: "Start again from the app", scheduled: "Fix the cause and retry the failed post" },
];

const faqs = [
  {
    q: "Can I schedule Threads posts?",
    a: "Yes. You can compose a Threads post, choose a date and time, and let Poskoo publish it automatically through the official Threads API.",
  },
  {
    q: "Do I need to give Poskoo my Threads password?",
    a: "No. You sign in through Meta's official login and approve publishing access. Poskoo never asks for, stores or scrapes your Threads password.",
  },
  {
    q: "Does Poskoo use the official Threads API?",
    a: "Yes. Poskoo connects through Meta's official login and publishes Threads posts through the official Threads API, so you never share your password with us.",
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
  {
    q: "Can I manage Instagram and Facebook too?",
    a: "Yes. Connect Instagram, Facebook Pages and Threads, then plan all of them from one calendar with a caption per channel.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Every account starts on the $0 Free plan with 2 social accounts and 10 scheduled posts per month. No credit card is needed to sign up.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} Threads scheduler`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  featureList: [
    "Threads text, image and video post scheduling",
    "Week and month content calendar",
    "Edit, reschedule and delete scheduled posts",
    "Publishing status and retries",
    "Instagram and Facebook Page scheduling in the same queue",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
};

export default function ThreadsSchedulerPage() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "Threads scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
        <span className="pill">Official Threads API · No password needed</span>
        <p className="eyebrow">Threads scheduler</p>
        <h1>
          Threads scheduler for <em className="s mark">planning and auto-publishing posts</em>
        </h1>
        <p className="lede">
          A Threads scheduler is a tool that lets you write Threads posts ahead of time and publish them automatically at
          the date and time you choose. Poskoo schedules Threads posts from the same calendar as Instagram and Facebook,
          uses Meta&apos;s official API, and starts on a $0 Free plan with no credit card.
        </p>
        <p className="lede">
          Write the text, add an image or video, choose a time, and track each result in the queue.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/app/calendar">Open the calendar</Link>
        </div>
        <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name="multichannel" label="A creator at a laptop sends one post that splits to several phones and screens" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Threads scheduling features</p>
            <h2>Everything you need to <em className="s">schedule Threads</em></h2>
          </div>
          <div className="cards">
            {features.map((feature) => (
              <article key={feature.title} className="pcard">
                <span className="no">{feature.no}</span>
                <h3>{feature.title.replace(/-/g, "\u2011")}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            Check your caption against the 500-character and 5-link limits with the <Link className={s.vlink} href="/tools/threads-character-counter">Threads character counter</Link>.
            {" "}Not sure when to post? Try the free <Link className={s.vlink} href="/tools/best-time-to-post-on-threads">best time to post on Threads</Link> finder.
            {" "}Want a better profile? Use the free <Link className={s.vlink} href="/tools/threads-bio-generator">Threads bio generator</Link>.
            {" "}Need a first draft? Try the <Link className={s.vlink} href="/tools/threads-post-generator">free Threads post generator</Link>.
            {" "}Need a topic tag? Use the free <Link className={s.vlink} href="/tools/threads-hashtag-generator">Threads hashtag generator</Link>.
            {" "}Need a first draft? Use the free <Link className={s.vlink} href="/tools/threads-caption-generator">Threads caption generator</Link>.
            {" "}Have a long draft? Split it into numbered posts with the <Link className={s.vlink} href="/tools/threads-thread-maker">Threads thread maker</Link>.
            {" "}Or <Link className={s.vlink} href="/tools/threads-tools">browse all free Threads tools</Link> in one place.
            {" "}See which posts earn replies with the free <Link className={s.vlink} href="/tools/threads-engagement-rate-calculator">Threads engagement rate calculator</Link>.
          </p>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            Also planning Instagram or Facebook? See the{" "}
            <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler</Link>
            {" "}and the <Link className={s.vlink} href="/facebook-scheduler">Facebook Page scheduler</Link>.
          </p>
        </div>
      </section>

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">How Threads scheduling works</p>
              <h2>Schedule your first <em className="s mark">Threads post</em></h2>
              <ol className={s.steps}>
                {steps.map((step) => (
                  <li key={step.n}>
                    <span className={s.stepNo} aria-hidden="true">{step.n}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-schedule.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A creator adds a scheduled Threads post to a weekly calendar next to a friendly alarm clock"
              />
            </div>
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
            New to this? Read the{" "}
            <Link className={s.vlink} href="/help/schedule-threads-posts">
              step-by-step guide to scheduling Threads posts
            </Link>
            .
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Manual posting vs scheduling</p>
            <h2>What changes when you <em className="s">schedule Threads?</em></h2>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th} scope="col">Task</th>
                  <th className={s.th} scope="col">Manual posting</th>
                  <th className={s.th} scope="col">Scheduling with {BRAND.name}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.task}>
                    <td className={s.td} style={{ fontWeight: 600 }}>{row.task}</td>
                    <td className={s.td}>{row.manual}</td>
                    <td className={s.td}>{row.scheduled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Threads scheduler FAQs</p>
            <h2>Accounts, formats and publishing</h2>
          </div>
          <div className="faq">
            {faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next Threads post <em className="s">on the calendar</em></h2>
              <p>Start free, connect through Meta, and manage Threads, Instagram and Facebook in one queue.</p>
              <Link className="btn" href="/signup">Start scheduling free <span aria-hidden="true">→</span></Link>
              {" "}
              <Link className="btn" href="/pricing">Compare plans</Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Two friends celebrate beside a task board and a rising chart after scheduling their posts"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

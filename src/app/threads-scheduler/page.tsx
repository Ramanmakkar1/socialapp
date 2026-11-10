import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { SOFTWARE_APPLICATION_OFFERS } from "@/lib/plans";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/threads-scheduler";
const title = `Threads Scheduler: Plan & Auto-Publish Posts | ${BRAND.name}`;
const description = `Schedule Threads posts on one calendar and publish them automatically through Meta's official API. Plan text, image or video posts and track results.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

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
    url: `${BRAND.url}${PATH}`,
  }),
  featureList: [
    "Threads text, image and video post scheduling",
    "Week and month content calendar",
    "Edit, reschedule and delete scheduled posts",
    "Publishing status and retries",
    "Instagram and Facebook Page scheduling in the same queue",
  ],
  offers: SOFTWARE_APPLICATION_OFFERS,
};

export default function ThreadsSchedulerPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Threads scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <span className="pill">Official Threads API · No password needed</span>
        <p className="eyebrow">Threads scheduler</p>
        <h1>
          Threads scheduler for <em className="s mark">planning and auto-publishing posts</em>
        </h1>
        <p className="lede">
          Plan Threads posts on one calendar and publish them automatically through Meta&apos;s official API. Write the
          text, add an image or video, choose a time, and track each result in the queue.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/app/calendar">Open the calendar</Link>
        </div>
        <p className="small">Free plan included. No credit card needed.</p>
        <div className="hero-art" style={{ maxWidth: 920 }}>
          <Image
            sizes="(max-width: 960px) 100vw, 920px"
            src="/landing/multichannel.webp"
            width={1400}
            height={933}
            priority
            alt="A creator schedules one post that is sent to Threads, Instagram and Facebook from a single calendar"
          />
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Threads scheduling features</p>
            <h2>Everything you need to <em className="s">schedule Threads.</em></h2>
          </div>
          <div className="cards">
            {features.map((feature) => (
              <article key={feature.title} className="pcard">
                <span className="no">{feature.no}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
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
              <h2>Schedule your first <em className="s mark">Threads post.</em></h2>
              <div className="pains">
                {steps.map((step) => (
                  <div key={step.n} className="pain">
                    <b>{step.n}. {step.title}</b>
                    <span>{step.text}</span>
                  </div>
                ))}
              </div>
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
              <h2>Put your next Threads post <em className="s">on the calendar.</em></h2>
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

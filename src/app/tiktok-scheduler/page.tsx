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

const PATH = "/tiktok-scheduler";
const title = `TikTok Scheduler: Plan and Auto-Post TikTok Videos | ${BRAND.name}`;
const description = `Schedule TikTok videos and photo posts on one calendar and publish them automatically through TikTok's official API. Plan ahead and post on time.`;

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.url).toString() },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const features = [
  {
    no: "01 / Formats",
    title: "One video or up to 35 photos",
    text: "A TikTok post takes either a single video or a photo carousel of up to 35 photos, not both. Photo posts need the photos uploaded in Poskoo, because TikTok pulls them from our verified media domain.",
  },
  {
    no: "02 / Video limits",
    title: "Videos from 3 seconds to 10 minutes",
    text: "TikTok videos need to be MP4 or MOV, at least 3 seconds and no longer than 10 minutes, with a 1 GB limit per file in Poskoo. Photos can be JPG up to 20 MB each. Vertical 9:16 video looks best.",
  },
  {
    no: "03 / Visibility",
    title: "Choose who can see each post",
    text: "TikTok tells Poskoo which visibility options your account can use, so you pick from Everyone, Friends, Followers or Only me where available. Turn comments, Duet and Stitch on or off, and disclose branded content when it applies.",
  },
  {
    no: "04 / Calendar",
    title: "Plan TikTok beside Instagram and Facebook",
    text: "Select TikTok, Instagram, Threads and Facebook Pages in the same composer, customise the caption per channel, and keep one publishing queue for every account.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect TikTok with the official login",
    text: "Sign in on TikTok's official screen and allow Poskoo to publish to your account. We never ask for your TikTok password.",
  },
  {
    n: "2",
    title: "Upload your video or photos and caption",
    text: "Add one video or up to 35 photos, write the caption, and choose visibility plus comment, Duet and Stitch settings where your account allows them.",
  },
  {
    n: "3",
    title: "Pick a time and let the queue post",
    text: "Choose the date and time. Poskoo publishes through TikTok's Content Posting API when the post is due and shows a published or failed status you can retry.",
  },
];

const comparison = [
  { task: "Choosing a consistent posting time", manual: "You set a reminder and post by hand", scheduled: "You pick the time once and it is queued" },
  { task: "Planning a week of TikTok posts", manual: "Open the app each day and film from scratch", scheduled: "Plan the week in one calendar session" },
  { task: "Posting while busy or offline", manual: "The post waits until you are free", scheduled: "The worker publishes at the scheduled time" },
  { task: "Changing a planned post", manual: "Remember and re-upload it later", scheduled: "Edit, reschedule or delete it from the queue" },
  { task: "Checking what went live", manual: "Scroll your TikTok profile to check", scheduled: "See published or failed status in the queue" },
  { task: "Recovering from a failed post", manual: "Start again from the app", scheduled: "Fix the cause and retry the failed post" },
];

const faqs = [
  {
    q: "Is it safe to connect TikTok to Poskoo?",
    a: "Yes. Poskoo uses TikTok's official Login Kit and Content Posting API. You sign in on TikTok, approve publishing access, and never give Poskoo your TikTok password. You can revoke access from your TikTok account at any time.",
  },
  {
    q: "Can I schedule TikTok photo posts?",
    a: "Yes, up to 35 photos in one post. The photos must be uploaded in Poskoo rather than linked from another site, because TikTok only pulls photo posts from our verified media domain. A photo post uses the first caption line as its title (up to 90 characters) and the rest as the description (up to 4,000 characters).",
  },
  {
    q: "What video length and size does TikTok accept?",
    a: "Video must be MP4 or MOV, at least 3 seconds and no longer than 10 minutes, up to 1 GB per file in Poskoo. Vertical 9:16 video, such as 1080 by 1920, fills the screen best.",
  },
  {
    q: "Can I change the time after scheduling?",
    a: "Yes. Scheduled posts can be edited, moved to a new time or deleted from the queue before they publish.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Every account starts on the $0 Free plan with 2 social accounts and 10 scheduled posts per month. No credit card is needed to sign up. Pro and Agency add more accounts, unlimited scheduling and more auto-DMs.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} TikTok scheduler`,
    description,
    url: `${BRAND.url}${PATH}`,
  }),
  featureList: [
    "TikTok video and photo post scheduling",
    "Videos from 3 seconds to 10 minutes, up to 1 GB",
    "Photo posts with up to 35 photos",
    "Visibility, comment, Duet and Stitch options",
    "Week and month content calendar",
    "Instagram, Threads and Facebook Page scheduling in the same queue",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
};

export default function TikTokSchedulerPage() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "TikTok scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
        <span className="pill">Official TikTok API · No password needed</span>
        <p className="eyebrow">TikTok scheduler</p>
        <h1>
          Schedule TikTok videos and <em className="s mark">post them automatically</em>
        </h1>
        <p className="lede">
          Poskoo connects through TikTok&apos;s official login and API and posts your video at the date and time you
          choose. Plan TikTok next to Instagram, Threads and Facebook on one calendar.
        </p>
        <p className="lede">
          Upload one video or up to 35 photos, write the caption, pick who can see it, and let the queue publish it
          while you are busy.
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
            <p className="eyebrow">TikTok scheduling features</p>
            <h2>What you can <em className="s">schedule on TikTok.</em></h2>
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
            Planning other channels too? See the{" "}
            <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler</Link>, the{" "}
            <Link className={s.vlink} href="/threads-scheduler">Threads scheduler</Link> and the{" "}
            <Link className={s.vlink} href="/social-media-scheduler-comparison">social media scheduler comparison</Link>.
          </p>
        </div>
      </section>

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">How TikTok scheduling works</p>
              <h2>Schedule your first <em className="s mark">TikTok post.</em></h2>
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
                alt="A creator adds a scheduled TikTok video to a weekly calendar next to a friendly alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">One calendar for every channel</p>
            <h2>Plan TikTok next to <em className="s">Instagram, Threads and Facebook.</em></h2>
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
            <p className="eyebrow">TikTok scheduler FAQs</p>
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
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            New to it? Follow our step-by-step guide:{" "}
            <Link className={s.vlink} href="/help/schedule-tiktok-posts">how to schedule TikTok videos</Link>.
          </p>
          <p className="small" style={{ marginTop: 12, textAlign: "center" }}>
            Writing a caption first? Check the 4,000-character limit and feed preview with our{" "}
            <Link className={s.vlink} href="/tools/tiktok-caption-counter">TikTok caption character counter</Link>.
          </p>
          <p className="small" style={{ marginTop: 12, textAlign: "center" }}>
            Need words for your video? Draft six hooks and captions with our{" "}
            <Link className={s.vlink} href="/tools/tiktok-caption-generator">free TikTok caption generator</Link>.
          </p>
          <p className="small" style={{ marginTop: 12, textAlign: "center" }}>
            Need hashtags? Build a small set of 3 to 15 niche tags with our{" "}
            <Link className={s.vlink} href="/tools/tiktok-hashtag-generator">free TikTok hashtag generator</Link>.
            Need a new handle? Try our{" "}
            <Link className={s.vlink} href="/tools/tiktok-username-generator">free TikTok username generator</Link>.
            Writing your profile? Use our{" "}
            <Link className={s.vlink} href="/tools/tiktok-bio-generator">free TikTok bio generator</Link>.
          </p>
          <p className="small" style={{ marginTop: 12, textAlign: "center" }}>
            Not sure when to post? Get three starting times for your audience with the{" "}
            <Link className={s.vlink} href="/tools/best-time-to-post-on-tiktok">best time to post on TikTok</Link>{" "}
            finder.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next TikTok post <em className="s">on the calendar.</em></h2>
              <p>Start free, connect with TikTok, and manage TikTok, Instagram, Threads and Facebook in one queue.</p>
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

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

const PATH = "/linkedin-scheduler";
const title = "LinkedIn Scheduler: Plan and Auto-Publish LinkedIn Posts";
const description = `Schedule LinkedIn posts on one calendar and publish them automatically through LinkedIn's official API. Plan text and image posts, then track results.`;

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.url).toString() },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const features = [
  {
    no: "01 / Accounts",
    title: "Your profile, and company pages you run",
    text: "Connect your personal LinkedIn profile through LinkedIn's official sign-in. When company page access is enabled for your account, you can also publish to a company page you administer.",
  },
  {
    no: "02 / Formats",
    title: "Text posts and up to 20 images",
    text: "Write a LinkedIn post up to 3,000 characters and add up to 20 images in one post. Images can be JPG or PNG up to 10 MB each. Video is not supported from Poskoo yet.",
  },
  {
    no: "03 / Calendar",
    title: "Pick the date and time",
    text: "Choose when each post goes live, see upcoming posts in the week and month calendar, and reschedule from the queue when plans change.",
  },
  {
    no: "04 / Status",
    title: "See what published and what failed",
    text: "The publishing worker sends due LinkedIn posts through the official API, records success or failure, and lets you retry a failed post after fixing it.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect LinkedIn with the official sign-in",
    text: "Sign in on LinkedIn's official screen and allow Poskoo to publish to your profile. We never ask for your LinkedIn password.",
  },
  {
    n: "2",
    title: "Write the post and choose a time",
    text: "Add your text and up to 20 images, select LinkedIn, and pick the date and time for the post.",
  },
  {
    n: "3",
    title: "Let the queue publish it",
    text: "Poskoo publishes the post when it is due and shows a published or failed status. If something goes wrong, you can retry it.",
  },
];

const comparison = [
  { task: "Choosing a consistent posting time", manual: "You set a reminder and post by hand", scheduled: "You pick the time once and it is queued" },
  { task: "Planning a week of posts", manual: "Open LinkedIn each day and write from scratch", scheduled: "Draft the week in one calendar session" },
  { task: "Posting while busy or offline", manual: "The post waits until you are free", scheduled: "The worker publishes at the scheduled time" },
  { task: "Changing a planned post", manual: "Remember and rewrite it later", scheduled: "Edit, reschedule or delete it from the queue" },
  { task: "Checking what went live", manual: "Scroll your profile to check", scheduled: "See published or failed status in the queue" },
  { task: "Recovering from a failed post", manual: "Start again from LinkedIn", scheduled: "Fix the cause and retry the failed post" },
];

const faqs = [
  {
    q: "Can I schedule LinkedIn posts?",
    a: "Yes. You can compose a LinkedIn post, choose a date and time, and let Poskoo publish it automatically through LinkedIn's official API.",
  },
  {
    q: "Can I post to a LinkedIn company page?",
    a: "Yes, when company page access is enabled for your account. Poskoo can publish to a company page you administer as well as your personal profile. Company page publishing needs LinkedIn's Community Management API access, which is granted after a separate review.",
  },
  {
    q: "What can I post to LinkedIn?",
    a: "A LinkedIn post can be text up to 3,000 characters, with up to 20 images in one post. Images can be JPG or PNG up to 10 MB each. Video is not supported from Poskoo yet.",
  },
  {
    q: "Can I edit or reschedule a scheduled post?",
    a: "Yes. Scheduled posts can be edited, moved to a new time, duplicated or deleted before they publish.",
  },
  {
    q: "What is the best time to post on LinkedIn?",
    a: "There is no single best time for every account. Post when your audience is active, usually on weekday mornings and early afternoons, then check your results and adjust. Scheduling lets you test a few times without posting by hand.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Every account starts on the $0 Free plan with 2 social accounts and 10 scheduled posts per month. No credit card is needed to sign up. Pro and Agency add more accounts and unlimited scheduling.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} LinkedIn scheduler`,
    description,
    url: `${BRAND.url}${PATH}`,
  }),
  featureList: [
    "LinkedIn text post scheduling",
    "Up to 20 images per post",
    "Personal profile and company page publishing",
    "Week and month content calendar",
    "Edit, reschedule and delete scheduled posts",
    "Publishing status and retries",
    "Instagram, Facebook Page and Threads scheduling in the same queue",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
};

export default function LinkedInSchedulerPage() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "LinkedIn scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
        <span className="pill">Official LinkedIn API · No password needed</span>
        <p className="eyebrow">LinkedIn scheduler</p>
        <h1>
          Schedule LinkedIn posts and <em className="s mark">publish them on time</em>
        </h1>
        <p className="lede">
          Poskoo connects through LinkedIn&apos;s official sign-in and API and publishes your post at the scheduled
          time. Write the text, add images, choose a date and time, and let the queue handle the rest.
        </p>
        <p className="lede">
          Plan LinkedIn next to Instagram, Facebook and Threads on one calendar, so every channel stays on schedule.
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
            <p className="eyebrow">LinkedIn scheduling features</p>
            <h2>What you can <em className="s">schedule on LinkedIn.</em></h2>
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
            <Link className={s.vlink} href="/facebook-scheduler">Facebook Page scheduler</Link> and the{" "}
            <Link className={s.vlink} href="/social-media-scheduler-comparison">social media scheduler comparison</Link>.
          </p>
        </div>
      </section>

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">How LinkedIn scheduling works</p>
              <h2>Schedule your first <em className="s mark">LinkedIn post.</em></h2>
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
              <p className="small" style={{ marginTop: 16 }}>
                Need emphasis or bullets? Try our{" "}
                <Link className={s.vlink} href="/tools/linkedin-text-formatter">free LinkedIn text formatter</Link>{" "}
                before adding the post to your calendar.
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-schedule.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A creator adds a scheduled LinkedIn post to a weekly calendar next to a friendly alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">One calendar for every channel</p>
            <h2>Plan LinkedIn with your <em className="s">other channels.</em></h2>
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
            <p className="eyebrow">LinkedIn scheduler FAQs</p>
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
            <Link className={s.vlink} href="/help/schedule-linkedin-posts">how to schedule LinkedIn posts</Link>.
            Check your draft with the <Link className={s.vlink} href="/tools/linkedin-character-counter">LinkedIn character counter</Link>, then see how it looks with the <Link className={s.vlink} href="/tools/linkedin-post-preview">LinkedIn post preview</Link>.
            Build a short, relevant tag set with the <Link className={s.vlink} href="/tools/linkedin-hashtag-generator">LinkedIn hashtag generator</Link>.
            Not sure when to post? Use the <Link className={s.vlink} href="/tools/best-time-to-post-on-linkedin">best time to post on LinkedIn finder</Link> for starting slots to test.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next LinkedIn post <em className="s">on the calendar.</em></h2>
              <p>Start free, connect through LinkedIn, and manage LinkedIn, Instagram, Facebook and Threads in one queue.</p>
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

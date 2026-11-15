import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/social-media-scheduler-for-small-business";
const title = `Social Media Scheduler for Small Business | ${BRAND.name}`;
const description =
  "Poskoo lets small businesses schedule posts across supported platforms, auto-DM Instagram keyword commenters, capture leads and track clicks.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.canonicalUrl).toString() },
  openGraph: { title, description, url: new URL(PATH, BRAND.canonicalUrl).toString() },
  twitter: { card: "summary_large_image", title, description },
});

const workflow = [
  {
    n: "1",
    title: "Plan the week on one calendar",
    text: "Open the week or month view and drop in a post for each channel. Use the free content calendar template if you like to plan offline first.",
  },
  {
    n: "2",
    title: "Write once, adapt per platform",
    text: "Add the caption, media and link, then choose the channels and the time each post should go out. Save drafts and come back to them later.",
  },
  {
    n: "3",
    title: "Let the queue publish",
    text: "Poskoo publishes each post through the platform's official API at the time you picked, then shows a published or failed status with a retry.",
  },
  {
    n: "4",
    title: "Turn comments into leads",
    text: "Set a keyword such as GUIDE. When someone comments it on Instagram, Poskoo sends your DM, captures the email and tracks the link click.",
  },
];

const platforms = [
  { name: "Instagram", text: "Feed posts, Reels, carousels and Stories through Meta's official API." },
  { name: "Facebook Pages", text: "Page posts with text, images or a video link, scheduled in the same calendar." },
  { name: "Threads", text: "Text, image and video posts up to 500 characters, published through Meta." },
  { name: "LinkedIn", text: "Personal profile posts with images, scheduled alongside your other channels." },
  { name: "YouTube", text: "Videos and Shorts with title, description, tags and privacy settings." },
  { name: "Bluesky and Mastodon", text: "Text posts with images, connected with an app password or OAuth." },
  { name: "TikTok, Pinterest, X and Google Business Profile", text: "Built and waiting for each platform's API approval; connect as soon as it is switched on." },
];

const comparison = [
  { task: "Remembering to post", manual: "A phone reminder or a note, easy to miss on a busy day.", poskoo: "A queue publishes at the time you set, even when you are busy." },
  { task: "Writing for each channel", manual: "Rewrite the same caption in every app, one at a time.", poskoo: "Write once, pick the channels and adjust the caption where needed." },
  { task: "Replying to comments", manual: "Watch the inbox and send the same DM by hand.", poskoo: "Keyword rules send the DM and capture the email automatically." },
  { task: "Knowing what worked", manual: "Check each app's insights separately.", poskoo: "Clicks and leads sit next to the post that produced them." },
  { task: "Cost and setup", manual: "Several apps, several logins, no shared view.", poskoo: "One workspace, a free plan and no card to start." },
];

const faqs = [
  {
    q: "What do I need to connect an account?",
    a: "You need an account on the platform you want to publish to and the right permission to post. Instagram and Facebook connect through Meta's official login, so the account must be a professional account linked to a Facebook Page. LinkedIn, YouTube, Bluesky and Mastodon each connect with their own official sign-in or app password.",
  },
  {
    q: "Is scheduling through the official API safe?",
    a: "Yes. Poskoo uses each platform's official API and OAuth sign-in. You approve access on the platform's own screen, and Poskoo never asks for, stores or scrapes your password. You can revoke access from the platform at any time.",
  },
  {
    q: "Which platforms can I schedule to?",
    a: "Instagram, Facebook Pages, Threads, LinkedIn, YouTube, Bluesky and Mastodon publish today. TikTok, Pinterest, X and Google Business Profile are built and waiting for each platform's API approval, so you can connect them as soon as they are switched on.",
  },
  {
    q: "What does the free plan include?",
    a: "The Free plan includes 2 social accounts, 10 scheduled posts a month, 500 auto-DMs a month and a link-in-bio page with 5 links. Paid plans add more accounts, unlimited scheduling, more auto-DMs, email capture and click and lead analytics.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. Every account starts on the Free plan and no card is needed. You only add payment details if you choose to upgrade to Pro or Agency, and you can cancel any time.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} social media scheduler for small business`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  featureList: [
    "Week and month content calendar",
    "Schedule posts across supported platforms",
    "Instagram comment-to-DM automation",
    "Email lead capture in DMs",
    "Click and lead tracking",
    "Link-in-bio page",
    "Publishing status and retries",
  ],
  offers: softwareOffers(planReadiness()),
};

export default function SocialMediaSchedulerForSmallBusinessPage() {
  return (
    <PublicShell
      className={s.sched}
      breadcrumbs={[{ name: "Social media scheduler for small business", path: PATH }]}
    >
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Free plan · No credit card needed</span>
          <p className="eyebrow">Social media scheduler for small business</p>
          <h1>
            Social media scheduler for <em className="s mark">small business</em>
          </h1>
          <p className="lede">
            Poskoo lets small businesses schedule posts across supported platforms, auto-DM Instagram keyword
            commenters, capture leads and track clicks, all from one calendar.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Start scheduling free <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-line" href="/pricing">
              See plans and pricing
            </Link>
          </div>
          <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art">
          <AnimArt
            name="multichannel"
            label="A small business owner schedules posts for several social platforms from one calendar"
          />
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The weekly workflow</p>
            <h2>Plan once, publish all week.</h2>
            <p>
              A small business does not need a full content team. It needs a simple routine that keeps the
              calendar full and the inbox under control.
            </p>
          </div>
          <div className="cards">
            {workflow.map((step) => (
              <article key={step.n} className="pcard">
                <span className="no">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            Prefer to plan on paper first? Use the free{" "}
            <Link className={s.vlink} href="/tools/social-media-content-calendar">
              social media content calendar template
            </Link>{" "}
            and then add the posts to Poskoo.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">Supported platforms</p>
              <h2>One calendar for <em className="s mark">every channel.</em></h2>
              <p>
                Connect the accounts you already use and see every scheduled post in one place. Each channel
                publishes through its own official API, with a clear status when it is done.
              </p>
              <ul>
                {platforms.map((platform) => (
                  <li key={platform.name}>
                    <strong>{platform.name}:</strong> {platform.text}
                  </li>
                ))}
              </ul>
              <p className="small">
                Start with the{" "}
                <Link className={s.vlink} href="/instagram-scheduler">
                  Instagram scheduler
                </Link>{" "}
                and add the rest as you grow.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="demo-schedule"
                label="A weekly calendar fills with posts for Instagram, Facebook, Threads and other channels"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Comment-to-DM lead capture</p>
              <h2>Turn comments into <em className="s">real leads.</em></h2>
              <p>
                A post can ask people to comment a keyword. When they do, Poskoo sends the DM you wrote, asks
                for an email before the link, and records the click so you can see what the post brought in.
              </p>
              <ul>
                <li>Keyword rules for comments, Story replies and DMs.</li>
                <li>Email capture before the link is sent.</li>
                <li>Pause a rule at any time without losing it.</li>
                <li>Click and lead counts next to each post.</li>
              </ul>
              <p className="small">
                Learn how{" "}
                <Link className={s.vlink} href="/instagram-auto-dm">
                  Instagram auto-DM
                </Link>{" "}
                works, or add a{" "}
                <Link className={s.vlink} href="/instagram-link-in-bio">
                  link-in-bio page
                </Link>{" "}
                for the links in your profile.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="card-dm"
                label="A comment with a keyword becomes an automatic Instagram DM that captures an email lead"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Manual vs one scheduler</p>
            <h2>Doing it by hand vs <em className="s">one scheduler.</em></h2>
            <p>
              Both work. The difference is how much of the week you spend remembering, rewriting and replying.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Task</th>
                  <th scope="col" className={s.th}>Doing it manually</th>
                  <th scope="col" className={s.th}>With Poskoo</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.task} className={s.tr}>
                    <th scope="row" className={s.td}>{row.task}</th>
                    <td className={s.td}>{row.manual}</td>
                    <td className={s.td}>{row.poskoo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">Free plan</p>
              <h2>Start free, <em className="s mark">upgrade when you grow.</em></h2>
              <p>
                The Free plan includes 2 social accounts, 10 scheduled posts a month, 500 auto-DMs a month and a
                link-in-bio page with 5 links. No card is needed to start.
              </p>
              <p>
                Pro and Agency add more accounts, unlimited scheduling, more auto-DMs, email capture and click
                and lead analytics. Compare every limit on the{" "}
                <Link className={s.vlink} href="/pricing">
                  pricing page
                </Link>
                .
              </p>
              <Link className="btn btn-dark" href="/signup">
                Create your free account <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="art">
              <AnimArt
                name="card-leads"
                label="A small business owner watches leads and clicks grow from a free Poskoo account"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Small business scheduler FAQs</p>
            <h2>Accounts, safety and limits</h2>
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
            Need a hand? Browse the{" "}
            <Link className={s.vlink} href="/tools">
              free social media tools
            </Link>
            , see the{" "}
            <Link className={s.vlink} href="/free-social-media-scheduler">
              free social media scheduler
            </Link>{" "}
            or read the{" "}
            <Link className={s.vlink} href="/social-media-scheduler-comparison">
              social media scheduler comparison
            </Link>{" "}
            before you{" "}
            <Link className={s.vlink} href="/signup">
              create your free account
            </Link>
            .
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next week <em className="s">on the calendar.</em></h2>
              <p>Start free, connect your accounts and schedule your first posts in a few minutes.</p>
              <Link className="btn" href="/signup">
                Start scheduling free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <AnimArt
              name="feat-calendar"
              label="A friendly calendar illustration shows a week of scheduled social posts"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

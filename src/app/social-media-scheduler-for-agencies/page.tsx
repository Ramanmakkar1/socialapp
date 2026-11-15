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

const PATH = "/social-media-scheduler-for-agencies";
const title = `Social Media Scheduler for Agencies (2026) | ${BRAND.name}`;
const description =
  "Poskoo lets agencies schedule posts across supported networks, manage up to 25 accounts on one calendar, capture Instagram leads and review analytics.";

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
    title: "Connect the accounts you run",
    text: "Add each client account once through the platform's official login. The Agency plan holds up to 25 social accounts in one calendar.",
  },
  {
    n: "2",
    title: "Plan the week per account",
    text: "Switch account, open the week or month view and drop in each post. Save drafts so a client can send copy later without losing the slot.",
  },
  {
    n: "3",
    title: "Publish through official APIs",
    text: "Poskoo publishes to each supported network at the time you picked and shows a published or failed status with a retry, so nothing silently disappears.",
  },
  {
    n: "4",
    title: "Turn comments into leads",
    text: "Set an Instagram keyword such as GUIDE. When someone comments it, Poskoo sends the DM, captures the email and tracks the click on that post.",
  },
];

const platforms = [
  { name: "Instagram", text: "Feed posts, Reels, carousels and Stories through Meta's official API." },
  { name: "Facebook Pages", text: "Page posts with text, images or a video link, scheduled in the same calendar." },
  { name: "Threads", text: "Text, image and video posts up to 500 characters, published through Meta." },
  { name: "LinkedIn", text: "Personal profile posts with images, scheduled alongside the other channels." },
  { name: "YouTube", text: "Videos and Shorts with title, description, tags and privacy settings." },
  { name: "Bluesky and Mastodon", text: "Text posts with images, connected with an app password or OAuth." },
  {
    name: "TikTok, Pinterest, X and Google Business Profile",
    text: "Built and waiting for each platform's API approval; connect as soon as it is switched on.",
  },
];

const limits = [
  {
    title: "One login, no client portals",
    text: "Poskoo has no separate client workspaces, client logins or approval queue. You run the accounts from your own workspace, which keeps setup simple and avoids a second tool for sign-off.",
  },
  {
    title: "25 accounts is the Agency cap",
    text: "The Agency plan includes 25 connected social accounts across all clients. Need more than that? Run a second workspace rather than expecting the plan to stretch.",
  },
  {
    title: "Approval happens outside Poskoo",
    text: "Draft posts live in the calendar, but client review still happens the way it does now: send the draft, get a yes, then schedule it. There is no built-in approval step yet.",
  },
  {
    title: "Official APIs only",
    text: "Poskoo never scrapes or asks for platform passwords. It connects with each network's official OAuth login and publishes through its API, so you can revoke access at any time.",
  },
];

const faqs = [
  {
    q: "How many client accounts can I manage?",
    a: "The Agency plan includes 25 connected social accounts and unlimited scheduling across them. Free starts with 2 accounts and Pro with 5. If you handle more than 25, run a second workspace rather than expecting one plan to cover everything.",
  },
  {
    q: "Does Poskoo have client workspaces or approvals?",
    a: "No. Poskoo currently has no separate client workspaces, client logins or built-in approval queue. All accounts live in your workspace, and client sign-off happens outside the app before you schedule a post.",
  },
  {
    q: "Which networks can agencies schedule to today?",
    a: "Instagram, Facebook Pages, Threads, LinkedIn, YouTube, Bluesky and Mastodon publish today. TikTok, Pinterest, X and Google Business Profile are built and waiting for each platform's API approval, so they can be connected once switched on.",
  },
  {
    q: "How does Instagram lead capture work for clients?",
    a: "You set a keyword rule on an Instagram post. When someone comments that keyword, Poskoo sends the DM you wrote, captures their email before the link, and records the click. Leads show next to the post that produced them and can be exported as CSV.",
  },
  {
    q: "Where do agencies see results?",
    a: "Click and lead counts sit next to each post, and you can build a shareable performance view with the free social media analytics report tool before a client call. Pro and Agency add click and lead analytics across accounts.",
  },
  {
    q: "Can I try it before moving client accounts over?",
    a: "Yes. Every account starts on the Free plan with 2 social accounts, 10 scheduled posts a month and 500 auto-DMs, and no card is needed. Move to Pro or Agency when the account count and limits fit your roster.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} social media scheduler for agencies`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  featureList: [
    "One calendar for up to 25 social accounts",
    "Schedule posts across supported networks",
    "Instagram comment-to-DM automation",
    "Email lead capture in DMs",
    "Click and lead tracking",
    "Publishing status and retries",
  ],
  offers: softwareOffers(planReadiness()),
};

export default function SocialMediaSchedulerForAgenciesPage() {
  return (
    <PublicShell
      className={s.sched}
      breadcrumbs={[{ name: "Social media scheduler for agencies", path: PATH }]}
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
          <span className="pill">Agency plan · 25 accounts · No credit card to start</span>
          <p className="eyebrow">Social media scheduler for agencies</p>
          <h1>
            Social media scheduler for <em className="s mark">agencies</em>
          </h1>
          <p className="lede">
            Poskoo lets agencies schedule posts across supported networks, manage up to 25 accounts on one
            calendar, capture Instagram leads and review analytics, all from one workspace.
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
            label="An agency team schedules posts for several client accounts from one calendar"
          />
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The agency workflow</p>
            <h2>One calendar for every client account.</h2>
            <p>
              An agency does not need a heavier tool. It needs one place to keep every client&apos;s calendar full,
              catch failed posts and turn comments into leads, without juggling logins.
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
              <p className="eyebrow">Supported networks</p>
              <h2>One calendar for <em className="s mark">every channel.</em></h2>
              <p>
                Connect each account once and see every scheduled post in one place. Each network publishes
                through its own official API, with a clear status when it is done.
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
                <Link className={s.vlink} href="/social-media-scheduler">
                  social media scheduler
                </Link>{" "}
                and add channels as your roster grows.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="demo-schedule"
                label="A weekly calendar fills with posts for Instagram, Facebook, Threads and other networks"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Instagram lead capture</p>
              <h2>Turn client comments into <em className="s">real leads.</em></h2>
              <p>
                A post can ask people to comment a keyword. When they do, Poskoo sends the DM you wrote, asks
                for an email before the link, and records the click so the client can see what the post brought in.
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
                works, or review results with the free{" "}
                <Link className={s.vlink} href="/tools/social-media-analytics-report">
                  social media analytics report
                </Link>
                .
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
            <p className="eyebrow">Honest limits</p>
            <h2>What Poskoo does <em className="s">not</em> do yet.</h2>
            <p>
              Agencies ask for client portals and approval flows. Poskoo does not have them today, so here is
              what to expect before you move accounts over.
            </p>
          </div>
          <div className="cards">
            {limits.map((item) => (
              <article key={item.title} className="pcard">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">Agency pricing</p>
              <h2>Start free, <em className="s mark">move up when the roster grows.</em></h2>
              <p>
                The Free plan includes 2 social accounts, 10 scheduled posts a month and 500 auto-DMs. Pro
                adds 5 accounts and unlimited scheduling. Agency adds 25 accounts, 10,000 auto-DMs a month and
                priority support.
              </p>
              <p>
                Compare every limit on the{" "}
                <Link className={s.vlink} href="/pricing">
                  pricing page
                </Link>
                . No card is needed to start.
              </p>
              <Link className="btn btn-dark" href="/pricing">
                See Agency pricing <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="art">
              <AnimArt
                name="card-leads"
                label="An agency owner watches leads and clicks grow across client accounts"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Agency scheduler FAQs</p>
            <h2>Accounts, limits and lead capture</h2>
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
            <Link className={s.vlink} href="/social-media-scheduler">
              social media scheduler
            </Link>{" "}
            or read the{" "}
            <Link className={s.vlink} href="/social-media-scheduler-comparison">
              scheduler comparison
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
              <h2>Put your clients&apos; next week <em className="s">on the calendar.</em></h2>
              <p>Start free, connect your accounts and schedule the first posts in a few minutes.</p>
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

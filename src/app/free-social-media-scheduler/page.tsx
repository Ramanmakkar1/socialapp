import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { PLANS, PLANS_NOTE, softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";
import { getPlatformCopy, listText } from "@/lib/platform-support";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/free-social-media-scheduler";
const title = `Free Social Media Scheduler: Plan & Auto-Post | ${BRAND.name}`;
const description =
  "Schedule posts free with Poskoo: 2 social accounts, 10 scheduled posts a month and 500 Instagram auto-DMs, forever. Official APIs, no credit card.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.canonicalUrl).toString() },
  openGraph: { title, description, url: new URL(PATH, BRAND.canonicalUrl).toString() },
  twitter: { card: "summary_large_image", title, description },
});

const freePlan = PLANS.find((p) => p.name === "Free") ?? PLANS[0];

const platforms = [
  { name: "Instagram", href: "/instagram-scheduler", text: "Feed posts, Reels, carousels and Stories through Meta's official API." },
  { name: "Facebook Pages", href: "/facebook-scheduler", text: "Page posts with text, images or a video link, scheduled in the same calendar." },
  { name: "Threads", href: "/threads-scheduler", text: "Text, image and video posts up to 500 characters, published through Meta." },
  { name: "LinkedIn", href: "/linkedin-scheduler", text: "Personal profile posts with images, scheduled alongside your other channels." },
  { name: "YouTube", href: "/youtube-scheduler", text: "Videos and Shorts with title, description, tags and privacy settings." },
  { name: "Bluesky", href: "/bluesky-scheduler", text: "Text posts with images, connected with an app password." },
  { name: "Mastodon", href: "/mastodon-scheduler", text: "Text posts with images, connected with OAuth on any server." },
  { name: "TikTok, Pinterest, X and Google Business Profile", text: "Built and waiting for each platform's API approval; connect as soon as it is switched on." },
];

const steps = [
  {
    n: "1",
    title: "Sign up free",
    text: "Create your account on the Free plan. No credit card is needed and you can start scheduling straight away.",
  },
  {
    n: "2",
    title: "Connect an account",
    text: "Choose a platform and sign in on its own official login screen. Poskoo never asks for your password.",
  },
  {
    n: "3",
    title: "Write, pick a time, publish",
    text: "Add the caption and media, choose the date and time, and Poskoo publishes through the official API and shows the status.",
  },
];

const planValue = (plan: (typeof PLANS)[number], re: RegExp) =>
  plan.items.find((item) => re.test(item.text))?.text ?? "—";

const faqs = [
  {
    q: "Is Poskoo really free forever?",
    a: "Yes. The Free plan is $0 forever and includes 2 social accounts, 10 scheduled posts a month, 500 Instagram auto-DMs a month and a link-in-bio page. You only pay if you choose to upgrade.",
  },
  {
    q: "Do I need a credit card?",
    a: "No. Every account starts on the Free plan and no card is needed. You only add payment details if you choose to upgrade to Pro or Agency, and you can cancel any time.",
  },
  {
    q: "What happens when I hit 10 scheduled posts?",
    a: `Nothing is charged automatically. You can upgrade to Pro for unlimited scheduling, or wait for next month's allowance. ${PLANS_NOTE}`,
  },
  {
    q: "Is it safe to connect my accounts?",
    a: "Yes. Poskoo uses each platform's official API and OAuth sign-in. You approve access on the platform's own screen, and Poskoo never asks for, stores or scrapes your password. You can revoke access from the platform at any time.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} free social media scheduler`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  featureList: [
    "Free social media scheduling",
    "Week and month content calendar",
    "Instagram comment-to-DM automation",
    "Link-in-bio page",
    "Publishing status and retries",
  ],
  offers: softwareOffers(planReadiness()),
};

export default function FreeSocialMediaSchedulerPage() {
  const pc = getPlatformCopy();
  const pending = [...pc.awaiting, ...pc.soon];
  return (
    <PublicShell
      className={s.sched}
      breadcrumbs={[{ name: "Free social media scheduler", path: PATH }]}
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
          <p className="eyebrow">Free social media scheduler</p>
          <h1>
            Free social media <em className="s mark">scheduler</em>
          </h1>
          <p className="lede">
            Yes, you can schedule social media posts for free. Poskoo&apos;s Free plan is $0 forever and includes 2
            social accounts, 10 scheduled posts a month, 500 Instagram auto-DMs a month and a link-in-bio page. No
            credit card needed.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Start free <span aria-hidden="true">→</span>
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
            label="A creator schedules free social media posts for several platforms from one calendar"
          />
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Free plan limits</p>
            <h2>What the free plan includes</h2>
            <p>
              These are the real limits of the Free plan, read straight from Poskoo&apos;s pricing so they never
              drift. Everything below is included at $0 forever.
            </p>
          </div>
          <div className="cards">
            <article className="pcard">
              <h3>Included on Free</h3>
              <ul>
                {freePlan.items.map((item) => (
                  <li key={item.text}>{item.text}</li>
                ))}
              </ul>
              <p className="small">
                <Link className={s.vlink} href="/pricing">
                  Compare Free, Pro and Agency plans
                </Link>
              </p>
            </article>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">Supported platforms</p>
              <h2>Which platforms can I schedule to for free?</h2>
              <p>
                {listText(pc.live.social)} publish today.{pending.length ? ` ${listText(pending)} ${pending.length === 1 ? "is" : "are"} not live yet.` : ""}
              </p>
              <ul>
                {platforms.map((platform) => (
                  <li key={platform.name}>
                    {platform.href ? (
                      <Link className={s.vlink} href={platform.href}>
                        {platform.name}
                      </Link>
                    ) : (
                      <strong>{platform.name}</strong>
                    )}
                    : {platform.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="art">
              <AnimArt
                name="demo-schedule"
                label="A weekly calendar fills with free posts for Instagram, Facebook, Threads and other channels"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Free vs paid</p>
            <h2>When should I upgrade?</h2>
            <p>
              Stay on Free while you post a few times a month. Upgrade when you need more accounts, unlimited
              scheduling or more auto-DMs.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Plan</th>
                  <th scope="col" className={s.th}>Accounts</th>
                  <th scope="col" className={s.th}>Scheduled posts</th>
                  <th scope="col" className={s.th}>Auto-DMs</th>
                </tr>
              </thead>
              <tbody>
                {PLANS.map((plan) => (
                  <tr key={plan.name} className={s.tr}>
                    <th scope="row" className={s.td}>{plan.name}</th>
                    <td className={s.td}>{planValue(plan, /social accounts/)}</td>
                    <td className={s.td}>{planValue(plan, /scheduled posts|Unlimited scheduling/)}</td>
                    <td className={s.td}>{planValue(plan, /auto-DMs/)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            Paid plans unlock unlimited scheduling. Compare every limit on the{" "}
            <Link className={s.vlink} href="/pricing">
              pricing page
            </Link>
            .
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Get started</p>
              <h2>How to schedule your first post free</h2>
              <div className="cards">
                {steps.map((step) => (
                  <article key={step.n} className="pcard">
                    <span className="no">{step.n}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="art">
              <AnimArt
                name="feat-calendar"
                label="A friendly calendar illustration shows a week of free scheduled social posts"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Free plan FAQs</p>
            <h2>Free forever, limits and safety</h2>
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
            Browse the{" "}
            <Link className={s.vlink} href="/tools">
              free social media tools
            </Link>
            , read the{" "}
            <Link className={s.vlink} href="/guides/cheapest-social-media-scheduling-tools-2026">
              cheapest social media scheduling tools guide
            </Link>
            , see the{" "}
            <Link className={s.vlink} href="/social-media-scheduler">
              social media scheduler for small business
            </Link>{" "}
            or compare Poskoo as a{" "}
            <Link className={s.vlink} href="/buffer-alternative">
              Buffer alternative
            </Link>
            .
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Schedule your first post <em className="s">for free.</em></h2>
              <p>Start free, connect your accounts and schedule your first posts in a few minutes.</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <AnimArt
              name="card-schedule"
              label="A creator schedules a post for free in the Poskoo calendar"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

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
import { LandingDemo } from "@/app/LandingDemo";
import { PLATFORMS_ANSWER } from "@/lib/platform-support";

const PATH = "/social-media-scheduler";
const title = `Social Media Scheduler: Plan & Auto-Publish Posts | ${BRAND.name}`;
const description = `Free social media scheduler for Instagram, Facebook, Threads, TikTok, LinkedIn, Pinterest, YouTube, X, Bluesky and Mastodon. One calendar, official APIs.`;

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const platforms = [
  {
    name: "Instagram",
    href: "/instagram-scheduler",
    text: "Schedule Instagram posts with a drag-and-drop calendar, feed, Reels and carousel support.",
  },
  {
    name: "Facebook",
    href: "/facebook-scheduler",
    text: "Schedule Facebook Page posts with text, photos or video through Meta's official login.",
  },
  {
    name: "Threads",
    href: "/threads-scheduler",
    text: "Schedule Threads text, image or video posts on one calendar through Meta's official API.",
  },
  {
    name: "TikTok",
    href: "/tiktok-scheduler",
    text: "Schedule TikTok videos and photo posts through TikTok's official API, alongside your other channels.",
  },
  {
    name: "LinkedIn",
    href: "/linkedin-scheduler",
    text: "Schedule LinkedIn text and image posts through LinkedIn's official API, then track results.",
  },
  {
    name: "Pinterest",
    href: "/pinterest-scheduler",
    text: "Schedule Pins to any board with a title, destination link and a JPG or PNG image.",
  },
  {
    name: "YouTube",
    href: "/youtube-scheduler",
    text: "Schedule YouTube videos and Shorts with titles, descriptions, tags and privacy settings.",
  },
  {
    name: "X (Twitter)",
    href: "/x-scheduler",
    text: "Schedule X posts with text and up to 4 images or one video through X's official API.",
  },
  {
    name: "Bluesky",
    href: "/bluesky-scheduler",
    text: "Schedule Bluesky posts with your handle and an app password, with text and up to 4 images.",
  },
  {
    name: "Mastodon",
    href: "/mastodon-scheduler",
    text: "Schedule Mastodon posts on any server with OAuth, images or video, and automatic publishing.",
  },
];

const steps = [
  {
    n: "1",
    art: "feat-linkbio" as const,
    title: "Connect accounts with official login",
    text: "Sign in on each platform's own login screen and approve publishing. Poskoo never asks for your password.",
  },
  {
    n: "2",
    art: "writing" as const,
    title: "Write once and customise per channel",
    text: "Write your post in one composer, select the channels, and adjust the caption for each platform where you want a different version.",
  },
  {
    n: "3",
    art: "feat-calendar" as const,
    title: "Pick a time and track the queue",
    text: "Choose a date and time, see it in the queue and calendar, then follow the published or failed status of every post.",
  },
];

const tools = [
  { href: "/tools/social-media-post-generator", label: "Social media post generator" },
  { href: "/tools/hashtag-generator", label: "Hashtag generator" },
  { href: "/tools/best-time-to-post-on-social-media", label: "Best time to post on social media" },
  { href: "/tools/social-media-content-calendar", label: "Social media content calendar" },
];

const faqs = [
  {
    q: "Is there a free social media scheduler?",
    a: "Yes. Poskoo's Free plan costs $0 and includes 2 social accounts and 10 scheduled posts a month. No credit card is needed to sign up.",
  },
  {
    q: "Which social networks does Poskoo support?",
    a: PLATFORMS_ANSWER,
  },
  {
    q: "Do you need my passwords?",
    a: "No. You connect with each platform's official OAuth login and Poskoo never sees your password. Bluesky is the exception: it uses an app password, as explained on the Bluesky scheduler page.",
  },
  {
    q: "Can I schedule to several platforms at once?",
    a: "Yes. Write the post once, select several connected channels, customise the caption for each one, and Poskoo queues them for the same time or different times.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} social media scheduler`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  "@id": `${BRAND.canonicalUrl}${PATH}#software`,
  featureList: [
    "Schedule posts to 10 social platforms from one calendar",
    "Official platform APIs and OAuth login",
    "Week and month content calendar plus publishing queue",
    "Per-channel captions and media",
    "Publishing status and retries",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${BRAND.canonicalUrl}${PATH}#webpage`,
  url: `${BRAND.canonicalUrl}${PATH}`,
  name: title,
  description,
  isPartOf: { "@id": `${BRAND.canonicalUrl}#website` },
  about: { "@id": `${BRAND.canonicalUrl}${PATH}#software` },
};

export default function SocialMediaSchedulerPage() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "Social media scheduler", path: PATH }]}>
      {[appJsonLd, webPageJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">10 platforms · Official APIs · Free plan</span>
          <p className="eyebrow">Social media scheduler</p>
          <h1>Social media scheduler for every platform</h1>
          <p className="lede">
            Poskoo is a social media scheduler: you write a post once, pick the channels and a time, and it
            auto-publishes through each platform&apos;s official API. The Free plan is $0 with 2 social accounts and
            10 scheduled posts a month, and no credit card is needed.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <Link className="btn btn-line" href="/pricing">Compare plans</Link>
          </div>
          <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name="multichannel" label="A creator at a laptop sends one scheduled post to several phones and social platforms" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Supported platforms</p>
            <h2>Which platforms can you schedule?</h2>
          </div>
          <div className="cards">
            {platforms.map((platform) => (
              <article key={platform.name} className="pcard">
                <h3><Link className={s.vlink} href={platform.href}>{platform.name} scheduler</Link></h3>
                <p>{platform.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">How it works</p>
            <h2>How does scheduling work in Poskoo?</h2>
          </div>
          <div className="howGrid">
            {steps.map((step) => (
              <article key={step.n} className="howStep">
                <div className="howArt"><AnimArt name={step.art} /></div>
                <span className="howNo">Step {step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Why Poskoo</p>
            <h2>What makes Poskoo different from other schedulers?</h2>
          </div>
          <p className="lede">
            Instagram comment-to-DM automation and lead capture are built in. When someone comments your keyword,
            Poskoo sends them a private DM with your link and can collect their email first, all from the same
            workspace as your calendar. See{" "}
            <Link className={s.vlink} href="/instagram-auto-dm">Instagram auto-DM</Link>{" "}
            or <Link className={s.vlink} href="/social-media-scheduler-comparison">compare social media schedulers</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Free tools</p>
            <h2>Free social media tools</h2>
          </div>
          <nav className="relChips" aria-label="Free social media tools">
            <span>Plan your next post</span>
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href}>{tool.label}</Link>
            ))}
          </nav>
        </div>
      </section>

      <section id="demo" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <LandingDemo hideLink={PATH} />
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Social media scheduler FAQs</p>
            <h2>Accounts, platforms and publishing</h2>
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
              <h2>Put your next post <em className="s">on the calendar</em></h2>
              <p>Start free, connect your accounts with official login, and manage every platform in one queue.</p>
              <Link className="btn" href="/signup">Start scheduling free <span aria-hidden="true">→</span></Link>
              {" "}
              <Link className="btn" href="/pricing">Compare plans</Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

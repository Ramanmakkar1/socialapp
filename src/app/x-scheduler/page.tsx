import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { ChannelStatusNote, networkAvailability } from "@/components/ChannelStatusNote";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/x-scheduler";
const title = `X Scheduler: Schedule Tweets and Posts on X | ${BRAND.name}`;
const description = "Poskoo schedules posts to X through X's official API: connect your account, write the post, add up to 4 images or one video, and pick a time.";
const SOON_DESCRIPTION = "Plan posts for X in Poskoo. X publishing through the official API is coming soon; Instagram, Threads and Facebook work today on the Free plan.";

// The description only says publishing works once X is live (src/lib/platform-support.ts).
export async function generateMetadata(): Promise<Metadata> {
  const desc = networkAvailability("x") === "live" ? description : SOON_DESCRIPTION;
  return withSocial({
    title: { absolute: title },
    description: desc,
    alternates: { canonical: new URL(PATH, BRAND.canonicalUrl).toString() },
    openGraph: { title, description: desc, url: new URL(PATH, BRAND.canonicalUrl).toString() },
    twitter: { card: "summary_large_image", title, description: desc },
  });
}

const features = [
  {
    no: "01 / Text",
    title: "Write the post in the composer",
    text: "Add the text for your tweet, then choose when it should go out. Poskoo sends it to X at the scheduled time, so you can plan ahead instead of posting live.",
  },
  {
    no: "02 / Images",
    title: "Attach up to 4 images",
    text: "Add up to 4 images to a single post, each up to 5 MB. Poskoo sends them through X's official v2 chunked upload before the post is published.",
  },
  {
    no: "03 / Video",
    title: "Or schedule one video",
    text: "A post can carry one video up to 512 MB instead of images. The video is uploaded through the same official X v2 chunked upload and processed before publishing.",
  },
  {
    no: "04 / Status",
    title: "See published or failed, then retry",
    text: "Every scheduled post shows a published or failed status. If X rate-limits the post, the status says so and you can retry it later.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect X with the official sign-in",
    text: "Sign in on X's official OAuth screen and approve access. Poskoo never asks for your X password.",
  },
  {
    n: "2",
    title: "Write the post and add media",
    text: "Add your text plus up to 4 images or one video. Images can be up to 5 MB each and video up to 512 MB.",
  },
  {
    n: "3",
    title: "Pick a time and let the queue publish",
    text: "Choose the date and time. Poskoo publishes through X's official API when it is due, then shows a published or failed status so you can retry if needed.",
  },
];

const faqs = [
  {
    q: "How do I schedule a tweet on X?",
    a: "Connect your X account with X's official OAuth sign-in, write the post, add up to 4 images or one video, and pick a date and time. Poskoo publishes the post through X's official API when it is due.",
  },
  {
    q: "Do I need to give Poskoo my X password?",
    a: "No. You sign in through X's official OAuth screen and approve access. Poskoo never asks for, stores or scrapes your X password.",
  },
  {
    q: "How many images or videos can one scheduled post have?",
    a: "A post can have text plus up to 4 images, or one video. Images can be up to 5 MB each and video up to 512 MB.",
  },
  {
    q: "How is media uploaded to X?",
    a: "Media goes through X's official v2 chunked upload. Poskoo uploads the file and waits for X to finish processing it before the post is published.",
  },
  {
    q: "What happens if a scheduled post fails?",
    a: "The post shows a published or failed status. If X rate-limits the post, the status says so, and you can retry it later.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} X scheduler`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  featureList: [
    "X post text composer",
    "Up to 4 images or 1 video per post",
    "Images up to 5 MB and video up to 512 MB",
    "Official X v2 chunked media upload",
    "Week and month content calendar",
    "Published or failed status with retries",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
};

export default function XSchedulerPage() {
  const availability = networkAvailability("x");
  const isLive = availability === "live";
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "X scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
        <span className="pill">{isLive ? "Official X API · No password needed" : "Official X API · Not live yet"}</span>
        <p className="eyebrow">X scheduler</p>
        <h1>
          Schedule Tweets <em className="s mark">and posts on X</em>
        </h1>
        {isLive ? (
        <p className="lede">
          Yes, you can schedule tweets for free: connect your X account with X&apos;s official sign-in, write the post,
          add up to 4 images or one video, pick a date and time, and Poskoo publishes it for you. The Free plan is $0
          with no credit card.
        </p>
        ) : (
        <p className="lede">
          X scheduling in Poskoo isn&apos;t switched on yet. When it is, you&apos;ll connect your X account with X&apos;s official sign-in, write the post, add up to 4 images or one video and pick a time, and Poskoo will publish it for you. The Free plan is $0 with no credit card.
        </p>
        )}
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start scheduling posts <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/signup">Create your free account</Link>
        </div>
        <p className="small">Free plan included. No credit card needed.</p>
        <ChannelStatusNote state={availability} network="X" />
        </div>
        <div className="hero-art"><AnimArt name="multichannel" label="A creator at a laptop sends a scheduled post to X alongside posts for other social channels" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">X scheduling features</p>
            <h2>What you can <em className="s">schedule on X.</em></h2>
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
        </div>
      </section>

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">How X scheduling works</p>
              <h2>Schedule your first <em className="s mark">post on X.</em></h2>
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
                alt="A creator adds a scheduled post to a weekly calendar next to a friendly alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">Official API only</p>
              <h2>Connect once and <em className="s">keep posting.</em></h2>
              <p>
                Poskoo connects to X with X&apos;s official OAuth sign-in, so you approve access on X&apos;s own screen and
                never share a password. Posts and media are sent through X&apos;s official API, not through scraping or
                browser automation.
              </p>
              <p>
                Because every scheduled post reports a published or failed status, you always know what went out. When X
                rate-limits a post, the status says so and you can retry it later.
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-leads.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="Two friends celebrate beside a task board and a rising chart after publishing scheduled posts"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">One content calendar</p>
            <h2>Plan X next to <em className="s">Instagram on one calendar.</em></h2>
            <p>
              Select X and Instagram in the same composer, tailor the copy for each channel, and review the week or month
              without switching between separate planning tools. Scheduled posts stay in one queue where you can edit,
              reschedule or delete them before they go live.
            </p>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">01 / Instagram</span>
              <h3>Publish Instagram content on schedule</h3>
              <p>Use the <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler for feed posts, Reels and carousels</Link> alongside your X plan.</p>
            </article>
            <article className="pcard">
              <span className="no">02 / Planning</span>
              <h3>Turn an idea into a complete post</h3>
              <p>Follow the <Link className={s.vlink} href="/instagram-content-planner">step-by-step Instagram content planner</Link> to prepare the copy and visuals for your calendar.</p>
            </article>
            <article className="pcard">
              <span className="no">03 / Compare</span>
              <h3>Choose the right scheduling setup</h3>
              <p>Read the <Link className={s.vlink} href="/social-media-scheduler-comparison">social media scheduler comparison</Link> to review supported channels, publishing and planning features. Cross-posting from X? Plan the same update with the <Link className={s.vlink} href="/bluesky-scheduler">Bluesky post scheduler</Link>.</p>
            </article>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">X scheduler FAQs</p>
            <h2>Media limits and publishing</h2>
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
            New to it? Read the{" "}
            <Link className={s.vlink} href="/help/schedule-x-posts">step-by-step guide to scheduling X posts</Link>, or
            check your post with the <Link className={s.vlink} href="/tools/x-character-counter">X character counter</Link>, preview it with the <Link className={s.vlink} href="/tools/x-post-preview">X post preview</Link> and pick tags with the <Link className={s.vlink} href="/tools/x-hashtag-generator">X hashtag generator</Link>.
            Check your profile header with the <Link className={s.vlink} href="/tools/x-header-size-checker">X header size checker</Link>.
            Style a post or bio with the <Link className={s.vlink} href="/tools/x-font-generator">X font generator</Link>.
            Start from a draft with the <Link className={s.vlink} href="/tools/x-post-generator">free X post generator</Link>.
            Split long posts with the <Link className={s.vlink} href="/tools/x-thread-maker">Twitter thread maker</Link>.
            Measure results with the <Link className={s.vlink} href="/tools/x-engagement-rate-calculator">X engagement rate calculator</Link>.
            Need a profile refresh? Try the <Link className={s.vlink} href="/tools/x-bio-generator">free X bio generator</Link>.
            Short on ideas? Start from a draft with the <Link className={s.vlink} href="/tools/tweet-generator">free tweet generator</Link>.
            Not sure when to post? Find the{" "}
            <Link className={s.vlink} href="/tools/best-time-to-post-on-x">best time to post on X</Link>. You can also{" "}
            <Link className={s.vlink} href="/tools/x-tools">browse all free X tools</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next X post <em className="s">on the calendar.</em></h2>
              <p>Start free, connect through X&apos;s official sign-in, and schedule posts beside your Instagram content.</p>
              <Link className="btn" href="/signup">Start scheduling posts free <span aria-hidden="true">→</span></Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A creator schedules a post on a calendar beside a friendly alarm clock"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
